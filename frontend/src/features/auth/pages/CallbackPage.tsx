import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export const CallbackPage = () => {
  const { error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error('Auth0 callback error:', error);
      // In a real app we might redirect to a dedicated error page,
      // but going back to login with a clean state is a good fallback.
      navigate('/login');
    }
  }, [error, navigate]);

  return (
    <div className="flex bg-gray-50 items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Authenticating...</h2>
        <p className="text-gray-500 mt-2">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
};

export default CallbackPage;
