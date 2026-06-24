#!/usr/bin/env python
"""
Reset internship status question for testing the student offers gate.
Run with: python reset_internship_status.py
Optional: python reset_internship_status.py student@talent-center.local
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.accounts_et_roles.models import User

DEFAULT_EMAIL = 'student@talent-center.local'


def reset_internship_status(email: str) -> None:
    """Reset internship question flags for a student user."""
    try:
        user = User.objects.get(email=email)

        if not hasattr(user, 'student_profile'):
            print(f'[ERR] User {email} does not have a student profile')
            return

        student_profile = user.student_profile
        print(f'Current internship_status_acknowledged: {student_profile.internship_status_acknowledged}')
        print(f'Current has_internship: {student_profile.has_internship}')
        print(f'Current internship_company_name: {student_profile.internship_company_name!r}')

        student_profile.internship_status_acknowledged = False
        student_profile.has_internship = False
        student_profile.internship_company_name = ''
        student_profile.internship_specialization = ''
        student_profile.internship_company_city = ''
        student_profile.internship_stage_duration = ''
        student_profile.save()

        print(f'\n[OK] Reset successful for {email}')
        print(f'  internship_status_acknowledged: {student_profile.internship_status_acknowledged}')
        print(f'  has_internship: {student_profile.has_internship}')

    except User.DoesNotExist:
        print(f'[ERR] User with email {email} not found')
    except Exception as e:
        print(f'[ERR] Error: {e}')


if __name__ == '__main__':
    email = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_EMAIL

    print('=' * 60)
    print('Reset Internship Status Question')
    print('=' * 60)

    reset_internship_status(email)

    print('\n' + '=' * 60)
    print('Done! Refresh /student/internship-offers to see the question again.')
    print('=' * 60)
