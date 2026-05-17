import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminLayout from '../../components/AdminLayout';
import CreateEncadrantForm from '../components/CreateEncadrantForm';

const AddEncadrantPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('encadrants');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [maxStudents, setMaxStudents] = useState('15');
  const [bio, setBio] = useState('');

  const goBack = () => navigate('/admin/encadrants');

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

        <CreateEncadrantForm
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          department={department}
          roleTitle={roleTitle}
          specialization={specialization}
          maxStudents={maxStudents}
          bio={bio}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
          onDepartmentChange={setDepartment}
          onRoleTitleChange={setRoleTitle}
          onSpecializationChange={setSpecialization}
          onMaxStudentsChange={setMaxStudents}
          onBioChange={setBio}
          onCancel={goBack}
          onSubmit={goBack}
        />
      </div>
    </AdminLayout>
  );
};

export default AddEncadrantPage;
