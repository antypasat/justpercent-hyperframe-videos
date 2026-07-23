// Generates caption clip <div>s from per-clip word timing JSON.
// Groups: max 3 words, break on sentence punctuation or >0.45s gap.
import { readFileSync, writeFileSync } from "fs";

const CLIPS = [
  { file: "assets/A1.words.json", offset: 0 },
  { file: "assets/B1.words.json", offset: 14.07 },
  { file: "assets/C1.words.json", offset: 36.72 }
];

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const groups = [];
for (const { file, offset } of CLIPS) {
  const words = JSON.parse(readFileSync(file, "utf8"));
  let group = [];
  const flush = () => {
    if (!group.length) return;
    groups.push({
      start: Math.max(0, group[0].start - 0.06) + offset,
      end: group[group.length - 1].end + 0.12 + offset,
      text: group.map((w) => w.text).join(" ")
    });
    group = [];
  };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = group[group.length - 1];
    if (prev && (w.start - prev.end > 0.45 || group.length >= 3)) flush();
    group.push(w);
    if (/[.!?…]$/.test(w.text) || /,$/.test(w.text)) flush();
  }
  flush();
}
// clamp ends so same-track clips never overlap
for (let i = 0; i < groups.length - 1; i++) {
  if (groups[i].end > groups[i + 1].start) groups[i].end = groups[i + 1].start;
}
const out = groups.map(
  (g, i) =>
    `      <div id="cap-${i}" class="clip caption" data-start="${g.start.toFixed(2)}" data-duration="${Math.max(0.3, g.end - g.start).toFixed(2)}" data-track-index="3"><span>${esc(g.text)}</span></div>`
);
writeFileSync("captions.html", out.join("\n") + "\n");
console.log(`wrote ${out.length} caption clips to captions.html`);
