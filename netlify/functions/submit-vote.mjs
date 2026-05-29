import {
  json,
  getVotesStore,
  normalizeEircode,
  safeKey,
  validEmail,
  validEircode,
  clientIp,
  makeReferenceId
} from './_utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, message: 'Method not allowed.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    const eircode = normalizeEircode(body.eircode || '');
    const vote = String(body.vote || '').trim();
    const confirmed = body.confirmed === true || body.confirmed === 'true';

    if (!validEmail(email)) {
      return json(400, { ok: false, message: 'Please enter a valid email address.' });
    }

    if (!validEircode(eircode)) {
      return json(400, { ok: false, message: 'Please enter a valid Eircode.' });
    }

    if (!['Agree', 'Do Not Agree'].includes(vote)) {
      return json(400, { ok: false, message: 'Please select your vote.' });
    }

    if (!confirmed) {
      return json(400, { ok: false, message: 'Please confirm one vote per residence.' });
    }

    const store = getVotesStore();
    const key = `votes/${safeKey(eircode)}.json`;

    const existing = await store.get(key, { consistency: 'strong' });
    if (existing) {
      return json(409, {
        ok: false,
        duplicate: true,
        message: 'A vote has already been submitted for this Eircode.'
      });
    }

    const now = new Date();
    const publicReferenceId = makeReferenceId();
    const record = {
      publicReferenceId,
      email,
      eircode,
      vote,
      confirmed: true,
      submittedAt: now.toISOString(),
      submittedAtIreland: now.toLocaleString('en-IE', {
        timeZone: 'Europe/Dublin',
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      userAgent: event.headers['user-agent'] || '',
      ip: clientIp(event)
    };

    await store.setJSON(key, record, {
      metadata: {
        eircode,
        vote,
        submittedAt: record.submittedAt,
        publicReferenceId
      }
    });

    return json(200, {
      ok: true,
      message: 'Vote successfully recorded.',
      record: {
        referenceId: publicReferenceId,
        eircode,
        vote,
        submittedAtIreland: record.submittedAtIreland
      }
    });
  } catch (error) {
    console.error('submit-vote error:', error);
    return json(500, {
      ok: false,
      message: 'Unable to submit your vote. Please try again.'
    });
  }
};
