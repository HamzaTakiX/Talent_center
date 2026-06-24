"""Backfill announcement engagement counters from student action logs."""

from django.db import migrations
from django.db.models import Count


def sync_engagement_counters(apps, schema_editor):
    Announcement = apps.get_model('announcements', 'Announcement')
    StudentAnnouncementAction = apps.get_model('announcements', 'StudentAnnouncementAction')
    StudentAnnouncementBookmark = apps.get_model('announcements', 'StudentAnnouncementBookmark')

    view_counts = {
        row['announcement_id']: row['total']
        for row in (
            StudentAnnouncementAction.objects.filter(action_type='VIEW')
            .values('announcement_id')
            .annotate(total=Count('student_profile', distinct=True))
        )
    }
    click_counts = {
        row['announcement_id']: row['total']
        for row in (
            StudentAnnouncementAction.objects.filter(action_type='CLICK')
            .values('announcement_id')
            .annotate(total=Count('id'))
        )
    }
    save_action_counts = {
        row['announcement_id']: row['total']
        for row in (
            StudentAnnouncementAction.objects.filter(action_type='SAVE')
            .values('announcement_id')
            .annotate(total=Count('id'))
        )
    }
    bookmark_counts = {
        row['announcement_id']: row['total']
        for row in (
            StudentAnnouncementBookmark.objects.filter(bookmark_type='SAVE')
            .values('announcement_id')
            .annotate(total=Count('id'))
        )
    }

    for announcement in Announcement.objects.all().iterator():
        view_count = view_counts.get(announcement.pk, 0)
        click_count = click_counts.get(announcement.pk, 0)
        save_count = max(
            save_action_counts.get(announcement.pk, 0),
            bookmark_counts.get(announcement.pk, 0),
            announcement.save_count,
        )
        if (
            announcement.view_count != view_count
            or announcement.click_count != click_count
            or announcement.save_count != save_count
        ):
            Announcement.objects.filter(pk=announcement.pk).update(
                view_count=view_count,
                click_count=click_count,
                save_count=save_count,
            )


class Migration(migrations.Migration):
    dependencies = [
        ('announcements', '0003_publication_log_schedule_actions'),
    ]

    operations = [
        migrations.RunPython(sync_engagement_counters, migrations.RunPython.noop),
    ]
