"""Provider registry — lookup + enablement gate."""

from typing import Type

from ..exceptions import ProviderNotEnabled, ProviderNotFound
from .base import AuthProvider, ProviderName

_REGISTRY: dict[ProviderName, Type[AuthProvider]] = {}


def register(cls: Type[AuthProvider]) -> Type[AuthProvider]:
    """Class decorator — adds a provider class to the registry."""
    if not hasattr(cls, 'name'):
        raise TypeError(f'{cls.__name__} must define a class-level `name`.')
    _REGISTRY[cls.name] = cls
    return cls


def _coerce(name: str | ProviderName) -> ProviderName:
    if isinstance(name, ProviderName):
        return name
    try:
        return ProviderName(name.upper())
    except ValueError as exc:
        raise ProviderNotFound(f'Unknown provider: {name}') from exc


def get_provider(name: str | ProviderName) -> AuthProvider:
    """Resolve a registered + enabled provider by name."""
    provider_name = _coerce(name)
    cls = _REGISTRY.get(provider_name)
    if cls is None:
        raise ProviderNotFound(f'Provider {provider_name.value} is not registered.')
    if not cls.is_enabled():
        raise ProviderNotEnabled(f'Provider {provider_name.value} is disabled.')
    return cls()


def list_enabled() -> list[str]:
    return [name.value for name, cls in _REGISTRY.items() if cls.is_enabled()]


def list_all() -> list[str]:
    return [name.value for name in _REGISTRY.keys()]
