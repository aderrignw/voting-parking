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

function normaliseEircode(value = '') {
  const compact = clean(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, 3)} ${compact.slice(3, 7)}`;
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

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });

  try {
    const body = JSON.parse(event.body || '{}');
    const visitorKey = clean(body.visitorKey) || `server-${Date.now().toString(36)}`;
    const payload = {
      'form-name': 'aderrig-green-policy-download-audit',
      visitorKey,
      email: clean(body.email).toLowerCase(),
      eircode: normaliseEircode(body.eircode),
      downloadedAtIreland: clean(body.downloadedAtIreland) || irelandTimestamp(),
      document: 'Aderrig Green Parking Policy Draft',
      status: 'Downloaded Draft Policy'
    };

    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || '';
    if (!siteUrl) {
      return json(200, { ok: true, stored: false, message: 'Download acknowledged. Site URL unavailable for server-side form registration.' });
    }

    const response = await fetch(siteUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formEncode(payload)
    });

    return json(200, { ok: true, stored: response.ok });
  } catch (error) {
    console.error('register-policy-download error:', error);
    return json(200, { ok: true, stored: false });
  }
};
