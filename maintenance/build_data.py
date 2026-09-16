import json, re
from datetime import date, timedelta

MONTHS = {m: i+1 for i, m in enumerate(
    ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])}

def parse_dates(spec):
    """'2026: Sep 14, 21, Oct 5; 2027: Jan 4, 11' -> [date,...]"""
    out = []
    for chunk in spec.split(";"):
        chunk = chunk.strip()
        year_s, rest = chunk.split(":", 1)
        year = int(year_s.strip())
        month = None
        for tok in [t.strip() for t in rest.split(",")]:
            m = re.match(r"^([A-Z][a-z]{2})\s+(\d{1,2})$", tok)
            if m:
                month = MONTHS[m.group(1)]
                out.append(date(year, month, int(m.group(2))))
            elif re.match(r"^\d{1,2}$", tok):
                assert month, f"day with no month: {tok} in {spec}"
                out.append(date(year, month, int(tok)))
            else:
                raise ValueError(f"bad token {tok!r} in {spec!r}")
    return out

# offer meta: code -> (name, redeemBy, uses, bonusFP, perk)
OFFERS = {
  "26TOR504": ("Odds on Wins", "2026-09-04", 2, 0,
               "$100 FreePlay when redeemed online, in the app, or via a Travel Advisor"),
  "26VAR504": ("Award Winning Oasis Class", "2026-09-11", 1, 0, ""),
  "26MIX504": ("King of Spades", "2026-09-10", 1, 75, ""),
  "26EST204": ("East Coast Action", "2026-09-09", 1, 0, ""),
  "26OCT105": ("October Opener", "2026-09-08", 1, 0, ""),
  "26PAS403": ("Caribbean Chips", "2026-08-25", 1, 50, ""),
  "26RCL804": ("August Monthly Mix", "2026-08-31", 1, 50, ""),
  "26BAF306": ("California Winners", "2026-09-07", 1, 0, ""),
  "26BAF206": ("Odds on the Ocean: Two Room Offer", "2026-08-25", 1, 0, ""),
  "26TOR604": ("2026 Play Your Way", "2026-09-15", 2, 75,
               "$75 FreePlay when redeemed online, in the app, or via a Travel Advisor"),
  "26TOR404": ("Winning Plays", "2026-09-02", 2, 0, ""),
}

OASIS = {"Oasis","Allure","Harmony","Wonder","Utopia","Symphony"}
MIA, FLL, PCN, TPA = "Miami", "Fort Lauderdale", "Orlando (Port Canaveral)", "Tampa"

# (offer, ship, port, itinerary, nights, room, datespec, inferred_nights)
R = []
def add(o, ship, port, it, n, room, spec, inferred=False):
    R.append((o, ship, port, it, n, room, spec, inferred))

