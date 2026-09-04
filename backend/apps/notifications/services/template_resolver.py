"""Template resolution — DB-driven selection with explicit fallback chain.

Resolution order (never silent):
1. Selected active template for event_code + channel
2. Default active template for event_code + channel
3. Registry EventConfig.template_code lookup
4. System generic fallback (returns None; caller uses payload fallback + log)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from apps.notifications.models import NotificationTemplate

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ResolvedTemplate:
    template: NotificationTemplate | None
    template_code: str
    source: str  # selected | default | registry | system_fallback


def resolve_template(
    *,
    event_code: str,
    channel: str,
    registry_template_code: str = '',
) -> ResolvedTemplate:
    """Resolve which template to use for an event/channel. Never raises."""
    base = NotificationTemplate.objects.filter(
        channel=channel,
        status=NotificationTemplate.Status.ACTIVE,
        is_active=True,
    )

    selected = base.filter(event_code=event_code, is_selected=True).first()
    if selected:
        logger.debug(
            'Template resolved via selected: event=%s channel=%s code=%s',
            event_code, channel, selected.code,
        )
        return ResolvedTemplate(selected, selected.code, 'selected')

    logger.info(
        'Template resolver: no selected template for event=%s channel=%s — trying default',
        event_code, channel,
    )

    default = base.filter(event_code=event_code, is_default=True).first()
    if default:
        logger.debug(
            'Template resolved via default: event=%s channel=%s code=%s',
            event_code, channel, default.code,
        )
        return ResolvedTemplate(default, default.code, 'default')

    logger.warning(
        'Template resolver: no default template for event=%s channel=%s — trying registry code=%s',
        event_code, channel, registry_template_code,
    )

    if registry_template_code:
        registry_tpl = base.filter(code=registry_template_code).first()
        if not registry_tpl and channel == 'IN_APP':
            registry_tpl = base.filter(code=f'{registry_template_code}_in_app').first()
        if registry_tpl:
            logger.debug(
                'Template resolved via registry: event=%s channel=%s code=%s',
                event_code, channel, registry_tpl.code,
            )
            return ResolvedTemplate(registry_tpl, registry_tpl.code, 'registry')

    logger.error(
        'Template resolver CONFIGURATION ERROR: no template for event=%s channel=%s '
        'registry_code=%s — using system generic fallback',
        event_code, channel, registry_template_code,
    )
    return ResolvedTemplate(None, registry_template_code or 'system_fallback', 'system_fallback')


def set_selected_template(*, template: NotificationTemplate) -> NotificationTemplate:
    """Mark template as the selected one for its event_code+channel; clear others."""
    if not template.event_code:
        raise ValueError('Template must have an event_code before it can be selected')
    NotificationTemplate.objects.filter(
        event_code=template.event_code,
        channel=template.channel,
        is_selected=True,
    ).exclude(pk=template.pk).update(is_selected=False)
    template.is_selected = True
    template.status = NotificationTemplate.Status.ACTIVE
    template.is_active = True
    template.save()
    return template


def set_default_template(*, template: NotificationTemplate) -> NotificationTemplate:
    """Mark template as the default for its event_code+channel; clear others."""
    if not template.event_code:
        raise ValueError('Template must have an event_code before it can be set as default')
    NotificationTemplate.objects.filter(
        event_code=template.event_code,
        channel=template.channel,
        is_default=True,
    ).exclude(pk=template.pk).update(is_default=False)
    template.is_default = True
    template.status = NotificationTemplate.Status.ACTIVE
    template.is_active = True
    template.save()
    return template
