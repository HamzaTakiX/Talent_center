from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from django.conf import settings


def _normalize_lang(language: str | None) -> str:
    value = (language or '').strip().lower()
    if not value:
        return ''
    if '-' in value:
        return value.split('-')[0]
    return value


def _transcribe_with_whisper_cli(file_path: Path, language: str = '') -> dict[str, Any]:
    binary = getattr(settings, 'WHISPER_BINARY', 'whisper') or 'whisper'
    model = getattr(settings, 'WHISPER_MODEL', 'base') or 'base'

    with tempfile.TemporaryDirectory(prefix='stt_out_') as out_dir:
        if binary == 'whisper':
            cmd = [
                sys.executable,
                '-m',
                'whisper',
                str(file_path),
                '--model',
                model,
                '--output_format',
                'txt',
                '--fp16',
                'False',
                '--output_dir',
                out_dir,
            ]
        else:
            cmd = [
                binary,
                str(file_path),
                '--model',
                model,
                '--output_format',
                'txt',
                '--fp16',
                'False',
                '--output_dir',
                out_dir,
            ]
        if language:
            cmd.extend(['--language', language])

        subprocess.run(cmd, capture_output=True, text=True, check=True)
        output_txt = Path(out_dir) / f'{file_path.stem}.txt'
        text = output_txt.read_text(encoding='utf-8').strip()
        return {'text': text, 'provider': 'whisper-cli', 'model': model, 'empty': not bool(text)}


def _transcribe_with_openai(file_path: Path, language: str = '') -> dict[str, Any]:
    api_key = getattr(settings, 'OPENAI_API_KEY', '')
    if not api_key:
        raise RuntimeError('OPENAI_API_KEY is not configured.')
    model = getattr(settings, 'OPENAI_STT_MODEL', 'gpt-4o-mini-transcribe')

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError('openai package is not installed.') from exc

    client = OpenAI(api_key=api_key)
    with file_path.open('rb') as audio_file:
        kwargs: dict[str, Any] = {'model': model, 'file': audio_file}
        if language:
            kwargs['language'] = language
        response = client.audio.transcriptions.create(**kwargs)
    text = str(getattr(response, 'text', '') or '').strip()
    if not text:
        raise RuntimeError('OpenAI transcription is empty.')
    return {'text': text, 'provider': 'openai', 'model': model}


def transcribe_audio(uploaded_file, language: str | None = None) -> dict[str, Any]:
    lang = _normalize_lang(language)
    suffix = Path(getattr(uploaded_file, 'name', '') or 'audio.webm').suffix or '.webm'

    with tempfile.NamedTemporaryFile(prefix='interview_stt_', suffix=suffix, delete=False) as temp:
        for chunk in uploaded_file.chunks():
            temp.write(chunk)
        temp_path = Path(temp.name)

    errors: list[str] = []
    try:
        try:
            whisper_result = _transcribe_with_whisper_cli(temp_path, language=lang)
            if whisper_result.get('text'):
                return whisper_result
            if not getattr(settings, 'OPENAI_API_KEY', ''):
                return whisper_result
        except Exception as exc:
            errors.append(f'whisper-cli: {exc}')

        try:
            return _transcribe_with_openai(temp_path, language=lang)
        except Exception as exc:
            errors.append(f'openai: {exc}')

        raise RuntimeError(' | '.join(errors) if errors else 'No STT provider available.')
    finally:
        try:
            temp_path.unlink(missing_ok=True)
        except Exception:
            pass
