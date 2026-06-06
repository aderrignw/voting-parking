import { getStore } from '@netlify/blobs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Director-Email',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const ADMIN_EMAIL = 'claudiosantos1968@gmail.com';
const REMOVED_PREFIX = 'removed-votes/';
const json = (statusCode, body) => ({ statusCode, headers: corsHeaders, body: JSON.stringify(body) });
const store = () => getStore({ name: 'aderrig-parking-settings', consistency: 'strong' });

function safeId(value = '') {
  return String(value || 'vote').trim().replace(/[^A-Za-z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 120) || 'vote';
}

function irelandTimestamp() {
  return new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' });
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });

  try {
    const body = JSON.parse(event.body || '{}');
    const email = String(event.headers['x-director-email'] || body.directorEmail || '').trim().toLowerCase();
    const pin = String(event.headers['x-admin-pin'] || body.pin || '');
    const required = process.env.ADMIN_ONLY_PIN || 'OMCADMIN2026';
    const directorPin = process.env.DIRECTOR_PIN || process.env.ADMIN_PIN || 'OMCDIRETORES2026';

    if (email !== ADMIN_EMAIL) return json(403, { ok: false, message: 'Administrator access required.' });
    if (pin !== required && pin !== directorPin) return json(401, { ok: false, message: 'Invalid administrator password.' });

    const reason = String(body.reason || '').trim();
    if (reason.length < 5) return json(400, { ok: false, message: 'Please provide a clear reason for removing this vote.' });

    const submissionId = String(body.submissionId || body.id || '').trim();
    const referenceId = String(body.referenceId || '').trim();
    const eircode = String(body.eircode || '').trim();
    const emailValue = String(body.email || '').trim().toLowerCase();
    if (!submissionId && !referenceId && !eircode && !emailValue) {
      return json(400, { ok: false, message: 'Unable to identify the vote to remove.' });
    }

    const removedAtIso = new Date().toISOString();
    const record = {
      submissionId,
      referenceId,
      eircode,
      email: emailValue,
      vote: String(body.vote || '').trim(),
      submittedAtIreland: String(body.submittedAtIreland || '').trim(),
      createdAt: String(body.createdAt || '').trim(),
      reason,
      removedAtIreland: irelandTimestamp(),
      removedAtIso,
      removedBy: email
    };

    const keySeed = submissionId || referenceId || `${eircode}-${emailValue}` || String(Date.now());
    await store().set(`${REMOVED_PREFIX}${safeId(keySeed)}.json`, JSON.stringify(record), { contentType: 'application/json' });
    return json(200, { ok: true, removed: record });
  } catch (error) {
    return json(500, { ok: false, message: 'Unable to remove vote.' });
  }
};
