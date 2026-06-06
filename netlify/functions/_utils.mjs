import { getStore } from '@netlify/blobs';

export const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

export const normalizeEircode = (value = '') => String(value)
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, '')
  .replace(/^(.{3})(.{4})$/, '$1 $2');

export const safeKey = (eircode) => normalizeEircode(eircode).replace(/\s+/g, '-');

export const validEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export const validEircode = (eircode = '') => /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/.test(String(eircode).trim().toUpperCase());

export const getBlobStore = (name, options = {}) => {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN;
  const config = { name, consistency: 'strong', ...options };
  if (siteID && token) {
    config.siteID = siteID;
    config.token = token;
  }
  return getStore(config);
};

export const getVotesStore = () => getBlobStore('aderrig-parking-votes');

export const clientIp = (event) => {
  const headers = event.headers || {};
  const raw = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['client-ip'] || '';
  return String(raw).split(',')[0].trim();
};


export const makeReferenceId = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `AG-2026-${out.slice(0,4)}-${out.slice(4,8)}`;
};
