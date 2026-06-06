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

function headerValue(headers = {}, name = '') {
  const target = String(name).toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (String(key).toLowerCase() === target) return value;
  }
  return '';
}

function toIsoFromParts(dateValue = '', timeValue = '') {
  const date = String(dateValue || '').trim();
  const time = String(timeValue || '').trim();
  if (!date || !time) return '';
  const parsed = new Date(`${date}T${time}:00+01:00`);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

async function readJson(s) {
  try {
    const item = await s.get(SETTINGS_KEY, { type: 'json', consistency: 'strong' });
    if (item && typeof item === 'object') return item;
  } catch {}
  try {
    const text = await s.get(SETTINGS_KEY, { type: 'text', consistency: 'strong' });
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function saveSettings(settings) {
  const s = store();
  const payload = JSON.stringify(settings);

  if (typeof s.setJSON === 'function') {
    await s.setJSON(SETTINGS_KEY, settings);
  } else {
    await s.set(SETTINGS_KEY, payload, { metadata: { contentType: 'application/json' } });
  }

  let saved = null;
  for (let i = 0; i < 3; i += 1) {
    saved = await readJson(s);
    if (saved && String(saved.votingCloseAtIso || '') === String(settings.votingCloseAtIso || '')) return saved;
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  throw new Error('Settings were written but could not be verified from Netlify Blobs.');
}

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
    const existing = await readJson(store());
    return existing && typeof existing === 'object'
      ? { ...DEFAULT_SETTINGS, ...existing, baseline: { ...DEFAULT_SETTINGS.baseline, ...(existing.baseline || {}) } }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });

  try {
    const body = JSON.parse(event.body || '{}');
    const email = String(headerValue(event.headers, 'x-director-email') || body.directorEmail || '').trim().toLowerCase();
    const pin = String(headerValue(event.headers, 'x-admin-pin') || body.pin || '');
    const required = process.env.ADMIN_ONLY_PIN || 'OMCADMIN2026';
    const directorPin = process.env.DIRECTOR_PIN || process.env.ADMIN_PIN || 'OMCDIRETORES2026';

    if (email !== ADMIN_EMAIL) return json(403, { ok: false, message: 'Administrator access required.' });
    if (pin !== required && pin !== directorPin) return json(401, { ok: false, message: 'Invalid administrator password.' });

    const current = await readCurrent();
    const votingCloseAtIso = String(body.votingCloseAtIso || toIsoFromParts(body.votingEndDate, body.votingEndTime) || current.votingCloseAtIso || '').trim();
    const resetAtIso = String(body.resetAtIso || toIsoFromParts(body.resetDate, body.resetTime) || current.baseline.establishedAtIso || '').trim();
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

    const saved = await saveSettings(settings);
    return json(200, { ok: true, settings: saved });
  } catch (error) {
    return json(500, {
      ok: false,
      message: 'Unable to update voting settings.',
      detail: String(error.message || error).slice(0, 500)
    });
  }
};
