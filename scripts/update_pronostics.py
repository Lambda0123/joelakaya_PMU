import json, re, datetime, requests
from bs4 import BeautifulSoup
from pathlib import Path

# IMPORTANT:
# This updater only reads public pages. It does not bypass paywalls, CAPTCHAs
# or anti-bot protections. Website layouts can change, so extraction must be
# maintained when a source changes its HTML.
DATA = Path("data/pronostics.json")
d = json.loads(DATA.read_text(encoding="utf-8"))

HEADERS={"User-Agent":"Mozilla/5.0 (compatible; JoelakayaPMU/1.0)"}

# Keep source URLs visible in the JSON. For a robust production feed, prefer
# a licensed/API data provider when available.
for src in d["sources"]:
    try:
        r=requests.get(src["url"],headers=HEADERS,timeout=20)
        r.raise_for_status()
        soup=BeautifulSoup(r.text,"html.parser")
        text=" ".join(soup.stripped_strings)
        # Conservative extraction: look for runs of 8 distinct horse numbers.
        candidates=[]
        for m in re.finditer(r'(?<!\d)((?:\d{1,2}\s+){7}\d{1,2})(?!\d)',text):
            nums=[int(x) for x in m.group(1).split()]
            if len(nums)==8 and len(set(nums))==8 and all(1<=x<=30 for x in nums):
                candidates.append(nums)
        if candidates:
            src["pronostic"]=candidates[0]
        src["last_checked"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
    except Exception as e:
        src["error"]=str(e)

DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding="utf-8")
