/**
 * Writes public/tc-auth-env.js from Vite env loading (same rules as vite build).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'public', 'tc-auth-env.js');
const modeArg = process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1];
const mode =
  modeArg === 'development' || modeArg === 'production'
    ? modeArg
    : process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'predev'
      ? 'development'
      : 'production';

/** Same prefix as Vite client exposure; process.env wins (Vercel injects at build). */
const env = { ...loadEnv(mode, root, '') };
for (const key of Object.keys(process.env)) {
  if (key.startsWith('VITE_') && process.env[key]) {
    env[key] = process.env[key];
  }
}

function sanitizeApiUrl(raw) {
  if (!raw) return '';
  let value = String(raw).trim();
  const embedded = value.match(/VITE_API_URL=(.+)/i);
  if (embedded) value = embedded[1].trim();
  return value.replace(/\/+$/, '');
}

const payload = {
  VITE_AUTH0_DOMAIN: env.VITE_AUTH0_DOMAIN ?? '',
  VITE_AUTH0_CLIENT_ID: env.VITE_AUTH0_CLIENT_ID ?? '',
  VITE_AUTH0_AUDIENCE: env.VITE_AUTH0_AUDIENCE ?? '',
  VITE_AUTH0_CONNECTION: env.VITE_AUTH0_CONNECTION ?? '',
  VITE_API_URL: sanitizeApiUrl(env.VITE_API_URL),
  VITE_APP_URL: (env.VITE_APP_URL ?? '').trim().replace(/\/+$/, ''),
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  `window.__TC_AUTH0_ENV__=${JSON.stringify(payload)};\n`,
  'utf8',
);

const mask = (v) => (v && v.length > 8 ? `${v.slice(0, 6)}…` : v ? '(set)' : '(empty)');

console.log('[emit-auth-env] mode:', mode);
console.log('[emit-auth-env] VITE_AUTH0_DOMAIN:', mask(payload.VITE_AUTH0_DOMAIN));
console.log('[emit-auth-env] VITE_AUTH0_CLIENT_ID:', mask(payload.VITE_AUTH0_CLIENT_ID));
console.log('[emit-auth-env] VITE_API_URL:', payload.VITE_API_URL || '(empty)');

if (!payload.VITE_AUTH0_DOMAIN || !payload.VITE_AUTH0_CLIENT_ID) {
  console.warn(
    '[emit-auth-env] WARNING: Auth0 variables missing at build time. ' +
      'Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in Vercel → Environment Variables (Production), then redeploy without cache.',
  );
}
