import { json, normalizeEircode, validEircode } from './_utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, message: 'Method not allowed.' });
  }

  const body = JSON.parse(event.body || '{}');
  const eircode = normalizeEircode(body.eircode || '');

  if (!validEircode(eircode)) {
    return json(400, { ok: false, message: 'Please enter a valid Eircode.' });
  }

  return json(200, { ok: true, duplicate: false, eircode });
};
