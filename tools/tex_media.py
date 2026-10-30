import json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"}
root = sys.argv[1]; d = json.load(open("tex.json"))
jobs = {}
for v in d.values():
    for b in v["b"]:
        if b["k"] in ("audio", "img"):
            name = b["u"].rstrip("/").split("/")[-1]
            local = f"utexas audio/tex/{'img/' if b['k'] == 'img' else ''}{name}"
            jobs[local] = b["u"]; b["u"] = local
def get(item):
    local, u = item; f = os.path.join(root, local)
    if os.path.exists(f) and os.path.getsize(f): return None
    os.makedirs(os.path.dirname(f), exist_ok=True)
    try: open(f, "wb").write(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read())
    except Exception as e: return (u, str(e))
with ThreadPoolExecutor(3) as ex: errs = [e for e in ex.map(get, jobs.items()) if e]
json.dump(d, open("tex_local.json", "w"), ensure_ascii=False)
print(len(jobs), "files", "errors", errs[:5])
