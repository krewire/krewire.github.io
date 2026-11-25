#!/usr/bin/env python3
"""
Sync the landing-page translation dictionaries into the client bundle.

`lang/<locale>/*.json` (split per context/classification) is the source of truth for landing-page strings.
`public/assets/krewire.js` embeds a copy of those dictionaries
(`var translations = {...};`) so the language toggle works without an extra
network request. This script:

1. loads all context/classification JSON files from `lang/<locale>/*.json`,
2. verifies that `en` and `id` declare exactly the same keys, and
3. rewrites the embedded `translations` object in `public/assets/krewire.js`.

Usage:
    python3 scripts/sync-i18n.py           # verify + rewrite
    python3 scripts/sync-i18n.py --check   # verify only; exit 1 if out of sync
"""

import json
import os
import sys

LOCALES = ("en", "id")
MARKER = "var translations = "


def flatten(obj, prefix=""):
    keys = set()
    for k, v in obj.items():
        path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys |= flatten(v, path)
        else:
            keys.add(path)
    return keys


def load_locale_dict(root, locale):
    loc_dir = os.path.join(root, "lang", locale)
    result = {}
    if not os.path.isdir(loc_dir):
        return result

    for fname in sorted(os.listdir(loc_dir)):
        if not fname.endswith(".json") or fname == "site.json":
            continue
        context_name = fname[:-5]  # strip .json
        fpath = os.path.join(loc_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
            result[context_name] = data
    return result


def main():
    check_only = "--check" in sys.argv[1:]
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    dicts = {}
    for loc in LOCALES:
        dicts[loc] = load_locale_dict(root, loc)

    en_keys, id_keys = flatten(dicts["en"]), flatten(dicts["id"])
    if en_keys != id_keys:
        for k in sorted(en_keys - id_keys):
            print(f"ERROR: key missing in id: {k}", file=sys.stderr)
        for k in sorted(id_keys - en_keys):
            print(f"ERROR: key missing in en: {k}", file=sys.stderr)
        sys.exit(1)

    js_path = os.path.join(root, "public", "assets", "krewire.js")
    with open(js_path, encoding="utf-8") as f:
        src = f.read()

    start = src.find(MARKER)
    if start < 0:
        print(f"ERROR: '{MARKER}' not found in {js_path}", file=sys.stderr)
        sys.exit(1)
    start += len(MARKER)
    _, length = json.JSONDecoder().raw_decode(src[start:])

    rendered = json.dumps({loc: dicts[loc] for loc in LOCALES}, indent=2, ensure_ascii=False)
    in_sync = src[start:start + length] == rendered

    if check_only:
        if not in_sync:
            print("ERROR: public/assets/krewire.js translations are out of sync; run scripts/sync-i18n.py", file=sys.stderr)
            sys.exit(1)
        print(f"SUCCESS: {len(en_keys)} landing keys in parity and embedded bundle is in sync.")
        return

    if not in_sync:
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(src[:start] + rendered + src[start + length:])
    print(f"SUCCESS: {len(en_keys)} landing keys in parity across modular files; krewire.js {'updated' if not in_sync else 'already in sync'}.")


if __name__ == "__main__":
    main()
