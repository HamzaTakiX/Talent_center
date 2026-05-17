from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/features/admin/announcements-stage/components/AnnouncementsTable.tsx"
text = p.read_text(encoding="utf-8")
text = text.replace("motion.div", "div")
p.write_text(text, encoding="utf-8")
print("done")
