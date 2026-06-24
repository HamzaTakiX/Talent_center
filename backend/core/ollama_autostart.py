"""
Auto-start Ollama when the Django backend boots (local dev).

Students/devs only need: python manage.py runserver
Ollama serve + optional model pulls run in the background.
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import sys
import threading
import time
from typing import TYPE_CHECKING

import requests

if TYPE_CHECKING:
    from subprocess import Popen

logger = logging.getLogger(__name__)

_process: Popen | None = None
_lock = threading.Lock()
_bootstrapped = False


def _should_autostart() -> bool:
    from django.conf import settings

    if not getattr(settings, 'OLLAMA_AUTO_START', False):
        return False

    # runserver parent reloader — skip; child has RUN_MAIN=true
    if 'runserver' in sys.argv and os.environ.get('RUN_MAIN') != 'true':
        return False

    # One-off management commands — don't spawn a long-lived server
    skip_commands = {
        'migrate', 'makemigrations', 'test', 'shell', 'collectstatic',
        'createsuperuser', 'flush', 'dumpdata', 'loaddata', 'check',
    }
    if any(cmd in sys.argv for cmd in skip_commands):
        return False

    return True


def _ollama_binary() -> str | None:
    from django.conf import settings

    configured = getattr(settings, 'OLLAMA_BINARY', '').strip()
    if configured and os.path.isfile(configured):
        return configured

    found = shutil.which('ollama')
    if found:
        return found

    # Windows: Ollama Desktop installs here but may not add PATH for Python
    if sys.platform == 'win32':
        candidates = [
            os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs', 'Ollama', 'ollama.exe'),
            r'C:\Program Files\Ollama\ollama.exe',
        ]
        for path in candidates:
            if path and os.path.isfile(path):
                return path

    return None


def is_ollama_running(base_url: str | None = None) -> bool:
    from django.conf import settings

    url = (base_url or getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')).rstrip('/')
    try:
        resp = requests.get(f'{url}/api/tags', timeout=2)
        return resp.status_code == 200
    except requests.RequestException:
        return False


def _spawn_ollama_serve(binary: str) -> Popen | None:
    kwargs: dict = {
        'stdout': subprocess.DEVNULL,
        'stderr': subprocess.DEVNULL,
    }
    if sys.platform == 'win32':
        kwargs['creationflags'] = subprocess.CREATE_NO_WINDOW  # type: ignore[attr-defined]
    else:
        kwargs['start_new_session'] = True

    try:
        proc = subprocess.Popen([binary, 'serve'], **kwargs)
        logger.info('Started Ollama serve (pid=%s)', proc.pid)
        return proc
    except OSError as exc:
        logger.error('Failed to start Ollama: %s', exc)
        return None


def _wait_until_ready(base_url: str, timeout: float) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if is_ollama_running(base_url):
            return True
        time.sleep(0.5)
    return False


def _pull_missing_models(binary: str, base_url: str) -> None:
    from django.conf import settings

    if not getattr(settings, 'OLLAMA_AUTO_PULL_MODELS', True):
        return

    try:
        resp = requests.get(f'{base_url.rstrip("/")}/api/tags', timeout=5)
        resp.raise_for_status()
        installed = {m.get('name', '') for m in (resp.json().get('models') or [])}
    except requests.RequestException:
        return

    wanted = {
        getattr(settings, 'OLLAMA_MODEL', 'qwen3:8b'),
        getattr(settings, 'OLLAMA_FALLBACK_MODEL', 'llama3.1:8b'),
        getattr(settings, 'CAREER_COACH_EMBEDDING_MODEL', 'bge-m3'),
    }

    for model in wanted:
        if not model:
            continue
        if any(model in name or name.startswith(model) for name in installed):
            continue
        logger.info('Pulling Ollama model %s (first run may take several minutes)…', model)
        try:
            subprocess.run(
                [binary, 'pull', model],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except OSError as exc:
            logger.warning('Could not pull model %s: %s', model, exc)


def _bootstrap() -> None:
    global _process, _bootstrapped

    with _lock:
        if _bootstrapped:
            return
        _bootstrapped = True

    from django.conf import settings

    base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
    timeout = float(getattr(settings, 'OLLAMA_STARTUP_TIMEOUT', 45))

    if is_ollama_running(base_url):
        logger.info('Ollama already running at %s', base_url)
        binary = _ollama_binary()
        if binary:
            threading.Thread(
                target=_pull_missing_models,
                args=(binary, base_url),
                name='ollama-pull',
                daemon=True,
            ).start()
        else:
            logger.warning(
                'Ollama is running but ollama.exe was not found — set OLLAMA_BINARY in .env '
                'to pull AI models automatically.'
            )
        return

    binary = _ollama_binary()
    if not binary:
        logger.warning(
            'OLLAMA_AUTO_START is enabled but "ollama" was not found in PATH. '
            'Install from https://ollama.com/download'
        )
        return

    _process = _spawn_ollama_serve(binary)
    if _process is None:
        return

    if _wait_until_ready(base_url, timeout):
        logger.info('Ollama is ready at %s', base_url)
        threading.Thread(
            target=_pull_missing_models,
            args=(binary, base_url),
            name='ollama-pull',
            daemon=True,
        ).start()
    else:
        logger.warning(
            'Ollama did not become ready within %ss. AI features will use fallback until it starts.',
            timeout,
        )


def ensure_ollama_running() -> None:
    """Called from AppConfig.ready() — non-blocking."""
    if not _should_autostart():
        return
    threading.Thread(target=_bootstrap, name='ollama-autostart', daemon=True).start()
