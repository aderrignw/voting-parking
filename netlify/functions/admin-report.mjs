const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Director-Email',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const TOTAL_RESIDENCES = 227;
const ADMIN_EMAIL = 'claudiosantos1968@gmail.com';
const OFFICIAL_BASELINE = {
  confirmed: true,
  status: 'Confirmed',
  startingSubmissions: 0,
  establishedAtIreland: '01 Jun 2026, 15:31',
  establishedAtIso: '2026-06-01T15:31:00+01:00',
  note: 'System cleared before official launch. Voting started from zero recorded submissions.'
};
const OFFICIAL_RESIDENT_BASE = [{"eircodeKey":"K78N8X7","street":"Adamstown Way"},{"eircodeKey":"K78W1W7","street":"Adamstown Way"},{"eircodeKey":"K78T6C9","street":"Adamstown Way"},{"eircodeKey":"K78P6H2","street":"Adamstown Way"},{"eircodeKey":"K78T8N2","street":"Adamstown Way"},{"eircodeKey":"K78T2W8","street":"Adamstown Way"},{"eircodeKey":"K78T6X7","street":"Adamstown Way"},{"eircodeKey":"K78R2H6","street":"Adamstown Way"},{"eircodeKey":"K78E7Y0","street":"Adamstown Way"},{"eircodeKey":"K78A8P3","street":"Adamstown Way"},{"eircodeKey":"K78N9P3","street":"Adamstown Way"},{"eircodeKey":"K78Y0E0","street":"Adamstown Way"},{"eircodeKey":"K78C2H9","street":"Adamstown Way"},{"eircodeKey":"K78R6P2","street":"Adamstown Way"},{"eircodeKey":"K78X2R5","street":"Adamstown Way"},{"eircodeKey":"K78P8W6","street":"Adamstown Way"},{"eircodeKey":"K78E6H9","street":"Adamstown Way"},{"eircodeKey":"K78N7P0","street":"Adamstown Way"},{"eircodeKey":"K78H2P3","street":"Aderrig Court"},{"eircodeKey":"K78E6F2","street":"Aderrig Court"},{"eircodeKey":"K78T8X5","street":"Aderrig Court"},{"eircodeKey":"K78X3E8","street":"Aderrig Court"},{"eircodeKey":"K78V2X6","street":"Aderrig Court"},{"eircodeKey":"K78W4C0","street":"Aderrig Court"},{"eircodeKey":"K78F2P2","street":"Aderrig Court"},{"eircodeKey":"K78Y7Y8","street":"Aderrig Court"},{"eircodeKey":"K78H6N3","street":"Aderrig Court"},{"eircodeKey":"K78Y9K3","street":"Aderrig Court"},{"eircodeKey":"K78E3W6","street":"Aderrig Court"},{"eircodeKey":"K78W2N4","street":"Aderrig Court"},{"eircodeKey":"K78C2R4","street":"Aderrig Court"},{"eircodeKey":"K78A2C2","street":"Aderrig Court"},{"eircodeKey":"K78P2Y2","street":"Aderrig Court"},{"eircodeKey":"K78E7C9","street":"Aderrig Court"},{"eircodeKey":"K78A0F3","street":"Aderrig Court"},{"eircodeKey":"K78R9P9","street":"Aderrig Court"},{"eircodeKey":"K78P3K6","street":"Aderrig Green"},{"eircodeKey":"K78A8N2","street":"Aderrig Green"},{"eircodeKey":"K78W2P3","street":"Aderrig Green"},{"eircodeKey":"K78T2F5","street":"Aderrig Green"},{"eircodeKey":"K78E0W4","street":"Aderrig Green"},{"eircodeKey":"K78A9X7","street":"Aderrig Green"},{"eircodeKey":"K78X6N2","street":"Aderrig Green"},{"eircodeKey":"K78P2C8","street":"Aderrig Green"},{"eircodeKey":"K78K5W8","street":"Aderrig Green"},{"eircodeKey":"K78Y9E2","street":"Aderrig Green"},{"eircodeKey":"K78C8C4","street":"Aderrig Green"},{"eircodeKey":"K78A5F1","street":"Aderrig Green"},{"eircodeKey":"K78T1W6","street":"Aderrig Green"},{"eircodeKey":"K78N6P9","street":"Aderrig Green"},{"eircodeKey":"K78H7R2","street":"Aderrig Green"},{"eircodeKey":"K78K3H1","street":"Aderrig Green"},{"eircodeKey":"K78K7W7","street":"Aderrig Grove"},{"eircodeKey":"K78T3V1","street":"Aderrig Grove"},{"eircodeKey":"K78X0F4","street":"Aderrig Grove"},{"eircodeKey":"K78H0F3","street":"Aderrig Grove"},{"eircodeKey":"K78E9R2","street":"Aderrig Grove"},{"eircodeKey":"K78Y6X5","street":"Aderrig Grove"},{"eircodeKey":"K78K2T0","street":"Aderrig Grove"},{"eircodeKey":"K78X5K5","street":"Aderrig Grove"},{"eircodeKey":"K78W3C9","street":"Aderrig Grove"},{"eircodeKey":"K78R6C8","street":"Aderrig Grove"},{"eircodeKey":"K78W7P8","street":"Aderrig Grove"},{"eircodeKey":"K78W1K6","street":"Aderrig Grove"},{"eircodeKey":"K78W5A0","street":"Aderrig Grove"},{"eircodeKey":"K78N2N4","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78N5K0","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78E6N3","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78V3Y4","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78K2R4","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78Y2E5","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78H2F4","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78V0T9","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78T2N5","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78T9P8","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78V8K0","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78H7K3","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78R6C1","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78E4H3","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78P6V3","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78W2T7","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78Y3V6","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78N4X9","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78A2K3","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78E7Y4","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78H9F9","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78K3K2","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78E7R6","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78V9H2","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78E0K1","street":"Aderrig Heights, Celbridge Link Road"},{"eircodeKey":"K78T9H6","street":"Aderrig Lane"},{"eircodeKey":"K78P8E8","street":"Aderrig Lane"},{"eircodeKey":"K78C2W6","street":"Aderrig Lane"},{"eircodeKey":"K78H9Y5","street":"Aderrig Lane"},{"eircodeKey":"K78W2R3","street":"Aderrig Lane"},{"eircodeKey":"K78C9V6","street":"Aderrig Lane"},{"eircodeKey":"K78W6E4","street":"Aderrig Lane"},{"eircodeKey":"K78X4Y7","street":"Aderrig Lane"},{"eircodeKey":"K78P8N4","street":"Aderrig Lane"},{"eircodeKey":"K78R7F4","street":"Aderrig Lane"},{"eircodeKey":"K78E9R7","street":"Aderrig Lane"},{"eircodeKey":"K78X5X4","street":"Aderrig Lane"},{"eircodeKey":"K78Y5R3","street":"Aderrig Lane"},{"eircodeKey":"K78A2C9","street":"Aderrig Lane"},{"eircodeKey":"K78X5C6","street":"Aderrig Lane"},{"eircodeKey":"K78V5X8","street":"Aderrig Lane"},{"eircodeKey":"K78X6W2","street":"Aderrig Lane"},{"eircodeKey":"K78K5P1","street":"Aderrig Lane"},{"eircodeKey":"K78E4P9","street":"Aderrig Lane"},{"eircodeKey":"K78R1X7","street":"Aderrig Lane"},{"eircodeKey":"K78A3P8","street":"Aderrig Lane"},{"eircodeKey":"K78P6Y2","street":"Aderrig Lane"},{"eircodeKey":"K78X2W8","street":"Aderrig Lane"},{"eircodeKey":"K78V0Y8","street":"Aderrig Lane"},{"eircodeKey":"K78X8N9","street":"Aderrig Lane"},{"eircodeKey":"K78Y9P8","street":"Aderrig Lawn"},{"eircodeKey":"K78W5K3","street":"Aderrig Lawn"},{"eircodeKey":"K78E9T2","street":"Aderrig Lawn"},{"eircodeKey":"K78W9N2","street":"Aderrig Lawn"},{"eircodeKey":"K78N2T8","street":"Aderrig Lawn"},{"eircodeKey":"K78Y7N6","street":"Aderrig Lawn"},{"eircodeKey":"K78W2H5","street":"Aderrig Lawn"},{"eircodeKey":"K78E4E9","street":"Aderrig Lawn"},{"eircodeKey":"K78A6W0","street":"Aderrig Lawn"},{"eircodeKey":"K78F9X2","street":"Aderrig Lawn"},{"eircodeKey":"K78R6T2","street":"Aderrig Lawn"},{"eircodeKey":"K78N2K4","street":"Aderrig Lawn"},{"eircodeKey":"K78Y2R3","street":"Aderrig Lawn"},{"eircodeKey":"K78K2P1","street":"Aderrig Lawn"},{"eircodeKey":"K78W6A0","street":"Aderrig Lawn"},{"eircodeKey":"K78K2X3","street":"Aderrig Park Avenue"},{"eircodeKey":"K78R2N7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78H2F1","street":"Aderrig Park Avenue"},{"eircodeKey":"K78X8X3","street":"Aderrig Park Avenue"},{"eircodeKey":"K78X6C5","street":"Aderrig Park Avenue"},{"eircodeKey":"K78K0T3","street":"Aderrig Park Avenue"},{"eircodeKey":"K78K7X6","street":"Aderrig Park Avenue"},{"eircodeKey":"K78V9X7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78R3P1","street":"Aderrig Park Avenue"},{"eircodeKey":"K78A6Y1","street":"Aderrig Park Avenue"},{"eircodeKey":"K78Y0T0","street":"Aderrig Park Avenue"},{"eircodeKey":"K78V0A3","street":"Aderrig Park Avenue"},{"eircodeKey":"K78C7N0","street":"Aderrig Park Avenue"},{"eircodeKey":"K78N2T7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78C2H2","street":"Aderrig Park Avenue"},{"eircodeKey":"K78H6P5","street":"Aderrig Park Avenue"},{"eircodeKey":"K78N5X7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78W1X4","street":"Aderrig Park Avenue"},{"eircodeKey":"K78A0E2","street":"Aderrig Park Avenue"},{"eircodeKey":"K78E7F7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78A6K2","street":"Aderrig Park Avenue"},{"eircodeKey":"K78W1C9","street":"Aderrig Park Avenue"},{"eircodeKey":"K78F4A3","street":"Aderrig Park Avenue"},{"eircodeKey":"K78A9F4","street":"Aderrig Park Avenue"},{"eircodeKey":"K78R9C8","street":"Aderrig Park Avenue"},{"eircodeKey":"K78T9K3","street":"Aderrig Park Avenue"},{"eircodeKey":"K78F5C8","street":"Aderrig Park Avenue"},{"eircodeKey":"K78W6V9","street":"Aderrig Park Avenue"},{"eircodeKey":"K78R2K2","street":"Aderrig Park Avenue"},{"eircodeKey":"K78X0N7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78H2K8","street":"Aderrig Park Avenue"},{"eircodeKey":"K78C3V2","street":"Aderrig Park Avenue"},{"eircodeKey":"K78A0W5","street":"Aderrig Park Avenue"},{"eircodeKey":"K78T9P6","street":"Aderrig Park Avenue"},{"eircodeKey":"K78C9F7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78T1W9","street":"Aderrig Park Avenue"},{"eircodeKey":"K78C6W7","street":"Aderrig Park Avenue"},{"eircodeKey":"K78K8W9","street":"Aderrig Park Avenue"},{"eircodeKey":"K78Y6P8","street":"Aderrig Park Avenue"},{"eircodeKey":"K78R1X2","street":"Aderrig Park Avenue"},{"eircodeKey":"K78F8C2","street":"Aderrig Place"},{"eircodeKey":"K78Y8X3","street":"Aderrig Place"},{"eircodeKey":"K78W3K1","street":"Aderrig Place"},{"eircodeKey":"K78Y9V9","street":"Aderrig Place"},{"eircodeKey":"K78W9Y0","street":"Aderrig Place"},{"eircodeKey":"K78A0X6","street":"Aderrig Place"},{"eircodeKey":"K78C9C4","street":"Aderrig Place"},{"eircodeKey":"K78A3H5","street":"Aderrig Place"},{"eircodeKey":"K78A9K6","street":"Aderrig Place"},{"eircodeKey":"K78W6W0","street":"Aderrig Place"},{"eircodeKey":"K78W9E8","street":"Aderrig Place"},{"eircodeKey":"K78A5R7","street":"Aderrig Place"},{"eircodeKey":"K78H2Y5","street":"Aderrig Place"},{"eircodeKey":"K78C8H2","street":"Aderrig Street"},{"eircodeKey":"K78P9Y1","street":"Aderrig Street"},{"eircodeKey":"K78F2R9","street":"Aderrig Street"},{"eircodeKey":"K78Y6Y3","street":"Aderrig Street"},{"eircodeKey":"K78F8A0","street":"Aderrig Street"},{"eircodeKey":"K78E6W4","street":"Aderrig Street"},{"eircodeKey":"K78T3Y4","street":"Aderrig Street"},{"eircodeKey":"K78Y3C8","street":"Aderrig Street"},{"eircodeKey":"K78F2A2","street":"Aderrig Street"},{"eircodeKey":"K78T3H5","street":"Aderrig Street"},{"eircodeKey":"K78V2C6","street":"Aderrig Street"},{"eircodeKey":"K78N8E8","street":"Aderrig Street"},{"eircodeKey":"K78C3C7","street":"Aderrig Street"},{"eircodeKey":"K78X3F4","street":"Aderrig Street"},{"eircodeKey":"K78K5K6","street":"Aderrig Street"},{"eircodeKey":"K78C3Y1","street":"Aderrig Walk"},{"eircodeKey":"K78R8C1","street":"Aderrig Walk"},{"eircodeKey":"K78V8E8","street":"Aderrig Walk"},{"eircodeKey":"K78E2K3","street":"Aderrig Walk"},{"eircodeKey":"K78C8P3","street":"Aderrig Walk"},{"eircodeKey":"K78A2P2","street":"Aderrig Walk"},{"eircodeKey":"K78Y9C3","street":"Aderrig Walk"},{"eircodeKey":"K78P7Y2","street":"Aderrig Walk"},{"eircodeKey":"K78F2C0","street":"Aderrig Walk"},{"eircodeKey":"K78P9K8","street":"Aderrig Walk"},{"eircodeKey":"K78C9W2","street":"Aderrig Walk"},{"eircodeKey":"K78N2W7","street":"Aderrig Walk"},{"eircodeKey":"K78Y3K5","street":"Airlie Park Road West"},{"eircodeKey":"K78F6Y7","street":"Airlie Park Road West"},{"eircodeKey":"K78R7Y5","street":"Airlie Park Road West"},{"eircodeKey":"K78A2T6","street":"Airlie Park Road West"},{"eircodeKey":"K78K1W7","street":"Airlie Park Road West"},{"eircodeKey":"K78H2V1","street":"Airlie Park Road West"},{"eircodeKey":"K78W5H9","street":"Airlie Park Road West"},{"eircodeKey":"K78T1F3","street":"Airlie Park Road West"},{"eircodeKey":"K78K5C3","street":"Airlie Park Road West"},{"eircodeKey":"K78A2Y5","street":"Airlie Park Road West"},{"eircodeKey":"K78W8Y9","street":"Airlie Park Road West"},{"eircodeKey":"K78F9R2","street":"Airlie Park Road West"},{"eircodeKey":"K78X8K5","street":"Airlie Park Road West"},{"eircodeKey":"K78W2X7","street":"Airlie Park Road West"},{"eircodeKey":"K78W3V7","street":"Airlie Park Road West"},{"eircodeKey":"K78W2N9","street":"Airlie Park Road West"},{"eircodeKey":"K78X6R7","street":"Airlie Park Road West"}];
const DEFAULT_DIRECTORS = [
  'selerizzuti@gmail.com',
  'bahrikaran@gmail.com',
  'rohananeja@gmail.com',
  'niravakbari20@gmail.com',
  'aditiu008@gmail.com',
  'claudiosantos1968@gmail.com'
];

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

