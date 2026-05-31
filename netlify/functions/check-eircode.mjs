import { json, normalizeEircode, validEircode } from './_utils.mjs';

const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';
const INELIGIBLE_EIRCODE_MESSAGE = 'This consultation is restricted to residents within the Aderrig Green area. The Eircode provided could not be verified as belonging to an eligible residence. Please check your Eircode and try again.';
const DUPLICATE_EIRCODE_MESSAGE = 'This residence has already voted. One vote per Eircode is permitted.';
const INVALID_EIRCODE_MESSAGE = 'This Eircode does not appear to be a valid residential Eircode. Please check the Eircode and try again.';

function eligibleAderrigGreenEircode(eircode) {
  return String(eircode || '').replace(/\s+/g, '').startsWith('K78');
}

function clearlyInvalidEircode(eircode) {
  const compact = String(eircode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^K78[A-Z0-9]{4}$/.test(compact)) return false;

  const unique = compact.slice(3);

  if (['0000', 'XXXX', 'TEST'].includes(unique)) return true;
  if (/^([A-Z0-9])\1{3}$/.test(unique)) return true;
  if (/^1234$/.test(unique)) return true;
  if (/^ABCD$/.test(unique)) return true;
  if (/^ZZZZ$/.test(unique)) return true;

  return false;
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

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, message: 'Method not allowed.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const eircode = normalizeEircode(body.eircode || '');

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

    if (clearlyInvalidEircode(eircode)) {
      return json(400, {
        ok: false,
        eligible: false,
        message: INVALID_EIRCODE_MESSAGE
      });
    }

    const formId = process.env.NETLIFY_FORM_ID;
    const token = process.env.NETLIFY_AUTH_TOKEN;

    if (!formId || !token) {
      console.error('Missing NETLIFY_FORM_ID or NETLIFY_AUTH_TOKEN.');
      return json(500, {
        ok: false,
        message: 'Unable to check this Eircode. Please try again.'
      });
    }

    const submissions = await fetchAllSubmissions(formId, token);

    const alreadyVoted = submissions.some((submission) => {
      const submittedEircode = normalizeEircode(getFieldValue(submission, 'eircode') || '');
      return submittedEircode === eircode;
    });

    if (alreadyVoted) {
      return json(409, {
        ok: false,
        duplicate: true,
        message: DUPLICATE_EIRCODE_MESSAGE
      });
    }

    return json(200, {
      ok: true,
      duplicate: false,
      eligible: true,
      eircode
    });
  } catch (error) {
    console.error('check-eircode error:', error);
    return json(500, {
      ok: false,
      message: 'Unable to check this Eircode. Please try again.'
    });
  }
};
