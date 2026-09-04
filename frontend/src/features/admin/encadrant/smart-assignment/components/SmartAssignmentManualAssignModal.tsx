import { FunctionComponent, useMemo, useState } from 'react';
import { Loader2, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentEncadrantCard, SmartAssignmentStudentRow } from '../../../api/types';
import AdminModal from '../../../ui/AdminModal';
import AdminSearchInput from '../../../ui/AdminSearchInput';
import AdminSelectField from '../../../ui/AdminSelectField';
import { getAdminUserInitials } from '../../../dashboard/utils/adminUserDisplay';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';
import { specializationDomainLabel } from '../../utils/specializationDomainDisplay';
import {
  buildManualAssignGroups,
  encadrantHasCapacity,
  type ManualAssignFilter,
  type ManualAssignStudentEntry,
} from '../utils/manualAssignUtils';
import '../styles/admin-smart-assignment-manual-assign.css';

interface SmartAssignmentManualAssignModalProps {
  open: boolean;
  encadrant: SmartAssignmentEncadrantCard | null;
  students: SmartAssignmentStudentRow[];
  assignmentMap: Map<number, { encadrantId: number; encadrantName: string }>;
  assigningId: number | null;
  onClose: () => void;
  onAssign: (student: SmartAssignmentStudentRow) => void;
  onUnassign: (student: SmartAssignmentStudentRow) => void;
}

