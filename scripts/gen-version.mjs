// Writes public/version.json with the current build identifier so the
// running app can detect when a new deploy is live and prompt users to
// reload. Run automatically before every `vite build` (see package.json
// "prebuild" / "prebuild:dev" scripts).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public");
const outFile = resolve(outDir, "version.json");

// Vercel exposes the git SHA; fall back to a timestamp for local builds.
const version =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GIT_COMMIT_SHA ||
  String(Date.now());

mkdirSync(outDir, { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify({ version, builtAt: new Date().toISOString() }, null, 2) + "\n",
);

console.log(`[gen-version] wrote ${outFile} → ${version}`);
