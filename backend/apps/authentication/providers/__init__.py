"""
Auth provider plug-in layer.

Importing this package causes every provider module to load and self-register
via the @register decorator in registry.py. To add a new provider:

    1. Create apps/authentication/providers/<name>.py.
    2. Subclass AuthProvider, set `name = ProviderName.<NAME>`, decorate with
       @register, and implement authenticate() (plus begin_login/handle_callback
       for OAuth/OIDC flows).
    3. Add a block under settings.AUTH_PROVIDERS[<NAME>].
    4. Import the module here so it registers at app-ready time.
"""

from . import base, registry  # noqa: F401
from . import local, auth0, microsoft, sso  # noqa: F401
