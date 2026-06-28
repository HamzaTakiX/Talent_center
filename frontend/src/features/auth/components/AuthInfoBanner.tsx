import { FunctionComponent, ReactNode } from 'react';
import { Star } from 'lucide-react';

interface AuthInfoBannerProps {
  children: ReactNode;
}

/** Themed info callout — respects auth light/dark tokens via `.auth-screen[data-auth-theme]`. */
const AuthInfoBanner: FunctionComponent<AuthInfoBannerProps> = ({ children }) => (
  <div
    role="note"
    className="auth-alert-info w-full rounded-[10px] px-4 py-3 text-sm font-inter"
  >
    <p className="m-0 text-sm leading-5">
      <Star
        className="auth-alert-info__icon me-2 inline-block h-4 w-4 shrink-0 align-middle"
        strokeWidth={2}
        aria-hidden
      />
      {children}
    </p>
  </div>
);

export default AuthInfoBanner;
