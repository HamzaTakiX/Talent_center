from apps.history.context import clear_current_request, set_current_request


class HistoryRequestMiddleware:
    """Attach HTTP request to thread-local storage for audit events."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_current_request(request)
        try:
            return self.get_response(request)
        finally:
            clear_current_request()
