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
  "26TOR608": { name: "Play Your Way", redeemBy: "2026-09-15", uses: 1, fp: 0, perk: "", benefit: "Cruise fare for one plus a discounted cruise fare for your guest", comp: true },
  "26TOR508": { name: "Odds on Wins", redeemBy: "2026-09-04", uses: 1, fp: 0, perk: "", benefit: "Cruise fare for one plus a discounted cruise fare for your guest", comp: true },
  "26TOR408": { name: "Winning Plays", redeemBy: "2026-09-02", uses: 1, fp: 0, perk: "", benefit: "Cruise fare for one plus a discounted cruise fare for your guest", comp: true },
  "26PAS607": { name: "Jack of all Spades", redeemBy: "2026-09-16", uses: 1, fp: 25, perk: "", benefit: "Room for two or cruise fare for one plus a discounted rate for your guest", comp: true },
  "26QFP207": { name: "Autumn Showdown", redeemBy: "2026-09-16", uses: 1, fp: 25, perk: "", benefit: "Room for two or cruise fare for one plus a discounted fare for your guest", comp: true },
  "26VAR507": { name: "Award Winning Oasis Class", redeemBy: "2026-09-11", uses: 1, fp: 0, perk: "", benefit: "Room for two or cruise fare for one plus a discounted fare for your guest", comp: true },
  "26PAS507": { name: "Dealer's Roll", redeemBy: "2026-08-28", uses: 1, fp: 25, perk: "", benefit: "Cruise fare for two or cruise fare for one plus a discounted rate for your guest", comp: true },
  "26MIX508": { name: "King of Spades", redeemBy: "2026-09-10", uses: 1, fp: 25, perk: "", benefit: "Cruise fare for one plus a discounted cruise fare for your guest", comp: true },
  "26EST207": { name: "East Coast Action", redeemBy: "2026-09-09", uses: 1, fp: 0, perk: "", benefit: "Interior room for two or cruise fare for one plus a discounted cruise fare for your guest", comp: true },
  "26OCT108": { name: "October Opener", redeemBy: "2026-09-08", uses: 1, fp: 0, perk: "", benefit: "Cruise fare for one plus a discounted cruise fare for your guest", comp: true },
  "26RCL807": { name: "August Monthly Mix", redeemBy: "2026-08-31", uses: 1, fp: 25, perk: "", benefit: "Room for two or cruise fare for one plus a discounted fare for your guest", comp: true },
  "26FRP109": { name: "Freeplay Offer", redeemBy: "2026-08-28", uses: 1, fp: 25, perk: "$25 FreePlay", benefit: "$25 FreePlay only — cruise fare is not included", comp: false },
};

const source = `// Club Royale snapshot for Tully, verified August 27, 2026.\nconst TULLY_OFFERS = ${JSON.stringify(offers)};\nconst TULLY_ROYAL_SAILING_GROUPS = ${JSON.stringify(groups)};\n`;
await writeFile(outputPath, source);
