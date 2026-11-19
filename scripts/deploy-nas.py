import argparse
import datetime
import fcntl
import hashlib
import json
import os
import pathlib
import re
import secrets
import shutil
import socket
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request


def command(*arguments, output=None):
    result = subprocess.run(arguments, stdout=output or subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError(f'{arguments[0]} {arguments[1]} failed: {result.stderr.decode(errors="replace").strip()}')
    return result.stdout.decode().strip() if output is None else ''


def inspect(container):
    return json.loads(command('docker', 'inspect', container))[0]


def write_private(destination, content):
    destination.write_text(content)
    destination.chmod(0o600)


opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(port, route, method='GET', payload=None, token=''):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['X-Emby-Token'] = token
    message = urllib.request.Request(f'http://127.0.0.1:{port}{route}', method=method, headers=headers,
                                     data=None if payload is None else json.dumps(payload).encode())
    try:
        with opener.open(message, timeout=15) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors='replace')[:500]
        raise RuntimeError(f'{route}: HTTP {error.code}: {detail}') from None


def wait_health(port):
    for attempt in range(60):
        try:
            if json.loads(request(port, '/health'))['status'] == 'ok':
                return
        except (OSError, ValueError, RuntimeError, KeyError):
            pass
        time.sleep(1)
    raise RuntimeError(f'Health check did not pass on port {port}')


def verify_assets(port, manifest):
    for route, expected in manifest['assets'].items():
        actual = hashlib.sha256(request(port, route + '?goemby2_verify=' + manifest['version'])).hexdigest()
        if actual != expected:
            raise RuntimeError(f'Asset hash mismatch: {route}')
    if manifest['version'].encode() not in request(port, '/'):
        raise RuntimeError('Updated frontend cache version is missing')


parser = argparse.ArgumentParser()
parser.add_argument('--project-dir', required=True)
parser.add_argument('--image', required=True)
parser.add_argument('--stage-only', action='store_true')
arguments = parser.parse_args()
project = pathlib.Path(arguments.project_dir).resolve(strict=True)
compose = project / 'docker-compose.yaml'
if not compose.is_file() or compose.is_symlink():
    raise SystemExit('Expected a regular docker-compose.yaml in the specified project directory')
if not re.fullmatch(r'ghcr\.io/xhui999w/go-emby2:sha-[0-9a-f]{12}', arguments.image):
    raise SystemExit('A fixed go-emby2 image tag is required')
os.umask(0o077)
lock = (project / '.go-emby2-update.lock').open('w')
os.fchmod(lock.fileno(), 0o600)
fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
application = inspect('go-emby')
labels = application['Config']['Labels']
project_name = labels['com.docker.compose.project']
if project_name != 'go-emby':
    raise SystemExit('Container does not belong to the expected go-emby Compose project')
database_id = command('docker', 'compose', '-p', project_name, '-f', str(compose), 'ps', '-q', 'postgres')
database = inspect(database_id)
database_env = dict(value.split('=', 1) for value in database['Config']['Env'])
database_user = database_env.get('POSTGRES_USER', 'postgres')
database_name = database_env.get('POSTGRES_DB', database_user)
manifest = json.loads(command('docker', 'run', '--rm', '--entrypoint', 'cat', arguments.image,
                              '/usr/local/share/go-emby2/patch-manifest.json'))
current_hash = command('docker', 'exec', 'go-emby', 'sha256sum', '/usr/local/bin/go-emby').split()[0]
if current_hash != manifest['upstream_binary_sha256']:
    previous = json.loads(command('docker', 'exec', 'go-emby', 'cat', '/usr/local/share/go-emby2/patch-manifest.json'))
    if previous['upstream_binary_sha256'] != manifest['upstream_binary_sha256'] or previous['binary_sha256'] != current_hash:
        raise SystemExit('The installed backend differs from the pinned runtime')
revision = arguments.image.rsplit('-', 1)[1]
timestamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
backup = project / 'update-backups' / (timestamp + '-' + revision)
backup.mkdir(parents=True, mode=0o700)
backup.parent.chmod(0o700)
backup.chmod(0o700)
original = compose.read_text()
write_private(backup / 'docker-compose.yaml', original)
write_private(backup / 'container.json', json.dumps(application, indent=2))
print(f'Backing up application and database to {backup}', flush=True)
with (backup / 'database.dump').open('wb') as output:
    os.fchmod(output.fileno(), 0o600)
    command('docker', 'exec', database_id, 'pg_dump', '-U', database_user, '-d', database_name, '-Fc', output=output)
with (backup / 'app-data.tar.gz').open('wb') as output:
    os.fchmod(output.fileno(), 0o600)
    command('docker', 'exec', 'go-emby', 'tar', 'czf', '-', '-C', '/app/data', '.', output=output)
networks = set(application['NetworkSettings']['Networks']) & set(database['NetworkSettings']['Networks'])
if len(networks) != 1:
    raise SystemExit('Expected exactly one shared application/database network')
network = next(iter(networks))
environment = dict(value.split('=', 1) for value in application['Config']['Env'])
database_url = environment.get('DATABASE_URL', '').strip()
test_database = 'goemby2_check_' + revision
if database_url:
    connection = urllib.parse.urlsplit(database_url)
    database_url = urllib.parse.urlunsplit(connection._replace(path='/' + test_database))
else:
    password = environment.get('POSTGRES_PASSWORD') or command('docker', 'exec', 'go-emby', 'cat', '/run/bootstrap/postgres-password')
    username = urllib.parse.quote(database_user, safe='')
    password = urllib.parse.quote(password, safe='')
    database_url = f'postgres://{username}:{password}@postgres:5432/{test_database}?sslmode=disable'
