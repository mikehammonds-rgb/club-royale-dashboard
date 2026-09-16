import { copyFile, mkdir } from 'node:fs/promises';

await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });

for (const file of ['index.html', 'app.js', 'styles.css']) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(`../public/${file}`, import.meta.url));
}

for (const file of ['club-royale-data.js', 'live-sailing-groups.js', 'mike-26pas603.js', 'booked-cruises.js', 'tully-data.js', 'member-profiles.js']) {
  await copyFile(new URL(`../data/${file}`, import.meta.url), new URL(`../public/data/${file}`, import.meta.url));
}
