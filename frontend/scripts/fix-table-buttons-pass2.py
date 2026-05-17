from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin"

REPLACEMENTS = [
    ("className={btnMobile(viewDetailsBtn)}", "className={adminTableBtnMobile}"),
    ("className={btnMobile(validateBtn)}", "className={adminTableBtnMobilePrimary}"),
    ("className={btnMobile(viewDetailsBtnClass)}", "className={adminTableBtnMobile}"),
    ("className={btnMobile(validateBtnClass)}", "className={adminTableBtnMobilePrimary}"),
    ("className={btnMobile(actionOutlineBtn)}", "className={adminTableBtnMobile}"),
    ("className={btnMobile(approveBtnClass)}", "className={adminTableBtnMobileSuccess}"),
    ("className={btnMobile(manageStudentsBtnClass)}", "className={adminTableBtnMobilePrimary}"),
    ("className={viewDetailsBtn}", "className={adminTableBtn}"),
    ("className={validateBtn}", "className={adminTableBtnPrimary}"),
    ("className={viewDetailsBtnClass}", "className={adminTableBtn}"),
    ("className={validateBtnClass}", "className={adminTableBtnPrimary}"),
    ("className={actionOutlineBtn}", "className={adminTableBtn}"),
    ("className={approveBtnClass}", "className={adminTableBtnSuccess}"),
    ("className={manageStudentsBtnClass}", "className={adminTableBtnPrimary}"),
    ("className={btnMobile}", "className={adminTableBtnMobile}"),
]

IMPORTS = {
    "adminTableBtn": "adminTableBtn",
    "adminTableBtnMobile": "adminTableBtnMobile",
    "adminTableBtnPrimary": "adminTableBtnPrimary",
    "adminTableBtnSuccess": "adminTableBtnSuccess",
    "adminTableBtnMobilePrimary": "adminTableBtnMobilePrimary",
    "adminTableBtnMobileSuccess": "adminTableBtnMobileSuccess",
}

for path in ROOT.rglob("*.tsx"):
    text = path.read_text(encoding="utf-8")
    orig = text
    for a, b in REPLACEMENTS:
        text = text.replace(a, b)
    # drop leftover const lines
    lines = []
    skip_prefixes = (
        "const viewDetailsBtn",
        "const validateBtn",
        "const viewDetailsBtnClass",
        "const validateBtnClass",
        "const actionOutlineBtn",
        "const approveBtnClass",
        "const manageStudentsBtnClass",
        "const actionButtonClass",
        "const btnMobile",
    )
    for line in text.splitlines(keepends=True):
        if any(line.strip().startswith(p) for p in skip_prefixes):
            continue
        lines.append(line)
    text = "".join(lines)
    if text != orig:
        depth = len(path.relative_to(ROOT).parts) - 1
        imp = "../" * depth + "ui/adminTableButtons"
        needed = {sym for sym in IMPORTS if sym in text}
        if needed and f"from '{imp}'" not in text:
            sym_list = ", ".join(sorted(needed))
            insert = f"import {{ {sym_list} }} from '{imp}';\n"
            idx = text.find("import ")
            if idx >= 0:
                end = text.find("\n", text.rfind("import ", 0, text.find("const ") if "const " in text else len(text)))
                if end < 0:
                    end = text.find("\n\n")
                block_end = text.rfind("import ")
                while True:
                    nl = text.find("\n", block_end)
                    if nl < 0:
                        break
                    nxt = text[nl + 1 : nl + 8]
                    if nxt.startswith("import "):
                        block_end = nl + 1
                    else:
                        end = nl
                        break
                text = text[: end + 1] + "\n" + insert + text[end + 1 :]
        path.write_text(text, encoding="utf-8")
        print(path.name)
