#!/usr/bin/env python
"""
Prépare un compte étudiant de test pour la connexion locale.

Usage (depuis backend/) :
  python setup_test_student.py

Identifiants par défaut :
  Email    : student@talent-center.local
  Password : TalentCenter2026!
"""
import os
import sys

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.accounts_et_roles.services import ensure_user_profile
from apps.admin_management.models import ClassGroup, Filiere
from apps.admin_management.services.esca_academic_seed import seed_esca_academic
from apps.authentication.models import LoginAttempt
from apps.authentication.services.credentials import set_student_password

User = get_user_model()

TEST_EMAIL = 'student@talent-center.local'
TEST_PASSWORD = 'TalentCenter2026!'


def main():
    user, created = User.objects.get_or_create(
        email=TEST_EMAIL,
        defaults={
            'role': User.RoleChoices.STUDENT,
            'account_status': User.AccountStatus.ACTIVE,
            'platform_access_granted': True,
            'first_login_completed': True,
        },
    )
    if not created:
        user.role = User.RoleChoices.STUDENT
        user.account_status = User.AccountStatus.ACTIVE
        user.platform_access_granted = True
        user.first_login_completed = True
        user.is_active = True
        user.save()

    ensure_user_profile(user)
    profile = user.profile
    profile.first_name = profile.first_name or 'Test'
    profile.last_name = profile.last_name or 'Student'
    profile.save(update_fields=['first_name', 'last_name', 'updated_at'])

    set_student_password(user=user, plaintext=TEST_PASSWORD)

    if not Filiere.objects.filter(is_active=True).exists():
        seed_esca_academic()

    from apps.admin_management.services.esca_catalog import ESCA_CATALOG_FILIERE_CODES

    filiere = (
        Filiere.objects.filter(is_active=True, code__in=ESCA_CATALOG_FILIERE_CODES)
        .order_by('sort_order', 'code')
        .first()
    )
    class_group = None
    if filiere:
        class_group = (
            ClassGroup.objects.filter(filiere=filiere, is_active=True)
            .order_by('code')
            .select_related('academic_year_ref')
            .first()
        )

    student_profile, _ = StudentProfile.objects.get_or_create(user=user)
    if filiere:
        student_profile.filiere = filiere
        student_profile.program_major = filiere.name
    if class_group:
        student_profile.class_group = class_group
        student_profile.current_class = class_group.name
        if class_group.academic_year_ref_id:
            student_profile.academic_year = class_group.academic_year_ref.code
        elif getattr(class_group, 'academic_year', None):
            student_profile.academic_year = class_group.academic_year

    student_profile.identity_confirmed = True
    student_profile.profile_completed = True
    student_profile.save()

    # Débloquer après trop de tentatives échouées
    deleted, _ = LoginAttempt.objects.filter(identifier=TEST_EMAIL).delete()
    if deleted:
        print(f'  Lockout  : {deleted} tentative(s) effacée(s)')

    print('=' * 60)
    print('Compte étudiant de test — Talent Center')
    print('=' * 60)
    print(f'  Email      : {TEST_EMAIL}')
    print(f'  Mot de passe : {TEST_PASSWORD}')
    print(f'  Filière    : {student_profile.filiere.code if student_profile.filiere_id else "—"}')
    print(f'  Classe     : {student_profile.current_class or "—"}')
    print(f'  Profil     : identity_confirmed=True, profile_completed=True')
    print(f'  Statut     : {user.account_status}')
    print('=' * 60)
    print('Connexion : http://localhost:5173/login (ou votre URL frontend)')
    print('=' * 60)


if __name__ == '__main__':
    main()
