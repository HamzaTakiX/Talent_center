from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/features/admin/encadrant/components/EncadrantsTablePanel.tsx"
text = p.read_text(encoding="utf-8")
start = text.find("flex flex-col gap-5 px-4 pb-1.5 pt-6 sm:px-6 lg:flex-row")
end = text.find("space-y-3 px-4 pb-6 pt-0 sm:px-6 lg:hidden")
if start == -1 or end == -1:
    raise SystemExit(f"markers not found start={start} end={end}")
start = text.rfind("\n", 0, start) + 1

new_header = """      <AdminModuleHeader
        layout=\"toolbar\"
        title=\"Encadrants\"
        subtitle=\"Manage supervisors and their assigned students\"
        actions={
          <AdminListToolbar
            searchValue={query}
            onSearchChange={onQueryChange}
            searchPlaceholder=\"Search encadrants...\"
            toolbarAriaLabel=\"Filter encadrants\"
            filter1={{
              value: departmentFilter,
              onChange: setDepartmentFilter,
              options: departmentSelectOptions,
              ariaLabel: 'Filter by department',
            }}
            createLabel=\"Add Encadrant\"
            onCreate={() => navigate('/admin/encadrants/new')}
          />
        }
      />

"""
end = text.rfind("\n", 0, end) + 1
text = text[:start] + new_header + text[end:]
p.write_text(text, encoding="utf-8")
print("patched")
