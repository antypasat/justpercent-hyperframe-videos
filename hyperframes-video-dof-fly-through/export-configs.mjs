// Mirrors configs.js into configs/*.json (the JSON deliverables).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
await import(join(ROOT, "configs.js"));

mkdirSync(join(ROOT, "configs"), { recursive: true });
for (const [key, cfg] of Object.entries(window.DOF_CONFIGS)) {
  const file = join(ROOT, "configs", `${cfg.name}.json`);
  writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
  console.log(`${key} -> configs/${cfg.name}.json`);
}
