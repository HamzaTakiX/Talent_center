import { RouterProvider, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { router } from './router';
import { Auth0ProviderWithNavigate } from '../features/auth/components/Auth0ProviderWithNavigate';

// This wrapper handles the redirection logically after Auth0 provides the state
// We create a tiny component to use the router hook inside the router context if we needed to
// But since Auth0Provider wraps the router, we actually need to pass the redirect callback.
// A simpler approach is to use window.location.replace, but it's better to leverage the router history.
// However, RouterProvider is down the tree. Let's redirect using window.location if needed, or
// even better, let our generic CallbackPage handle it.
// We'll pass a simple callback that uses window.history to avoid a full page reload if possible.
const onRedirectCallback = (appState: any) => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

export const App = () => {
  return (
    <Auth0ProviderWithNavigate onRedirectCallback={onRedirectCallback}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Auth0ProviderWithNavigate>
  );
};
