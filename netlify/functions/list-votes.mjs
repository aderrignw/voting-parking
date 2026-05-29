import { json, getVotesStore } from './_utils.mjs';

const readAllVotes = async () => {
  const store = getVotesStore();
  const votes = [];
  let cursor;
  do {
    const result = await store.list({ prefix: 'votes/', cursor });
    for (const blob of result.blobs || []) {
      const item = await store.get(blob.key, { type: 'json', consistency: 'strong' });
      if (item) votes.push(item);
    }
    cursor = result.cursor;
  } while (cursor);
  votes.sort((a, b) => String(a.submittedAt).localeCompare(String(b.submittedAt)));
  return votes;
};

export const handler = async (event) => {
  try {
    const pin = (event.queryStringParameters || {}).pin || '';
    const required = process.env.ADMIN_PIN || 'aderrig2026';
    if (pin !== required) return json(401, { ok: false, message: 'Admin PIN required.' });
    const votes = await readAllVotes();
    const agree = votes.filter(v => v.vote === 'Agree').length;
    const disagree = votes.filter(v => v.vote === 'Do Not Agree').length;
    const withInternalOrder = votes.map((v, i) => ({ internalOrder: i + 1, ...v }));
    return json(200, { ok: true, totals: { total: votes.length, agree, disagree }, votes: withInternalOrder });
  } catch (error) {
    return json(500, { ok: false, message: 'Unable to load votes.' });
  }
};
