import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';
import { SRF_SURFACE_CARD } from '../constants/srfLayout';
import {
  SRF_HEADER_STATUS_ACTION,
  SRF_HEADER_STATUS_BADGE,
  SRF_HEADER_STATUS_CLEARED,
} from '../constants/srfBadgeStyles';
import { STUDENT_ICON_CHIP_BRAND } from '../../design-system/studentSemanticStyles';

interface SrfHeaderProps {
  cleared: boolean;
  loading?: boolean;
}

const SrfHeader: FunctionComponent<SrfHeaderProps> = ({ cleared, loading = false }) => {
  const { t } = useTranslation();

  return (
    <section className={`${SRF_SURFACE_CARD} min-w-0`}>
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`inline-flex h-11 w-11 shrink-0 rounded-[12px] ${STUDENT_ICON_CHIP_BRAND}`}>
            <Wallet className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="m-0 font-inter text-xl font-bold leading-7 tracking-tight text-[var(--admin-text)] sm:text-2xl">
              {t('student.srf.header.title')}
            </h1>
            <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              {t('student.srf.header.subtitle')}
            </p>
          </div>
        </div>

        {!loading ? (
          <span
            className={`${SRF_HEADER_STATUS_BADGE} ${
              cleared ? SRF_HEADER_STATUS_CLEARED : SRF_HEADER_STATUS_ACTION
            } shrink-0 self-start sm:self-center`}
          >
            {cleared ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            )}
            {cleared ? t('student.srf.header.cleared') : t('student.srf.header.blocked')}
          </span>
        ) : null}
      </div>
    </section>
  );
};

export default SrfHeader;
