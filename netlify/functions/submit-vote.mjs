import {
  json,
  normalizeEircode,
  validEmail,
  validEircode,
  makeReferenceId
} from './_utils.mjs';

const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';
const INELIGIBLE_EIRCODE_MESSAGE = 'This consultation is restricted to residents within the Aderrig Green area. The Eircode provided could not be verified as belonging to an eligible residence. Please check your Eircode and try again.';
const DUPLICATE_EIRCODE_MESSAGE = 'This residence has already voted. One vote per Eircode is permitted.';

function validReferenceId(value) {
  return /^AG-2026-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(String(value || '').trim().toUpperCase());
}

function eligibleAderrigGreenEircode(eircode) {
  return String(eircode || '').replace(/\s+/g, '').startsWith('K78');
}

function getFieldValue(submission, fieldName) {
  const wanted = String(fieldName || '').toLowerCase();

  if (submission?.data && typeof submission.data === 'object') {
    for (const [key, value] of Object.entries(submission.data)) {
      if (String(key).toLowerCase() === wanted) return value;
    }
  }

  if (Array.isArray(submission?.fields)) {
    const found = submission.fields.find((field) => {
      const name = String(field?.name || field?.key || '').toLowerCase();
      return name === wanted;
    });
    return found?.value;
  }

  return undefined;
}

async function fetchAllSubmissions(formId, token) {
  const all = [];
  let page = 1;

  while (page <= 20) {
    const url = `${NETLIFY_API_BASE}/forms/${encodeURIComponent(formId)}/submissions?page=${page}&per_page=100`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`Netlify Forms API error ${response.status}: ${details}`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    all.push(...batch);
    if (batch.length < 100) break;

    page += 1;
  }

  return all;
}

async function eircodeAlreadyVoted(eircode) {
  const formId = process.env.NETLIFY_FORM_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (!formId || !token) {
    throw new Error('Missing NETLIFY_FORM_ID or NETLIFY_AUTH_TOKEN.');
  }

  const submissions = await fetchAllSubmissions(formId, token);

  return submissions.some((submission) => {
    const submittedEircode = normalizeEircode(getFieldValue(submission, 'eircode') || '');
    return submittedEircode === eircode;
  });
}

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
    const submittedReferenceId = String(body.referenceId || body.reference_id || body.reference || '').trim().toUpperCase();

    if (!validEmail(email)) {
      return json(400, { ok: false, message: 'Please enter a valid email address.' });
    }

    if (!validEircode(eircode)) {
      return json(400, { ok: false, message: 'Please enter a valid Eircode.' });
    }

    if (!eligibleAderrigGreenEircode(eircode)) {
      return json(403, {
        ok: false,
        eligible: false,
        message: INELIGIBLE_EIRCODE_MESSAGE
      });
    }

    if (!['Agree', 'Do Not Agree'].includes(vote)) {
      return json(400, { ok: false, message: 'Please select your vote.' });
    }

    if (!confirmed) {
      return json(400, { ok: false, message: 'Please confirm one vote per residence.' });
    }

    const duplicate = await eircodeAlreadyVoted(eircode);

    if (duplicate) {
      return json(409, {
        ok: false,
        duplicate: true,
        message: DUPLICATE_EIRCODE_MESSAGE
      });
    }

    const now = new Date();
    const publicReferenceId = validReferenceId(submittedReferenceId) ? submittedReferenceId : makeReferenceId();

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
  } catch (error) {
    console.error('submit-vote error:', error);
    return json(500, {
      ok: false,
      message: 'Unable to submit your vote. Please try again.'
    });
  }
};
