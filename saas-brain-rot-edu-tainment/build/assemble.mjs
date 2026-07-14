// Assemble index.html from src/ parts + prepared snapshots.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let html = read('src/index.template.html');
html = html.replace('/* __STAGE_CSS__ */', () => read('src/stage.css'));
html = html.replace('/* __APP_CSS__ */', () => read('src/app.css'));
html = html.replace('/* __TIMELINE_JS__ */', () => read('src/timeline.js'));

for (const m of [...html.matchAll(/<!-- __SNAP_([a-z0-9-]+)__ -->/g)]) {
  const frag = read('src/snapshots/' + m[1] + '.html');
  html = html.replace(m[0], () => frag);
}

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('index.html written:', (html.length / 1024 / 1024).toFixed(2), 'MB');
