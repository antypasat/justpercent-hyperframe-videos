// Prepare captured DOM states for the composition.
// - Flattens @media queries at 432x900 (mobile capture viewport)
// - Scopes all selectors under .jp-html / .jp-body so many page states coexist
// - Rewrites font URLs to local @fontsource woff2 copies, images to assets/images/
// - Emits src/app.css (deduped union) and src/snapshots/<state>.html fragments
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HP = '/sessions/modest-wonderful-curie/mnt/percentage-calculator/handy-percent';
const postcss = (await import(HP + '/node_modules/.pnpm/postcss@8.5.3/node_modules/postcss/lib/postcss.mjs')).default;
const { parse: parseHTML } = await import(HP + '/node_modules/node-html-parser/dist/index.js').then(m => m.default || m);

const STATES = [
  'home-light', 'home-light-search', 'home-light-pinned',
  'calc-decreased-light', 'calc-decreased-dark', 'calc-decreased-dark-pinned',
  'faqs-dark', 'faq-salary-dark', 'faq-salary-dark-8',
];

const VW = 432, VH = 900;

// ---------- media query evaluation ----------
function evalCondition(cond) {
  // returns true (keep, unwrap), false (drop), or null (keep wrapped as-is)
  cond = cond.trim().toLowerCase();
  if (cond === 'print') return false;
  if (cond === 'screen' || cond === 'all' || cond === '') return true;
  // split on 'and'
  let ok = true;
  for (let part of cond.split(/\band\b/)) {
    part = part.trim().replace(/^screen\s*/, '').trim();
    if (!part || part === 'screen' || part === 'all') continue;
    const m = part.match(/^\(\s*([a-z-]+)\s*(?::\s*([^)]+))?\)$/);
    if (!m) return null;
    const [, feat, valRaw] = m;
    const val = (valRaw || '').trim();
    const px = v => parseFloat(v);
    switch (feat) {
      case 'min-width': if (!(VW >= px(val))) ok = false; break;
      case 'max-width': if (!(VW <= px(val))) ok = false; break;
      case 'min-height': if (!(VH >= px(val))) ok = false; break;
      case 'max-height': if (!(VH <= px(val))) ok = false; break;
      case 'orientation': if (val !== 'portrait') ok = false; break;
      case 'hover': if (val !== 'none') ok = false; break;
      case 'any-hover': if (val !== 'none') ok = false; break;
      case 'pointer': if (val !== 'coarse') ok = false; break;
      case 'any-pointer': if (val !== 'coarse') ok = false; break;
      case 'prefers-reduced-motion': if (val !== 'no-preference') ok = false; break;
      case 'prefers-color-scheme': ok = false; break; // theme is class-driven in this app
      case 'prefers-contrast': if (val !== 'no-preference') ok = false; break;
      case 'display-mode': if (val !== 'browser') ok = false; break;
      case 'forced-colors': if (val !== 'none') ok = false; break;
      default: return null;
    }
    if (!ok) return false;
  }
  return ok;
}

// media list: comma = OR
function evalMediaList(params) {
  const parts = params.split(',');
  let anyNull = false;
  for (const p of parts) {
    const r = evalCondition(p);
    if (r === true) return true;
    if (r === null) anyNull = true;
  }
  return anyNull ? null : false;
}

