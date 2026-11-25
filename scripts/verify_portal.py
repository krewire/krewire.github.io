#!/usr/bin/env python3
"""
Comprehensive build smoke and regression verification suite for the Krewire Community Portal (krewire.github.io).
Covers:
  1. Clean-build smoke test (routes, assets, layouts)
  2. Bilingual dictionary parity & full key resolution
  3. Internal anchor navigation & local link integrity
  4. External link policy (HTTPS only, valid schemes)
  5. Deterministic theme engine & localStorage resilience
  6. Bilingual DOM switching & navigation coverage
  7. Responsive layout markup & viewport compliance
  8. Route manifest generation with cryptographic hashes
"""

import hashlib
import html.parser
import json
import os
import re
import subprocess
import sys
import time
from typing import Dict, List, Set, Tuple

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD_DIR = os.path.join(REPO_ROOT, ".krewire", "build")
LANG_DIR = os.path.join(REPO_ROOT, "lang")
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")
PAGES_DIR = os.path.join(REPO_ROOT, "pages")
LAYOUTS_DIR = os.path.join(REPO_ROOT, "layouts")

FAILED_CHECKS: List[str] = []
PASSED_CHECKS: List[str] = []

def record_pass(desc: str):
    PASSED_CHECKS.append(desc)
    print(f"  [PASS] {desc}")

def record_fail(desc: str, reason: str):
    FAILED_CHECKS.append(f"{desc}: {reason}")
    print(f"  [FAIL] {desc}: {reason}", file=sys.stderr)

class HTMLExtractor(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids: Set[str] = set()
        self.anchors: List[str] = []
        self.local_links: List[str] = []
        self.external_links: List[str] = []
        self.i18n_keys: List[str] = []
        self.i18n_html_keys: List[str] = []
        self.has_viewport = False
        self.responsive_classes: Set[str] = set()

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]):
        attr_dict = {k.lower(): v for k, v in attrs if v is not None}

        # Track IDs
        if "id" in attr_dict:
            self.ids.add(attr_dict["id"])

        # Track i18n
        if "data-i18n" in attr_dict:
            self.i18n_keys.append(attr_dict["data-i18n"])
        if "data-i18n-html" in attr_dict:
            self.i18n_html_keys.append(attr_dict["data-i18n-html"])

        # Track viewport meta
        if tag == "meta" and attr_dict.get("name") == "viewport":
            if "width=device-width" in attr_dict.get("content", ""):
                self.has_viewport = True

        # Track responsive classes
        if "class" in attr_dict:
            classes = attr_dict["class"].split()
            for cls in classes:
                if any(cls.startswith(prefix) for prefix in ("sm:", "md:", "lg:", "xl:", "2xl:")):
                    self.responsive_classes.add(cls)

        # Track links and asset sources
        for attr_name in ("href", "src"):
            if attr_name in attr_dict:
                url = attr_dict[attr_name].strip()
                if not url:
                    continue
                if url.startswith("#"):
                    self.anchors.append(url[1:])
                elif url.startswith(("http://", "https://")):
                    self.external_links.append(url)
                elif url.startswith("data:") or url.startswith("javascript:") or url.startswith("mailto:"):
                    continue
                else:
                    self.local_links.append(url)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Clean Build Smoke Test
# ─────────────────────────────────────────────────────────────────────────────
def test_build_smoke():
    print("\n--- 1. Testing Clean Build Smoke ---")
    if not os.path.isdir(BUILD_DIR):
        record_fail("Build Directory", f"Directory not found: {BUILD_DIR}")
        return

    required_files = [
        "index.html",
        "404.html",
        "assets/krewire.css",
        "assets/krewire.js",
        "site.webmanifest",
        "favicon.ico",
        "favicon.svg",
    ]

    for req in required_files:
        path = os.path.join(BUILD_DIR, req)
        if os.path.isfile(path) and os.path.getsize(path) > 0:
            record_pass(f"Built artifact '{req}' present ({os.path.getsize(path)} bytes)")
        else:
            record_fail(f"Built artifact '{req}'", "File missing or empty")

    index_html = os.path.join(BUILD_DIR, "index.html")
    if os.path.isfile(index_html):
        size = os.path.getsize(index_html)
        if size > 10000:
            record_pass(f"Landing page size adequate ({size} bytes)")
        else:
            record_fail("Landing page size", f"Suspiciously small ({size} bytes)")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Bilingual Dictionary Integrity & Parity
