"""Package reviewed source and builds. Never include real environment files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import subprocess

root = Path(__file__).resolve().parents[1]
out = root.parent / 'brightcopter-artifacts'
out.mkdir(exist_ok=True)
paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
source = []
for name in sorted(set(filter(None, paths))):
    relative = Path(name)
    if any(part in {'.git', 'node_modules', 'dist', 'test-results', 'playwright-report'} for part in relative.parts):
        continue
    if any((part == '.env' or part.startswith('.env.')) and part not in {'.env.example', '.env.server.example'} for part in relative.parts):
        continue
    file = root / relative
    if file.is_file() and not file.is_symlink():
        source.append((file, relative))

with ZipFile(out / 'bright-copter-source.zip', 'w', ZIP_DEFLATED) as z:
    for file, relative in source:
        z.write(file, relative)
with ZipFile(out / 'bright-copter-website.zip', 'w', ZIP_DEFLATED) as z:
    for file in (root / 'dist').rglob('*'):
        if file.is_file() and not file.is_symlink():
            z.write(file, file.relative_to(root / 'dist'))
    z.writestr('deployment.txt', 'Deploy these contents to Netlify or another static HTTPS host with equivalent headers and routing. Netlify reads the included _headers and _redirects. The configured canonical origin is https://brightcopter.netlify.com. No publishing is performed by this archive.\n')
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
        z.write(preview, 'preview/Bright-Copter.html')
        z.writestr('START-HERE.txt', 'source/ is the editable project. With Node 24, run npm ci and npm run dev. npm run build generates deployment files in dist/.\nwebsite/ contains the built site, including technical files, static metadata, policies and Netlify headers/routing.\npreview/Bright-Copter.html is a self-contained preview for a full browser.\nRead source/SECURITY.md for server-only environment configuration, the inactive future API template and validation commands.\nSource: https://github.com/spinachh360/brightcopter/tree/bright-copter-website\n')
for filename in ['bright-copter-source.zip', 'Bright-Copter-Complete-Project.zip']:
    file = out / filename
    if not file.exists():
        continue
    with ZipFile(file) as z:
        for name in z.namelist():
            assert not any((part == '.env' or part.startswith('.env.')) and part not in {'.env.example', '.env.server.example'} for part in Path(name).parts), name
print('Source, website and preview packages refreshed; real environment files are excluded.')
