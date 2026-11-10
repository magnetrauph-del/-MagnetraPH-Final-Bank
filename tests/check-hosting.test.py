"""Offline integration tests: execute the real verifier with a mocked curl transport.

Failure fixtures shorten the deadline (180 -> 2 seconds) and accelerate retry
sleeps; success fixtures use production timing. Production has no configuration
switch to bypass or shorten verification. No network is used.
Run: python3 tests/check-hosting.test.py
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
MOCK_CURL = r'''#!/usr/bin/env python3
import json, os, sys, time
from pathlib import Path
from urllib.parse import unquote, urlsplit
args = sys.argv[1:]
url = args[-1]
assert url.startswith('https://preview.invalid/')
p = unquote(urlsplit(url).path).lstrip('/')
head = '-I' in args
out = args[args.index('-o') + 1]
limit = int(args[args.index('--max-time') + 1])
state = Path('requests.json')
requests = json.loads(state.read_text()) if state.exists() else []
requests.append([p, head, url, limit])
state.write_text(json.dumps(requests))
mode = os.environ['SCENARIO']
if head:
    print('200' if mode == 'exposed' and p == '.git/config' else '404', end='')
    sys.exit()
f = Path('public') / (p or 'index.html')
code, body = ('200', f.read_bytes()) if f.is_file() else ('404', b'not found')
count = sum(r[0] == p and not r[1] for r in requests)
if p == 'banner-i18n.js':
    if mode in ('persistent', 'wrong200') or (mode == 'propagation' and count == 1) or (mode == 'mixed' and count % 2 == 1):
        body = b'b32 old payload'
    if mode in ('connection', '5xx') and count == 1:
        if mode == 'connection':
            print('000', end='')
            sys.exit(7)
        code, body = '503', b'unavailable'
    if mode in ('connection-persistent', '5xx-persistent', 'slow'):
        if mode == 'slow':
            time.sleep(limit)
            sys.exit(28)
        if mode == 'connection-persistent':
            sys.exit(7)
        code, body = '503', b'unavailable'
if p == 'banner-studio-ui.js' and mode == 'mixed':
    # Opposing versions: both files individually match on some attempts, but
    # no complete pass ever matches. Successful files must be rechecked.
    passes = sum(r[0] == 'banner-i18n.js' for r in requests)
    if passes % 2 == 0:
        body = b'b32 old payload'
if out != '/dev/null':
    Path(out).write_bytes(body)
print(code, end='')
'''


class HostingChecks(unittest.TestCase):
    def run_verifier(self, scenario):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            scripts = root / '.github/scripts'
            scripts.mkdir(parents=True)
            source = (ROOT / '.github/scripts/check-hosting.sh').read_text()
            self.assertEqual(source.count('payload_deadline=$((SECONDS + 180))'), 1)
            if scenario in ('persistent', 'wrong200', 'mixed', 'connection-persistent', '5xx-persistent', 'slow'):
                source = source.replace('payload_deadline=$((SECONDS + 180))',
                                        'payload_deadline=$((SECONDS + 2))')
            (scripts / 'check-hosting.sh').write_text(source)
            shutil.copy(ROOT / '.github/scripts/blocked-paths.txt', scripts)
            # Use every actual b33 payload, including the unchanged index.html.
            (root / 'public').symlink_to(ROOT / 'public', target_is_directory=True)
            bindir = root / 'bin'
            bindir.mkdir()
            curl = bindir / 'curl'
            curl.write_text(MOCK_CURL)
            curl.chmod(0o755)
            if scenario in ('persistent', 'wrong200', 'mixed', 'connection-persistent', '5xx-persistent'):
                # Exercise multiple failed passes without waiting five seconds each.
                sleeper = bindir / 'sleep'
                sleeper.write_text('#!/bin/sh\nexec /bin/sleep 0.05\n')
                sleeper.chmod(0o755)
            env = dict(os.environ, PATH=str(bindir) + os.pathsep + os.environ['PATH'], SCENARIO=scenario)
            start = time.monotonic()
            result = subprocess.run(['bash', str(scripts / 'check-hosting.sh'), 'https://preview.invalid'],
                                    cwd=root, env=env, capture_output=True, text=True, timeout=40)
            elapsed = time.monotonic() - start
            requests = json.loads((root / 'requests.json').read_text())
            return result, requests, elapsed

    def check_success(self, scenario):
        result, requests, _ = self.run_verifier(scenario)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('all 74 hosted files served with identical content', result.stdout)
        self.assertIn('all 116 blocked paths return 404', result.stdout)
        expected = [line.lstrip('/') for line in (ROOT / '.github/scripts/blocked-paths.txt').read_text().splitlines()
                    if line and not line.startswith('#')]
        self.assertEqual([r[0] for r in requests if r[1]], expected)
        for p in ['', 'dashboard.html', 'login.html?verify=1', 'followup.html?situation=quote-sent', 'create.html']:
            self.assertTrue(any(r[2] == 'https://preview.invalid/' + p for r in requests), p)
        self.assertTrue(all('?' not in r[2] for r in requests if r[0].startswith('banner')))
        return requests

    def test_matching(self):
        self.check_success('matching')

    def test_old_to_new(self):
        requests = self.check_success('propagation')
        self.assertEqual(sum(r[0] == 'banner-i18n.js' for r in requests), 2)
        self.assertGreater(sum(r[0] == 'auth-core-shared.js' for r in requests), 1)

    def test_transient_failures(self):
        for scenario in ('connection', '5xx'):
            with self.subTest(scenario=scenario):
                self.check_success(scenario)

    def test_persistent_failures_and_mixed_versions(self):
        for scenario in ('persistent', 'wrong200', 'mixed', 'connection-persistent', '5xx-persistent', 'slow'):
            with self.subTest(scenario=scenario):
                result, requests, elapsed = self.run_verifier(scenario)
                self.assertEqual(result.returncode, 1, result.stdout)
                self.assertIn('did not complete a matching pass', result.stdout)
                self.assertNotIn('hosted files served with identical content', result.stdout)
                self.assertLess(elapsed, 6, 'payload deadline must include requests and sleeps')
                self.assertTrue(all(0 < r[3] <= 2 for r in requests))
                if scenario != 'slow':
                    self.assertGreaterEqual(sum(r[0] == 'banner-i18n.js' for r in requests), 2)
                if scenario == 'mixed':
                    self.assertTrue(any(r[0] == 'banner-studio-ui.js' for r in requests))

    def test_protected_path_exposure_fails(self):
        result, requests, _ = self.run_verifier('exposed')
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertIn('blocked path served: /.git/config -> HTTP 200', result.stdout)
        self.assertEqual(sum(r[1] for r in requests), 116)
        self.assertFalse(any(r[0] == '.git/config' and not r[1] for r in requests))


if __name__ == '__main__':
    unittest.main(verbosity=2)
