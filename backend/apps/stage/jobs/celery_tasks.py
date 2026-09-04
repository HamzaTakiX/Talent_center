"""Background jobs for offer publish side-effects (embeddings + matching)."""

from __future__ import annotations

import logging
import threading

logger = logging.getLogger(__name__)


def _run_offer_post_publish(offer_id: int) -> dict:
    from apps.stage.models import InternshipOffer
    from apps.stage.services.ai_pipeline.pipeline import process_offer_publish
    from apps.stage.services.matching_service import recalculate_matches_for_offer
    from apps.stage.models import MatchingHistory

    try:
        offer = InternshipOffer.objects.prefetch_related('targeting_rules').get(pk=offer_id)
    except InternshipOffer.DoesNotExist:
        logger.warning('Offer %s not found for post-publish processing', offer_id)
        return {'offer_id': offer_id, 'error': 'not_found'}

    embedding_ok = False
    try:
        process_offer_publish(offer)
        embedding_ok = True
    except Exception:
        logger.exception('Offer embedding failed for offer %s', offer_id)

    matched = 0
    try:
        matched = recalculate_matches_for_offer(offer, trigger=MatchingHistory.Trigger.OFFER_PUBLISHED)
    except Exception:
        logger.exception('Match recalculation failed for offer %s', offer_id)

    return {
        'offer_id': offer_id,
        'embedding_indexed': embedding_ok,
        'students_scored': matched,
    }


def schedule_offer_post_publish(offer_id: int) -> None:
    """Enqueue embedding + matching after publish; never block the HTTP response."""
    try:
        from .celery_tasks import process_offer_post_publish_task

        if process_offer_post_publish_task is not None:
            process_offer_post_publish_task.delay(offer_id)
            return
    except Exception:
        pass

    thread = threading.Thread(
        target=_run_offer_post_publish,
        args=(offer_id,),
        name=f'offer-post-publish-{offer_id}',
        daemon=True,
    )
    thread.start()


try:
    from celery import shared_task

    @shared_task(bind=True, max_retries=2, default_retry_delay=60)
    def process_offer_post_publish_task(self, offer_id: int) -> dict:
        try:
            return _run_offer_post_publish(offer_id)
        except Exception as exc:
            logger.exception('Post-publish processing failed for offer %s', offer_id)
            raise self.retry(exc=exc) from exc

except ImportError:
    process_offer_post_publish_task = None
