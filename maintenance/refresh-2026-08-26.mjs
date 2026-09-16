import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../data/live-sailing-groups.js", import.meta.url);
const source = await readFile(sourcePath, "utf8");
const match = source.match(/const ROYAL_SAILING_GROUPS = (\[[\s\S]*\]);\s*$/);

if (!match) throw new Error("Could not read the existing sailing groups.");

const existing = JSON.parse(match[1]);
const rows = JSON.parse(await readFile("/private/tmp/autumn_rows.json", "utf8"));

const autumnGroups = rows.map(({ cells, links }) => {
  const [ship, ...portLines] = cells[0].split("\n").map(value => value.trim()).filter(Boolean);
  const benefitLines = cells[2].split("\n").map(value => value.trim()).filter(Boolean);
  const dateLines = cells[3].split("\n").map(value => value.trim()).filter(Boolean);
  const roomText = benefitLines.at(-1) || "Interior";
  const room = roomText.startsWith("Balcony")
    ? "Balcony"
    : roomText.startsWith("Ocean View")
      ? "Ocean View"
      : "Interior";

  return {
    offer: "26QFP204",
    dates: dateLines,
    itin: cells[1].trim(),
    link: links[0]?.href || "",
    port: portLines.join(" "),
    room,
    ship
  };
});

const active = existing.filter(group => !["26PAS403", "26BAF206", "26QFP204"].includes(group.offer));
const refreshed = [...active, ...autumnGroups];
const expandedRows = refreshed.reduce((total, group) => total + group.dates.reduce((count, line) => (
  /^\d{4}$/.test(line) ? count : count + line.split(",").length
), 0), 0);
const output = [
  "// Live eligible sailing groups read from Royal Caribbean on August 26, 2026.",
  "// Dates are expanded into individual cruises by app.js at load time.",
  `const ROYAL_SAILING_GROUPS = ${JSON.stringify(refreshed)};`,
  ""
].join("\n");

await writeFile(sourcePath, output);
console.log(JSON.stringify({
  removedGroups: existing.length - active.length,
  addedGroups: autumnGroups.length,
  totalGroups: refreshed.length,
  expandedRows
}));
