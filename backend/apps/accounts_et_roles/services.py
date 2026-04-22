from typing import Optional
from django.db import transaction
from django.utils import timezone

from .models import (
    User, UserProfile,
    StudentProfile, StaffProfile, SupervisorProfile,
    Role, Permission, UserRoleAssignment,
    AccountInvitation, OnboardingStep, UserOnboardingProgress,
    RoleChangeLog, AccountStatusLog,
)


# =============================================================================
# PROFILE SERVICES
# =============================================================================

def ensure_user_profile(user: User) -> UserProfile:
    """Get or create the common UserProfile for a user."""
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


def confirm_identity(user: User, data: dict) -> UserProfile:
    """
    Step 1 onboarding: Confirm basic identity (writes to UserProfile).

    Args:
        user: The user completing identity confirmation
        data: Dict with first_name, last_name, date_of_birth, phone (optional)

    Returns:
        The updated UserProfile
    """
    profile = ensure_user_profile(user)

    profile.first_name = data.get('first_name', profile.first_name)
    profile.last_name = data.get('last_name', profile.last_name)
    profile.date_of_birth = data.get('date_of_birth', profile.date_of_birth)
    if 'phone' in data:
        profile.phone = data['phone']

    profile.save()

    # Also mark the student's identity as confirmed if they have a student profile
    if user.role == User.RoleChoices.STUDENT:
        student_profile, _ = StudentProfile.objects.get_or_create(user=user)
        student_profile.identity_confirmed = True
        
        # Save academic info if provided
        if 'program_major' in data:
            student_profile.program_major = data['program_major']
        if 'current_class' in data:
            student_profile.current_class = data['current_class']
            
        student_profile.save(update_fields=['identity_confirmed', 'program_major', 'current_class'])

    return profile


def complete_student_profile(user: User, data: dict, cv_file=None) -> StudentProfile:
    """
    Step 2 onboarding: Complete student-specific profile.

    Args:
        user: The student user
        data: Dict with student-specific fields
        cv_file: Optional uploaded CV file

    Returns:
        The updated StudentProfile
    """
    profile, _ = StudentProfile.objects.get_or_create(user=user)

    profile.program_major = data.get('program_major', profile.program_major)
    profile.current_class = data.get('current_class', profile.current_class)
    profile.linkedin_url = data.get('linkedin_url', profile.linkedin_url)
    profile.professional_summary = data.get('professional_summary', profile.professional_summary)

    # Career & Internship Preferences
    profile.career_objective = data.get('career_objective', profile.career_objective)
    profile.availability = data.get('availability', profile.availability)
    profile.start_date = data.get('start_date', profile.start_date)
    profile.city = data.get('city', profile.city)
    profile.has_applied = data.get('has_applied', profile.has_applied)

    # Handle JSON fields (skills, mobility)
    skills = data.get('skills')
    if skills is not None:
        if isinstance(skills, str):
            profile.skills = [s.strip() for s in skills.split(',') if s.strip()]
        elif isinstance(skills, list):
            profile.skills = skills

    mobility = data.get('mobility')
    if mobility is not None:
        if isinstance(mobility, str):
            profile.mobility = [m.strip() for m in mobility.split(',') if m.strip()]
        elif isinstance(mobility, list):
            profile.mobility = mobility

    if cv_file:
        profile.cv_file = cv_file

    profile.profile_completed = True
    profile.save()
    return profile


def complete_staff_profile(user: User, data: dict) -> StaffProfile:
    """Complete staff-specific profile."""
    profile, _ = StaffProfile.objects.get_or_create(user=user)

    profile.department = data.get('department', profile.department)
    profile.job_title = data.get('job_title', profile.job_title)
    profile.office_location = data.get('office_location', profile.office_location)
    profile.phone_extension = data.get('phone_extension', profile.phone_extension)

    profile.save()
    return profile


def complete_supervisor_profile(user: User, data: dict) -> SupervisorProfile:
    """Complete supervisor-specific profile."""
    profile, _ = SupervisorProfile.objects.get_or_create(user=user)

    profile.specialization = data.get('specialization', profile.specialization)
    profile.office_location = data.get('office_location', profile.office_location)
    profile.linkedin_url = data.get('linkedin_url', profile.linkedin_url)
    profile.research_interests = data.get('research_interests', profile.research_interests)

    profile.save()
    return profile


# =============================================================================
# RBAC SERVICES
# =============================================================================

def assign_role(
    user: User,
    role: Role,
    assigned_by: Optional[User] = None,
    expires_at: Optional[timezone.datetime] = None,
    reason: str = '',
) -> UserRoleAssignment:
    """
    Assign a role to a user with audit logging.

    Args:
        user: The user receiving the role
        role: The Role to assign
        assigned_by: The admin/operator making the assignment
        expires_at: Optional expiration datetime
        reason: Audit log reason

    Returns:
        The UserRoleAssignment (reactivated if previously existed)
    """
    with transaction.atomic():
        assignment, created = UserRoleAssignment.objects.get_or_create(
            user=user,
            role=role,
            defaults={
                'assigned_by': assigned_by,
                'expires_at': expires_at,
                'is_active': True,
            }
        )

        if not created:
            # Reactivate existing assignment
            was_active = assignment.is_active
            assignment.is_active = True
            assignment.expires_at = expires_at
            assignment.assigned_by = assigned_by
            assignment.save()

            action = (
                RoleChangeLog.Action.ASSIGNED
                if was_active
                else RoleChangeLog.Action.REACTIVATED
            )
        else:
            action = RoleChangeLog.Action.ASSIGNED

        # Audit log
        RoleChangeLog.objects.create(
            user=user,
            role=role,
            action=action,
            changed_by=assigned_by,
            reason=reason,
        )

    return assignment


