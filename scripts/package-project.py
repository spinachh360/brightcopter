"""Package reviewed source and builds. Never include real environment files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import subprocess
import json
import re

root = Path(__file__).resolve().parents[1]
out = root.parent / 'brightcopter-artifacts'
out.mkdir(exist_ok=True)
paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
source = []
for name in sorted(set(filter(None, paths))):
    relative = Path(name)
    if any(part in {'.git', 'node_modules', 'dist', 'test-results', 'playwright-report', '.firebase'} for part in relative.parts):
        continue
    if relative.name == '.firebase-build.json' or relative.name.startswith(('firebase-debug.log', 'ui-debug.log')):
        continue
    if any((part == '.env' or part.startswith('.env.')) and part not in {'.env.example', '.env.server.example'} for part in relative.parts):
        continue
    file = root / relative
    if file.is_file() and not file.is_symlink():
        source.append((file, relative))

firebase = json.loads((root / 'firebase.json').read_text())
firebase['hosting']['public'] = '.'
firebase['hosting'].pop('predeploy', None)  # This archive already contains the compiled build.
firebase.pop('emulators', None)
firebase_json = json.dumps(firebase, indent=2) + '\n'
canonical = re.search(r'rel="canonical" href="([^"]+)"', (root / 'dist/index.html').read_text())
origin = canonical.group(1).rstrip('/') if canonical else 'noindex preview — rebuild production before publishing'
project_alias = (root / '.firebaserc').read_text()
if 'name="robots" content="noindex,nofollow"' in (root / 'dist/index.html').read_text():
    raise RuntimeError('Build production with npm run firebase:build before packaging deployment archives.')
with ZipFile(out / 'bright-copter-source.zip', 'w', ZIP_DEFLATED) as z:
    for file, relative in source:
        z.write(file, relative)
with ZipFile(out / 'bright-copter-website.zip', 'w', ZIP_DEFLATED) as z:
    for file in (root / 'dist').rglob('*'):
        if file.is_file() and not file.is_symlink():
            z.write(file, file.relative_to(root / 'dist'))
    z.writestr('firebase.json', firebase_json)
    z.writestr('.firebaserc', project_alias)
    z.writestr('deployment.txt', f'Firebase Hosting build for {origin}. Extract, sign in with npx firebase-tools@15.34.2 login and publish with npx firebase-tools@15.34.2 deploy --only hosting. The included firebase.json applies this build\'s CSP, routing and cache headers. Legacy Netlify files are also included for rollback. No authentication credentials or publishing are included in this archive.\n')
preview = out / 'Bright-Copter-Working-Preview.html'
if preview.is_file():
    with ZipFile(out / 'Bright-Copter-Browser-Preview.zip', 'w', ZIP_DEFLATED) as z:
        z.write(preview, 'Bright-Copter.html')
        z.writestr('READ-ME.txt', 'Extract and open Bright-Copter.html in a full browser. Some chat/file viewers disable JavaScript. This preview is self-contained and noindex. External WhatsApp and Maps links need internet. Hosting security headers apply to the deployed build, not a local file.\n')
    with ZipFile(out / 'Bright-Copter-Complete-Project.zip', 'w', ZIP_DEFLATED) as z:
        for file, relative in source:
            z.write(file, Path('source') / relative)
        for file in (root / 'dist').rglob('*'):
            if file.is_file() and not file.is_symlink():
                z.write(file, Path('website') / file.relative_to(root / 'dist'))
        z.writestr('website/firebase.json', firebase_json)
        z.writestr('website/.firebaserc', project_alias)
        z.write(preview, 'preview/Bright-Copter.html')
        z.writestr('START-HERE.txt', f'source/ is the editable project. With Node 24, run npm ci and npm run dev. Read source/FIREBASE.md for Firebase sign-in and deployment.\nwebsite/ contains the built site for {origin}, with native Firebase headers/routing and legacy Netlify files.\npreview/Bright-Copter.html is a self-contained preview for a full browser.\nRead source/SECURITY.md for environment configuration, the inactive future API template and validation commands. No login credentials are packaged.\nSource: https://github.com/spinachh360/brightcopter/tree/firebase-hosting\n')
for filename in ['bright-copter-source.zip', 'Bright-Copter-Complete-Project.zip']:
    file = out / filename
    if not file.exists():
        continue
    with ZipFile(file) as z:
        for name in z.namelist():
            assert not any((part == '.env' or part.startswith('.env.')) and part not in {'.env.example', '.env.server.example'} for part in Path(name).parts), name
            assert '.firebase' not in Path(name).parts and Path(name).name != '.firebase-build.json', name
print('Source, website and preview packages refreshed; real environment files are excluded.')
