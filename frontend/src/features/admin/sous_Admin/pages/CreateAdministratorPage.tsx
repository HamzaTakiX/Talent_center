import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminLayout from '../../components/AdminLayout';
import CreateAdministratorForm from '../components/CreateAdministratorForm';
import type { CreateAdminPermissionKey } from '../constants/createAdministrator';

const CreateAdministratorPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('administrators');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const togglePermission = (key: CreateAdminPermissionKey) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const goBack = () => navigate('/admin/admins');

  return (
    <AdminLayout>
      <div className="flex w-full min-w-0 flex-col gap-5 pb-2 font-inter">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 w-fit shrink-0 items-center justify-center gap-2 admin-btn-surface rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 text-center text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span className="leading-5">{backLabel}</span>
        </button>

        <CreateAdministratorForm
          fullName={fullName}
          email={email}
          role={role}
          phone={phone}
          notes={notes}
          permissions={permissions}
          onFullNameChange={setFullName}
          onEmailChange={setEmail}
          onRoleChange={setRole}
          onPhoneChange={setPhone}
          onNotesChange={setNotes}
          onTogglePermission={togglePermission}
          onCancel={goBack}
          onSubmit={goBack}
        />
      </div>
    </AdminLayout>
  );
};

export default CreateAdministratorPage;
