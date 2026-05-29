import { getVotesStore } from './_utils.mjs';

const csvEscape = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';

export const handler = async (event) => {
  const pin = (event.queryStringParameters || {}).pin || '';
  const required = process.env.ADMIN_PIN || 'aderrig2026';
  if (pin !== required) return { statusCode: 401, headers: { 'content-type': 'text/plain' }, body: 'Admin PIN required.' };
  const store = getVotesStore();
  const items = [];
  const rows = [['Internal Order','Reference ID','Date/Time Ireland','Date/Time ISO','Email','Eircode','Vote']];
  let cursor;
  do {
    const result = await store.list({ prefix: 'votes/', cursor });
    for (const blob of result.blobs || []) {
      const item = await store.get(blob.key, { type: 'json', consistency: 'strong' });
      if (item) items.push(item);
    }
    cursor = result.cursor;
  } while (cursor);
  items.sort((a,b)=>String(a.submittedAt).localeCompare(String(b.submittedAt)));
  items.forEach((item, index) => rows.push([index + 1, item.publicReferenceId || '', item.submittedAtIreland, item.submittedAt, item.email, item.eircode, item.vote]));
  const body = rows.map(row => row.map(csvEscape).join(',')).join('\n');
  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="aderrig-green-parking-votes.csv"'
    },
    body
  };
};
