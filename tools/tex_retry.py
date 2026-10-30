import json, os, sys, time, urllib.request
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"}
root = sys.argv[1]; d = json.load(open("tex.json"))
todo = []
for v in d.values():
    for b in v["b"]:
        if b["k"] in ("audio", "img"):
            name = b["u"].rstrip("/").split("/")[-1]
            local = os.path.join(root, f"utexas audio/tex/{'img/' if b['k'] == 'img' else ''}{name}")
            if not os.path.exists(local) or os.path.getsize(local) == 0: todo.append((local, b["u"]))
todo = list(dict.fromkeys(todo)); print("todo", len(todo), flush=True)
for rnd in range(6):
    left = []
    for local, u in todo:
        try:
            data = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
            open(local, "wb").write(data)
        except Exception as e: left.append((local, u))
        time.sleep(2)
    print("round", rnd, "left", len(left), flush=True)
    todo = left
    if not todo: break
    time.sleep(120)