# ---------------- 26TOR504 ----------------
o="26TOR504"
add(o,"Wonder",MIA,"4-Night Perfect Day at CocoCay & Bahamas",4,"Ocean View","2026: Sep 14, 21, 28, Oct 5, 19, 26, Nov 30")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Sep 18, 25, Oct 9, Dec 21")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Ocean View","2026: Oct 2, 16, 30, Nov 27, Dec 4, 11")
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Oct 12, Nov 16, Dec 7")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Oct 23, Nov 6, Dec 18")
add(o,"Wonder",MIA,"4-Night Perfect Day at CocoCay & Bahamas",4,"Balcony","2026: Nov 2, Dec 14")
add(o,"Wonder",MIA,"3-Night Perfect Day Getaway",3,"Balcony","2026: Nov 20")
add(o,"Harmony",PCN,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Sep 15, Nov 10")
add(o,"Harmony",PCN,"5-Night Western Caribbean & Perfect Day",5,"Interior","2026: Sep 26")
add(o,"Harmony",PCN,"2-Night Perfect Day Getaway",2,"Interior","2026: Oct 1")
add(o,"Harmony",PCN,"5-Night Bahamas & Perfect Day",5,"Interior","2026: Oct 3, 24, 31")
add(o,"Harmony",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Oct 13")
add(o,"Harmony",PCN,"2-Night Perfect Day Getaway",2,"Balcony","2026: Oct 29")
add(o,"Utopia",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Sep 21, Oct 19, Nov 9, 30")
add(o,"Allure",FLL,"6-Night Western Caribbean & Perfect Day",6,"Interior","2026: Oct 11")
add(o,"Allure",FLL,"7-Night Perfect Day at CocoCay & Caribbean",7,"Interior","2026: Oct 25")
add(o,"Allure",MIA,"7-Night Eastern Caribbean & Perfect Day",7,"Interior","2026: Nov 1, 8")
add(o,"Allure",MIA,"7-Night Caribbean & Perfect Day",7,"Ocean View","2026: Nov 15, 29")
add(o,"Allure",MIA,"7-Night Eastern Caribbean Cruise",7,"Interior","2026: Dec 6")
add(o,"Allure",MIA,"7-Night Caribbean & Perfect Day",7,"Interior","2026: Dec 13")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Ocean View","2026: Nov 6, 13, Dec 4")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Balcony","2026: Nov 9, Dec 14")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Nov 16, Dec 7")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Nov 20, 27, Dec 18")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 23, 30")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Dec 11")

# ---------------- 26VAR504 ----------------
o="26VAR504"
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Oct 19, 26, Nov 30; 2027: Jan 4, 11")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Ocean View","2027: Jan 8, 15, 22, 29")
add(o,"Allure",MIA,"3-Night Bahamas & Perfect Day",3,"Ocean View","2027: Jan 18, 29")

# ---------------- 26MIX504 (night counts inferred) ----------------
o="26MIX504"
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Oct 5, 19, 26, Nov 2",True)
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Oct 23, Nov 6, 20, Dec 18",True)
add(o,"Harmony",PCN,"2-Night Perfect Day Getaway",2,"Balcony","2026: Oct 29",True)
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Nov 9, 16, Dec 7, 14",True)
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Nov 20, 27, Dec 18",True)