// ---------- selector scoping ----------
function scopeSelector(sel) {
  sel = sel.trim();
  if (!sel) return null;
  if (sel.startsWith('@')) return sel;
  // pseudo-page rules etc.
  if (/^(from|to|\d+%)$/.test(sel)) return sel; // keyframe steps
  let s = sel;
  s = s.replace(/:root/g, '.jp-html');
  s = s.replace(/(^|[\s>+~(])html(?![\w-])/g, '$1.jp-html');
  s = s.replace(/(^|[\s>+~(])body(?![\w-])/g, '$1.jp-body');
  // starts with * ?
  if (/^\*(?![\w-])/.test(s)) {
    const rest = s.slice(1);
    return `.jp-html${rest}, .jp-html *${rest}`;
  }
  if (/^::(before|after|selection|placeholder|marker|backdrop)/.test(s)) {
    return `.jp-html *${s}, .jp-html${s}`;
  }
  if (s.startsWith('.jp-html') || s.startsWith('.jp-body')) return s;
  return `.jp-html ${s}`;
}

function scopeRule(rule) {
  if (!rule.selector) return;
  const out = [];
  for (const sel of rule.selectors) {
    const sc = scopeSelector(sel);
    if (sc) out.push(sc);
  }
  rule.selector = out.join(', ');
}

// ---------- font handling ----------
const FONT_DIR = path.join(ROOT, 'fonts');
fs.mkdirSync(FONT_DIR, { recursive: true });
const fontFamilies = { 'space-grotesk': 'space-grotesk', 'ibm-plex-sans': 'ibm-plex-sans', 'jetbrains-mono': 'jetbrains-mono' };
const copiedFonts = new Set();

function rewriteFontFace(atRuleOrRule) {
  // returns false if the @font-face should be dropped
  let family = '', srcDecl = null, keep = true;
  atRuleOrRule.walkDecls(d => {
    if (d.prop === 'font-family') family = d.value.replace(/['"]/g, '');
    if (d.prop === 'src') srcDecl = d;
  });
  if (/^katex/i.test(family)) return false;
  if (!srcDecl) return false;
  const m = srcDecl.value.match(/url\(["']?\/assets\/([a-z0-9-]+-\d+-normal)\.[A-Za-z0-9_-]+\.woff2["']?\)/i);
  if (!m) {
    // unknown font source; keep only data-uri faces
    return /data:/.test(srcDecl.value);
  }
  const base = m[1]; // e.g. space-grotesk-latin-ext-300-normal
  const fam = Object.keys(fontFamilies).find(f => base.startsWith(f + '-'));
  if (!fam) return false;
  const fname = `${base}.woff2`;
  const srcFile = `${HP}/node_modules/@fontsource/${fam}/files/${fname}`;
  if (!fs.existsSync(srcFile)) return false;
  if (!copiedFonts.has(fname)) {
    fs.copyFileSync(srcFile, path.join(FONT_DIR, fname));
    copiedFonts.add(fname);
  }
  srcDecl.value = `url("fonts/${fname}") format("woff2")`;
  return true;
}

// ---------- css processing ----------
const seen = new Set();
const outCss = [];

function processCss(cssText) {
  let rootNode;
  try { rootNode = postcss.parse(cssText); } catch (e) { console.error('css parse fail', e.message); return; }
  const emit = [];

  function handleRule(rule) {
    if (rule.type === 'rule') {
      scopeRule(rule);
      return rule;
    }
    return rule;
  }

  rootNode.each(node => {
    if (node.type === 'atrule') {
      const name = node.name.toLowerCase();
      if (name === 'media') {
        const r = evalMediaList(node.params);
        if (r === false) return;
        if (r === true) {
          node.each(child => { if (child.type === 'rule') handleRule(child); if (child.type==='atrule') child.walkRules(handleRule); emit.push(child); });
          return;
        }
        node.walkRules(handleRule);
        emit.push(node);
        return;
      }
      if (name === 'font-face') { if (rewriteFontFace(node)) emit.push(node); return; }
      if (name === 'keyframes' || name === '-webkit-keyframes') { emit.push(node); return; }
      if (name === 'supports') { node.walkRules(handleRule); emit.push(node); return; }
      if (name === 'import' || name === 'charset') return;
      if (name === 'layer') { node.walkRules(handleRule); emit.push(node); return; }
      if (name === 'page') return;
      node.walkRules && node.walkRules(handleRule);
      emit.push(node);
      return;
    }
    if (node.type === 'rule') { emit.push(handleRule(node)); return; }
  });

  for (const n of emit) {
    const txt = n.toString();
    const key = txt.replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    outCss.push(txt);
  }
}

// ---------- html processing ----------
const IMG_DIR = path.join(ROOT, 'assets', 'images');
fs.mkdirSync(IMG_DIR, { recursive: true });
const SNAP_DIR = path.join(ROOT, 'src', 'snapshots');
fs.mkdirSync(SNAP_DIR, { recursive: true });
const copiedImgs = new Set();

function localizeImg(u) {
  const m = String(u).match(/(?:https?:\/\/justpercent\.com)?\/?(?:\.\/)?images\/([A-Za-z0-9._-]+)$/);
  if (!m) return null;
  const f = m[1];
  const src = `${HP}/public/images/${f}`;
  if (fs.existsSync(src)) {
    if (!copiedImgs.has(f)) { fs.copyFileSync(src, path.join(IMG_DIR, f)); copiedImgs.add(f); }
    return `assets/images/${f}`;
  }
  return null;
}

function processState(name) {
  const p = path.join(ROOT, 'capture', 'html', name + '.json');
  let d = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (typeof d === 'string') d = JSON.parse(d);
  if (d.abort) throw new Error(name + ' aborted capture: ' + d.abort);
  processCss(d.css);

  const doc = parseHTML(d.html, { comment: false });
  const htmlEl = doc.querySelector('html');
  const bodyEl = doc.querySelector('body');
  // strip head + leftovers
  doc.querySelectorAll('head, script, noscript, link, template').forEach(n => n.remove());
  // images
  bodyEl.querySelectorAll('img').forEach(img => {
    const loc = localizeImg(img.getAttribute('src'));
    if (loc) img.setAttribute('src', loc);
    const ss = img.getAttribute('srcset');
    if (ss) {
      const parts = ss.split(',').map(x => {
        const t = x.trim().split(/\s+/);
        const l = localizeImg(t[0]);
        if (l) t[0] = l;
        return t.join(' ');
      });
      img.setAttribute('srcset', parts.join(', '));
    }
    img.setAttribute('loading', 'eager');
    img.removeAttribute('fetchpriority');
  });
  // ---- value repair ----
  // The capture-time value sync was index-shifted by CookieYes checkboxes
  // (live NodeList included them, the clone didn't). Text-input values are
  // therefore unreliable; clear them and re-apply the values that were read
  // DIRECTLY from the live elements at capture time (see capture meta).
  bodyEl.querySelectorAll('input').forEach(inp => {
    const type = (inp.getAttribute('type') || 'text').toLowerCase();
    if (type === 'text' || type === 'search' || type === 'tel' || type === 'number') inp.setAttribute('value', '');
  });
  const VALUES = {
    'home-light':            { '#calculator-search': '' },
    'home-light-search':     { '#calculator-search': 'tax' },
    'home-light-pinned':     { '#calculator-search': '', '#percentage-input': '8', '#number': '250', '#basic-percentage-result': '20' },
    'calc-decreased-light':  { '#decreased-value-original-input': '', '#decreased-value-percentage-input': '', '#decreased-value-result': '' },
    'calc-decreased-dark':   { '#decreased-value-original-input': '', '#decreased-value-percentage-input': '', '#decreased-value-result': '' },
    'calc-decreased-dark-pinned': { '#decreased-value-original-input': '10000', '#decreased-value-percentage-input': '25', '#decreased-value-result': '7500' },
    'faqs-dark':             {},
    'faq-salary-dark':       { '#current-salary': '4000', '#raise-percent': '5', '#new-salary-result': '4200' },
    'faq-salary-dark-8':     { '#current-salary': '4000', '#raise-percent': '8', '#new-salary-result': '4320' },
  };
  const map = VALUES[name] || {};
  for (const sel of Object.keys(map)) {
    const el = bodyEl.querySelector(sel);
    if (el) el.setAttribute('value', map[sel]);
    else console.warn('  value target missing in', name, sel);
  }

  const htmlClass = (htmlEl.getAttribute('class') || '').trim();
  const htmlStyle = (htmlEl.getAttribute('style') || '').trim();
  const bodyClass = (bodyEl.getAttribute('class') || '').trim();
  const bodyStyle = (bodyEl.getAttribute('style') || '').trim();
  const bodyTheme = bodyEl.getAttribute('data-theme') || '';
  let frag = `<div class="jp-html ${htmlClass}" style="${htmlStyle}"><div class="jp-body ${bodyClass}" data-theme="${bodyTheme}" style="${bodyStyle}">${bodyEl.innerHTML}</div></div>`;
  // capture browser ran with a comma-decimal locale; film is en-US — decimal
  // separator on screen must be a dot (thousands commas like 10,000 are fine)
  frag = frag
    .replace('data-number="39.60">39,6<', 'data-number="39.60">39.6<')
    .replace('so 0,70 × $120', 'so 0.70 × $120')
    .replace(/(id="decimal-result">)(\d+),(\d+)(<)/, '$1$2.$3$4');
  fs.writeFileSync(path.join(SNAP_DIR, name + '.html'), frag);
  const meta = { url: d.url, scrollY: d.scrollY, docH: d.docH, theme: d.theme, extra: d.vals || d.cardRect || d.ddRect || null };
  return meta;
}

const metas = {};
for (const s of STATES) {
  metas[s] = processState(s);
  console.log('state ok:', s, JSON.stringify(metas[s]).slice(0, 160));
}
fs.writeFileSync(path.join(ROOT, 'src', 'snapshots', 'meta.json'), JSON.stringify(metas, null, 2));

// base scoped-wrapper css
outCss.unshift(`/* generated from live captures of justpercent.com — do not edit by hand */`);
fs.writeFileSync(path.join(ROOT, 'src', 'app.css'), outCss.join('\n'));
console.log('css rules:', seen.size, 'bytes:', outCss.join('\n').length);
console.log('fonts copied:', [...copiedFonts].length, 'images copied:', [...copiedImgs].length);
