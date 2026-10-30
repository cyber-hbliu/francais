import json, re, html, os, sys, urllib.request
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"}
web = json.load(open("fi_web_src.json"))
urls = list(dict.fromkeys(g["u"] for ch in web.values() for g in ch["gram"]))
def slug(u): return u.rstrip("/").split("/")[-1]
def fetch(u):
    f = "tex/" + slug(u) + ".html"
    if not os.path.exists(f) or os.path.getsize(f) < 1000:
        open(f, "wb").write(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read())
    return f
with ThreadPoolExecutor(8) as ex: files = list(ex.map(fetch, urls))

class P(HTMLParser):
    # walks the chapter body until "texercises"; keeps paragraphs (with <b>), tables, audio, images
    def __init__(s): super().__init__(convert_charrefs=True); s.out = []; s.stack = []; s.cur = None; s.row = None; s.cell = None; s.tbl = None; s.stop = False; s.inh2 = False; s.h2 = ""; s.cap = False
    def text_target(s):
        return s.cell if s.cell is not None else s.cur
    def handle_starttag(s, t, a):
        if s.stop: return
        a = dict(a)
        if t == "h2": s.inh2 = True; s.h2 = ""
        if t in ("p", "li", "h3", "h4", "h5") and s.tbl is None: s.cur = [t, ""]
        if t == "table": s.tbl = {"rows": [], "cap": ""}
        if t == "caption": s.cap = True; s.cell = [""]
        if t == "tr" and s.tbl is not None: s.row = []
        if t in ("td", "th") and s.row is not None: s.cell = [""]; s.cellspan = int(a.get("colspan", 1) or 1)
        if t in ("strong", "b"):
            x = s.text_target();  x and x.__setitem__(-1, x[-1] + "**")
        if t == "br":
            x = s.text_target();  x and x.__setitem__(-1, x[-1] + "\n")
        if t == "source" and a.get("src", "").split("?")[0].endswith(".mp3"):
            s.split(); s.out.append({"k": "audio", "u": a["src"].split("?")[0]})
        if t == "img" and a.get("src"):
            s.split(); s.out.append({"k": "img", "u": a["src"], "w": a.get("width")})
    def handle_endtag(s, t):
        if s.stop: return
        if t == "h2":
            s.inh2 = False
            if "texercise" in s.h2.lower(): s.stop = True; s.flush(); return
            s.out.append({"k": "h", "t": s.h2.strip()})
        if t in ("strong", "b"):
            x = s.text_target();  x and x.__setitem__(-1, x[-1] + "**")
        if t == "caption": s.tbl["cap"] = s.cell[0].strip(); s.cell = None; s.cap = False
        if t in ("td", "th") and s.cell is not None and s.row is not None: s.row.append(s.cell[0].strip()); s.cell = None
        if t == "tr" and s.row is not None and s.tbl is not None: s.tbl["rows"].append(s.row); s.row = None
        if t == "table" and s.tbl is not None:
            s.flush(); s.out.append({"k": "tbl", **s.tbl}); s.tbl = None
        if t in ("p", "li", "h3", "h4", "h5") and s.cur is not None and s.cur[0] == t: s.flush()
    def split(s):
        # media inside a paragraph: close the text so far, keep the paragraph open for what follows
        tag = s.cur[0] if s.cur else None; s.flush()
        if tag and s.tbl is None: s.cur = [tag, ""]
    def flush(s):
        if s.cur and s.cur[1].strip():
            t = re.sub(r"\*\*\s*\*\*", "", re.sub(r"[ \t ]+", " ", s.cur[1])).strip()
            if t and t != "**": s.out.append({"k": "li" if s.cur[0] == "li" else ("h" if s.cur[0] in ("h3", "h4", "h5") else "p"), "t": t})
        s.cur = None
    def handle_data(s, d):
        if s.stop: return
        if s.inh2: s.h2 += d; return
        x = s.text_target()
        if x is not None: x[-1] += d
out = {}
for u, f in zip(urls, files):
    src = open(f, encoding="utf-8").read()
    i = src.find('<section data-type="'); j = src.find("</section>", i)
    body = src[i:j]
    m = re.search(r'<h1 class="entry-title">(.*?)</h1>', body, re.S) or re.search(r"<title>(.*?)(?:&#8211;|–)", src, re.S)
    title = html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip()
    body = body[body.find("</header>"):] if "</header>" in body else body
    p = P(); p.feed(body); p.flush()
    blocks = []
    for b in p.out:
        if b["k"] == "tbl":
            rows = [[re.sub(r"\s+", " ", c).replace("** **", " ").strip() for c in r] for r in b["rows"]]
            rows = [r for r in rows if any(c.strip("* ") for c in r)]
            if not rows: continue
            hdr = [c.strip("* ").lower() for c in rows[0]]
            b = {"k": "dlg" if hdr[:2] == ["french", "english"] else "tbl", "cap": b["cap"].replace("**", ""), "rows": rows[1:] if hdr[:2] == ["french", "english"] else rows}
        if b["k"] == "img" and not re.search(r"\.(gif|png|jpe?g)$", b["u"], re.I): continue
        blocks.append(b)
    out[slug(u)] = {"t": title, "u": u, "b": blocks}
json.dump(out, open("tex.json", "w"), ensure_ascii=False)
n_a = sum(1 for v in out.values() for b in v["b"] if b["k"] == "audio"); n_d = sum(1 for v in out.values() for b in v["b"] if b["k"] == "dlg")
print(len(out), "pages", n_a, "audio", n_d, "dialogues", "no-audio:", [k for k, v in out.items() if not any(b["k"] == "audio" for b in v["b"])][:20])