stage = project / ('stage-' + timestamp + '-' + revision)
stage.mkdir(mode=0o700)
stage.chmod(0o700)
data = stage / 'data'
media = stage / 'media'
data.mkdir()
media.mkdir()
for index in range(300):
    film = media / '国产电影' / f'电影{index:04}.strm'
    episode = media / '国产剧' / f'测试剧{index:04}' / 'S01E01.strm'
    for entry in [film, episode]:
        entry.parent.mkdir(parents=True, exist_ok=True)
        entry.write_text('http://127.0.0.1:9/qa.mp4\n')
admin_password = secrets.token_hex(24)
environment.update({'DATABASE_URL': database_url, 'ADMIN_PASSWORD': admin_password,
                    'MEDIA_INFO_ROOT': '/app/data', 'FILE_MANAGER_ROOT': '/media', 'MEDIA_ROOTS': '/media',
                    'PUBLIC_URL': '', 'PORT': '8097', 'LISTEN': ':8097'})
environment_file = stage / 'stage.env'
write_private(environment_file, ''.join(f'{key}={value}\n' for key, value in environment.items()))
stage_container = 'go-emby2-check-' + revision
database_created = False
container_created = False
try:
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 18097))
    command('docker', 'exec', database_id, 'createdb', '-U', database_user, test_database)
    database_created = True
    print('Preparing an isolated temporary database', flush=True)
    command('docker', 'run', '--rm', '--network', network, '--env-file', str(environment_file),
            arguments.image, '--prepare-schema')
    command('docker', 'run', '-d', '--name', stage_container, '--network', network,
            '--env-file', str(environment_file), '-p', '127.0.0.1:18097:8097',
            '-v', f'{data}:/app/data', '-v', f'{media}:/media',
            '-v', '/etc/machine-id:/run/license-machine-id:ro', arguments.image)
    container_created = True
    wait_health(18097)
    verify_assets(18097, manifest)
    session = json.loads(request(18097, '/emby/Users/AuthenticateByName', 'POST', {'Username': 'admin', 'Pw': admin_password}))
    token = session['AccessToken']
    for name, kind in [('国产电影', 'movies'), ('国产剧', 'tvshows')]:
        request(18097, '/admin/libraries', 'POST', {'Name': name, 'Kind': kind, 'Paths': ['/media/' + name], 'Penetrate': False}, token)
    for attempt in range(90):
        libraries = json.loads(request(18097, '/admin/libraries', token=token))
        counts = {library['Name']: library.get('Count', 0) for library in libraries}
        if counts.get('国产电影') == 300 and counts.get('国产剧') == 300:
            print('Staging passed: all 300 movies and all 300 episodes were scanned beyond the 256-entry page boundary', flush=True)
            break
        if attempt % 15 == 0:
            print('Waiting for isolated scan: ' + json.dumps(counts, ensure_ascii=False), flush=True)
        time.sleep(1)
    else:
        raise RuntimeError('Isolated full-directory scan did not reach the expected counts')
    write_private(backup / 'staging-passed.json', json.dumps({'image': arguments.image, 'counts': counts, 'manifest': manifest}, indent=2))
finally:
    if container_created:
        command('docker', 'rm', '-f', stage_container)
    if database_created:
        command('docker', 'exec', database_id, 'dropdb', '-U', database_user, '--force', test_database)
    environment_file.unlink(missing_ok=True)

if arguments.stage_only:
    print('Stage-only validation completed; production configuration was not changed', flush=True)
    raise SystemExit(0)
old_tag = application['Config']['Image']
pattern = r'(?m)^([ \t]+image:[ \t]*)' + re.escape(old_tag) + r'[ \t]*$'
updated, replacements = re.subn(pattern, lambda match: match[1] + arguments.image, original)
if replacements != 2:
    raise SystemExit('Expected exactly two matching application/schema image references; production was not changed')
replacement = project / '.go-emby2-compose.tmp'
replacement.write_text(updated)
shutil.copymode(compose, replacement)
command('docker', 'compose', '-p', project_name, '-f', str(replacement), 'config', '--quiet')
os.replace(replacement, compose)
try:
    print('Updating only the go-emby application container', flush=True)
    command('docker', 'compose', '-p', project_name, '-f', str(compose), 'up', '-d', '--no-deps', '--pull', 'never', 'go-emby')
    wait_health(8097)
    verify_assets(8097, manifest)
    if command('docker', 'compose', '-p', project_name, '-f', str(compose), 'ps', '-q', 'postgres') != database_id:
        raise RuntimeError('Database container unexpectedly changed')
    actual_image = inspect('go-emby')['Config']['Image']
    if actual_image != arguments.image:
        raise RuntimeError('The running image does not match the requested fixed version')
    write_private(backup / 'deployment-passed.json', json.dumps({'image': actual_image, 'version': manifest['version']}))
    print(json.dumps({'status': 'deployed', 'image': actual_image, 'version': manifest['version'], 'backup': str(backup)}, ensure_ascii=False), flush=True)
except Exception:
    rollback = re.sub(pattern, lambda match: match[1] + application['Image'], original)
    replacement.write_text(rollback)
    shutil.copymode(compose, replacement)
    os.replace(replacement, compose)
    command('docker', 'compose', '-p', project_name, '-f', str(compose), 'up', '-d', '--no-deps', '--pull', 'never', 'go-emby')
    wait_health(8097)
    print('Restored the previous application image after failed deployment verification', flush=True)
    raise
