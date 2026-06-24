"""Build event matrix and category lookups from the registry."""

from __future__ import annotations

from apps.notifications.events.registry import EVENT_REGISTRY, RESOLVER_NAMES


def event_codes_for_category(category: str) -> list[str]:
    return [code for code, config in EVENT_REGISTRY.items() if config.category == category]


def build_event_matrix() -> list[dict]:
    rows = []
    for event_code, config in sorted(EVENT_REGISTRY.items()):
        rows.append({
            'event_code': event_code,
            'category': config.category,
            'priority': config.priority,
            'channels': list(config.channels),
            'resolver': config.resolver,
            'resolver_label': RESOLVER_NAMES.get(config.resolver, config.resolver),
            'digestible': config.digestible,
            'urgent': config.urgent,
            'template_code': config.template_code,
        })
    return rows
