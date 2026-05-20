import pathlib
import re

root = pathlib.Path(r"c:\Users\Dell\OneDrive\Desktop\Talent_center\pfe-talent-center\frontend\src\features\admin\announcements-stage")

fixes = [
    (r'<motion\.motion\.motion\.motion\.div', '<motion.div'),
    ('<motion.div className="admin-ann-bar-row__track">', '<div className="admin-ann-bar-row__track">'),
    ('</motion.div>\n          </motion.div>\n        ))}\n      </motion.div>', '</div>\n          </div>\n        ))}\n      </div>'),
    ('        </motion.div>\n        <div className="admin-ann-filters__actions">', '        </div>\n        <motion.div className="admin-ann-filters__actions">'),
]

# Simpler per-file fixes
files_fixes = {
    'components/AnnouncementsAnalyticsPanel.tsx': [
        (51, '            <div className="admin-ann-bar-row__track">'),
    ],
    'components/AnnouncementsFiltersBar.tsx': [
        (52, '        </div>'),
        (83, '        </motion.div>'),
        (84, '      </motion.div>'),
    ],
}

for rel, line_fixes in files_fixes.items():
    p = root / rel
    if not p.exists():
        continue
    lines = p.read_text(encoding='utf-8').splitlines()
    for idx, content in line_fixes:
        if idx < len(lines):
            lines[idx] = content
    p.write_text('\n'.join(lines) + '\n', encoding='utf-8')

# filters bar manual fix
fb = root / 'components/AnnouncementsFiltersBar.tsx'
t = fb.read_text(encoding='utf-8')
t = t.replace('        </motion.div>\n        <div className="admin-ann-filters__actions">', '        </div>\n        <div className="admin-ann-filters__actions">')
t = t.replace('        </motion.div>\n      </motion.div>', '        </div>\n      </div>')
t = t.replace('        </motion.div>\n      ) : null}', '        </motion.div>\n      ) : null}'.replace('</motion.div>', '</motion.div>'))
t = t.replace('        </motion.div>\n      ) : null}', '        </div>\n      ) : null}')
fb.write_text(t, encoding='utf-8')

ap = root / 'components/AnnouncementsAnalyticsPanel.tsx'
lines = ap.read_text(encoding='utf-8').splitlines()
lines[50] = '            <div className="admin-ann-bar-row__track">'
ap.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('done')
