from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/features/admin/announcements-stage/components/AnnouncementsTable.tsx"
text = p.read_text(encoding="utf-8")
start = text.find('      <div className="box-border flex min-h-[70px]')
end = text.find('      <div className="box-border w-full min-w-0 shrink-0 px-4 pb-6 pt-0 sm:px-6">')
if start == -1 or end == -1:
    raise SystemExit(f"markers not found {start} {end}")
new = """      <AdminModuleHeader
        layout=\"toolbar\"
        title=\"Announcements\"
        subtitle=\"Manage platform announcements and notifications\"
        actions={
          <AnnouncementsToolbar
            query={query}
            onQueryChange={onQueryChange}
            onCreate={onCreate}
          />
        }
      />

"""
text = text[:start] + new + text[end:]
p.write_text(text, encoding="utf-8")
print("done")
