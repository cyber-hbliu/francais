import json, re, sys
toc, ids = json.load(open('fi_toc.json')), json.load(open('vid_ids.json'))
out = {}
for cc, ch in toc.items():
    o = {"intro": None, "voc": [], "intfr": [], "intusa": [], "gram": [], "quiz": None, "listen": None, "act": [], "song": [], "pdf": {}}
    for sec, items in ch.items():
        for x in items:
            u, t = x["u"], x["t"]
            if u.endswith(".pdf"): o["pdf"][sec] = u; continue
            if "/fivideo/" in u:
                v = {"t": t, "y": ids[u][0]}
                if "g" in x: v["g"] = x["g"]
                if sec == "videos-intro": o["intro"] = v
                else: o[{"videos-voc": "voc", "videos-int-fr": "intfr", "videos-int-usa": "intusa"}[sec]].append(v)
            elif sec == "grammar":
                if "texfrenchgrammar/" in u and not u.endswith("texfrenchgrammar/"):
                    m = re.match(r"([\d.]+)\s*(.*?)\.?$", t)
                    o["gram"].append({"n": m.group(1).rstrip("."), "t": m.group(2), "u": u} if m else {"n": "", "t": t, "u": u})
                elif "/tv/" in u: o["quiz"] = "https://fi-quiz.coerll.utexas.edu/quiz/tv/%s/" % cc
            elif sec == "listening": o["listen"] = u
            elif sec == "activity": o["act"].append({"t": t, "u": u})
            elif sec == "songs": o["song"].append({"t": t, "u": u})
    out[int(cc)] = o
s = "// Français interactif (University of Texas at Austin, COERLL/LAITS), CC BY 3.0: videos, Tex grammar and quizzes per chapter, linked from https://www.laits.utexas.edu/fi/\nwindow.FI_WEB=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(sys.argv[1], "w").write(s)
print(len(s)); print(json.dumps(out[0], ensure_ascii=False, indent=1)[:1500]); print(json.dumps(out[1]["gram"][:3], ensure_ascii=False))