def revoke_role(
    user: User,
    role: Role,
    changed_by: Optional[User] = None,
    reason: str = '',
) -> bool:
    """
    Revoke (deactivate) a role assignment with audit logging.

    Returns:
        True if a role was deactivated, False if no active assignment existed.
    """
    with transaction.atomic():
        assignment = UserRoleAssignment.objects.filter(
            user=user, role=role, is_active=True
        ).first()

        if not assignment:
            return False

        assignment.is_active = False
        assignment.save()

        RoleChangeLog.objects.create(
            user=user,
            role=role,
            action=RoleChangeLog.Action.DEACTIVATED,
            changed_by=changed_by,
            reason=reason,
        )

    return True


def get_user_permissions(user: User) -> set[str]:
    """Get all permission codes for a user through their active roles."""
    return user.permission_codes()


def user_has_permission(user: User, permission_code: str) -> bool:
    """Check if user has a specific permission (direct code check)."""
    return user.has_perm_code(permission_code)


# =============================================================================
# ACCOUNT STATUS SERVICES
# =============================================================================

def change_account_status(
    user: User,
    new_status: str,
    changed_by: Optional[User] = None,
    reason: str = '',
) -> None:
    """
    Change a user's account status with audit logging.

    Args:
        user: The user whose status is changing
        new_status: One of User.AccountStatus choices
        changed_by: The admin making the change
        reason: Audit reason
    """
    old_status = user.account_status
    if old_status == new_status:
        return

    with transaction.atomic():
        user.account_status = new_status
        user.save(update_fields=['account_status', 'updated_at'])

        AccountStatusLog.objects.create(
            user=user,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            reason=reason,
        )


def suspend_account(user: User, changed_by: Optional[User] = None, reason: str = '') -> None:
    """Suspend a user account."""
    change_account_status(
        user, User.AccountStatus.SUSPENDED, changed_by, reason
    )


def activate_account(user: User, changed_by: Optional[User] = None, reason: str = '') -> None:
    """Activate/reactivate a user account."""
    change_account_status(
        user, User.AccountStatus.ACTIVE, changed_by, reason
    )


# =============================================================================
# INVITATION SERVICES
# =============================================================================

def accept_invitation(invitation: AccountInvitation, user: User) -> None:
    """
    Mark an invitation as accepted and assign the invited role to the user.

    Args:
        invitation: The AccountInvitation being accepted
        user: The user accepting (newly created or existing)
    """
    with transaction.atomic():
        invitation.status = AccountInvitation.Status.ACCEPTED
        invitation.accepted_at = timezone.now()
        invitation.accepted_user = user
        invitation.save()

        # Assign the role from the invitation
        assign_role(
            user=user,
            role=invitation.role,
            reason=f'Accepted invitation {invitation.id}',
        )

        # Assign scope if provided
        if invitation.scope:
            from .models import UserScopeAssignment
            UserScopeAssignment.objects.get_or_create(
                user=user,
                scope=invitation.scope,
                defaults={'is_active': True},
            )


# =============================================================================
# ONBOARDING SERVICES
# =============================================================================

def get_or_create_onboarding_progress(user: User, step: OnboardingStep) -> UserOnboardingProgress:
    """Get or create a progress entry for a user on a specific onboarding step."""
    progress, _ = UserOnboardingProgress.objects.get_or_create(
        user=user,
        step=step,
        defaults={'status': UserOnboardingProgress.Status.NOT_STARTED},
    )
    return progress


def start_onboarding_step(user: User, step: OnboardingStep) -> UserOnboardingProgress:
    """Mark an onboarding step as started."""
    progress = get_or_create_onboarding_progress(user, step)
    progress.status = UserOnboardingProgress.Status.IN_PROGRESS
    progress.started_at = timezone.now()
    progress.save()
    return progress


def complete_onboarding_step(
    user: User,
    step: OnboardingStep,
    metadata: Optional[dict] = None,
) -> UserOnboardingProgress:
    """Mark an onboarding step as completed."""
    progress = get_or_create_onboarding_progress(user, step)
    progress.status = UserOnboardingProgress.Status.COMPLETED
    progress.completed_at = timezone.now()
    if metadata:
        progress.metadata.update(metadata)
    progress.save()
    return progress


def skip_onboarding_step(user: User, step: OnboardingStep, reason: str = '') -> UserOnboardingProgress:
    """Mark an onboarding step as skipped (for optional steps)."""
    progress = get_or_create_onboarding_progress(user, step)
    progress.status = UserOnboardingProgress.Status.SKIPPED
    if reason:
        progress.metadata['skip_reason'] = reason
    progress.save()
    return progress


def is_onboarding_complete(user: User, role: Role) -> bool:
    """Check if user has completed all required onboarding steps for a role."""
    required_steps = OnboardingStep.objects.filter(
        for_roles=role,
        is_required=True,
    )

    for step in required_steps:
        try:
            progress = UserOnboardingProgress.objects.get(user=user, step=step)
            if progress.status not in (
                UserOnboardingProgress.Status.COMPLETED,
                UserOnboardingProgress.Status.SKIPPED,
            ):
                return False
        except UserOnboardingProgress.DoesNotExist:
            return False

    return True