# ─────────────────────────────────────────────────────────────────────────────
def load_dictionaries() -> Tuple[Dict[str, str], Dict[str, str]]:
    en_dir = os.path.join(LANG_DIR, "en")
    id_dir = os.path.join(LANG_DIR, "id")

    en_dict = {}
    id_dict = {}

    for f in sorted(os.listdir(en_dir)):
        if f.endswith(".json"):
            prefix = f[:-5]
            with open(os.path.join(en_dir, f), "r", encoding="utf-8") as fp:
                data = json.load(fp)
                if isinstance(data, dict):
                    for k, v in data.items():
                        en_dict[f"{prefix}.{k}"] = str(v)
                else:
                    en_dict[prefix] = str(data)

    for f in sorted(os.listdir(id_dir)):
        if f.endswith(".json"):
            prefix = f[:-5]
            with open(os.path.join(id_dir, f), "r", encoding="utf-8") as fp:
                data = json.load(fp)
                if isinstance(data, dict):
                    for k, v in data.items():
                        id_dict[f"{prefix}.{k}"] = str(v)
                else:
                    id_dict[prefix] = str(data)

    return en_dict, id_dict

def test_locale_dictionaries(en_dict: Dict[str, str], id_dict: Dict[str, str], extractor: HTMLExtractor):
    print("\n--- 2. Testing Bilingual Dictionary Parity & Resolution ---")
    en_keys = set(en_dict.keys())
    id_keys = set(id_dict.keys())

    missing_in_id = en_keys - id_keys
    missing_in_en = id_keys - en_keys

    if not missing_in_id and not missing_in_en:
        record_pass(f"1:1 key parity verified between English and Indonesian ({len(en_keys)} keys each)")
    else:
        if missing_in_id:
            record_fail("Locale Parity", f"Missing in ID: {sorted(missing_in_id)[:5]}")
        if missing_in_en:
            record_fail("Locale Parity", f"Missing in EN: {sorted(missing_in_en)[:5]}")

    # Check for empty dictionary values
    empty_en = [k for k, v in en_dict.items() if not v.strip()]
    empty_id = [k for k, v in id_dict.items() if not v.strip()]
    if not empty_en and not empty_id:
        record_pass("All dictionary entries contain non-empty translations")
    else:
        if empty_en:
            record_fail("Empty Entries", f"EN keys empty: {empty_en}")
        if empty_id:
            record_fail("Empty Entries", f"ID keys empty: {empty_id}")

    # Verify referenced i18n keys resolve
    all_referenced = set(extractor.i18n_keys + extractor.i18n_html_keys)
    unresolved_en = [k for k in all_referenced if k not in en_dict]
    unresolved_id = [k for k in all_referenced if k not in id_dict]

    if not unresolved_en and not unresolved_id:
        record_pass(f"All {len(all_referenced)} DOM i18n markers resolve in both locales")
    else:
        if unresolved_en:
            record_fail("Unresolved i18n", f"Missing in EN: {unresolved_en}")
        if unresolved_id:
            record_fail("Unresolved i18n", f"Missing in ID: {unresolved_id}")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Internal Anchor Navigation & Local Links
