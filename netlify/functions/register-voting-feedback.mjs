import { backupFeedbackRecord } from '../_github-backup.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

function clean(value = '') {
  return String(value || '').trim();
}

function irelandTimestamp() {
  return new Date().toLocaleString('en-IE', {
    timeZone: 'Europe/Dublin',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function formEncode(payload) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => params.append(key, value == null ? '' : String(value)));
  return params.toString();
}

function normaliseRating(value) {
  const rating = Number.parseInt(String(value || '').trim(), 10);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 0;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });

  try {
    const body = JSON.parse(event.body || '{}');
    const referenceId = clean(body.referenceId).toUpperCase();
    const rating = normaliseRating(body.rating);
    const comment = clean(body.comment).slice(0, 200);

    if (!rating) {
      return json(400, { ok: false, message: 'Please choose a rating from 1 to 5.' });
    }

    const submittedAtIso = new Date().toISOString();
    const submittedAtIreland = irelandTimestamp();

    const record = {
      referenceId,
      rating,
      ratingLabel: {
        1: 'Very poor',
        2: 'Poor',
        3: 'Average',
        4: 'Good',
        5: 'Excellent'
      }[rating],
      comment,
      submittedAtIreland,
      submittedAtIso
    };

    let formStored = false;
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || '';
    if (siteUrl) {
      const payload = {
        'form-name': 'aderrig-voting-experience-feedback',
        referenceId,
        rating,
        ratingLabel: record.ratingLabel,
        comment,
        submittedAtIreland
      };

      const response = await fetch(siteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formEncode(payload)
      });

      formStored = response.ok;
    }

    let backup = { enabled: false, stored: false };
    try {
      backup = await backupFeedbackRecord(record);
    } catch (error) {
      console.error('feedback backup error:', error);
    }

    return json(200, {
      ok: true,
      stored: formStored,
      backup
    });
  } catch (error) {
    console.error('register-voting-feedback error:', error);
    return json(500, { ok: false, message: 'Unable to record feedback.' });
  }
};
