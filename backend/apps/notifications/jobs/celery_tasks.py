try:
    from celery import shared_task
except ImportError:
    def shared_task(*args, **kwargs):
        def decorator(func):
            return func
        return decorator


@shared_task(name='notifications.process_queue')
def process_notification_queue_task(batch_size: int = 50) -> dict:
    from apps.notifications.jobs.process_queue import process_notification_batch
    return process_notification_batch(batch_size=batch_size)
