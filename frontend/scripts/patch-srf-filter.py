from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/features/admin/SRF/components/StudentFinancialStatusTable.tsx"
text = p.read_text(encoding="utf-8")

start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')
if start == -1:
    start = text.find('        <motion.div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row')

# correct find
start = text.find("flex w-full min-w-0 flex-col gap-3 lg:flex-row")
if start == -1:
    raise SystemExit("start not found")
start = text.rfind("\n", 0, start) + 1

end = text.find('      <motion.div className="space-y-3 px-4 pb-6 pt-3 sm:px-6 lg:hidden">')
if end == -1:
    end = text.find('      <motion.div className="space-y-3 px-4 pb-6 pt-3 sm:px-6 lg:hidden">')
if end == -1:
    end = text.find("space-y-3 px-4 pb-6 pt-3 sm:px-6 lg:hidden")
    end = text.rfind("\n", 0, end) + 1

new_block = """        <div className=\"flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:max-w-2xl\">
          <AdminSearchInput
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onClear={() => onQueryChange('')}
            placeholder=\"Search students...\"
            aria-label=\"Search students\"
            containerClassName=\"min-w-0 flex-1 sm:min-w-[12rem]\"
          />
          <div ref={filterRef} className=\"flex w-full items-center gap-2 sm:w-auto\">
            <motion.div
              id=\"srf-status-filter\"
              className={\`min-w-0 flex-1 sm:w-[11rem] sm:flex-none \${showStatusSelect ? 'block' : 'hidden'} lg:block\`}
            >
              <AdminSelectField
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setFilterOpen(false);
                }}
                options={[...STATUS_FILTER_OPTIONS]}
                aria-label=\"Filter by payment status\"
              />
            </motion.div>
            <button
              type=\"button\"
              onClick={() => setFilterOpen((open) => !open)}
              aria-expanded={filterOpen}
              aria-controls=\"srf-status-filter\"
              aria-label={
                hasActiveFilter ? \`Status filter: \${statusFilter}. Click to change\` : 'Show status filter'
              }
              className={[
                'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors',
                'admin-btn-surface text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]',
                hasActiveFilter || filterOpen
                  ? 'border-[var(--admin-brand)] bg-[var(--admin-brand-muted)]'
                  : 'border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]',
              ].join(' ')}
            >
              <Filter className=\"h-4 w-4\" strokeWidth={1.75} aria-hidden />
            </button>
          </motion.div>
        </motion.div>

"""

new_block = new_block.replace("motion.div", "motion.div")

text = text[:start] + new_block + text[end:]
p.write_text(text, encoding="utf-8")
print("done", start, end)
