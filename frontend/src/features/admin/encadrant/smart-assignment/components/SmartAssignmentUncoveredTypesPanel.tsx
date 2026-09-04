import { FunctionComponent, useId, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { AlertTriangle, ChevronDown } from 'lucide-react';

import type { SmartAssignmentInternshipAnalytics } from '../../../api/types';

import { easePremium } from '../../../dashboard/ui/animations';

import '../styles/admin-smart-assignment-analytics.css';



function splitInternshipTypeName(name: string): { title: string; duration: string | null } {

  const match = name.trim().match(/^(.*?)\s*\(([^)]+)\)\s*$/);

  if (!match) return { title: name, duration: null };

  return { title: match[1].trim() || name, duration: match[2].trim() };

}



interface SmartAssignmentUncoveredTypesPanelProps {

  analytics: SmartAssignmentInternshipAnalytics | null | undefined;

  loading?: boolean;

}



const SmartAssignmentUncoveredTypesPanel: FunctionComponent<

  SmartAssignmentUncoveredTypesPanelProps

> = ({ analytics, loading = false }) => {

  const { t } = useTranslation();

  const prefix = 'admin.smartAssignment.analytics';

  const gridId = useId();

  const [expanded, setExpanded] = useState(true);



  const uncovered = useMemo(

    () => analytics?.uncovered_internship_types ?? [],

    [analytics?.uncovered_internship_types],

  );



  if (loading || uncovered.length === 0) {

    return null;

  }



  const toggleLabel = expanded

    ? t(`${prefix}.uncoveredCollapseTypes`)

    : t(`${prefix}.uncoveredExpandTypes`, { count: uncovered.length });



  return (

    <motion.aside

      className={`sa-uncovered sa-uncovered--prominent ${expanded ? '' : 'sa-uncovered--collapsed'}`}

      initial={{ opacity: 0, y: 8 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.35, ease: easePremium }}

      role="note"

      aria-labelledby="smart-assignment-uncovered-title"

    >

      <header className="sa-uncovered__head">

        <button

          type="button"

          className="sa-uncovered__toggle"

          onClick={() => setExpanded((open) => !open)}

          aria-expanded={expanded}

          aria-controls={gridId}

          aria-label={toggleLabel}

        >

          <span className="sa-uncovered__icon" aria-hidden>

            <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={2} />

          </span>

          <div className="sa-uncovered__copy">

            <h2 id="smart-assignment-uncovered-title" className="sa-uncovered__title">

              {t(`${prefix}.uncoveredTitle`)}

            </h2>

            <p className="sa-uncovered__hint">

              {t(`${prefix}.uncoveredHint`, {

                defaultValue: 'These internship types have students waiting but no matching supervisor.',

              })}

            </p>

          </div>

          <span className="sa-uncovered__actions">

            <span className="sa-uncovered__badge">

              {t(`${prefix}.uncoveredTypesBadge`, {

                count: uncovered.length,

                defaultValue: '{{count}} types',

              })}

            </span>

            <ChevronDown

              className={`sa-uncovered__chevron ${expanded ? 'sa-uncovered__chevron--open' : ''}`}

              aria-hidden

            />

          </span>

        </button>

      </header>



      <AnimatePresence initial={false}>

        {expanded ? (

          <motion.div

            key="uncovered-grid"

            id={gridId}

            className="sa-uncovered__body"

            initial={{ height: 0, opacity: 0 }}

            animate={{ height: 'auto', opacity: 1 }}

            exit={{ height: 0, opacity: 0 }}

            transition={{ duration: 0.28, ease: easePremium }}

          >

            <ul className="sa-uncovered__grid" role="list">

              {uncovered.map((row) => {

                const { title, duration } = splitInternshipTypeName(row.internship_type_name);

                return (

                  <li key={row.internship_type_id} className="sa-uncovered__card">

                    <p className="sa-uncovered__name">{title}</p>

                    <div className="sa-uncovered__meta">

                      {duration ? <span className="sa-uncovered__chip">{duration}</span> : null}

                      <span className="sa-uncovered__count">

                        {t(`${prefix}.uncoveredStudentsBadge`, {

                          count: row.student_count,

                          defaultValue: '{{count}} student(s)',

                        })}

                      </span>

                    </div>

                  </li>

                );

              })}

            </ul>

          </motion.div>

        ) : null}

      </AnimatePresence>

    </motion.aside>

  );

};



export default SmartAssignmentUncoveredTypesPanel;

