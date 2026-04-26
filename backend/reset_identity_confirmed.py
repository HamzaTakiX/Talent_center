#!/usr/bin/env python
"""
Reset identity_confirmed to false for testing onboarding flow
Run with: python reset_identity_confirmed.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.accounts_et_roles.models import User

def reset_identity_confirmed(email):
    """Reset identity_confirmed flag for a student user."""
    try:
        user = User.objects.get(email=email)
        
        if hasattr(user, 'student_profile'):
            student_profile = user.student_profile
            print(f"Current identity_confirmed: {student_profile.identity_confirmed}")
            print(f"Current profile_completed: {student_profile.profile_completed}")
            
            # Reset both flags
            student_profile.identity_confirmed = False
            student_profile.profile_completed = False
            student_profile.save()
            
            print(f"\n✓ Reset successful for {email}")
            print(f"  identity_confirmed: {student_profile.identity_confirmed}")
            print(f"  profile_completed: {student_profile.profile_completed}")
        else:
            print(f"✗ User {email} does not have a student profile")
            
    except User.DoesNotExist:
        print(f"✗ User with email {email} not found")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("Reset Identity Confirmed Flag")
    print("=" * 60)
    
    # Reset for the test account
    reset_identity_confirmed("student@talent-center.local")
    
    print("\n" + "=" * 60)
    print("Done! User will now need to complete the onboarding steps.")
    print("=" * 60)
