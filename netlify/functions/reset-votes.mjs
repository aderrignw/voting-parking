import { json, getVotesStore } from './_utils.mjs';
import { getStore } from '@netlify/blobs';

const settingsStore = () => getStore({ name: 'aderrig-parking-settings', consistency: 'strong' });
const SETTINGS_KEY = 'settings/voting-settings.json';

function irelandTimestamp(date = new Date()) {
  return date.toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' });
}

async function updateResetBaseline(note = '') {
  const now = new Date();
  const store = settingsStore();
  let current = {};
  try { current = await store.get(SETTINGS_KEY, { type: 'json', consistency: 'strong' }) || {}; } catch {}
  const settings = {
    ...current,
    baseline: {
      ...(current.baseline || {}),
      confirmed: true,
      status: 'Confirmed',
      startingSubmissions: 0,
      establishedAtIreland: irelandTimestamp(now),
      establishedAtIso: now.toISOString(),
      note: note || 'System cleared before official launch. Voting started from zero recorded submissions.'
    },
    updatedAtIso: now.toISOString()
  };
  await store.setJSON(SETTINGS_KEY, settings);
  return settings.baseline;
}

const deleteAllVotes = async () => {
  const store = getVotesStore();
  let cursor;
  let deleted = 0;
  do {
    const result = await store.list({ prefix: 'votes/', cursor });
    const blobs = result.blobs || [];
    for (const blob of blobs) {
      await store.delete(blob.key);
      deleted += 1;
    }
    cursor = result.cursor;
  } while (cursor);
  return deleted;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });
  try {
    const body = JSON.parse(event.body || '{}');
    const pin = String(body.pin || '');
    const confirm = String(body.confirm || '').trim().toUpperCase();
    const required = process.env.ADMIN_PIN || 'aderrig2026';
    if (pin !== required) return json(401, { ok: false, message: 'Admin PIN required.' });
    if (confirm !== 'RESET ALL VOTES') {
      return json(400, { ok: false, message: 'Please type RESET ALL VOTES to confirm.' });
    }
    const deleted = await deleteAllVotes();
    const baseline = await updateResetBaseline(String(body.note || '').trim());
    return json(200, { ok: true, deleted, baseline, message: `Reset complete. ${deleted} vote record(s) removed.` });
  } catch (error) {
    return json(500, { ok: false, message: 'Unable to reset votes.' });
  }
};
