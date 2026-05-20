import { FunctionComponent, ReactNode } from 'react';
import { Star } from 'lucide-react';

interface AuthInfoBannerProps {
  children: ReactNode;
}

/** Themed info callout — respects auth light/dark tokens via `.auth-screen[data-auth-theme]`. */
const AuthInfoBanner: FunctionComponent<AuthInfoBannerProps> = ({ children }) => (
  <div
    role="note"
    className="auth-alert-info flex w-full items-start gap-3 rounded-[10px] px-4 py-3 text-sm font-inter"
  >
    <Star className="auth-alert-info__icon mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
    <p className="min-w-0 flex-1 text-sm leading-5">{children}</p>
  </div>
);

export default AuthInfoBanner;
