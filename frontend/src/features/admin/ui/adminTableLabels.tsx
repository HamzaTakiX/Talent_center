import { FunctionComponent } from 'react';
import { useAdminTableValues } from '../i18n/useAdminTableValues';

export const OfferStatusLabel: FunctionComponent<{ status: string }> = ({ status }) => {
  const { offerStatus } = useAdminTableValues();
  return <>{offerStatus(status)}</>;
};

export const AnnouncementTypeLabel: FunctionComponent<{ type: string }> = ({ type }) => {
  const { announcementType } = useAdminTableValues();
  return <>{announcementType(type)}</>;
};

export const AccountStatusLabel: FunctionComponent<{ status: string }> = ({ status }) => {
  const { accountStatus } = useAdminTableValues();
  return <>{accountStatus(status)}</>;
};

export const DocumentStatusLabel: FunctionComponent<{ status: string }> = ({ status }) => {
  const { documentStatus } = useAdminTableValues();
  return <>{documentStatus(status)}</>;
};

export const ReportStatusLabel: FunctionComponent<{ status: string }> = ({ status }) => {
  const { reportStatus } = useAdminTableValues();
  return <>{reportStatus(status)}</>;
};

export const InternshipStatusLabel: FunctionComponent<{ status: string }> = ({ status }) => {
  const { internshipStatus } = useAdminTableValues();
  return <>{internshipStatus(status)}</>;
};

export const SrfPaymentStatusLabel: FunctionComponent<{ status: string }> = ({ status }) => {
  const { srfPaymentStatus } = useAdminTableValues();
  return <>{srfPaymentStatus(status)}</>;
};
