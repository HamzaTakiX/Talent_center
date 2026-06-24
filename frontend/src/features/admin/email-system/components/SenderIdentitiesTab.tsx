import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Pencil, Star, Trash2, UserPlus, Users } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import { AdminFormField, AdminFormInput } from '../../shared/forms/AdminFormPrimitives';
import { adminFormGridClass } from '../../shared/forms/adminFormClasses';
import { AdminTableEmptyState } from '../../ui';
import {
  adminTableBtn,
  adminTableBtnDanger,
  adminTableBtnIcon,
  adminTableBtnSuccess,
} from '../../ui/adminTableButtons';
import type { SenderIdentity } from '../types/emailSystemTypes';
import {
  AdminButton,
  EmailSystemSectionShell,
  EmailSystemStatusBadge,
  EmailSystemTablePanel,
  emailSystemTableTdClass,
  emailSystemTableThClass,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.senders';

const MODULE_KEYS = ['general', 'offers', 'applications', 'documents', 'announcements', 'chat', 'srf', 'system'];

interface Props {
  items: SenderIdentity[];
  saving: boolean;
  onCreate: (payload: Partial<SenderIdentity>) => Promise<unknown>;
  onUpdate: (id: number, payload: Partial<SenderIdentity>) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  onSetDefault: (id: number) => Promise<unknown>;
  onVerify: (id: number) => Promise<unknown>;
}

const SenderIdentitiesTab: FunctionComponent<Props> = ({
  items,
  saving,
  onCreate,
  onUpdate,
  onDelete,
  onSetDefault,
  onVerify,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ display_name: '', email_address: '', module: 'general' });
  const [editing, setEditing] = useState<SenderIdentity | null>(null);

  const moduleOptions = useMemo(
    () =>
      MODULE_KEYS.map((m) => ({
        value: m,
        label: t(`${PREFIX}.modules.${m}`, { defaultValue: m }),
      })),
    [t],
  );

  const submit = async () => {
    if (editing) {
      await onUpdate(editing.id, form);
      setEditing(null);
    } else {
      await onCreate(form);
    }
    setForm({ display_name: '', email_address: '', module: 'general' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ display_name: '', email_address: '', module: 'general' });
  };

  return (
    <div className="email-system-tab-stack">
      <EmailSystemSectionShell
        icon={UserPlus}
        busy={saving}
        title={editing ? t(`${PREFIX}.edit`) : t(`${PREFIX}.add`)}
        subtitle={t(`${PREFIX}.formHint`, {
          defaultValue: 'Assign sender addresses to platform modules.',
        })}
        action={
          editing ? (
            <AdminButton variant="ghost" size="sm" onClick={cancelEdit}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </AdminButton>
          ) : null
        }
      >
        <div className={adminFormGridClass}>
          <AdminFormField label={t(`${PREFIX}.displayName`)} htmlFor="sender-display-name" fieldKey="title">
            <AdminFormInput
              id="sender-display-name"
              fieldKey="title"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.email`)} htmlFor="sender-email" fieldKey="email">
            <AdminFormInput
              id="sender-email"
              fieldKey="email"
              type="email"
              value={form.email_address}
              onChange={(e) => setForm({ ...form, email_address: e.target.value })}
            />
          </AdminFormField>
          <AdminSelect
            id="sender-module"
            label={t(`${PREFIX}.module`)}
            value={form.module}
            options={moduleOptions}
            onChange={(v) => setForm({ ...form, module: v })}
            searchable
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <AdminButton variant="primary" size="md" disabled={saving} onClick={() => void submit()}>
            {editing ? t(`${PREFIX}.update`) : t(`${PREFIX}.addBtn`)}
          </AdminButton>
        </div>
      </EmailSystemSectionShell>

      <EmailSystemTablePanel
        title={t(`${PREFIX}.tableTitle`, { defaultValue: 'Sender identities' })}
        subtitle={t(`${PREFIX}.tableSubtitle`, { defaultValue: 'Verified senders used per module when delivering email.' })}
        minWidth="920px"
      >
        <table className="admin-table admin-table--safe w-full">
          <thead>
            <tr>
              <th className={emailSystemTableThClass}>{t(`${PREFIX}.displayName`)}</th>
              <th className={emailSystemTableThClass}>{t(`${PREFIX}.email`)}</th>
              <th className={emailSystemTableThClass}>{t(`${PREFIX}.module`)}</th>
              <th className={emailSystemTableThClass}>{t(`${PREFIX}.status`)}</th>
              <th className={`${emailSystemTableThClass} text-center`}>{t(`${PREFIX}.actions`)}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <AdminTableEmptyState colSpan={5} title={t(`${PREFIX}.empty`)} />
            ) : (
              items.map((row) => (
                <tr key={row.id} className="transition-colors">
                  <td className={emailSystemTableTdClass}>
                    <span className="inline-flex items-center gap-2 font-medium">
                      {row.display_name}
                      {row.is_default ? (
                        <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" aria-hidden />
                      ) : null}
                    </span>
                  </td>
                  <td className={emailSystemTableTdClass}>{row.email_address}</td>
                  <td className={emailSystemTableTdClass}>
                    {t(`${PREFIX}.modules.${row.module}`, { defaultValue: row.module })}
                  </td>
                  <td className={emailSystemTableTdClass}>
                    <EmailSystemStatusBadge tone={row.is_verified ? 'success' : 'warning'}>
                      {row.is_verified ? t(`${PREFIX}.verified`) : t(`${PREFIX}.pending`)}
                    </EmailSystemStatusBadge>
                  </td>
                  <td className={emailSystemTableTdClass}>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        className={`${adminTableBtn} ${adminTableBtnIcon}`}
                        title={t(`${PREFIX}.edit`)}
                        aria-label={t(`${PREFIX}.edit`)}
                        onClick={() => {
                          setEditing(row);
                          setForm({
                            display_name: row.display_name,
                            email_address: row.email_address,
                            module: row.module,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!row.is_default ? (
                        <button
                          type="button"
                          className={`${adminTableBtn} ${adminTableBtnIcon}`}
                          title={t(`${PREFIX}.setDefault`)}
                          aria-label={t(`${PREFIX}.setDefault`)}
                          onClick={() => void onSetDefault(row.id)}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      ) : null}
                      {!row.is_verified ? (
                        <button
                          type="button"
                          className={`${adminTableBtn} ${adminTableBtnSuccess}`}
                          title={t(`${PREFIX}.verify`)}
                          onClick={() => void onVerify(row.id)}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>{t(`${PREFIX}.verify`)}</span>
                        </button>
                      ) : null}
                      {!row.is_default ? (
                        <button
                          type="button"
                          className={`${adminTableBtn} ${adminTableBtnDanger}`}
                          title={t(`${PREFIX}.delete`)}
                          onClick={() => void onDelete(row.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t(`${PREFIX}.delete`)}</span>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </EmailSystemTablePanel>
    </div>
  );
};

export default SenderIdentitiesTab;
