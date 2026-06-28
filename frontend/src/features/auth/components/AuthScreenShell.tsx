import { FunctionComponent, ReactNode } from 'react';
import { useAuthTheme } from '../context/AuthThemeContext';
import '../styles/auth-theme.css';

interface AuthScreenShellProps {
  children: ReactNode;
  /** `text-start` for login (RTL), `text-left` for LTR forms */
  textAlign?: 'start' | 'left';
}

/** Root layout for login / onboarding — applies shared light & dark tokens. */
export const AuthScreenShell: FunctionComponent<AuthScreenShellProps> = ({
  children,
  textAlign = 'start',
}) => {
  const { theme } = useAuthTheme();

  return (
    <div
      data-auth-theme={theme}
      className={`auth-screen relative w-full min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row auth-bg auth-text font-inter text-sm ${textAlign === 'left' ? 'text-left' : 'text-start'}`}
    >
      {children}
    </div>
  );
};

interface AuthFormColumnProps {
  children: ReactNode;
  maxWidth?: '500px' | '576px';
}

/** Scrollable form column with preferences bar (lang + theme). */
export const AuthFormColumn: FunctionComponent<AuthFormColumnProps> = ({
  children,
  maxWidth = '500px',
}) => (
  <div className="auth-form-scroll relative w-full flex-1 lg:w-1/2 lg:h-full overflow-y-auto flex flex-col items-center px-5 sm:px-8 pb-12 pt-6 sm:pt-8 lg:pt-4 lg:p-4 box-border">
    <div
      className={`w-full flex flex-col relative m-auto py-6 lg:py-2 ${maxWidth === '576px' ? 'max-w-[576px]' : 'max-w-[500px]'}`}
    >
      {children}
    </div>
  </div>
);

export default AuthScreenShell;
