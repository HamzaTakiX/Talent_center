import type { ReactNode } from 'react';
import { AuthInitLoader } from '../../../features/auth/components/AuthInitLoader';

type AuthLoadingGateProps = {
  children?: ReactNode;
  message?: string;
};

/** Blocks protected UI until auth/role validation completes (no layout flash). */
export const AuthLoadingGate = ({ children, message }: AuthLoadingGateProps) => {
  if (children) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Vérification de la session"
      >
        {children}
      </div>
    );
  }

  return <AuthInitLoader message={message} />;
};
