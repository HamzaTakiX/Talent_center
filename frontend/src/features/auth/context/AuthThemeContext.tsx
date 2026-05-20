/**
 * Re-exports admin theme for auth screens — same storage key so login ↔ dashboard stay in sync.
 */
export {
  AdminThemeProvider as AuthThemeProvider,
  useAdminTheme as useAuthTheme,
} from '../../admin/dashboard/context/AdminThemeContext';
