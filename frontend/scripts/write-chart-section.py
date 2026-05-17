from pathlib import Path

lines = [
"import { FunctionComponent, ReactNode } from 'react';",
"import { motion } from 'framer-motion';",
"import { BarChart3 } from 'lucide-react';",
"import { fadeInUp, easePremium } from '../../dashboard/ui/animations';",
"import StatPageChart from './StatPageChart';",
"import { STAT_PAGE_CHARTS } from './statPageChartData';",
"import type { StatPageChartId } from './types';",
"",
"interface AdminStatChartSectionProps {",
"  chartId: StatPageChartId;",
"  title?: string;",
"  subtitle?: string;",
"  children?: ReactNode;",
"}",
"",
"const AdminStatChartSection: FunctionComponent<AdminStatChartSectionProps> = ({",
"  chartId,",
"  title,",
"  subtitle,",
"  children,",
"}) => {",
"  const config = STAT_PAGE_CHARTS[chartId];",
"  if (!config) return null;",
"",
"  const heading = title ?? config.title;",
"  const desc = subtitle ?? config.subtitle;",
"",
"  return (",
"    <motion.section",
"      {...fadeInUp}",
"      transition={{ duration: 0.35, ease: easePremium }}",
'      className="admin-stat-chart-section admin-module-panel w-full min-w-0 overflow-hidden shadow-sm"',
"      aria-labelledby={`chart-heading-${chartId}`}",
"    >",
'      <div className="flex flex-col gap-1 border-b border-[var(--admin-border)] px-4 py-4 sm:px-6 sm:py-5">',
'        <div className="flex items-center gap-2.5">',
'          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_10%,var(--admin-bg-elevated))] text-[var(--admin-brand)]">',
'            <BarChart3 className="h-4 w-4" strokeWidth={1.75} aria-hidden />',
"          </span>",
'          <motion.div className="min-w-0">',
"            <h2",
"              id={`chart-heading-${chartId}`}",
'              className="font-inter text-base font-semibold leading-snug text-[var(--admin-text)] sm:text-[1.0625rem]"',
"            >",
"              {heading}",
"            </h2>",
'            <p className="mt-0.5 text-sm leading-relaxed text-[var(--admin-text-secondary)]">{desc}</p>',
"          </motion.div>",
"        </motion.div>",
"      </motion.div>",
'      <motion.div className="px-4 py-4 sm:px-6 sm:py-5">',
"        {children ?? <StatPageChart chartId={chartId} />}",
"      </motion.div>",
"    </motion.section>",
"  );",
"};",
"",
"export default AdminStatChartSection;",
]

# fix lines that still say motion.div wrongly
fixed = []
for line in lines:
    line = line.replace('className="min-w-0">', 'className="min-w-0">').replace("<motion.div className=\"min-w-0\">", "<div className=\"min-w-0\">")
    line = line.replace("</motion.div>", "</motion.div>")
    if line.strip() == "</motion.div>":
        line = "          </motion.div>"
    fixed.append(line)

# manual fix indices - rewrite clean
content = "\n".join([
"import { FunctionComponent, ReactNode } from 'react';",
"import { motion } from 'framer-motion';",
"import { BarChart3 } from 'lucide-react';",
"import { fadeInUp, easePremium } from '../../dashboard/ui/animations';",
"import StatPageChart from './StatPageChart';",
"import { STAT_PAGE_CHARTS } from './statPageChartData';",
"import type { StatPageChartId } from './types';",
"",
"interface AdminStatChartSectionProps {",
"  chartId: StatPageChartId;",
"  title?: string;",
"  subtitle?: string;",
"  children?: ReactNode;",
"}",
"",
"const AdminStatChartSection: FunctionComponent<AdminStatChartSectionProps> = ({",
"  chartId, title, subtitle, children,",
"}) => {",
"  const config = STAT_PAGE_CHARTS[chartId];",
"  if (!config) return null;",
"  const heading = title ?? config.title;",
"  const desc = subtitle ?? config.subtitle;",
"  return (",
"    <motion.section {...fadeInUp} transition={{ duration: 0.35, ease: easePremium }}",
'      className="admin-stat-chart-section admin-module-panel w-full min-w-0 overflow-hidden shadow-sm"',
"      aria-labelledby={`chart-heading-${chartId}`}>",
'      <div className="flex flex-col gap-1 border-b border-[var(--admin-border)] px-4 py-4 sm:px-6 sm:py-5">',
'        <div className="flex items-center gap-2.5">',
'          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_10%,var(--admin-bg-elevated))] text-[var(--admin-brand)]">',
'            <BarChart3 className="h-4 w-4" strokeWidth={1.75} aria-hidden />',
"          </span>",
'          <motion.div className="min-w-0">',
"            <h2 id={`chart-heading-${chartId}`} className=\"font-inter text-base font-semibold leading-snug text-[var(--admin-text)] sm:text-[1.0625rem]\">{heading}</h2>",
'            <p className="mt-0.5 text-sm leading-relaxed text-[var(--admin-text-secondary)]">{desc}</p>',
"          </motion.div>",
"        </motion.div>",
"      </motion.div>",
'      <motion.div className="px-4 py-4 sm:px-6 sm:py-5">{children ?? <StatPageChart chartId={chartId} />}</motion.div>',
"    </motion.section>",
"  );",
"};",
"",
"export default AdminStatChartSection;",
])

d_close = chr(60) + "/" + "div" + chr(62)
d_open = chr(60) + "motion.div"
content = content.replace(d_open, chr(60) + "div")
content = content.replace(d_close, chr(60) + "/" + "div" + chr(62))

Path(__file__).resolve().parents[1].joinpath("src/features/admin/ui/charts/AdminStatChartSection.tsx").write_text(content, encoding="utf-8")
print("done")