const SmartAssignmentManualAssignModal: FunctionComponent<SmartAssignmentManualAssignModalProps> = ({
  open,
  encadrant,
  students,
  assignmentMap,
  assigningId,
  onClose,
  onAssign,
  onUnassign,
}) => {
  const { t } = useTranslation();
  const prefix = 'admin.smartAssignment.manualAssign';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ManualAssignFilter>('compatible');

  const filterOptions = useMemo(
    () => [
      { value: 'compatible', label: t(`${prefix}.filterCompatible`) },
      { value: 'assigned', label: t(`${prefix}.filterAssignedHere`) },
      { value: 'unassigned', label: t(`${prefix}.filterUnassigned`) },
      { value: 'all', label: t(`${prefix}.filterAll`) },
    ],
    [t],
  );

  const groups = useMemo(() => {
    if (!encadrant) return [];
    return buildManualAssignGroups(students, encadrant, assignmentMap, query, filter);
  }, [assignmentMap, encadrant, filter, query, students]);

  const totalVisible = useMemo(
    () => groups.reduce((sum, group) => sum + group.studentCount, 0),
    [groups],
  );

  const hasCapacity = encadrant ? encadrantHasCapacity(encadrant) : false;

  const loadPct = encadrant?.max_capacity
    ? Math.min(100, (encadrant.current_load / encadrant.max_capacity) * 100)
    : 0;

  const renderStudentRow = (entry: ManualAssignStudentEntry) => {
    const { student, isCurrentEncadrant, compatible, assignedEncadrantName } = entry;
    const busy = assigningId === student.student_profile_id;
    const initials = getAdminUserInitials(student.full_name, student.email);

    return (
      <li
        key={student.student_profile_id}
        className={`sa-manual-assign__student${isCurrentEncadrant ? ' sa-manual-assign__student--assigned' : ''}`}
      >
        <div className="sa-manual-assign__student-main">
          <InternshipStudentAvatar
            url={null}
            name={student.full_name}
            email={student.email}
            initials={initials}
            size="list"
          />
          <div className="sa-manual-assign__student-copy">
            <div className="sa-manual-assign__student-head">
              <p className="sa-manual-assign__student-name">{student.full_name}</p>
              {isCurrentEncadrant ? (
                <span className="sa-manual-assign__student-status">{t(`${prefix}.assignedHere`)}</span>
              ) : null}
            </div>
            <div className="sa-manual-assign__student-tags">
              {student.internship_type ? (
                <span className="sa-manual-assign__student-tag">{student.internship_type}</span>
              ) : null}
              {student.sector ? (
                <span className="sa-manual-assign__student-tag sa-manual-assign__student-tag--sector">
                  {student.sector}
                </span>
              ) : null}
            </div>
            {student.class_name ? (
              <p className="sa-manual-assign__student-meta">{student.class_name}</p>
            ) : null}
            {!isCurrentEncadrant && assignedEncadrantName ? (
              <p className="sa-manual-assign__student-assigned">
                {t(`${prefix}.assignedTo`, { name: assignedEncadrantName })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="sa-manual-assign__student-actions">
          {!compatible && !isCurrentEncadrant ? (
            <span className="sa-manual-assign__badge sa-manual-assign__badge--warn">
              {t(`${prefix}.notCompatible`)}
            </span>
          ) : null}
          {isCurrentEncadrant ? (
            <button
              type="button"
              className={`sa-manual-assign__btn sa-manual-assign__btn--ghost${busy ? ' sa-manual-assign__btn--loading' : ''}`}
              disabled={busy || student.is_locked}
              aria-busy={busy}
              onClick={() => onUnassign(student)}
            >
              {busy ? (
                <Loader2 className="sa-manual-assign__btn-spinner" aria-hidden />
              ) : (
                <UserMinus className="h-3.5 w-3.5" aria-hidden />
              )}
              {busy ? t(`${prefix}.removing`) : t(`${prefix}.unassign`)}
            </button>
          ) : (
            <button
              type="button"
              className={`sa-manual-assign__btn sa-manual-assign__btn--primary${busy ? ' sa-manual-assign__btn--loading' : ''}`}
              disabled={busy || !compatible || !hasCapacity || student.is_locked}
              aria-busy={busy}
              onClick={() => onAssign(student)}
            >
              {busy ? (
                <Loader2 className="sa-manual-assign__btn-spinner" aria-hidden />
              ) : (
                <UserPlus className="h-3.5 w-3.5" aria-hidden />
              )}
              {busy ? t(`${prefix}.assigning`) : t(`${prefix}.assign`)}
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={encadrant ? t(`${prefix}.title`, { name: encadrant.full_name }) : t(`${prefix}.titleFallback`)}
      description={t(`${prefix}.description`)}
      maxWidthClass="max-w-4xl"
      headerIcon={UserCheck}
      bodyClassName="sa-manual-assign__body"
    >
      {encadrant ? (
        <>
          <div className="sa-manual-assign__encadrant">
            <InternshipStudentAvatar
              url={resolveMediaUrl(encadrant.avatar_url)}
              name={encadrant.full_name}
              email={encadrant.email}
              initials={getAdminUserInitials(encadrant.full_name, encadrant.email)}
              size="list"
            />
            <div className="sa-manual-assign__encadrant-copy">
              <div className="sa-manual-assign__encadrant-top">
                <div>
                  <p className="sa-manual-assign__encadrant-name">{encadrant.full_name}</p>
                  <p className="sa-manual-assign__encadrant-load">
                    {t('admin.smartAssignment.workload', {
                      current: encadrant.current_load,
                      max: encadrant.max_capacity || '∞',
                    })}
                  </p>
                </div>
                <span
                  className={`sa-manual-assign__capacity-pill${hasCapacity ? '' : ' sa-manual-assign__capacity-pill--full'}`}
                >
                  {hasCapacity ? t(`${prefix}.capacityOpen`) : t(`${prefix}.capacityFullShort`)}
                </span>
              </div>
              <div className="sa-manual-assign__capacity-track" aria-hidden>
                <span
                  className="sa-manual-assign__capacity-fill"
                  style={{ width: `${loadPct}%` }}
                />
              </div>
              <div className="sa-manual-assign__chips">
                {(encadrant.scope?.filiere_labels ?? []).map((label) => (
                  <span key={`f-${label}`} className="sa-manual-assign__chip">
                    {label}
                  </span>
                ))}
                {(encadrant.scope?.level_labels ?? []).map((label) => (
                  <span key={`l-${label}`} className="sa-manual-assign__chip sa-manual-assign__chip--level">
                    {label}
                  </span>
                ))}
                {encadrant.specialization_domains.map((domain) => {
                  const key = typeof domain === 'string' ? domain : domain.code;
                  return (
                    <span key={key} className="sa-manual-assign__chip sa-manual-assign__chip--domain">
                      {specializationDomainLabel(domain, t)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {!hasCapacity ? (
            <div className="sa-manual-assign__capacity-warn" role="status">
              <span className="sa-manual-assign__capacity-warn-dot" aria-hidden />
              {t(`${prefix}.capacityFull`)}
            </div>
          ) : null}

          <div className="sa-manual-assign__toolbar-shell">
            <div className="sa-manual-assign__toolbar">
            <AdminSearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder={t(`${prefix}.searchStudents`)}
              containerClassName="min-w-0 flex-1"
            />
            <AdminSelectField
              value={filter}
              options={filterOptions}
              onChange={(value) => setFilter(value as ManualAssignFilter)}
              aria-label={t(`${prefix}.filterAria`)}
              wrapperClassName="w-full sm:w-[220px]"
            />
            </div>
            <p className="sa-manual-assign__count">
              {t(`${prefix}.studentsShown`, { count: totalVisible })}
            </p>
          </div>

          <div className="sa-manual-assign__groups">
            {groups.length === 0 ? (
              <p className="sa-manual-assign__empty">{t(`${prefix}.empty`)}</p>
            ) : (
              groups.map((group) => (
                <section key={group.filiere} className="sa-manual-assign__group">
                  <header className="sa-manual-assign__group-head">
                    <h3 className="sa-manual-assign__group-title">{group.filiere}</h3>
                    <span className="sa-manual-assign__group-count">{group.studentCount}</span>
                  </header>
                  {group.levels.map((levelGroup) => (
                    <div key={`${group.filiere}-${levelGroup.level}`} className="sa-manual-assign__level">
                      <h4 className="sa-manual-assign__level-title">{levelGroup.level}</h4>
                      <ul className="sa-manual-assign__list" role="list">
                        {levelGroup.students.map(renderStudentRow)}
                      </ul>
                    </div>
                  ))}
                </section>
              ))
            )}
          </div>
        </>
      ) : null}
    </AdminModal>
  );
};

export default SmartAssignmentManualAssignModal;
