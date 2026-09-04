"""Secure password generation and encrypted credential storage."""

import base64
import hashlib
import secrets
import string

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.utils import timezone

from ..models import StudentCredential

User = get_user_model()

_SPECIAL = '!@#$%^&*()-_=+[]{}|:;,.<>?'


def _fernet():
    from cryptography.fernet import Fernet
    digest = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def generate_secure_password(length: int = 16) -> str:
    if length < 12:
        length = 12
    alphabet = string.ascii_letters + string.digits + _SPECIAL
    while True:
        chars = [secrets.choice(string.ascii_lowercase),
                 secrets.choice(string.ascii_uppercase),
                 secrets.choice(string.digits),
                 secrets.choice(_SPECIAL)]
        chars += [secrets.choice(alphabet) for _ in range(length - 4)]
        secrets.SystemRandom().shuffle(chars)
        password = ''.join(chars)
        try:
            validate_password(password)
        except Exception:
            continue
        if (
            any(c.isupper() for c in password)
            and any(c.islower() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in _SPECIAL for c in password)
        ):
            return password


def encrypt_password(plaintext: str) -> str:
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt_password(ciphertext: str) -> str:
    return _fernet().decrypt(ciphertext.encode()).decode()


@transaction.atomic
def set_student_password(*, user, plaintext: str, generated_by=None) -> StudentCredential:
    """Hash password on User and store encrypted copy for admin reveal."""
    validate_password(plaintext, user=user)
    user.set_password(plaintext)
    user.save(update_fields=['password', 'updated_at'])

    StudentCredential.objects.filter(user=user, is_current=True).update(is_current=False)

    return StudentCredential.objects.create(
        user=user,
        password_ciphertext=encrypt_password(plaintext),
        generated_by=generated_by,
        is_current=True,
    )


def _current_credential(user):
    return (
        StudentCredential.objects
        .filter(user=user, is_current=True)
        .order_by('-generated_at')
        .first()
    )


def current_credential_plaintext(*, user) -> str | None:
    record = _current_credential(user)
    if record is None:
        return None
    return decrypt_password(record.password_ciphertext)


@transaction.atomic
def provision_user_password(*, user, generated_by=None) -> str:
    """Return the current plaintext password, generating a random one if missing."""
    existing = current_credential_plaintext(user=user)
    if existing:
        return existing
    plaintext = generate_secure_password()
    set_student_password(user=user, plaintext=plaintext, generated_by=generated_by)
    return plaintext


def reveal_current_credential(*, user, revealed_by=None) -> str:
    record = _current_credential(user)
    if record is None:
        raise ValueError('No credential on file for this user.')
    if record.revealed_at is None:
        record.revealed_at = timezone.now()
        record.save(update_fields=['revealed_at'])
    return decrypt_password(record.password_ciphertext)


def reveal_or_provision_credential(*, user, revealed_by=None) -> str:
    """Reveal the stored password, creating a random one if none exists yet."""
    provision_user_password(user=user, generated_by=revealed_by)
    return reveal_current_credential(user=user, revealed_by=revealed_by)


@transaction.atomic
def regenerate_user_password(*, user, generated_by=None) -> str:
    """Replace the current password with a new random one and return it."""
    plaintext = generate_secure_password()
    set_student_password(user=user, plaintext=plaintext, generated_by=generated_by)
    return plaintext
