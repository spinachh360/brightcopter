import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {assertPublicEnv} from '../config/site.mjs';
assertPublicEnv(process.env);
const tracked = execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const illegalEnv = tracked.filter(name => /(^|\/)\.env(?:\.|$)/.test(name) && !name.endsWith('.example'));
if (illegalEnv.length) throw new Error(`Private environment files must not be committed: ${illegalEnv.join(', ')}`);
const firebaseState = tracked.filter(name => name.startsWith('.firebase/') || name === '.firebase-build.json' || /(^|\/)firebase-debug\.log/.test(name));
if (firebaseState.length) throw new Error(`Local Firebase credentials/logs/build receipts must not be committed: ${firebaseState.join(', ')}`);
const sourceFiles = execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const files = [...new Set(sourceFiles)].filter(name => /^(src|components|lib|shared)\/.*\.(tsx?|jsx?|mjs)$/.test(name));
const credentialPattern = /(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bsk_live_[A-Za-z0-9]{16,}\b|(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|mssql):\/\/[^\s'"`]+:[^\s@]+@)/;
for (const name of files) {
  let text;
  try { text = await readFile(name,'utf8'); }
  catch (error) {
    if (error.code === 'ENOENT') continue; // A tracked file may be moved before staging.
    throw error;
  }
  if (credentialPattern.test(text)) throw new Error(`Possible credential in ${name}; remove it and rotate the credential.`);
  if (/dangerouslySetInnerHTML/.test(text)) throw new Error(`Raw HTML rendering needs a dedicated security review: ${name}`);
}
console.log('Security checks passed: no tracked private env files, recognized credential patterns or raw HTML sinks. This is a targeted check, not a guarantee against every kind of secret.');
