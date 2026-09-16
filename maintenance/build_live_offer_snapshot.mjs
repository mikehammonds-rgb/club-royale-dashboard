import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath, snapshotDate = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error("Usage: node maintenance/build_live_offer_snapshot.mjs <browser-snapshot.json> <output.js> [snapshot-date]");
}

const snapshot = JSON.parse(await readFile(inputPath, "utf8"));

function roomFromBenefit(text) {
  const detail = text.split("\n").map(value => value.trim()).filter(Boolean).at(-1) || "";
  if (/^Balcony\b/i.test(detail)) return "Balcony";
  if (/^Ocean View\b/i.test(detail)) return "Ocean View";
  if (/^Interior\b/i.test(detail)) return "Interior";
  return "All Rooms";
}

const groups = snapshot.flatMap(offer => offer.groups.map(({ cells, href }) => {
  const [ship, ...portLines] = cells[0].split("\n").map(value => value.trim()).filter(Boolean);
  return {
    offer: offer.code,
    dates: cells[3].split("\n").map(value => value.trim()).filter(Boolean),
    itin: cells[1].trim(),
    link: href || "",
    port: portLines.join(" "),
    room: roomFromBenefit(cells[2]),
    ship
  };
}));

const datedRows = groups.reduce((total, group) => total + group.dates.reduce((count, line) => (
  /^\d{4}$/.test(line) ? count : count + line.split(",").length
), 0), 0);

const output = [
  `// Live eligible sailing groups read from Royal Caribbean on ${snapshotDate}.`,
  "// Dates are expanded into individual cruises by app.js at load time.",
  `const MIKE_ROYAL_SAILING_GROUPS = ${JSON.stringify(groups)};`,
  ""
].join("\n");

await writeFile(outputPath, output);
console.log(JSON.stringify({ offers: snapshot.length, groups: groups.length, datedRows }));
