p = r"c:\Users\Dell\OneDrive\Desktop\Talent_center\pfe-talent-center\frontend\src\features\admin\announcements-stage\components\AnnouncementsFiltersBar.tsx"
t = open(p, encoding="utf-8").read()
t = t.replace('<motion.div className="admin-ann-filters__actions">', '<motion.div className="admin-ann-filters__actions">')
# real replacements
t = t.replace("motion.div className=\"admin-ann-filters__actions\"", "div className=\"admin-ann-filters__actions\"")
t = t.replace("motion.div className=\"admin-ann-filters__panel\"", "motion.div className=\"admin-ann-filters__panel\"".replace("motion.div", "div"))
t = t.replace("</motion.div>\n      </motion.div>\n\n      {expanded", "</div>\n      </div>\n\n      {expanded")
# fix panel close - last motion.div before ) : null
t = t.replace("</motion.div>\n      ) : null}", "</div>\n      ) : null}")
open(p, "w", encoding="utf-8").write(t)
print("ok")