# ---------------- 26EST204 ----------------
o="26EST204"
add(o,"Harmony",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Sep 15, Oct 13, Nov 10")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Sep 18, Oct 2, 16, 30, Dec 4, 11")
add(o,"Utopia",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Sep 21, Oct 19, Nov 9, 30")
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Sep 21, 28, Oct 5, 12, 19, 26, Nov 2, 16, 30, Dec 7, 14")
add(o,"Allure",FLL,"6-Night Western Caribbean & Perfect Day",6,"Interior","2026: Sep 27, Oct 11")
add(o,"Harmony",PCN,"2-Night Perfect Day Getaway",2,"Balcony","2026: Oct 1, 29")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Oct 23, Nov 6, Dec 18")
add(o,"Allure",MIA,"7-Night Perfect Day at CocoCay & Caribbean",7,"Interior","2026: Oct 25")
add(o,"Allure",MIA,"7-Night Eastern Caribbean & Perfect Day",7,"Interior","2026: Nov 1, 8")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 9, 16, 23, 30, Dec 7, 14")
add(o,"Allure",MIA,"7-Night Caribbean & Perfect Day",7,"Interior","2026: Nov 15, 29, Dec 13")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Nov 20, 27, Dec 18")
add(o,"Wonder",MIA,"3-Night Perfect Day Getaway",3,"Balcony","2026: Nov 20")
add(o,"Allure",MIA,"7-Night Eastern Caribbean Cruise",7,"Interior","2026: Dec 6")

# ---------------- 26OCT105 ----------------
o="26OCT105"
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Oct 2, 16, 23, 30")
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Oct 5, 12, 19, 26")

# ---------------- 26PAS403 ----------------
o="26PAS403"
add(o,"Allure",MIA,"7-Night Eastern Caribbean & Perfect Day",7,"Interior","2026: Nov 1, 8")
add(o,"Wonder",MIA,"4-Night Perfect Day at CocoCay & Bahamas",4,"Balcony","2026: Nov 2, 16, Dec 7")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Nov 6, 13, 20, Dec 18")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Nov 6, Dec 18")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Balcony","2026: Nov 9, 16, 30, Dec 7, 14")
add(o,"Utopia",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 9, 16, 30, Dec 7")
add(o,"Harmony",PCN,"4-Night Bahamas & Perfect Day",4,"Balcony","2026: Nov 10")
add(o,"Allure",MIA,"7-Night Caribbean & Perfect Day",7,"Balcony","2026: Nov 15, 29")
add(o,"Wonder",MIA,"3-Night Perfect Day Getaway",3,"Ocean View","2026: Nov 20")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 23")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Ocean View","2026: Nov 27, Dec 4, 11")
add(o,"Wonder",MIA,"3-Night Perfect Day at CocoCay & Bahamas",3,"Interior","2026: Nov 27")
add(o,"Wonder",MIA,"4-Night Perfect Day at CocoCay & Bahamas",4,"Ocean View","2026: Nov 30, Dec 14")
add(o,"Wonder",MIA,"3-Night Perfect Day at CocoCay & Bahamas",3,"Ocean View","2026: Dec 4, 11, 21")
add(o,"Allure",MIA,"7-Night Eastern Caribbean Cruise",7,"Interior","2026: Dec 6")
add(o,"Harmony",PCN,"7-Night Eastern Caribbean & Perfect Day",7,"Interior","2026: Dec 12")
add(o,"Allure",MIA,"7-Night Caribbean & Perfect Day",7,"Ocean View","2026: Dec 13")
add(o,"Freedom",MIA,"4-Night Eastern Caribbean Cruise",4,"Ocean View","2026: Dec 17")
add(o,"Radiance",TPA,"7-Night Perfect Day at CocoCay & Caribbean Holiday",7,"Interior","2026: Dec 19")
add(o,"Enchantment",TPA,"7-Night Western Caribbean Holiday",7,"Interior","2026: Dec 20")
add(o,"Freedom",MIA,"5-Night Western Caribbean Holiday",5,"Interior","2026: Dec 21")

# ---------------- 26TOR604 (reappeared Aug 23, 2026 after removal Aug 21) ----------------
o="26TOR604"
add(o,"Wonder",MIA,"4-Night Perfect Day at CocoCay & Bahamas",4,"Balcony","2026: Nov 2; 2027: Jan 4, 11, Feb 22, Mar 1, Apr 12, 19, 26")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Nov 6, 27, Dec 11; 2027: Mar 19")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Nov 6, Dec 4, 21; 2027: Mar 5, 12, 26")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Balcony","2026: Nov 9; 2027: Jan 4, 11, 18, 25, Feb 8, 15, Mar 8, 15, 22, 29, Apr 5, 12, 19")
add(o,"Harmony",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 10")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Ocean View","2026: Nov 13, 20, Dec 4, 18")
add(o,"Allure",MIA,"7-Night Caribbean & Perfect Day",7,"Ocean View","2026: Nov 15, 29")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Nov 16, Dec 7, 14")
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 16, Dec 7, 14")
add(o,"Wonder",MIA,"3-Night Perfect Day Getaway",3,"Interior","2026: Nov 20; 2027: Mar 19")
add(o,"Wonder",MIA,"3-Night Perfect Day at CocoCay & Bahamas",3,"Ocean View","2026: Nov 27, Dec 11; 2027: Jan 8, Feb 19, 26, Apr 2, 9, 16, 23, 30")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 30")
add(o,"Wonder",MIA,"4-Night Perfect Day at CocoCay & Bahamas",4,"Ocean View","2026: Nov 30; 2027: Jan 15, Feb 15, Mar 8, 15, 22, 29, Apr 5")
add(o,"Wonder",MIA,"3-Night Perfect Day at CocoCay & Bahamas",3,"Balcony","2026: Dec 18")
add(o,"Allure",MIA,"4-Night Western Caribbean Cruise",4,"Ocean View","2027: Jan 10")
add(o,"Allure",MIA,"3-Night Bahamas & Perfect Day",3,"Ocean View","2027: Jan 18, 29, Feb 5")
add(o,"Allure",MIA,"4-Night Bahamas & Perfect Day",4,"Ocean View","2027: Jan 25, Feb 1")
add(o,"Utopia",PCN,"4-Night Perfect Day CocoCay & Bahamas",4,"Interior","2027: Feb 1")
add(o,"Oasis",FLL,"5-Night Perfect Day at CocoCay & Caribbean",5,"Interior","2027: Apr 23")
add(o,"Harmony",PCN,"7-Night Perfect Day at CocoCay & Caribbean",7,"Ocean View","2027: May 8")

