import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error("Usage: node maintenance/build_mike_offer_groups.mjs <input.json> <output.js>");
}

const rows = JSON.parse(await readFile(inputPath, "utf8"));
const groups = rows.map(row => {
  const [ship, ...portParts] = row.shipPort.split("\n").map(value => value.trim()).filter(Boolean);
  const roomText = row.benefit.split("\n").at(-1) || "";
  const room = roomText.startsWith("Ocean View") ? "Ocean View"
    : roomText.startsWith("Balcony") ? "Balcony"
      : roomText.startsWith("Interior") ? "Interior"
        : "All Rooms";
  return {
    offer: "26PAS603",
    dates: row.dates.split("\n").map(value => value.trim()).filter(Boolean),
    itin: row.itinerary,
    link: row.href,
    port: portParts.join(" "),
    room,
    ship,
  };
});

const source = `// Jack of all Spades sailing snapshot verified August 29, 2026.\nconst MIKE_26PAS603_SAILING_GROUPS = ${JSON.stringify(groups)};\n`;
await writeFile(outputPath, source);
