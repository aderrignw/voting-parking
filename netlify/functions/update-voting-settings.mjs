import { getStore } from '@netlify/blobs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Director-Email',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const ADMIN_EMAIL = 'claudiosantos1968@gmail.com';
const SETTINGS_KEY = 'settings/voting-settings.json';
const DEFAULT_SETTINGS = {
  votingCloseAtIso: '2026-06-08T23:59:00+01:00',
  votingCloseLabel: '08 June 2026, 23:59 · Ireland time',
  baseline: {
    confirmed: true,
    status: 'Confirmed',
    startingSubmissions: 0,
    establishedAtIreland: '04 Jun 2026, 17:43',
    establishedAtIso: '2026-06-04T17:43+01:00',
    note: 'System cleared before official launch. Voting started from zero recorded submissions.'
  }
};

const json = (statusCode, body) => ({ statusCode, headers: corsHeaders, body: JSON.stringify(body) });
const store = () => getStore({ name: 'aderrig-parking-settings', consistency: 'strong' });

function irelandDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' });
}

function closeLabel(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-IE', { timeZone: 'Europe/Dublin', day: '2-digit', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('en-IE', { timeZone: 'Europe/Dublin', hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time} · Ireland time`;
}

async function readCurrent() {
  try {
    const existing = await store().get(SETTINGS_KEY, { type: 'json', consistency: 'strong' });
    return existing && typeof existing === 'object' ? { ...DEFAULT_SETTINGS, ...existing, baseline: { ...DEFAULT_SETTINGS.baseline, ...(existing.baseline || {}) } } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
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

    const current = await readCurrent();
    const votingCloseAtIso = String(body.votingCloseAtIso || current.votingCloseAtIso || '').trim();
    const resetAtIso = String(body.resetAtIso || current.baseline.establishedAtIso || '').trim();
    const resetAtIreland = String(body.resetAtIreland || irelandDateTime(resetAtIso) || current.baseline.establishedAtIreland || '').trim();
    const note = String(body.baselineNote || current.baseline.note || DEFAULT_SETTINGS.baseline.note).trim();

    if (!votingCloseAtIso || Number.isNaN(new Date(votingCloseAtIso).getTime())) {
      return json(400, { ok: false, message: 'Please enter a valid voting closing date/time.' });
    }
    if (!resetAtIso || Number.isNaN(new Date(resetAtIso).getTime())) {
      return json(400, { ok: false, message: 'Please enter a valid reset date/time.' });
    }

    const settings = {
      votingCloseAtIso,
      votingCloseLabel: closeLabel(votingCloseAtIso),
      baseline: {
        confirmed: true,
        status: 'Confirmed',
        startingSubmissions: 0,
        establishedAtIreland: resetAtIreland,
        establishedAtIso: resetAtIso,
        note
      },
      updatedAtIso: new Date().toISOString(),
      updatedBy: email
    };

    await store().set(SETTINGS_KEY, JSON.stringify(settings), { contentType: 'application/json' });
    return json(200, { ok: true, settings });
  } catch (error) {
    return json(500, { ok: false, message: 'Unable to update voting settings.' });
  }
};
