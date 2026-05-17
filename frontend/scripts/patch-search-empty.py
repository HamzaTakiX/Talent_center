import re
import os

root = os.path.join(os.path.dirname(__file__), "..", "src", "features", "admin")
ui_dir = os.path.join(root, "ui")


def ui_import_line(file_dir: str) -> str:
    rel = os.path.relpath(ui_dir, file_dir).replace("\\", "/")
    if not rel.startswith("."):
        rel = "./" + rel
    return f"import {{ AdminSearchEmptyState, AdminTableEmptyState }} from '{rel}';\n"


def add_imports(content: str, file_dir: str) -> str:
    if "AdminSearchEmptyState" not in content:
        return content
    if re.search(r"from ['\"].*ui['\"]", content) and "AdminSearchEmptyState" in content:
        return content
    if "AdminSearchEmptyState" in content and "AdminTableEmptyState" in content:
        if re.search(r"AdminSearchEmptyState.*from", content):
            return content
    # extend existing ui import
    m = re.search(r"(import \{[^}]*)(} from ['\"][^'\"]*ui['\"];)", content)
    if m and "AdminSearchEmptyState" not in m.group(1):
        names = m.group(1) + ", AdminSearchEmptyState, AdminTableEmptyState" + m.group(2)
        return content[: m.start()] + names + content[m.end() :]
    imp = ui_import_line(file_dir)
    match = list(re.finditer(r"^import .+$", content, re.M))
    if match:
        pos = match[-1].end() + 1
        return content[:pos] + imp + content[pos:]
    return imp + content


for dirpath, _, filenames in os.walk(root):
    for fn in filenames:
        if not fn.endswith(".tsx"):
            continue
        path = os.path.join(dirpath, fn)
        with open(path, encoding="utf-8") as f:
            content = f.read()
        original = content

        content = re.sub(
            r'<p className="py-8 text-center[^"]*">([^<]+)</p>',
            r'<AdminSearchEmptyState title="\1" />',
            content,
        )

        def table_repl(m: re.Match) -> str:
            colspan = m.group(1)
            title = m.group(2).strip()
            return f'<AdminTableEmptyState colSpan={{{colspan}}} title="{title}" />'

        content = re.sub(
            r"<tr>\s*<td colSpan=\{(\d+)\} className=\"[^\"]*\">\s*([^<]+?)\s*</td>\s*</tr>",
            table_repl,
            content,
            flags=re.DOTALL,
        )

        if content != original:
            content = add_imports(content, dirpath)
            with open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write(content)
            print("updated", path)
