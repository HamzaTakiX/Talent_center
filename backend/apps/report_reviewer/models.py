from django.conf import settings
from django.db import models


class PageAnalysisCache(models.Model):
    """Cached page analysis keyed by user + report + page + content hash + mode."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='report_page_analyses',
    )
    report_id = models.CharField(max_length=128, db_index=True)
    page_number = models.PositiveIntegerField()
    content_hash = models.CharField(max_length=64, db_index=True)
    mode = models.CharField(max_length=32, default='full')
    model_name = models.CharField(max_length=128, blank=True, default='')
    score = models.PositiveSmallIntegerField(default=100)
    issues_json = models.JSONField(default=list)
    summary_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'report_id', 'page_number', 'content_hash', 'mode'],
                name='uniq_page_analysis_cache',
            ),
        ]
        indexes = [
            models.Index(
                fields=['user', 'report_id', 'page_number', 'mode'],
                name='rpt_rev_user_rpt_page_mode_idx',
            ),
        ]
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'{self.report_id} p{self.page_number} ({self.mode})'
