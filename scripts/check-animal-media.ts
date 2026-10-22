// Checks that every photo and sound the animal game links on Wikimedia Commons still answers:
// a linked file can be renamed or deleted there. Run by hand: bun run check:media.
import { ANIMALS } from "../src/games/animals/data/animals";

// Wikimedia asks scripts for a User-Agent that says who they are, and rate-limits the rest.
const USER_AGENT = "kids-portal-media-check/1.0 (https://github.com/legrak/kids-portal)";
const PAUSE_MS = 1000;

async function check(url: string, expectedType: string): Promise<string | null> {
  for (let attempt = 1; ; attempt++) {
    await Bun.sleep(PAUSE_MS);
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Range: "bytes=0-0" },
    });
    await response.arrayBuffer();
    if (response.status === 429 && attempt < 5) {
      await Bun.sleep(10_000 * attempt);
      continue;
    }
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok) return `HTTP ${response.status}`;
    return type.startsWith(expectedType) ? null : `unexpected type ${type}`;
  }
}

let failures = 0;
for (const animal of ANIMALS) {
  for (const [what, url, type] of [
    ["photo", animal.photo.url, "image/"],
    ["sound", animal.sound.url, "audio/"],
  ] as const) {
    const problem = await check(url, type);
    if (problem) {
      failures++;
      console.error(`${animal.id} ${what}: ${problem} ${url}`);
    }
  }
}
console.log(failures ? `${failures} broken links` : `All ${ANIMALS.length * 2} links answer.`);
process.exit(failures ? 1 : 0);
