import { json, getVotesStore } from './_utils.mjs';

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
    return json(200, { ok: true, deleted, message: `Reset complete. ${deleted} vote record(s) removed.` });
  } catch (error) {
    return json(500, { ok: false, message: 'Unable to reset votes.' });
  }
};
