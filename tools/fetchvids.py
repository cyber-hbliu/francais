import hashlib, re, json, urllib.request, os
from concurrent.futures import ThreadPoolExecutor
urls = open('vids.txt').read().split()
def get(u):
    f = 'vidpages/' + hashlib.sha1(u.encode()).hexdigest()[:16]
    if not (os.path.exists(f) and os.path.getsize(f)):
        try:
            s = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=40).read()
            open(f, 'wb').write(s)
        except Exception as e: return u, [], str(e)
    s = open(f, encoding='utf-8', errors='ignore').read()
    t = re.search(r'<title>(.*?)</title>', s, re.S)
    return u, list(dict.fromkeys(re.findall(r'youtube(?:-nocookie)?\.com/embed/([\w-]{11})', s))), t.group(1).strip() if t else ''
with ThreadPoolExecutor(12) as ex: res = list(ex.map(get, urls))
m = {u: y for u, y, _ in res}
json.dump(m, open('vid_ids.json', 'w'), indent=0)
print('ok', sum(1 for v in m.values() if v), 'missing', [(u, t) for u, y, t in res if not y][:8], 'multi', [u for u, v in m.items() if len(v) > 1][:5])
