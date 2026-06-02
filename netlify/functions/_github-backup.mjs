const GITHUB_API_BASE = 'https://api.github.com';

function backupConfig() {
  const token = String(process.env.GITHUB_BACKUP_TOKEN || '').trim();
  const repo = String(process.env.GITHUB_BACKUP_REPO || '').trim();
  const branch = String(process.env.GITHUB_BACKUP_BRANCH || 'main').trim();
  const dir = String(process.env.GITHUB_BACKUP_DIR || 'backups/aderrig-green-2026').trim().replace(/^\/+|\/+$/g, '');
  if (!token || !repo) return null;
  return { token, repo, branch, dir };
}

function compact(value = '') {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function safeFileName(value = '') {
  return String(value || 'record')
    .trim()
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'record';
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function encodeContent(text) {
  return Buffer.from(String(text), 'utf8').toString('base64');
}

function decodeContent(content = '') {
  return Buffer.from(String(content).replace(/\n/g, ''), 'base64').toString('utf8');
}

async function githubRequest(config, path, options = {}) {
  const url = `${GITHUB_API_BASE}/repos/${config.repo}/contents/${encodeURI(path)}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });

  if (response.status === 404) return { missing: true, status: 404 };
  const bodyText = await response.text();
  let body = {};
  try { body = bodyText ? JSON.parse(bodyText) : {}; } catch { body = { raw: bodyText }; }

  if (!response.ok) {
    const error = new Error(`GitHub backup API error ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function readGithubJson(config, path) {
  const file = await githubRequest(config, `${path}?ref=${encodeURIComponent(config.branch)}`);
  if (file?.missing) return { exists: false, sha: '', data: null };
  const text = decodeContent(file.content || '');
  return { exists: true, sha: file.sha || '', data: JSON.parse(text) };
}

async function writeGithubJson(config, path, data, message, sha = '') {
  const payload = {
    message,
    content: encodeContent(JSON.stringify(data, null, 2) + '\n'),
    branch: config.branch
  };
  if (sha) payload.sha = sha;

  return githubRequest(config, path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function writeArchiveRecord(config, type, record, backupId, submittedAtIso) {
  const day = isoDate(submittedAtIso);
  const archivePath = `${config.dir}/${type}/archive/${day}/${safeFileName(backupId)}.json`;
  const existing = await githubRequest(config, `${archivePath}?ref=${encodeURIComponent(config.branch)}`);
  if (!existing?.missing) return { archived: true, alreadyExists: true, path: archivePath };

  await writeGithubJson(
    config,
    archivePath,
    record,
    `Add ${type} backup ${backupId}`
  );

  return { archived: true, alreadyExists: false, path: archivePath };
}

async function updateLatestRecords(config, type, record, uniqueKey, submittedAtIso) {
  const latestPath = `${config.dir}/${type}/${type}-latest.json`;
  let existing = { exists: false, sha: '', data: [] };

  try {
    existing = await readGithubJson(config, latestPath);
  } catch (error) {
    return {
      latestUpdated: false,
      path: latestPath,
      warning: 'Latest backup was not updated because the existing backup could not be read safely.'
    };
  }

  const current = existing.exists ? existing.data : [];
  if (!Array.isArray(current)) {
    return {
      latestUpdated: false,
      path: latestPath,
      warning: 'Latest backup was not updated because the existing backup is not an array.'
    };
  }

  const alreadyPresent = current.some((item) => {
    const itemKey = String(item?.backupKey || item?.referenceId || item?.visitorKey || '').trim();
    return itemKey && itemKey === uniqueKey;
  });

  const next = alreadyPresent ? current : [...current, record];

  if (!alreadyPresent) {
    await writeGithubJson(
      config,
      latestPath,
      next,
      `Update ${type} latest backup ${isoDate(submittedAtIso)}`,
      existing.sha
    );
  }

  return { latestUpdated: !alreadyPresent, alreadyPresent, path: latestPath, totalRecords: next.length };
}

async function backupRecord(type, rawRecord, uniqueKey) {
  const config = backupConfig();
  if (!config) return { enabled: false, stored: false, message: 'GitHub backup is not configured.' };

  const submittedAtIso = rawRecord.submittedAtIso || rawRecord.downloadedAtIso || new Date().toISOString();
  const backupKey = String(uniqueKey || rawRecord.referenceId || rawRecord.visitorKey || Date.now()).trim();
  const record = {
    ...rawRecord,
    backupKey,
    backupType: type,
    backupCreatedAtIso: new Date().toISOString()
  };

  try {
    const archive = await writeArchiveRecord(config, type, record, backupKey, submittedAtIso);
    const latest = await updateLatestRecords(config, type, record, backupKey, submittedAtIso);
    return { enabled: true, stored: true, archive, latest };
  } catch (error) {
    console.error('github backup error:', error);
    return {
      enabled: true,
      stored: false,
      message: 'GitHub backup failed. The operational submission was not blocked.',
      detail: String(error.message || '').slice(0, 300)
    };
  }
}

export async function backupVoteRecord(record) {
  const key = String(record?.referenceId || '').trim() || compact(record?.eircode || '') || Date.now().toString();
  return backupRecord('votes', record, key);
}

export async function backupDownloadRecord(record) {
  const rawKey = [
    record?.visitorKey,
    compact(record?.eircode || ''),
    String(record?.downloadedAtIso || Date.now()).replace(/[^0-9A-Za-z]/g, '')
  ].filter(Boolean).join('-');
  return backupRecord('downloads', record, rawKey);
}
