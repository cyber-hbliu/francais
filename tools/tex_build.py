import json, sys
root = sys.argv[1]
d = json.load(open("tex_local.json"))
import re
for v in d.values():  # the <audio> fallback link comes through as a bare URL paragraph
    v["b"] = [b for b in v["b"] if not (b["k"] == "p" and re.fullmatch(r"\s*https?://\S+\s*", b["t"]))]
web = json.load(open("fi_web_src.json"))
slug = lambda u: u.rstrip("/").split("/")[-1]
chapters = {ch: [{"n": g["n"], "t": g["t"], "s": slug(g["u"])} for g in w["gram"]] for ch, w in web.items()}
head = "// Tex's French Grammar (University of Texas at Austin, Blyth, Kelton et al.), CC BY 4.0 – https://utexas.pressbooks.pub/texfrenchgrammar/\n// Explanations, Tex dialogues and their recordings, arranged by Français interactif chapter. Built by tools/tex_scrape.py.\n"
open(root + "/data/fi_tex.js", "w").write(head + "window.FI_TEX=" + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";\nwindow.FI_TEX_CH=" + json.dumps(chapters, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(sum(len(v) for v in chapters.values()), "grammar points", len(d), "pages")
