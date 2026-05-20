import { FunctionComponent, useState } from 'react';

import { Link, useNavigate, useParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';

import { ArrowLeft, CheckCircle, GraduationCap, UserRound } from 'lucide-react';

import AdminModulePageShell from '../../../ui/AdminModulePageShell';

import AdminModulePageSkeleton from '../../../ui/AdminModulePageSkeleton';

import { useSupervisionMeetingDetail } from '../hooks/useSupervisionMeetingDetail';

import { adminSupervisionMeetingsApi } from '../../../api/supervisionMeetings';

import MeetingStatusBadge from '../components/MeetingStatusBadge';

import { personInitials } from '../utils/meetingStatusMeta';

import { fadeInUp } from '../../../dashboard/ui/animations';

import '../styles/admin-meetings.css';



const SupervisionMeetingDetailPage: FunctionComponent = () => {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const { meeting, loading, error, reload } = useSupervisionMeetingDetail(id);

  const [actionLoading, setActionLoading] = useState(false);

  const locale = i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'en' ? 'en-GB' : 'fr-FR';



  const completeMeeting = async () => {

    if (!id) return;

    setActionLoading(true);

    try {

      await adminSupervisionMeetingsApi.updateStatus(id, 'COMPLETED');

      await reload();

    } finally {

      setActionLoading(false);

    }

  };



  if (loading) {

    return (

      <AdminModulePageShell width="wide">

        <AdminModulePageSkeleton tableRows={8} />

      </AdminModulePageShell>

    );

  }



  if (error || !meeting) {

    return (

      <AdminModulePageShell width="wide">

        <p className="text-red-600">

          {error ?? t('admin.modules.meetings.detail.notFound', { defaultValue: 'Meeting not found' })}

        </p>

        <Link to="/admin/encadrant/meetings" className="admin-link mt-2 inline-block">

          {t('admin.modules.meetings.back', { defaultValue: 'Back to meetings' })}

        </Link>

      </AdminModulePageShell>

    );

  }



  return (

    <AdminModulePageShell width="wide">

      <div className="admin-subpage-stack">

        <button

          type="button"

          onClick={() => navigate(-1)}

          className="mb-2 inline-flex items-center gap-1 text-sm text-[var(--admin-brand)]"

        >

          <ArrowLeft className="h-4 w-4" />

          {t('admin.common.actions.back', { defaultValue: 'Back' })}

        </button>



        <motion.header {...fadeInUp} className="admin-meetings-detail-hero">

          <div>

            <h1 className="text-xl font-bold text-[var(--admin-text)]">{meeting.title}</h1>

            <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">

              {t(`admin.modules.meetings.type.${meeting.meetingType}`, {

                defaultValue: meeting.meetingType,

              })}

              {meeting.internshipType ? ` · ${meeting.internshipType}` : ''}

            </p>

            <motion.div className="mt-3 flex flex-wrap gap-2">

              <MeetingStatusBadge status={meeting.status} size="md" />

            </motion.div>

          </div>

          {meeting.status !== 'COMPLETED' ? (

            <button

              type="button"

              disabled={actionLoading}

              onClick={() => void completeMeeting()}

              className="admin-btn-primary inline-flex items-center gap-1 text-sm"

            >

              <CheckCircle className="h-4 w-4" />

              {t('admin.modules.meetings.actions.complete', { defaultValue: 'Mark completed' })}

            </button>

          ) : null}

        </motion.header>



        <div className="admin-meetings-detail-profiles">

          <section className="admin-meetings-profile-card">

            <div className="admin-meetings-profile-card__head">

              <span className="admin-meetings-profile-card__avatar">

                {personInitials(meeting.student || '?')}

              </span>

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">

                  {t('admin.modules.meetings.detail.student', { defaultValue: 'Student' })}

                </p>

                <p className="font-semibold text-[var(--admin-text)]">{meeting.student || '—'}</p>

              </div>

              <GraduationCap className="ms-auto h-5 w-5 text-[var(--admin-brand)]" aria-hidden />

            </div>

            <dl className="grid gap-2 text-sm sm:grid-cols-2">

              <motion.div>

                <dt className="text-[var(--admin-text-muted)]">

                  {t('admin.modules.meetings.detail.filiere', { defaultValue: 'Program' })}

                </dt>

                <dd>{meeting.filiere || '—'}</dd>

              </motion.div>

              <motion.div>

                <dt className="text-[var(--admin-text-muted)]">

                  {t('admin.modules.meetings.detail.level', { defaultValue: 'Level' })}

                </dt>

                <dd>{meeting.academicLevel || '—'}</dd>

              </motion.div>

              <motion.div>

                <dt className="text-[var(--admin-text-muted)]">

                  {t('admin.modules.meetings.detail.group', { defaultValue: 'Group' })}

                </dt>

                <dd>{meeting.classGroup || '—'}</dd>

              </motion.div>

              <motion.div>

                <dt className="text-[var(--admin-text-muted)]">

                  {t('admin.modules.meetings.detail.year', { defaultValue: 'Year' })}

                </dt>

                <dd>{meeting.academicYear || '—'}</dd>

              </motion.div>

              <motion.div className="sm:col-span-2">

                <dt className="text-[var(--admin-text-muted)]">

                  {t('admin.modules.meetings.detail.internshipType', { defaultValue: 'Internship type' })}

                </dt>

                <dd>{meeting.internshipType || '—'}</dd>

              </motion.div>

            </dl>

          </section>



          <section className="admin-meetings-profile-card">

            <div className="admin-meetings-profile-card__head">

              <span className="admin-meetings-profile-card__avatar">

                {personInitials(meeting.encadrant)}

              </span>

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">

                  {t('admin.modules.meetings.detail.encadrant', { defaultValue: 'Supervisor' })}

                </p>

                <p className="font-semibold text-[var(--admin-text)]">{meeting.encadrant}</p>

              </div>

              <UserRound className="ms-auto h-5 w-5 text-[var(--admin-brand)]" aria-hidden />

            </div>

            <p className="text-sm text-[var(--admin-text-secondary)]">

              {t('admin.modules.meetings.detail.encadrantHint', {

                defaultValue: 'Primary supervisor for this academic follow-up session.',

              })}

            </p>

          </section>

        </div>



        <div className="admin-meetings-detail-grid">

          <aside className="space-y-4">

            <section className="admin-card p-4">

              <h3 className="admin-meetings-panel-title mb-3">

                {t('admin.modules.meetings.detail.agenda', { defaultValue: 'Agenda' })}

              </h3>

              <dl className="grid gap-2 text-sm">

                <div>

                  <dt className="text-[var(--admin-text-muted)]">

                    {t('admin.modules.meetings.detail.plannedStart', { defaultValue: 'Planned start' })}

                  </dt>

                  <dd>

                    {meeting.plannedStart

                      ? new Date(meeting.plannedStart).toLocaleString(locale)

                      : '—'}

                  </dd>

                </div>

                <div>

                  <dt className="text-[var(--admin-text-muted)]">

                    {t('admin.modules.meetings.detail.plannedEnd', { defaultValue: 'Planned end' })}

                  </dt>

                  <dd>

                    {meeting.plannedEnd

                      ? new Date(meeting.plannedEnd).toLocaleString(locale)

                      : '—'}

                  </dd>

                </div>

                <div>

                  <dt className="text-[var(--admin-text-muted)]">

                    {t('admin.modules.meetings.detail.location', { defaultValue: 'Location' })}

                  </dt>

                  <dd>{meeting.location || meeting.meetingUrl || '—'}</dd>

                </div>

                <div>

                  <dt className="text-[var(--admin-text-muted)]">

                    {t('admin.modules.meetings.detail.mode', { defaultValue: 'Mode' })}

                  </dt>

                  <dd>{meeting.meetingMode}</dd>

                </div>

              </dl>

              {meeting.description ? (

                <p className="mt-3 text-sm text-[var(--admin-text-secondary)]">{meeting.description}</p>

              ) : null}

            </section>

          </aside>



          <div className="space-y-4">

            {meeting.notes ? (

              <section className="admin-card p-4">

                <h3 className="admin-meetings-panel-title mb-2">

                  {t('admin.modules.meetings.detail.notes', { defaultValue: 'Notes' })}

                </h3>

                <p className="text-sm whitespace-pre-wrap">{meeting.notes}</p>

              </section>

            ) : null}



            {meeting.followUpActions ? (

              <section className="admin-card p-4">

                <h3 className="admin-meetings-panel-title mb-2">

                  {t('admin.modules.meetings.detail.followUp', { defaultValue: 'Follow-up actions' })}

                </h3>

                <p className="text-sm whitespace-pre-wrap">{meeting.followUpActions}</p>

              </section>

            ) : null}



            <section className="admin-card p-4">

              <h3 className="admin-meetings-panel-title mb-3">

                {t('admin.modules.meetings.detail.timeline', { defaultValue: 'Timeline' })}

              </h3>

              <div className="admin-meetings-timeline">

                {meeting.timeline.length === 0 ? (

                  <p className="text-sm text-[var(--admin-text-muted)]">

                    {t('admin.modules.meetings.detail.timelineEmpty', {

                      defaultValue: 'No history entries yet.',

                    })}

                  </p>

                ) : (

                  meeting.timeline.map((ev) => (

                    <div key={ev.id} className="admin-meetings-timeline-item">

                      <p className="text-sm font-medium">{ev.action}</p>

                      <p className="text-xs text-[var(--admin-text-muted)]">

                        {ev.actor} · {new Date(ev.createdAt).toLocaleString(locale)}

                      </p>

                      {ev.note ? <p className="mt-1 text-sm">{ev.note}</p> : null}

                    </div>

                  ))

                )}

              </div>

            </section>



            {meeting.attachments.length > 0 ? (

              <section className="admin-card p-4">

                <h3 className="admin-meetings-panel-title mb-2">

                  {t('admin.modules.meetings.detail.attachments', { defaultValue: 'Attachments' })}

                </h3>

                <ul className="space-y-1 text-sm">

                  {meeting.attachments.map((a) => (

                    <li key={a.id}>

                      {a.url ? (

                        <a href={a.url} className="admin-link" target="_blank" rel="noreferrer">

                          {a.originalName}

                        </a>

                      ) : (

                        a.originalName

                      )}

                    </li>

                  ))}

                </ul>

              </section>

            ) : null}

          </div>

        </div>

      </div>

    </AdminModulePageShell>

  );

};



export default SupervisionMeetingDetailPage;

