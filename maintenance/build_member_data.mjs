import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error("Usage: node maintenance/build_member_data.mjs <input.json> <output.js>");
}

const rows = JSON.parse(await readFile(inputPath, "utf8"));
const groups = rows.map(({ offer, dates, itin, link, port, room, ship }) => ({
  offer,
  dates,
  itin,
  link,
  port,
  room: room.startsWith("Ocean View") ? "Ocean View"
    : room.startsWith("Balcony") ? "Balcony"
      : room.startsWith("Interior") ? "Interior"
        : "All Rooms",
  ship,
}));

const offers = {
  "26TCR107": {"name":"Mega Spins","redeemBy":"2026-11-06","uses":2,"fp":25,"perk":"$25 FreePlay when redeemed through royalcaribbean.com, the Royal Caribbean App, or a Travel Advisor","benefit":"Exclusive stateroom offer (Interior or Ocean View), or apply $350 off an upgraded stateroom","cabinOptions":["Interior","Ocean View"],"comp":true},
  "26TOR909": {"name":"Go for Gold","redeemBy":"2026-10-28","uses":1,"fp":25,"perk":"$25 FreePlay when redeemed online","benefit":"Cruise fare for one plus a discounted cruise fare for your guest","cabinOptions":["Interior"],"comp":true},
  "26TOR808": {"name":"Isle or Nothing","redeemBy":"2026-10-14","uses":1,"fp":25,"perk":"$25 FreePlay when redeemed online","benefit":"Cruise fare for one plus a discounted cruise fare for your guest","cabinOptions":["Interior"],"comp":true},
  "26PAS707": {"name":"2026 Caribbean Chips","redeemBy":"2026-10-28","uses":1,"fp":0,"perk":"","benefit":"Exclusive stateroom offer (Interior room for two), or cruise fare for one plus a discounted cruise fare for your guest (Ocean View)","cabinOptions":["Interior","Ocean View"],"comp":true},
  "26NDS108": {"name":"Winter Wins","redeemBy":"2026-10-30","uses":1,"fp":0,"perk":"","benefit":"Cruise fare for one plus a discounted cruise fare for your guest","cabinOptions":["Ocean View","Interior"],"comp":true},
  "26JKP607": {"name":"Fortune Flash","redeemBy":"2026-10-16","uses":1,"fp":0,"perk":"","benefit":"Interior room for two","cabinOptions":["Interior"],"comp":true},
  "26RCL1007": {"name":"October Monthly Mix","redeemBy":"2026-10-31","uses":1,"fp":25,"perk":"Bonus FP $25","benefit":"Exclusive stateroom offer (Interior room for two), or cruise fare for one plus a discounted cruise fare for your guest (Ocean View)","cabinOptions":["Interior","Ocean View"],"comp":true},
  "26NPR807": {"name":"Suit Escape","redeemBy":"2026-10-21","uses":1,"fp":0,"perk":"","benefit":"Interior room for two","cabinOptions":["Interior"],"comp":true},
  "26SHC607": {"name":"Island Rollers","redeemBy":"2026-10-16","uses":1,"fp":25,"perk":"Bonus FP $25","benefit":"Interior room for two, or cruise fare for one plus a discounted cruise fare for your guest (Ocean View)","cabinOptions":["Interior","Ocean View"],"comp":true},
};

const source = `// Club Royale snapshot for Tully, verified October 8, 2026.\nconst TULLY_OFFERS = ${JSON.stringify(offers)};\nconst TULLY_ROYAL_SAILING_GROUPS = ${JSON.stringify(groups)};\n`;
await writeFile(outputPath, source);
