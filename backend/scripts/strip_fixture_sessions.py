#!/usr/bin/env python3
"""Remove sessions (and optional models) from a Django fixture; write UTF-8 JSON."""
import json
import sys
from pathlib import Path

DEFAULT_EXCLUDE = (
    "sessions.",
    "auth.permission",
    "contenttypes.",
)


def strip_fixture(path: Path, exclude_prefixes=DEFAULT_EXCLUDE) -> tuple[int, int]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit(f"{path}: expected a JSON array of fixture objects")
    kept = [
        obj
        for obj in data
        if not any(obj.get("model", "").startswith(p) for p in exclude_prefixes)
    ]
    path.write_text(
        json.dumps(kept, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return len(data), len(kept)


def main() -> None:
    target = Path(sys.argv[1] if len(sys.argv) > 1 else "data.json")
    before, after = strip_fixture(target)
    print(f"{target}: {before} -> {after} objects ({before - after} removed)")


if __name__ == "__main__":
    main()
