from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/features/admin/encadrant/components/EncadrantsTablePanel.tsx"
text = p.read_text(encoding="utf-8")
start = text.find('      <div className="hidden overflow-x-auto px-4 pb-6')
end = text.find('              <thead>')
if start == -1 or end == -1:
    raise SystemExit(f"not found start={start} end={end}")
text = text[:start] + (
    '      <div className="admin-module-table-wrap hidden px-4 pb-6 pt-0 min-w-0 sm:px-6 lg:block">\n'
    '        <AdminTableScroll minWidth="1195px" className="admin-table-scroll--panel">\n'
) + text[end:]
# remove orphan table tag if present
text = text.replace(
    '            <table className="w-full min-w-[1195px] border-collapse font-inter">\n              <thead>',
    '              <thead>',
    1,
)
p.write_text(text, encoding="utf-8")
print("patched encadrants table open")