function allowedDirectorEmails() {
  const configured = String(process.env.DIRECTOR_EMAILS || '').trim();
  if (!configured) return DEFAULT_DIRECTORS;
  return configured.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
}

function normaliseVote(value = '') {
  const v = String(value).trim().toLowerCase();
  if (['agree', 'approved', 'approve', 'yes', 'sim', 'aprovado'].includes(v)) return 'Agree';
  if (['do not agree', 'disagree', 'not agree', 'no', 'não', 'nao', 'rejected', 'reject'].includes(v)) return 'Do Not Agree';
  return value ? String(value).trim() : 'Unknown';
}

function normaliseEircode(value = '') {
  const clean = String(value).toUpperCase().replace(/\s+/g, '');
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)} ${clean.slice(3)}`;
}

function safeDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IE', {
    timeZone: 'Europe/Dublin',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function field(data, names) {
  for (const name of names) {
    if (data && data[name] !== undefined && data[name] !== null && String(data[name]).trim() !== '') return data[name];
  }
  return '';
}

function submissionReference(item, data) {
  return field(data, [
    'referenceId',
    'publicReferenceId',
    'public_reference_id',
    'reference_id',
    'reference',
    'Reference',
    'Reference ID',
    'referenceNumber',
    'reference_number',
    'voteReference',
    'vote_reference',
    'submissionId',
    'submission_id',
    'id'
  ]) || item.id || item.number || '';
}


function pct(part, total) {
  return total ? Number(((part / total) * 100).toFixed(1)) : 0;
}

function firstValidRowsByEircode(rows) {
  const sorted = rows.slice().sort((a, b) => {
    const da = new Date(a.createdAt || a.submittedAtIreland || 0).getTime();
    const db = new Date(b.createdAt || b.submittedAtIreland || 0).getTime();
    return (Number.isNaN(da) ? 0 : da) - (Number.isNaN(db) ? 0 : db);
  });

  const seen = new Set();
  const validRows = [];
  const excludedDuplicateRows = [];

  for (const row of sorted) {
    const key = String(row.eircode || '').toUpperCase().replace(/\s+/g, '');
    if (!key) {
      validRows.push(row);
      continue;
    }
    if (seen.has(key)) {
      excludedDuplicateRows.push(row);
    } else {
      seen.add(key);
      validRows.push(row);
    }
  }

  return { validRows, excludedDuplicateRows };
}



function eircodeKey(value = '') {
  return String(value || '').toUpperCase().replace(/\s+/g, '');
}

function buildStreetBreakdown(validRows = []) {
  const baseByEircode = new Map();
  const streetMap = new Map();

  for (const item of OFFICIAL_RESIDENT_BASE) {
    const key = eircodeKey(item.eircodeKey);
    if (!key) continue;
    const street = String(item.street || 'Unknown street').trim() || 'Unknown street';
    baseByEircode.set(key, street);
    if (!streetMap.has(street)) {
      streetMap.set(street, {
        street,
        potential: 0,
        votes: 0,
        participationRate: 0
      });
    }
    streetMap.get(street).potential += 1;
  }

  const unknownEircodesMap = new Map();

  for (const row of validRows) {
    const key = eircodeKey(row.eircode);
    if (!key) continue;
    const street = baseByEircode.get(key);
    if (!street) {
      if (!unknownEircodesMap.has(key)) {
        unknownEircodesMap.set(key, {
          eircode: normaliseEircode(key),
          firstSubmitted: row.submittedAtIreland || safeDate(row.createdAt),
          vote: row.vote || 'Unknown',
          referenceId: row.referenceId || ''
        });
      }
      continue;
    }
    if (!streetMap.has(street)) {
      streetMap.set(street, {
        street,
        potential: 0,
        votes: 0,
        participationRate: 0
      });
    }
    streetMap.get(street).votes += 1;
  }

  const streets = Array.from(streetMap.values())
    .map(row => ({
      ...row,
      participationRate: pct(row.votes, row.potential)
    }))
    .sort((a, b) => b.participationRate - a.participationRate || b.votes - a.votes || b.potential - a.potential || a.street.localeCompare(b.street));

  return {
    totalPotential: streets.reduce((sum, row) => sum + row.potential, 0),
    matchedVotes: streets.reduce((sum, row) => sum + row.votes, 0),
    unknownEircodes: Array.from(unknownEircodesMap.values()),
    streets
  };
}

async function fetchNetlifyFormSubmissions(formId, token, maxPages = 30) {
  const all = [];
  let page = 1;
  const perPage = 100;
  while (page <= maxPages) {
    const url = `https://api.netlify.com/api/v1/forms/${encodeURIComponent(formId)}/submissions?page=${page}&per_page=${perPage}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const text = await response.text();
      const error = new Error(text.slice(0, 500));
      error.status = response.status;
      throw error;
    }
    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }
  return all;
}

