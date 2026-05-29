import { json, normalizeEircode, validEmail, validEircode, makeReferenceId } from './_utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, message: 'Method not allowed.' });
  }

  const body = JSON.parse(event.body || '{}');
  const email = String(body.email || '').trim().toLowerCase();
  const eircode = normalizeEircode(body.eircode || '');
  const vote = String(body.vote || '').trim();
  const confirmed = body.confirmed === true || body.confirmed === 'true';

  if (!validEmail(email)) return json(400, { ok: false, message: 'Please enter a valid email address.' });
  if (!validEircode(eircode)) return json(400, { ok: false, message: 'Please enter a valid Eircode.' });
  if (!['Agree', 'Do Not Agree'].includes(vote)) return json(400, { ok: false, message: 'Please select your vote.' });
  if (!confirmed) return json(400, { ok: false, message: 'Please confirm one vote per residence.' });

  const now = new Date();
  const publicReferenceId = makeReferenceId();

  return json(200, {
    ok: true,
    message: 'Vote successfully recorded.',
    record: {
      referenceId: publicReferenceId,
      eircode,
      vote,
      submittedAtIreland: now.toLocaleString('en-IE', {
        timeZone: 'Europe/Dublin',
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }
  });
};
