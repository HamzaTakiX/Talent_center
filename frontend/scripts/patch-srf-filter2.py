from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / "src/features/admin/SRF/components/StudentFinancialStatusTable.tsx"
text = p.read_text(encoding="utf-8")

start = text.find("flex w-full min-w-0 flex-col gap-3 lg:flex-row")
start = text.rfind("\n", 0, start) + 1
end = text.find("space-y-3 px-4 pb-6 pt-3 sm:px-6 lg:hidden")
end = text.rfind("\n", 0, end) + 1

new = (root / "scripts/srf-toolbar-snippet.txt").read_text(encoding="utf-8")
text = text[:start] + new + text[end:]

p.write_text(text, encoding="utf-8")
print("toolbar patched")