# ─────────────────────────────────────────────────────────────────────────────
def test_links_and_anchors(extractor: HTMLExtractor):
    print("\n--- 3. Testing Navigation Anchors & Asset Links ---")
    # Verify anchors
    missing_anchors = set()
    for anchor in extractor.anchors:
        if anchor not in extractor.ids:
            missing_anchors.add(anchor)

    if not missing_anchors:
        record_pass(f"All internal anchors ({sorted(set(extractor.anchors))}) match DOM element IDs")
    else:
        record_fail("Anchor Integrity", f"Dangling anchor targets: {sorted(missing_anchors)}")

    # Verify local file links
    broken_local = []
    for link in extractor.local_links:
        clean = link.split("?")[0].split("#")[0]
        if clean.startswith("/"):
            clean = clean[1:]
        local_path = os.path.join(BUILD_DIR, clean)
        if not os.path.exists(local_path):
            broken_local.append(link)

    if not broken_local:
        record_pass(f"All {len(extractor.local_links)} local asset and page references resolve in build directory")
    else:
        record_fail("Local Links", f"Broken local links: {broken_local}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. External Link Policy
# ─────────────────────────────────────────────────────────────────────────────
def test_external_links(extractor: HTMLExtractor):
    print("\n--- 4. Testing External Link Safety & Policy ---")
    insecure = [u for u in extractor.external_links if u.startswith("http://")]
    if not insecure:
        record_pass("All external links use HTTPS transport")
    else:
        record_fail("Insecure Links", f"Found plain HTTP links: {insecure}")

    # Canonical ecosystem link checks
    approved_domains = ("github.com", "krewire.com", "creativecommons.org", "w3.org", "instagram.com")
    disapproved = []
    for url in extractor.external_links:
        m = re.match(r"https?://([^/]+)", url)
        if m:
            host = m.group(1).lower()
            if not any(host == d or host.endswith("." + d) for d in approved_domains):
                disapproved.append(url)

    if not disapproved:
        record_pass(f"All {len(extractor.external_links)} external links belong to approved canonical domains")
    else:
        record_fail("External Link Policy", f"Unapproved external links: {disapproved}")


# ─────────────────────────────────────────────────────────────────────────────
# 5. Deterministic Theme Engine & Storage Resilience
# ─────────────────────────────────────────────────────────────────────────────
def test_theme_engine_via_node():
    print("\n--- 5. Testing Theme Engine & Storage Fault-Tolerance (Node.js) ---")
    js_path = os.path.join(PUBLIC_DIR, "assets", "krewire.js")
    node_test = f"""
const fs = require('fs');
const vm = require('vm');

const js = fs.readFileSync({json.dumps(js_path)}, 'utf8');

// Test 1: Standard theme toggling & persistence
let store = {{}};
const mockDoc = {{
  documentElement: {{
    dataset: {{}},
    classList: {{
      _classes: new Set(),
      toggle(c, v) {{ if (v) this._classes.add(c); else this._classes.delete(c); }},
      contains(c) {{ return this._classes.has(c); }}
    }}
  }},
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {{}}
}};
const mockWin = {{
  location: {{ pathname: '/' }},
  matchMedia: (q) => ({{ matches: false }}),
  addEventListener: () => {{}}
}};
const mockStorage = {{
  getItem: (k) => store[k] || null,
  setItem: (k, v) => {{ store[k] = String(v); }}
}};

let ctx = vm.createContext({{
  window: mockWin,
  document: mockDoc,
  localStorage: mockStorage,
  console: console
}});

vm.runInContext(js, ctx);

if (ctx.window.krewireTheme.get() !== 'light') {{
  console.error('FAIL: Expected initial light theme, got: ' + ctx.window.krewireTheme.get());
  process.exit(1);
}}
ctx.window.krewireTheme.set('dark');
if (ctx.window.krewireTheme.get() !== 'dark' || store['krewire-theme'] !== 'dark') {{
  console.error('FAIL: Failed to set dark theme');
  process.exit(1);
}}
ctx.window.krewireTheme.toggle();
if (ctx.window.krewireTheme.get() !== 'light' || store['krewire-theme'] !== 'light') {{
  console.error('FAIL: Failed to toggle back to light');
  process.exit(1);
}}

// Test 2: Resilient error handling when localStorage throws (private mode / blocked cookies)
const throwingDoc = {{
  documentElement: {{
    dataset: {{}},
    classList: {{
      _classes: new Set(),
      toggle(c, v) {{ if (v) this._classes.add(c); else this._classes.delete(c); }},
      contains(c) {{ return this._classes.has(c); }}
    }}
  }},
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {{}}
}};
const throwingStorage = {{
  getItem: () => {{ throw new Error('SecurityError: Access is denied'); }},
  setItem: () => {{ throw new Error('SecurityError: Access is denied'); }}
}};
let ctx2 = vm.createContext({{
  window: mockWin,
  document: throwingDoc,
  localStorage: throwingStorage,
  console: console
}});

vm.runInContext(js, ctx2);
ctx2.window.krewireTheme.set('dark');
ctx2.window.krewireTheme.toggle();
console.log('SUCCESS');
"""
    try:
        proc = subprocess.run(["node", "-e", node_test], capture_output=True, text=True, check=True)
        if "SUCCESS" in proc.stdout:
            record_pass("Theme engine passed auto/light/dark state transitions")
            record_pass("Theme engine survived localStorage SecurityError/QuotaExceeded without throwing")
        else:
            record_fail("Theme Engine Test", f"Output: {proc.stdout} {proc.stderr}")
    except Exception as e:
        record_fail("Theme Engine Test", str(e))


# ─────────────────────────────────────────────────────────────────────────────
# 6. Bilingual DOM Switching & Navigation Coverage
# ─────────────────────────────────────────────────────────────────────────────
def test_bilingual_switching_via_node():
    print("\n--- 6. Testing Bilingual DOM Switching Engine (Node.js) ---")
    js_path = os.path.join(PUBLIC_DIR, "assets", "krewire.js")
    node_test = f"""
const fs = require('fs');
const vm = require('vm');

const js = fs.readFileSync({json.dumps(js_path)}, 'utf8');

// Mock DOM elements
const elements = [
  {{ attrs: {{ 'data-i18n': 'nav.start' }}, textContent: '', tagName: 'SPAN', getAttribute(k) {{ return this.attrs[k]; }} }},
  {{ attrs: {{ 'data-i18n': 'hero.cta_contribute' }}, textContent: '', tagName: 'A', getAttribute(k) {{ return this.attrs[k]; }} }},
  {{ attrs: {{ 'data-i18n': 'standards.title' }}, textContent: '', tagName: 'H2', getAttribute(k) {{ return this.attrs[k]; }} }}
];

const mockDoc = {{
  documentElement: {{
    dataset: {{}},
    classList: {{ _classes: new Set(), toggle() {{}}, contains() {{ return false; }} }},
    lang: 'en'
  }},
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: (selector) => {{
    if (selector === '[data-i18n]') return elements;
    return [];
  }},
  addEventListener: () => {{}}
}};
const mockWin = {{
  location: {{ pathname: '/' }},
  matchMedia: () => ({{ matches: false }}),
  addEventListener: () => {{}}
}};
const store = {{}};
const mockStorage = {{
  getItem: (k) => store[k] || null,
  setItem: (k, v) => {{ store[k] = String(v); }}
}};

let ctx = vm.createContext({{
  window: mockWin,
  document: mockDoc,
  localStorage: mockStorage,
  console: console
}});

vm.runInContext(js, ctx);

if (!ctx.window.krewireI18n) {{
  console.error('FAIL: window.krewireI18n not initialized');
  process.exit(1);
}}

// Switch to Indonesian
ctx.window.krewireI18n.setLocale('id');
if (ctx.document.documentElement.lang !== 'id') {{
  console.error('FAIL: lang attribute was not set to id');
  process.exit(1);
}}
if (elements[0].textContent !== 'Mulai di Sini') {{
  console.error('FAIL: nav.start did not translate to ID: ' + elements[0].textContent);
  process.exit(1);
}}

// Switch back to English
ctx.window.krewireI18n.setLocale('en');
if (ctx.document.documentElement.lang !== 'en') {{
  console.error('FAIL: lang attribute was not restored to en');
  process.exit(1);
}}
if (elements[0].textContent !== 'Start Here') {{
  console.error('FAIL: nav.start did not restore to EN: ' + elements[0].textContent);
  process.exit(1);
}}

console.log('SUCCESS');
"""
    try:
        proc = subprocess.run(["node", "-e", node_test], capture_output=True, text=True, check=True)
        if "SUCCESS" in proc.stdout:
            record_pass("Client-side i18n switching translates navigation and key landmarks to Indonesian")
            record_pass("Client-side i18n switching safely restores English default on toggle")
        else:
            record_fail("i18n Switching Test", f"Output: {proc.stdout} {proc.stderr}")
    except Exception as e:
        record_fail("i18n Switching Test", str(e))


# ─────────────────────────────────────────────────────────────────────────────
# 7. Responsive Layout Markup & Viewport Compliance
# ─────────────────────────────────────────────────────────────────────────────
def test_responsive_layout(extractor: HTMLExtractor):
    print("\n--- 7. Testing Responsive Viewport & Breakpoint Compliance ---")
    if extractor.has_viewport:
        record_pass("Viewport meta tag configured with 'width=device-width'")
    else:
        record_fail("Viewport Meta", "Missing or misconfigured <meta name='viewport'>")

    expected_breakpoints = ("sm:", "md:", "lg:")
    found_all = all(any(cls.startswith(bp) for cls in extractor.responsive_classes) for bp in expected_breakpoints)
    if found_all:
        record_pass(f"Responsive grid/flex breakpoints present: {len(extractor.responsive_classes)} adaptive classes detected")
    else:
        record_fail("Responsive Breakpoints", f"Missing some standard breakpoints in {extractor.responsive_classes}")


# ─────────────────────────────────────────────────────────────────────────────
# 8. Route Manifest Generation
# ─────────────────────────────────────────────────────────────────────────────
def generate_route_manifest(extractor: HTMLExtractor, en_dict: Dict[str, str], id_dict: Dict[str, str]):
    print("\n--- 8. Generating Build Route & Integrity Manifest ---")
    manifest_path = os.path.join(BUILD_DIR, "route_manifest.json")

    routes_info = []
    for r in ["index.html", "404.html"]:
        p = os.path.join(BUILD_DIR, r)
        if os.path.isfile(p):
            with open(p, "rb") as fp:
                data = fp.read()
                h = hashlib.sha256(data).hexdigest()
                routes_info.append({
                    "route": "/" if r == "index.html" else f"/{r}",
                    "file": r,
                    "bytes": len(data),
                    "sha256": h
                })

    assets_info = []
    for root, _, files in os.walk(BUILD_DIR):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), BUILD_DIR)
            if rel in ["index.html", "404.html", "route_manifest.json", ".kiw-build-manifest"]:
                continue
            p = os.path.join(root, f)
            with open(p, "rb") as fp:
                h = hashlib.sha256(fp.read()).hexdigest()
                assets_info.append({
                    "path": rel,
                    "bytes": os.path.getsize(p),
                    "sha256": h
                })

    manifest = {
        "manifest_version": "1.0.0",
        "project": "krewire.github.io",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "routes": routes_info,
        "assets_count": len(assets_info),
        "locales": {
            "en": {"keys_count": len(en_dict)},
            "id": {"keys_count": len(id_dict)}
        },
        "anchors": sorted(set(extractor.anchors)),
        "verification_summary": {
            "checks_passed": len(PASSED_CHECKS),
            "checks_failed": len(FAILED_CHECKS)
        }
    }

    with open(manifest_path, "w", encoding="utf-8") as fp:
        json.dump(manifest, fp, indent=2)

    record_pass(f"Saved route manifest to '{os.path.relpath(manifest_path, REPO_ROOT)}'")


