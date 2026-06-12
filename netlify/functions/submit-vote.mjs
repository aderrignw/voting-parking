import {
  json,
  normalizeEircode,
  validEircode,
  makeReferenceId,
  getBlobStore
} from './_utils.mjs';
import { backupVoteRecord } from './_github-backup.mjs';
const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';
const REMOVED_PREFIX = 'removed-votes/';
const settingsStore = () => getBlobStore('aderrig-parking-settings');
const SETTINGS_KEY = 'settings/voting-settings.json';
const VOTING_CLOSED_MESSAGE = 'Voting for this consultation has now closed. No further votes can be submitted.';

async function readVotingSettings() {
  const store = settingsStore();
  try {
    const item = await store.get(SETTINGS_KEY, { type: 'json', consistency: 'strong' });
    if (item && typeof item === 'object') return item;
  } catch {}
  try {
    const text = await store.get(SETTINGS_KEY, { type: 'text', consistency: 'strong' });
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function votingIsClosed() {
  const settings = await readVotingSettings();
  const closeAtIso = String(settings?.votingCloseAtIso || '').trim();
  if (!closeAtIso) return { closed: false, closeAtIso: '' };
  const closeAt = new Date(closeAtIso);
  if (Number.isNaN(closeAt.getTime())) return { closed: false, closeAtIso: '' };
  return { closed: Date.now() >= closeAt.getTime(), closeAtIso, closeLabel: settings?.votingCloseLabel || '' };
}

const INELIGIBLE_EIRCODE_MESSAGE = 'This consultation is restricted to residents within the Aderrig Green area. The Eircode provided could not be verified as belonging to an eligible residence. Please check your Eircode and try again.';
const DUPLICATE_EIRCODE_MESSAGE = 'This residence has already voted. One vote per Eircode is permitted.';
const INVALID_EIRCODE_MESSAGE = 'This Eircode does not appear to be a valid residential Eircode. Please check the Eircode and try again.';
const OFFICIAL_EIRCODE_KEYS = new Set(["K78A0E2","K78A0F3","K78A0W5","K78A0X6","K78A2C2","K78A2C9","K78A2K3","K78A2P2","K78A2T6","K78A2Y5","K78A3H5","K78A3P8","K78A5F1","K78A5R7","K78A6K2","K78A6W0","K78A6Y1","K78A8N2","K78A8P3","K78A9F4","K78A9K6","K78A9X7","K78C2H2","K78C2H9","K78C2R4","K78C2W6","K78C3C7","K78C3V2","K78C3Y1","K78C6W7","K78C7N0","K78C8C4","K78C8H2","K78C8P3","K78C9C4","K78C9F7","K78C9V6","K78C9W2","K78E0K1","K78E0W4","K78E2K3","K78E3W6","K78E4E9","K78E4H3","K78E4P9","K78E6F2","K78E6H9","K78E6N3","K78E6W4","K78E7C9","K78E7F7","K78E7R6","K78E7Y0","K78E7Y4","K78E9R2","K78E9R7","K78E9T2","K78F2A2","K78F2C0","K78F2P2","K78F2R9","K78F4A3","K78F5C8","K78F6Y7","K78F8A0","K78F8C2","K78F9R2","K78F9X2","K78H0F3","K78H2F1","K78H2F4","K78H2K8","K78H2P3","K78H2V1","K78H2Y5","K78H6N3","K78H6P5","K78H7K3","K78H7R2","K78H9F9","K78H9Y5","K78K0T3","K78K1W7","K78K2P1","K78K2R4","K78K2T0","K78K2X3","K78K3H1","K78K3K2","K78K5C3","K78K5K6","K78K5P1","K78K5W8","K78K7W7","K78K7X6","K78K8W9","K78N2K4","K78N2N4","K78N2T7","K78N2T8","K78N2W7","K78N4X9","K78N5K0","K78N5X7","K78N6P9","K78N7P0","K78N8E8","K78N8X7","K78N9P3","K78P2C8","K78P2Y2","K78P3K6","K78P6H2","K78P6V3","K78P6Y2","K78P7Y2","K78P8E8","K78P8N4","K78P8W6","K78P9K8","K78P9Y1","K78R1X2","K78R1X7","K78R2H6","K78R2K2","K78R2N7","K78R3P1","K78R6C1","K78R6C8","K78R6P2","K78R6T2","K78R7F4","K78R7Y5","K78R8C1","K78R9C8","K78R9P9","K78T1F3","K78T1W6","K78T1W9","K78T2F5","K78T2N5","K78T2W8","K78T3H5","K78T3V1","K78T3Y4","K78T6C9","K78T6X7","K78T8N2","K78T8X5","K78T9H6","K78T9K3","K78T9P6","K78T9P8","K78V0A3","K78V0T9","K78V0Y8","K78V2C6","K78V2X6","K78V3Y4","K78V5X8","K78V8E8","K78V8K0","K78V9H2","K78V9X7","K78W1C9","K78W1K6","K78W1W7","K78W1X4","K78W2H5","K78W2N4","K78W2N9","K78W2P3","K78W2R3","K78W2T7","K78W2X7","K78W3C9","K78W3K1","K78W3V7","K78W4C0","K78W5A0","K78W5H9","K78W5K3","K78W6A0","K78W6E4","K78W6V9","K78W6W0","K78W7P8","K78W8Y9","K78W9E8","K78W9N2","K78W9Y0","K78X0F4","K78X0N7","K78X2R5","K78X2W8","K78X3E8","K78X3F4","K78X4Y7","K78X5C6","K78X5K5","K78X5X4","K78X6C5","K78X6N2","K78X6R7","K78X6W2","K78X8K5","K78X8N9","K78X8X3","K78Y0E0","K78Y0T0","K78Y2E5","K78Y2R3","K78Y3C8","K78Y3K5","K78Y3V6","K78Y5R3","K78Y6P8","K78Y6X5","K78Y6Y3","K78Y7N6","K78Y7Y8","K78Y8X3","K78Y9C3","K78Y9E2","K78Y9K3","K78Y9P8","K78Y9V9"]);
const UNLISTED_EIRCODE_MESSAGE = 'We could not match this Eircode to the Aderrig Green residence register. Please check your Eircode carefully. If it is correct, you may confirm it and it will be marked for administrator review.';

function eircodeKey(eircode) {
  return String(eircode || '').toUpperCase().replace(/\s+/g, '');
}


const CLUID_EIRCODE_EMAIL_MAP = new Map([
  ['K78T2N5', 'tbreen@cluid.ie'],
  ['K78T9P8', 'tbreen@cluid.ie'],
  ['K78T1W9', 'tbreen@cluid.ie'],
  ['K78E9R2', 'tbreen@cluid.ie'],
  ['K78K2T0', 'tbreen@cluid.ie'],
  ['K78E7Y0', 'tbreen@cluid.ie'],
  ['K78A8P3', 'sculhane@cluid.ie'],
  ['K78N9P3', 'tbreen@cluid.ie'],
  ['K78Y0E0', 'tbreen@cluid.ie'],
  ['K78C2H9', 'tbreen@cluid.ie'],
  ['K78R6P2', 'tbreen@cluid.ie'],
  ['K78X2R5', 'tbreen@cluid.ie'],
  ['K78P8W6', 'tbreen@cluid.ie'],
  ['K78E6H9', 'tbreen@cluid.ie'],
  ['K78X6W2', 'omc@cluid.ie'],
  ['K78K5P1', 'omc@cluid.ie'],
  ['K78E4P9', 'omc@cluid.ie'],
  ['K78R1X7', 'omc@cluid.ie'],
  ['K78A3P8', 'omc@cluid.ie'],
  ['K78P6Y2', 'omc@cluid.ie'],
  ['K78X2W8', 'omc@cluid.ie'],
  ['K78V0Y8', 'omc@cluid.ie'],
  ['K78X8N9', 'omc@cluid.ie']
]);

const CLUID_ONLY_MESSAGE = 'This email is not authorised to vote for this Clúid property. Please use the registered Clúid email address for this property. (Clúid only)';

function cluidAuthorisedEmailForEircode(eircode) {
  return CLUID_EIRCODE_EMAIL_MAP.get(eircodeKey(eircode)) || '';
}

function isAuthorisedCluidVote(eircode, email) {
  const authorisedEmail = cluidAuthorisedEmailForEircode(eircode);
  if (!authorisedEmail) return true;
  return String(email || '').trim().toLowerCase() === authorisedEmail;
}

function isOfficialAderrigEircode(eircode) {
  return OFFICIAL_EIRCODE_KEYS.has(eircodeKey(eircode));
}

function validResidentEmail(email = '') {
  const value = String(email || '').trim().toLowerCase();
  if (value.length < 6 || value.length > 254) return false;
  if (/\s/.test(value) || value.includes('..')) return false;
  const match = value.match(/^([a-z0-9.!#$%&'*+/=?^_`{|}~-]+)@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i);
  if (!match) return false;
  const local = match[1];
  const domain = match[2];
  if (local.startsWith('.') || local.endsWith('.')) return false;
  const labels = domain.split('.');
  if (labels.some(label => !label || label.startsWith('-') || label.endsWith('-'))) return false;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,24}$/.test(tld)) return false;
  if (['pdf','doc','docx','xls','xlsx','txt','jpg','jpeg','png','gif','html','zip'].includes(tld)) return false;
  return true;
}


function validReferenceId(value) {
  return /^AG-2026-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(String(value || '').trim().toUpperCase());
}

function eligibleAderrigGreenEircode(eircode) {
  return String(eircode || '').replace(/\s+/g, '').startsWith('K78');
}

function clearlyInvalidEircode(eircode) {
  const compact = String(eircode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^K78[A-Z0-9]{4}$/.test(compact)) return false;

  const unique = compact.slice(3);

  if (['0000', 'XXXX', 'TEST'].includes(unique)) return true;
  if (/^([A-Z0-9])\1{3}$/.test(unique)) return true;
  if (/^1234$/.test(unique)) return true;
  if (/^ABCD$/.test(unique)) return true;
  if (/^ZZZZ$/.test(unique)) return true;

  return false;
}

function getFieldValue(submission, fieldName) {
  const wanted = String(fieldName || '').toLowerCase();

  if (submission?.data && typeof submission.data === 'object') {
    for (const [key, value] of Object.entries(submission.data)) {
      if (String(key).toLowerCase() === wanted) return value;
    }
  }

  if (Array.isArray(submission?.fields)) {
    const found = submission.fields.find((field) => {
      const name = String(field?.name || field?.key || '').toLowerCase();
      return name === wanted;
    });
    return found?.value;
  }

  return undefined;
}

async function fetchAllSubmissions(formId, token) {
  const all = [];
  let page = 1;

  while (page <= 20) {
    const url = `${NETLIFY_API_BASE}/forms/${encodeURIComponent(formId)}/submissions?page=${page}&per_page=100`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`Netlify Forms API error ${response.status}: ${details}`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    all.push(...batch);
    if (batch.length < 100) break;

    page += 1;
  }

  return all;
}

async function readRemovedVotes() {
  const removed = [];
  try {
    const store = settingsStore();
    let cursor;
    do {
      const result = await store.list({ prefix: REMOVED_PREFIX, cursor });
      for (const blob of result.blobs || []) {
        const item = await store.get(blob.key, { type: 'json', consistency: 'strong' });
        if (item) removed.push(item);
      }
      cursor = result.cursor;
    } while (cursor);
  } catch {}
  return removed;
}

function compactEircode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function compactText(value) {
  return String(value || '').trim().toLowerCase();
}

function parseDateValue(value) {
  if (!value) return 0;
  const direct = new Date(value).getTime();
  if (!Number.isNaN(direct)) return direct;
  const ireland = String(value || '').replace(/(\d{1,2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/, '$1 $2 $3 $4:$5:00 GMT');
  const fallback = new Date(ireland).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

function removedVoteTokens(item = {}) {
  const tokens = Array.isArray(item.removalTokens) && item.removalTokens.length
    ? item.removalTokens
    : [item.submissionId, item.referenceId, item.submittedAtIreland, item.createdAt];
  return tokens.map(compactText).filter(Boolean);
}

function submissionTokens(submission) {
  return [
    submission?.id,
    getFieldValue(submission, 'referenceId'),
    getFieldValue(submission, 'reference_id'),
    getFieldValue(submission, 'reference'),
    submission?.created_at,
    getFieldValue(submission, 'submitted_at_ireland'),
    getFieldValue(submission, 'submittedAtIreland')
  ].map(compactText).filter(Boolean);
}

function submissionWasRemoved(submission, removedVotes = []) {
  const tokens = new Set(submissionTokens(submission));
  const submittedEircodeKey = compactEircode(getFieldValue(submission, 'eircode') || '');
  const submittedEmail = compactText(getFieldValue(submission, 'email') || '');
  const submittedAt = parseDateValue(submission?.created_at || getFieldValue(submission, 'submitted_at_ireland') || getFieldValue(submission, 'submittedAtIreland'));

  return removedVotes.some((removed) => {
    if (removedVoteTokens(removed).some(token => tokens.has(token))) return true;

    const removedEircodeKey = compactEircode(removed.eircode || '');
    if (!removedEircodeKey || removedEircodeKey !== submittedEircodeKey) return false;

    const removedEmail = compactText(removed.email || '');
    const sameEmailOrUnknown = !removedEmail || !submittedEmail || removedEmail === submittedEmail;
    if (!sameEmailOrUnknown) return false;

    const removedAt = parseDateValue(removed.removedAtIso || removed.removedAtIreland);
    if (!removedAt || !submittedAt) return true;

    return submittedAt <= removedAt + (2 * 60 * 1000);
  });
}

async function eircodeAlreadyVoted(eircode) {
  const formId = process.env.NETLIFY_FORM_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (!formId || !token) {
    throw new Error('Missing NETLIFY_FORM_ID or NETLIFY_AUTH_TOKEN.');
  }

  const submissions = await fetchAllSubmissions(formId, token);
  const removedVotes = await readRemovedVotes();
  const requestedEircodeKey = compactEircode(eircode);

  return submissions.some((submission) => {
    const submittedEircodeKey = compactEircode(getFieldValue(submission, 'eircode') || '');
    if (submittedEircodeKey !== requestedEircodeKey) return false;
    return !submissionWasRemoved(submission, removedVotes);
  });
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, message: 'Method not allowed.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const email = String(body.email || '').trim().toLowerCase();
    const eircode = normalizeEircode(body.eircode || '');
    const vote = String(body.vote || '').trim();
    const confirmed = body.confirmed === true || body.confirmed === 'true';
    const submittedReferenceId = String(body.referenceId || body.reference_id || body.reference || '').trim().toUpperCase();
    const confirmUnlistedEircode = body.confirmUnlistedEircode === true || body.confirmUnlistedEircode === 'true';

    const closure = await votingIsClosed();
    if (closure.closed) {
      return json(403, {
        ok: false,
        closed: true,
        message: VOTING_CLOSED_MESSAGE,
        votingCloseAtIso: closure.closeAtIso,
        votingCloseLabel: closure.closeLabel
      });
    }

    if (!validResidentEmail(email)) {
      return json(400, { ok: false, message: 'Please enter a valid email address.' });
    }

    if (!validEircode(eircode)) {
      return json(400, { ok: false, message: 'Please enter a valid Eircode.' });
    }

    if (!eligibleAderrigGreenEircode(eircode)) {
      return json(403, {
        ok: false,
        eligible: false,
        message: INELIGIBLE_EIRCODE_MESSAGE
      });
    }

    if (clearlyInvalidEircode(eircode)) {
      return json(400, {
        ok: false,
        eligible: false,
        message: INVALID_EIRCODE_MESSAGE
      });
    }

    if (!isAuthorisedCluidVote(eircode, email)) {
      return json(403, {
        ok: false,
        eligible: true,
        cluidOnly: true,
        message: CLUID_ONLY_MESSAGE
      });
    }

    const officialMatch = isOfficialAderrigEircode(eircode);

    if (!officialMatch && !confirmUnlistedEircode) {
      return json(409, {
        ok: false,
        eligible: true,
        needsConfirmation: true,
        reviewRequired: true,
        message: UNLISTED_EIRCODE_MESSAGE
      });
    }

    if (!['Agree', 'Do Not Agree'].includes(vote)) {
      return json(400, { ok: false, message: 'Please select your vote.' });
    }

    if (!confirmed) {
      return json(400, { ok: false, message: 'Please confirm one vote per residence.' });
    }

    const duplicate = await eircodeAlreadyVoted(eircode);

    if (duplicate) {
      return json(409, {
        ok: false,
        duplicate: true,
        message: DUPLICATE_EIRCODE_MESSAGE
      });
    }

    const now = new Date();
    const submittedAtIso = now.toISOString();
    const submittedAtIreland = now.toLocaleString('en-IE', {
      timeZone: 'Europe/Dublin',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const publicReferenceId = validReferenceId(submittedReferenceId) ? submittedReferenceId : makeReferenceId();

    const record = {
      referenceId: publicReferenceId,
      email,
      eircode,
      eircodeKey: String(eircode || '').replace(/\s+/g, ''),
      eircodeStatus: officialMatch ? 'verified' : 'review_required',
      eircodeOfficialMatch: officialMatch,
      vote,
      submittedAtIreland,
      submittedAtIso
    };

    const backup = await backupVoteRecord(record);

    return json(200, {
      ok: true,
      message: 'Vote successfully recorded.',
      record: {
        referenceId: publicReferenceId,
        eircode,
        eircodeStatus: officialMatch ? 'verified' : 'review_required',
        vote,
        submittedAtIreland
      },
      backup
    });
  } catch (error) {
    console.error('submit-vote error:', error);
    return json(500, {
      ok: false,
      message: 'Unable to submit your vote. Please try again.'
    });
  }
};
