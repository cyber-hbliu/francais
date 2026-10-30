import re, html, json, sys, os
from urllib.parse import urljoin, unquote
d = sys.argv[1]; out = {}
for c in range(14):
    cc = f"{c:02d}"; base = f"https://www.laits.utexas.edu/fi/toc/{cc}/"
    s = open(os.path.join(d, f"toc{cc}.html"), encoding="utf-8").read()
    i = s.find('id="sidebar_first"'); s = s[i:s.find('featured-bottom', i)]
    tok = re.finditer(r'views-blockchapter-section-([a-z-]+?)-block-1"|chansons_links|<h3>(.*?)</h3>|<a\s+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', s, re.S)
    sec, sub, ch = None, None, {}
    for m in tok:
        if m.group(0).startswith("views-block"): sec, sub = m.group(1), None; continue
        if m.group(0) == "chansons_links": sec, sub = "songs", None; continue
        if m.group(2) is not None: sub = html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip(); continue
        href, txt = urljoin(base, html.unescape(m.group(3))), re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m.group(4)))).strip()
        if not sec or not txt: continue
        ch.setdefault(sec, []).append({"t": txt, "u": href, **({"g": sub} if sub else {})})
    out[cc] = ch
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, {a: len(b) for a, b in v.items()})
