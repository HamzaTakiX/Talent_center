import pathlib
p = pathlib.Path(r"c:\Users\Dell\OneDrive\Desktop\Talent_center\pfe-talent-center\frontend\src\features\admin\announcements-stage\components\AnnouncementsAnalyticsPanel.tsx")
text = p.read_text(encoding="utf-8")
text = text.replace('<motion.div className="admin-ann-analytics__bars">', '<div className="admin-ann-analytics__bars">')
text = text.replace('<motion.div key={b.label} className="admin-ann-bar-row">', '<motion.div key={b.label} className="admin-ann-bar-row">')
text = text.replace('<motion.div key={b.label} className="admin-ann-bar-row">', '<motion.div key={b.label} className="admin-ann-bar-row">')
text = text.replace(chr(60)+chr(100)+chr(105)+chr(118)+chr(32)+chr(107)+chr(101)+chr(121)+chr(61), chr(60)+chr(100)+chr(105)+chr(118)+chr(32)+chr(107)+chr(101)+chr(121)+chr(61))
