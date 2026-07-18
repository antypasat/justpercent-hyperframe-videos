// Mirror configs.js into configs/*.json (one file per version).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(ROOT, "configs"), { recursive: true });

const window = {};
new Function("window", readFileSync(join(ROOT, "configs.js"), "utf8"))(window);

for (const cfg of Object.values(window.CJ_CONFIGS)) {
  const file = join(ROOT, "configs", `${cfg.name}.json`);
  writeFileSync(file, JSON.stringify(cfg, null, 2));
  console.log(`wrote configs/${cfg.name}.json`);
}
