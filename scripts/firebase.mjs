import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile, writeFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {normalizeSiteUrl} from '../config/site.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cliVersion = '15.34.2';
const receiptPath = path.join(root, '.firebase-build.json');
const [command, ...args] = process.argv.slice(2);
function flag(name) {
  const at = args.indexOf(name);
  if (at < 0) return undefined;
  const value = args[at + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`);
  return value;
}
async function projectSettings() {
  const aliases = existsSync(path.join(root, '.firebaserc')) ? JSON.parse(await readFile(path.join(root, '.firebaserc'), 'utf8')) : {};
  const project = flag('--project') || process.env.FIREBASE_PROJECT_ID || aliases.projects?.default;
  if (!project || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project) || /YOUR_|your-project/.test(project))
    throw new Error('Supply your real Firebase Project ID: npm run firebase:build -- --project YOUR_PROJECT_ID. It is not a password or API key.');
  const site = flag('--site') || process.env.FIREBASE_HOSTING_SITE || project;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(site)) throw new Error('Invalid Firebase Hosting site ID');
  // Intentionally ignore an old SITE_URL in .env.local. A custom domain must
  // be selected explicitly so the migration cannot retain Netlify canonicals.
  const origin = normalizeSiteUrl(flag('--url') || `https://${site}.web.app`);
  return {project, site, origin};
}
function run(program, parameters, env = process.env) {
  return new Promise((resolve, reject) => {
    // npm run supplies the CLI path on Windows as well as Unix. Invoke it via
    // Node instead of a shell so flags and custom domains cannot execute code.
    const npmCli = process.env.npm_execpath;
    if (program === 'npm' && npmCli) { program = process.execPath; parameters = [npmCli, ...parameters]; }
    else if (program === 'npm' && process.platform === 'win32') { reject(new Error('Run the Firebase commands through npm run.')); return; }
    const child = spawn(program, parameters, {cwd: root, env, stdio: 'inherit', shell: false});
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${program} exited with status ${code}`)));
  });
}
function firebase(parameters, env = process.env) {
  // Keep OAuth and CLI state out of the source, deployment directory and ZIPs.
  const cliEnv = {...env, XDG_CONFIG_HOME: path.join(root, '.firebase/cli-config'), FIREBASE_CLI_DISABLE_USAGE_REPORTING: 'true', NO_UPDATE_NOTIFIER: '1'};
  // The environment may contain credentials for unrelated cloud services.
  // Use the explicit Firebase login unless CI deliberately opts into ADC.
  if (env.FIREBASE_USE_ADC !== 'true') delete cliEnv.GOOGLE_APPLICATION_CREDENTIALS;
  return run('npm', ['exec', '--yes', '--cache', path.join(tmpdir(), 'brightcopter-npm-cache'), `--package=firebase-tools@${cliVersion}`, '--', 'firebase', ...parameters], cliEnv);
}
async function fingerprint() {
  const hash = createHash('sha256');
  hash.update(await readFile(path.join(root, 'firebase.json')));
  async function visit(directory) {
    for (const entry of (await readdir(directory, {withFileTypes: true})).sort((a,b) => a.name.localeCompare(b.name))) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile()) { hash.update(path.relative(root, file)); hash.update(await readFile(file)); }
      else throw new Error('Hosting output must not contain symlinks');
    }
  }
  await visit(path.join(root, 'dist'));
  return hash.digest('hex');
}
async function verify({allowPreview = false} = {}) {
  if (!existsSync(receiptPath)) throw new Error('Prepare Firebase files first with npm run firebase:build -- --project YOUR_PROJECT_ID');
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  if (receipt.preview && !allowPreview) throw new Error('A preview build cannot be published to production. Run firebase:build or firebase:deploy first.');
  if (receipt.fingerprint !== await fingerprint()) throw new Error('The build or Firebase headers changed. Run firebase:build again before publishing.');
  if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== receipt.project) throw new Error('Firebase project does not match the prepared build. Rebuild for the intended project.');
  const config = JSON.parse(await readFile(path.join(root, 'firebase.json'), 'utf8'));
  if (config.hosting.site !== receipt.site) throw new Error('Hosting site does not match the prepared build');
  const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
  if (!receipt.preview && !html.includes(`rel="canonical" href="${receipt.origin}/"`)) throw new Error('The homepage canonical does not match the Firebase origin');
  if (receipt.preview && !html.includes('content="noindex,nofollow"')) throw new Error('Preview builds must be noindex');
  return receipt;
}
async function build(preview = false) {
  const settings = await projectSettings();
  await run('npm', ['run', 'build'], {...process.env, SITE_URL: settings.origin, FIREBASE_HOSTING_SITE: settings.site, ROBOTS_PREVIEW: String(preview), CONTEXT: preview ? 'deploy-preview' : 'production'});
  const receipt = {...settings, preview, fingerprint: await fingerprint()};
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`Prepared Firebase Hosting for ${settings.site}: ${settings.origin}${preview ? ' (noindex preview)' : ''}`);
  return receipt;
}

try {
  const flags = new Set(['--project', '--site', '--url', '--channel']);
  for (let i = 0; i < args.length; i += 2) if (!flags.has(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Unsupported or incomplete option: ${args[i]}`);
  if (command === 'login') await firebase(['login', '--no-localhost']);
  else if (command === 'verify') { await verify({allowPreview: process.env.FIREBASE_PREVIEW_DEPLOY === 'true'}); console.log('Firebase build, canonical URL and security headers verified.'); }
  else if (command === 'build' || command === 'build-preview') await build(command === 'build-preview');
  else if (command === 'check') {
    const receipt = await verify();
    await run('node', ['scripts/verify-technical.mjs'], {...process.env, SITE_URL: receipt.origin});
  }
  else if (command === 'serve' || command === 'test') {
    await verify({allowPreview: true});
    // Local Hosting uses the same routes and headers without contacting an
    // unrelated ambient Google service account or publishing anything.
    const localEnv = {...process.env, FIREBASE_CLI_DISABLE_USAGE_REPORTING: 'true'};
    delete localEnv.GOOGLE_APPLICATION_CREDENTIALS;
    await firebase(command === 'test'
      ? ['emulators:exec', '--only', 'hosting', '--project', 'demo-brightcopter', 'node scripts/verify-firebase.mjs']
      : ['emulators:start', '--only', 'hosting', '--project', 'demo-brightcopter'], localEnv);
  }
  else if (command === 'preview' || command === 'deploy') {
    const channel = flag('--channel') || 'review';
    if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(channel)) throw new Error('Use a short lowercase preview channel name');
    const receipt = await build(command === 'preview');
    await verify({allowPreview: command === 'preview'});
    await firebase(command === 'preview'
      ? ['hosting:channel:deploy', channel, '--expires', '7d', '--project', receipt.project]
      : ['deploy', '--only', 'hosting', '--project', receipt.project], {...process.env, FIREBASE_PREVIEW_DEPLOY: String(command === 'preview')});
  }
  else throw new Error('Use firebase:login, firebase:build, firebase:check, firebase:test, firebase:serve, firebase:preview or firebase:deploy.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
