import sys, re, html, urllib.request, urllib.parse, json
def look(q):
    u="https://term.anidap.net/master.php?pg_idx=3&page=0&schType=1&schGRP=1&schKeyword="+urllib.parse.quote(q)
    t=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=20).read().decode("utf-8","replace")
    out=[]
    for m in re.findall(r'<li[^>]*>(.*?)</li>',t,re.S):
        s=re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',m))).strip()
        if ' : ' in s and ('(VT)' in s or '[의학]' in s): out.append(s[:260])
    return out
for q in sys.argv[1:]:
    r=look(q); print("##",q); [print("  ",x) for x in r[:6]]