async function findDownloadFormId(token) {
  const configured = String(process.env.NETLIFY_DOWNLOAD_FORM_ID || '').trim();
  if (configured) return configured;

  const siteId = String(process.env.NETLIFY_SITE_ID || process.env.SITE_ID || '').trim();
  if (!siteId) return '';

  const response = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/forms`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return '';
  const forms = await response.json();
  if (!Array.isArray(forms)) return '';
  const found = forms.find(form => String(form.name || '').toLowerCase() === 'aderrig-green-policy-download-audit');
  return found?.id || '';
}

function buildDownloadAudit(downloadSubmissions = [], voteRows = []) {
  const voteEmails = new Set(voteRows.map(row => String(row.email || '').trim().toLowerCase()).filter(Boolean));
  const voteEircodes = new Set(voteRows.map(row => String(row.eircode || '').toUpperCase().replace(/\s+/g, '')).filter(Boolean));
  const groups = new Map();

  for (const item of downloadSubmissions) {
    const data = item.data || item.form_data || item || {};
    const visitorKey = String(field(data, ['visitorKey', 'visitor_key', 'visitor', 'Visitor Key']) || item.id || '').trim();
    const email = String(field(data, ['email', 'Email']) || '').trim().toLowerCase();
    const eircode = normaliseEircode(field(data, ['eircode', 'Eircode']) || '');
    const downloadedAt = field(data, ['downloadedAtIreland', 'downloaded_at_ireland', 'downloadedAt']) || safeDate(item.created_at || item.createdAt || new Date().toISOString());
    const createdAt = item.created_at || item.createdAt || downloadedAt;
    const key = visitorKey || email || eircode || item.id || `download-${groups.size + 1}`;

    if (!groups.has(key)) {
      groups.set(key, {
        visitorKey: key,
        email: '',
        eircode: '',
        downloads: 0,
        firstDownload: downloadedAt,
        lastDownload: downloadedAt,
        firstCreatedAt: createdAt,
        lastCreatedAt: createdAt,
        identified: false,
        voted: false
      });
    }

    const group = groups.get(key);
    group.downloads += 1;
    if (email) group.email = email;
    if (eircode) group.eircode = eircode;

    const currentTime = new Date(createdAt).getTime();
    const firstTime = new Date(group.firstCreatedAt).getTime();
    const lastTime = new Date(group.lastCreatedAt).getTime();
    if (!Number.isNaN(currentTime) && (Number.isNaN(firstTime) || currentTime < firstTime)) {
      group.firstCreatedAt = createdAt;
      group.firstDownload = downloadedAt;
    }
    if (!Number.isNaN(currentTime) && (Number.isNaN(lastTime) || currentTime > lastTime)) {
      group.lastCreatedAt = createdAt;
      group.lastDownload = downloadedAt;
    }
  }

  const rows = Array.from(groups.values()).map(group => {
    const eirKey = String(group.eircode || '').toUpperCase().replace(/\s+/g, '');
    group.identified = !!(group.email || group.eircode);
    group.voted = (group.email && voteEmails.has(group.email)) || (eirKey && voteEircodes.has(eirKey));
    return group;
  }).sort((a, b) => new Date(b.lastCreatedAt) - new Date(a.lastCreatedAt));

  const identifiedRows = rows.filter(row => row.identified);
  const anonymousRows = rows.filter(row => !row.identified);
  const totalDownloadClicks = rows.reduce((sum, row) => sum + row.downloads, 0);
  const identifiedDownloadClicks = identifiedRows.reduce((sum, row) => sum + row.downloads, 0);
  const anonymousDownloadClicks = anonymousRows.reduce((sum, row) => sum + row.downloads, 0);
  const votedAfterDownload = identifiedRows.filter(row => row.voted).length;

  return {
    totalDownloadClicks,
    uniqueVisitors: rows.length,
    anonymousVisitors: anonymousRows.length,
    identifiedVisitors: identifiedRows.length,
    anonymousDownloadClicks,
    identifiedDownloadClicks,
    votedAfterDownload,
    conversionToVotePercent: pct(votedAfterDownload, identifiedRows.length),
    rows,
    anonymousRows,
    identifiedRows
  };
}

function buildReport(submissions, includeRows = false) {
  const rows = submissions.map((item, index) => {
    const data = item.data || item.form_data || item || {};
    const vote = normaliseVote(field(data, ['vote', 'Vote', 'decision', 'choice']));
    const eircode = normaliseEircode(field(data, ['eircode', 'Eircode', 'eir_code', 'postcode']));
    const email = String(field(data, ['email', 'Email'])).trim().toLowerCase();
    const createdAt = item.created_at || item.createdAt || data.created_at || data.createdAt || field(data, ['submitted_at', 'submitted_at_ireland']);
    return {
      number: index + 1,
      id: item.id || '',
      email,
      eircode,
      vote,
      confirmed: field(data, ['confirmed', 'Confirmed']) || '',
      referenceId: submissionReference(item, data),
      submittedAtIreland: field(data, ['submitted_at_ireland', 'submittedAtIreland']) || safeDate(createdAt),
      createdAt: createdAt || '',
      ip: item.ip || data.ip || '',
      userAgent: field(data, ['user_agent', 'userAgent']) || '',
      referrer: item.referrer || data.referrer || ''
    };
  });

  const eircodeCounts = rows.reduce((acc, row) => {
    if (!row.eircode) return acc;
    acc[row.eircode] = (acc[row.eircode] || 0) + 1;
    return acc;
  }, {});
  const duplicateEircodes = Object.entries(eircodeCounts)
    .filter(([, count]) => count > 1)
    .map(([eircode, count]) => ({ eircode, count }));

  const { validRows, excludedDuplicateRows } = firstValidRowsByEircode(rows);

  const totalVotes = validRows.length;
  const agree = validRows.filter(r => r.vote === 'Agree').length;
  const doNotAgree = validRows.filter(r => r.vote === 'Do Not Agree').length;
  const unknown = totalVotes - agree - doNotAgree;
  const outstandingResidences = Math.max(TOTAL_RESIDENCES - totalVotes, 0);

  const validEircodeCounts = validRows.reduce((acc, row) => {
    if (!row.eircode) return acc;
    acc[row.eircode] = (acc[row.eircode] || 0) + 1;
    return acc;
  }, {});
  const uniqueEircodes = Object.keys(validEircodeCounts).length;

  const lastSubmission = rows
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.submittedAtIreland) - new Date(a.createdAt || a.submittedAtIreland))[0] || null;

  const byDayMap = {};
  for (const row of validRows) {
    const raw = row.createdAt || row.submittedAtIreland;
    const d = new Date(raw);
    const key = Number.isNaN(d.getTime()) ? String(raw).slice(0, 10) || 'Unknown' : d.toISOString().slice(0, 10);
    byDayMap[key] = byDayMap[key] || { date: key, total: 0, agree: 0, doNotAgree: 0, unknown: 0 };
    byDayMap[key].total++;
    if (row.vote === 'Agree') byDayMap[key].agree++;
    else if (row.vote === 'Do Not Agree') byDayMap[key].doNotAgree++;
    else byDayMap[key].unknown++;
  }

  const report = {
    generatedAtIreland: safeDate(new Date().toISOString()),
    officialBaseline: OFFICIAL_BASELINE,
    totalResidences: TOTAL_RESIDENCES,
    summary: {
      totalResidences: TOTAL_RESIDENCES,
      totalVotes,
      recordedSubmissions: rows.length,
      excludedDuplicateVotes: excludedDuplicateRows.length,
      outstandingResidences,
      participationRate: pct(totalVotes, TOTAL_RESIDENCES),
      agree,
      doNotAgree,
      unknown,
      agreePercent: pct(agree, totalVotes),
      doNotAgreePercent: pct(doNotAgree, totalVotes),
      unknownPercent: pct(unknown, totalVotes),
      uniqueEircodes,
      duplicateEircodesCount: duplicateEircodes.length,
      lastSubmission: includeRows ? lastSubmission : null
    },
    byDay: Object.values(byDayMap).sort((a, b) => a.date.localeCompare(b.date)),
    streetBreakdown: includeRows ? buildStreetBreakdown(validRows) : null
  };

  if (includeRows) {
    report.duplicateEircodes = duplicateEircodes;
    report.excludedDuplicateRows = excludedDuplicateRows;
    report.rows = rows;
  } else {
    report.duplicateEircodes = [];
    report.excludedDuplicateRows = [];
    report.rows = [];
  }

  return report;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return json(405, { ok: false, message: 'Method not allowed.' });

  const directorPin = process.env.DIRECTOR_PIN || process.env.ADMIN_PIN || 'OMCDIRETORES2026';
  const adminPin = process.env.ADMIN_ONLY_PIN || 'OMCADMIN2026';
  const providedPin = event.headers['x-admin-pin'] || event.headers['X-Admin-Pin'] || '';
  const directorEmail = String(event.headers['x-director-email'] || event.headers['X-Director-Email'] || '').trim().toLowerCase();
  const allowedEmails = allowedDirectorEmails();
  const isAdmin = directorEmail === ADMIN_EMAIL;

  if (!directorEmail) return json(401, { ok: false, message: 'Please enter your director email.' });
  if (!allowedEmails.includes(directorEmail)) return json(403, { ok: false, message: 'This email is not authorised to access the directors dashboard.' });

  if (isAdmin) {
    if (String(providedPin) !== String(adminPin)) {
      return json(401, { ok: false, message: 'Invalid administrator password.' });
    }
  } else if (String(providedPin) !== String(directorPin)) {
    return json(401, { ok: false, message: 'Invalid directors password.' });
  }

  const formId = process.env.NETLIFY_FORM_ID || '6a19f4c677b40f0008c59273';
  const token = process.env.NETLIFY_AUTH_TOKEN || '';
  if (!token) {
    return json(500, {
      ok: false,
      code: 'MISSING_NETLIFY_AUTH_TOKEN',
      isAdmin,
      authorisedDirector: directorEmail,
      message: 'Live dashboard is not connected yet. Please configure NETLIFY_AUTH_TOKEN in Netlify Environment variables.'
    });
  }

  let all = [];
  try {
    all = await fetchNetlifyFormSubmissions(formId, token, 30);
  } catch (error) {
    return json(error.status || 500, {
      ok: false,
      isAdmin,
      authorisedDirector: directorEmail,
      message: 'Could not read Netlify Forms submissions. Please check NETLIFY_AUTH_TOKEN and NETLIFY_FORM_ID.',
      detail: String(error.message || '').slice(0, 500)
    });
  }

  const report = buildReport(all, isAdmin);

  if (isAdmin) {
    try {
      const downloadFormId = await findDownloadFormId(token);
      const downloadSubmissions = downloadFormId ? await fetchNetlifyFormSubmissions(downloadFormId, token, 30) : [];
      report.downloadAudit = buildDownloadAudit(downloadSubmissions, report.rows || []);
      report.downloadAuditConfigured = !!downloadFormId;
    } catch (error) {
      report.downloadAudit = buildDownloadAudit([], report.rows || []);
      report.downloadAuditConfigured = false;
      report.downloadAuditError = String(error.message || '').slice(0, 500);
    }
  }

  return json(200, {
    ok: true,
    authorisedDirector: directorEmail,
    isAdmin,
    role: isAdmin ? 'administrator' : 'director',
    ...report
  });
};
