from pathlib import Path
p = Path(__file__).resolve().parents[1] / "src/features/admin/ui/charts/AdminStatChartSection.tsx"
t = p.read_text(encoding="utf-8")
bad = "</" + "motion.div>"
good = "</div>"
print("count bad", t.count(bad))
p.write_text(t.replace(bad, good), encoding="utf-8")