# ---------------- 26TOR404 (reappeared Aug 23, 2026 after removal Aug 21) ----------------
o="26TOR404"
add(o,"Harmony",PCN,"5-Night Western Caribbean & Perfect Day",5,"Interior","2026: Sep 5, 26")
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Balcony","2026: Sep 7, Nov 2, Dec 14; 2027: Jan 4, 11, 15, Feb 15, 22")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Sep 11, 18, 25, Oct 9, Dec 4, 21")
add(o,"Wonder",MIA,"4-Night Perfect Day CocoCay & Bahamas",4,"Ocean View","2026: Sep 14, 21, 28, Oct 5, 19, 26, Nov 16, 30")
add(o,"Harmony",PCN,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Sep 15, Nov 10")
add(o,"Utopia",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Sep 21, Oct 19, Nov 9, 30; 2027: Jan 4, 11, 25, Feb 1, 8, 22")
add(o,"Harmony",PCN,"2-Night Perfect Day Getaway",2,"Interior","2026: Oct 1")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Ocean View","2026: Oct 2, 16, 30, Nov 27, Dec 11; 2027: Jan 8, Feb 19, 26")
add(o,"Harmony",PCN,"5-Night Bahamas & Perfect Day",5,"Interior","2026: Oct 3, 24, 31")
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Oct 12, Dec 7")
add(o,"Harmony",PCN,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Oct 13; 2027: Jan 5")
add(o,"Wonder",MIA,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Oct 23, Nov 6, Dec 18")
add(o,"Harmony",PCN,"2-Night Perfect Day Getaway",2,"Balcony","2026: Oct 29")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Ocean View","2026: Nov 6, 13, Dec 4; 2027: Feb 12")
add(o,"Allure",MIA,"7-Night Eastern Caribbean & Perfect Day",7,"Interior","2026: Nov 8")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Balcony","2026: Nov 9, Dec 14; 2027: Jan 4, 11, 18, 25, Feb 1, 8, 15, 22")
add(o,"Allure",MIA,"7-Night Caribbean & Perfect Day",7,"Ocean View","2026: Nov 15")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Nov 16, Dec 7")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Balcony","2026: Nov 20, 27, Dec 18; 2027: Jan 8, 15, 22, 29, Feb 5, 19, 26")
add(o,"Wonder",MIA,"3-Night Perfect Day Getaway",3,"Balcony","2026: Nov 20")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Interior","2026: Nov 23, 30")
add(o,"Allure",MIA,"7-Night Eastern Caribbean Cruise",7,"Interior","2026: Dec 6")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Interior","2026: Dec 11")
add(o,"Allure",MIA,"3-Night Bahamas & Perfect Day",3,"Balcony","2027: Jan 18, 29, Feb 5")
add(o,"Allure",MIA,"4-Night Bahamas & Perfect Day",4,"Balcony","2027: Jan 25, Feb 1")
add(o,"Harmony",PCN,"2-Night Perfect Day Getaway",2,"Ocean View","2027: Feb 18")
add(o,"Allure",MIA,"7-Night Eastern Caribbean & Perfect Day",7,"Interior","2027: Apr 11")
add(o,"Oasis",FLL,"9-Night Ft. Lauderdale To Cape Liberty",9,"Interior","2027: Apr 28")

# ---------------- 26RCL804 ----------------
o="26RCL804"
add(o,"Wonder",MIA,"4-Night Bahamas & Perfect Day",4,"Ocean View","2026: Sep 7, 21, Oct 19, Nov 30; 2027: Jan 11, 15, Feb 22, Mar 8")
add(o,"Wonder",MIA,"3-Night Perfect Day at CocoCay & Bahamas",3,"Ocean View","2026: Nov 27, Dec 11")
add(o,"Oasis",FLL,"4-Night Bahamas & Perfect Day",4,"Balcony","2027: Jan 4, 18, 25, Feb 1, 8, 22, Mar 1, 8")
add(o,"Oasis",FLL,"3-Night Bahamas & Perfect Day",3,"Ocean View","2027: Jan 8, 15, 22, 29, Feb 5, 19, 26, Mar 5")
add(o,"Brilliance",FLL,"4-Night Bahamas Getaway",4,"Balcony","2026: Dec 14")
add(o,"Adventure",FLL,"6-Night Western Caribbean",6,"Ocean View","2026: Dec 13")



# ---------------- expand ----------------
ROOM_RANK = {"Interior": 1, "Ocean View": 2, "Balcony": 3}
sailings = []
for (code, ship, port, it, nights, room, spec, inferred) in R:
    name, redeem, uses, fp, perk = OFFERS[code]
    for d in parse_dates(spec):
        ret = d + timedelta(days=nights)
        tier = 1 if (ship in OASIS and port != TPA) else 2
        sailings.append({
            "offer": code, "ship": ship, "port": port, "itin": it,
            "nights": nights, "room": room,
            "depart": d.isoformat(), "return": ret.isoformat(),
            "tier": tier, "fp": fp,
            "score": ROOM_RANK[room] * 25 + fp,
            **({"inferred": True} if inferred else {})
        })

sailings.sort(key=lambda s: (s["depart"], s["offer"], s["ship"]))

BENEFITS = {
  "26TOR504": "Room for two, or apply $750 off an upgraded stateroom",
  "26VAR504": "Balcony or Oceanview room for two",
  "26MIX504": "Balcony or Oceanview room for two",
  "26EST204": "Balcony or Interior room for two",
  "26OCT105": "Oceanview or Interior room for two",
  "26PAS403": "Room for two",
  "26RCL804": "Balcony or Oceanview room for two",
  "26BAF306": "Ocean View or Interior room for two, plus a bonus interior room for guests",
  "26BAF206": "Interior room for two, plus a bonus interior room for guests",
  "26TOR604": "Room for two, or apply $750 off an upgraded stateroom",
  "26TOR404": "Room for two, or apply $800 off your choice of stateroom",
}
offers_out = {c: {"name": n, "redeemBy": r, "uses": u, "fp": f, "perk": p,
                  "benefit": BENEFITS[c]}
              for c, (n, r, u, f, p) in OFFERS.items()}

with open("/tmp/outputs/_data.js", "w") as fh:
    fh.write("const OFFERS = " + json.dumps(offers_out, indent=0, separators=(",", ":")) + ";\n")
    fh.write("const SAILINGS = " + json.dumps(sailings, separators=(",", ":")) + ";\n")

print("sailings:", len(sailings))
print("tier1:", sum(1 for s in sailings if s["tier"] == 1),
      "tier2:", sum(1 for s in sailings if s["tier"] == 2))
print("offers with sailings:", len({s["offer"] for s in sailings}))
print("date range:", sailings[0]["depart"], "->", sailings[-1]["depart"])
xmas = [s for s in sailings if s["depart"] <= "2026-12-25" <= s["return"]]
print("aboard on Christmas:", [(s["offer"], s["ship"], s["depart"], s["return"], s["tier"]) for s in xmas])