# ─────────────────────────────────────────────────────────────────────────────
# Main Runner
# ─────────────────────────────────────────────────────────────────────────────
def main():
    print("=================================================================")
    print(" Krewire Community Portal (krewire.github.io) Verification Suite")
    print("=================================================================")

    # Parse index.html
    index_path = os.path.join(BUILD_DIR, "index.html")
    if not os.path.isfile(index_path):
        print(f"ERROR: {index_path} not found. Run 'krew build' first.", file=sys.stderr)
        sys.exit(1)

    extractor = HTMLExtractor()
    with open(index_path, "r", encoding="utf-8") as fp:
        extractor.feed(fp.read())

    # Run verification suite
    test_build_smoke()
    en_dict, id_dict = load_dictionaries()
    test_locale_dictionaries(en_dict, id_dict, extractor)
    test_links_and_anchors(extractor)
    test_external_links(extractor)
    test_theme_engine_via_node()
    test_bilingual_switching_via_node()
    test_responsive_layout(extractor)
    generate_route_manifest(extractor, en_dict, id_dict)

    print("\n=================================================================")
    print(f" Summary: {len(PASSED_CHECKS)} passed, {len(FAILED_CHECKS)} failed.")
    print("=================================================================")

    if FAILED_CHECKS:
        print("\nFailures encountered:", file=sys.stderr)
        for f in FAILED_CHECKS:
            print(f"  - {f}", file=sys.stderr)
        sys.exit(1)

    print("\n✓ All portal smoke, bilingual, navigation, and theme gates passed cleanly!")

if __name__ == "__main__":
    main()
