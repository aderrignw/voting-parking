import { json, getVotesStore, normalizeEircode, safeKey, validEircode } from './_utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });
  try {
    const body = JSON.parse(event.body || '{}');
    const eircode = normalizeEircode(body.eircode || '');
    if (!validEircode(eircode)) return json(400, { ok: false, message: 'Please enter a valid Eircode.' });
    const store = getVotesStore();
    const existing = await store.get(`votes/${safeKey(eircode)}.json`, { consistency: 'strong' });
    if (existing) return json(409, { ok: false, duplicate: true, message: 'A vote has already been submitted for this Eircode.' });
    return json(200, { ok: true, duplicate: false, eircode });
  } catch (error) {
    return json(500, { ok: false, message: 'Unable to check this Eircode. Please try again.' });
  }
};
