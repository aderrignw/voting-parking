import { getBlobStore } from './_utils.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const SETTINGS_KEY = 'settings/voting-settings.json';
const store = () => getBlobStore('aderrig-parking-settings');

const json = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

async function readSettings() {
  const s = store();
  try {
    const item = await s.get(SETTINGS_KEY, { type: 'json', consistency: 'strong' });
    if (item && typeof item === 'object') return item;
  } catch {}
  try {
    const text = await s.get(SETTINGS_KEY, { type: 'text', consistency: 'strong' });
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'GET') return json(405, { ok: false, message: 'Method not allowed.' });

  try {
    const settings = await readSettings();
    const votingCloseAtIso = String(settings?.votingCloseAtIso || '').trim();
    const votingCloseLabel = String(settings?.votingCloseLabel || '').trim();

    let closed = false;
    if (votingCloseAtIso) {
      const closeAt = new Date(votingCloseAtIso);
      closed = !Number.isNaN(closeAt.getTime()) && Date.now() >= closeAt.getTime();
    }

    return json(200, {
      ok: true,
      closed,
      votingCloseAtIso,
      votingCloseLabel
    });
  } catch (error) {
    return json(200, {
      ok: true,
      closed: false,
      votingCloseAtIso: '',
      votingCloseLabel: ''
    });
  }
};
