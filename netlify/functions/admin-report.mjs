const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Director-Email',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

function normaliseVote(value = '') {
  const v = String(value).trim().toLowerCase();
  if (['agree', 'approved', 'approve', 'yes', 'sim', 'aprovado'].includes(v)) return 'Agree';
  if (['do not agree', 'disagree', 'not agree', 'no', 'não', 'nao', 'rejected', 'reject'].includes(v)) return 'Do Not Agree';
  return value ? String(value).trim() : 'Unknown';
}

function normaliseEircode(value = '') {
  const clean = String(value).toUpperCase().replace(/\s+/g, '');
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)} ${clean.slice(3)}`;
}

function safeDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IE', {
    timeZone: 'Europe/Dublin',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function field(data, names) {
  for (const name of names) {
    if (data && data[name] !== undefined && data[name] !== null && String(data[name]).trim() !== '') return data[name];
  }
  return '';
}

function buildReport(submissions) {
  const rows = submissions.map((item, index) => {
    const data = item.data || item.form_data || item || {};
    const vote = normaliseVote(field(data, ['vote', 'Vote', 'decision', 'choice']));
    const eircode = normaliseEircode(field(data, ['eircode', 'Eircode', 'eir_code', 'postcode']));
    const email = String(field(data, ['email', 'Email'])).trim().toLowerCase();
    const createdAt = item.created_at || item.createdAt || data.created_at || data.createdAt || field(data, ['submitted_at', 'submitted_at_ireland']);
    return {
      number: index + 1,
      id: item.id || '',
      email,
      eircode,
      vote,
      confirmed: field(data, ['confirmed', 'Confirmed']) || '',
      referenceId: field(data, ['referenceId', 'reference_id', 'ref', 'Reference ID']) || '',
      submittedAtIreland: field(data, ['submitted_at_ireland', 'submittedAtIreland']) || safeDate(createdAt),
      createdAt: createdAt || '',
      ip: item.ip || data.ip || '',
      userAgent: field(data, ['user_agent', 'userAgent']) || '',
      referrer: item.referrer || data.referrer || ''
    };
  });

  const totalVotes = rows.length;
  const agree = rows.filter(r => r.vote === 'Agree').length;
  const doNotAgree = rows.filter(r => r.vote === 'Do Not Agree').length;
  const unknown = totalVotes - agree - doNotAgree;
  const eircodeCounts = rows.reduce((acc, row) => {
    if (!row.eircode) return acc;
    acc[row.eircode] = (acc[row.eircode] || 0) + 1;
    return acc;
  }, {});
  const duplicateEircodes = Object.entries(eircodeCounts).filter(([, count]) => count > 1).map(([eircode, count]) => ({ eircode, count }));
  const uniqueEircodes = Object.keys(eircodeCounts).length;
  const lastSubmission = rows.slice().sort((a, b) => new Date(b.createdAt || b.submittedAtIreland) - new Date(a.createdAt || a.submittedAtIreland))[0] || null;

  const byDayMap = {};
  for (const row of rows) {
    const raw = row.createdAt || row.submittedAtIreland;
    const d = new Date(raw);
    const key = Number.isNaN(d.getTime()) ? String(raw).slice(0, 10) || 'Unknown' : d.toISOString().slice(0, 10);
    byDayMap[key] = byDayMap[key] || { date: key, total: 0, agree: 0, doNotAgree: 0, unknown: 0 };
    byDayMap[key].total++;
    if (row.vote === 'Agree') byDayMap[key].agree++;
    else if (row.vote === 'Do Not Agree') byDayMap[key].doNotAgree++;
    else byDayMap[key].unknown++;
  }

  return {
    generatedAtIreland: safeDate(new Date().toISOString()),
    summary: {
      totalVotes,
      agree,
      doNotAgree,
      unknown,
      agreePercent: totalVotes ? Number(((agree / totalVotes) * 100).toFixed(1)) : 0,
      doNotAgreePercent: totalVotes ? Number(((doNotAgree / totalVotes) * 100).toFixed(1)) : 0,
      unknownPercent: totalVotes ? Number(((unknown / totalVotes) * 100).toFixed(1)) : 0,
      uniqueEircodes,
      duplicateEircodesCount: duplicateEircodes.length,
      lastSubmission
    },
    duplicateEircodes,
    byDay: Object.values(byDayMap).sort((a, b) => a.date.localeCompare(b.date)),
    rows
  };
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return json(405, { ok: false, message: 'Method not allowed.' });

  const expectedPin = process.env.ADMIN_PIN || 'OMCDIRETORES2026';
  const providedPin = event.headers['x-admin-pin'] || event.headers['X-Admin-Pin'] || '';
  const directorEmail = String(event.headers['x-director-email'] || event.headers['X-Director-Email'] || '').trim().toLowerCase();
  const allowedEmails = [
    'selerizzuti@gmail.com',
    'bahrikaran@gmail.com',
    'rohananeja@gmail.com',
    'niravakbari20@gmail.com',
    'aditiu008@gmail.com',
    'claudiosantos1968@gmail.com'
  ];

  if (!directorEmail) return json(401, { ok: false, message: 'Please enter your director email.' });
  if (!allowedEmails.includes(directorEmail)) return json(403, { ok: false, message: 'This email is not authorised to access the directors dashboard.' });
  if (String(providedPin) !== String(expectedPin)) return json(401, { ok: false, message: 'Invalid directors password.' });

  const formId = process.env.NETLIFY_FORM_ID || '6a19f4c677b40f0008c59273';
  const token = process.env.NETLIFY_AUTH_TOKEN || '';
  if (!token) {
    return json(500, {
      ok: false,
      code: 'MISSING_NETLIFY_AUTH_TOKEN',
      message: 'Live dashboard is not connected yet. Please configure NETLIFY_AUTH_TOKEN in Netlify Environment variables, or use Import CSV for now.'
    });
  }

  const all = [];
  let page = 1;
  const perPage = 100;
  while (page <= 30) {
    const url = `https://api.netlify.com/api/v1/forms/${encodeURIComponent(formId)}/submissions?page=${page}&per_page=${perPage}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const text = await response.text();
      return json(response.status, { ok: false, message: 'Could not read Netlify Forms submissions. Please check NETLIFY_AUTH_TOKEN and NETLIFY_FORM_ID.', detail: text.slice(0, 500) });
    }
    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return json(200, { ok: true, authorisedDirector: directorEmail, ...buildReport(all) });
};
