#!/usr/bin/env python3
"""Build pipeline for the JustPercent kinetic-type teaser.

Reads capture/*.json (full-page DOM + CSSOM dumps from the live site),
produces:
  assets/jp-app.css      -- merged, scoped, mobile-evaluated app CSS
  assets/app-assets/     -- font/asset files copied from handy-percent/dist
  assets/app-images/     -- images referenced by the captured DOM
  capture/fragments/*.html -- scoped DOM fragments ready to inline into
                              compositions (wrapped in .jp-root/.jp-body)

Deterministic: pure text transforms, no network.
"""
import json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CAP = os.path.join(ROOT, 'capture')
DIST = os.path.normpath(os.path.join(ROOT, '..', '..', 'handy-percent', 'dist'))
OUT_CSS = os.path.join(ROOT, 'assets', 'jp-app.css')
OUT_ASSETS = os.path.join(ROOT, 'assets', 'app-assets')
OUT_IMAGES = os.path.join(ROOT, 'assets', 'app-images')
FRAG = os.path.join(CAP, 'fragments')

VIEW_W, VIEW_H = 432.0, 808.0

# ---------- tiny CSS block parser ----------

def parse_blocks(css):
    """Split css text into top-level blocks: (prelude, body) or (text, None) for @import etc."""
    blocks, i, n = [], 0, len(css)
    while i < n:
        # skip whitespace
        while i < n and css[i] in ' \t\r\n':
            i += 1
        if i >= n:
            break
        # find prelude end: '{' or ';'
        j = i
        depth = 0
        while j < n:
            c = css[j]
            if c == '{':
                break
            if c == ';':
                break
            j += 1
        if j >= n:
            break
        if css[j] == ';':
            blocks.append((css[i:j].strip(), None))
            i = j + 1
            continue
        # matched '{' -> find matching '}'
        depth = 1
        k = j + 1
        while k < n and depth:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        blocks.append((css[i:j].strip(), css[j+1:k-1]))
        i = k
    return blocks

# ---------- media query evaluation (mobile 432x808, touch) ----------

def eval_media_condition(cond):
    """Return True/False/None(unknown) for a single (feature: value) or keyword."""
    cond = cond.strip().lower()
    if cond in ('screen', 'all', 'only screen'):
        return True
    if cond == 'print':
        return False
    m = re.match(r'\(\s*([a-z-]+)\s*:\s*([^)]+)\)', cond)
    if not m:
        if cond in ('(hover)',):
            return False
        return None
    feat, val = m.group(1), m.group(2).strip()
    def px(v):
        v = v.strip()
        if v.endswith('px'):
            return float(v[:-2])
        if v.endswith('rem') or v.endswith('em'):
            return float(re.sub('r?em$', '', v)) * 16.0
        try:
            return float(v)
        except ValueError:
            return None
    if feat == 'max-width':
        p = px(val); return None if p is None else VIEW_W <= p
    if feat == 'min-width':
        p = px(val); return None if p is None else VIEW_W >= p
    if feat == 'max-height':
        p = px(val); return None if p is None else VIEW_H <= p
    if feat == 'min-height':
        p = px(val); return None if p is None else VIEW_H >= p
    if feat == 'width':
        p = px(val); return None if p is None else VIEW_W == p
    if feat == 'orientation':
        return val == 'portrait'
    if feat == 'hover':
        return val == 'none'
    if feat == 'any-hover':
        return val == 'none'
    if feat == 'pointer':
        return val == 'coarse'
    if feat == 'any-pointer':
        return val == 'coarse'
    if feat == 'prefers-reduced-motion':
        return val == 'no-preference'
    if feat == 'prefers-color-scheme':
        return False  # app themes via class; never rely on UA scheme
    if feat == 'prefers-contrast':
        return val == 'no-preference'
    if feat == 'display-mode':
        return val == 'browser'
    if feat == 'forced-colors':
        return val == 'none'
    return None

def eval_media(prelude):
    """Evaluate '@media ...' prelude. True => unwrap, False => drop, None => keep wrapped."""
    q = prelude[len('@media'):].strip()
    results = []
    for branch in re.split(r'\s*,\s*(?![^()]*\))', q):
        branch = branch.strip()
        neg = False
        if branch.startswith('not '):
            neg = True
            branch = branch[4:]
        parts = re.split(r'\s+and\s+', branch)
        vals = [eval_media_condition(p) for p in parts]
        if any(v is None for v in vals):
            results.append(None)
        else:
            r = all(vals)
            results.append((not r) if neg else r)
    if any(v is True for v in results):
        return True
    if all(v is False for v in results):
        return False
    return None

# ---------- selector scoping ----------

SCOPE = '[data-jp-scope]'

def scope_selector(sel):
    sel = sel.strip()
    if not sel:
        return sel
    low = sel.lower()
    # ::selection / ::backdrop etc on bare pseudo
    if sel.startswith('::'):
        return SCOPE + ' *' + sel
    # replace head token html/:root/body
    m = re.match(r'^(html|:root)(?![\w-])', low)
    if m:
        rest = sel[m.end():]
        return SCOPE + ' .jp-root' + rest
    m = re.match(r'^body(?![\w-])', low)
    if m:
        rest = sel[m.end():]
        return SCOPE + ' .jp-body' + rest
    return SCOPE + ' ' + sel

def split_selectors(prelude):
    """Split a selector list on top-level commas (escape-aware)."""
    out, depth, cur, i = [], 0, '', 0
    while i < len(prelude):
        ch = prelude[i]
        if ch == '\\' and i + 1 < len(prelude):
            cur += ch + prelude[i+1]
            i += 2
            continue
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
        i += 1
    if cur.strip():
        out.append(cur)
    return out

def scope_rule(prelude, body):
    sels = [scope_selector(s) for s in split_selectors(prelude)]
    return ', '.join(sels) + ' { ' + body.strip() + ' }'

# ---------- value transforms ----------

def rewrite_units(css):
    def vh(m):
        return f"{round(float(m.group(1)) * VIEW_H / 100.0, 2)}px"
    def vw(m):
        return f"{round(float(m.group(1)) * VIEW_W / 100.0, 2)}px"
    css = re.sub(r'(?<![\w.-])(\d*\.?\d+)(?:d|s|l)?vh(?![\w-])', vh, css)
    css = re.sub(r'(?<![\w.-])(\d*\.?\d+)(?:d|s|l)?vw(?![\w-])', vw, css)
    return css

URL_LOG = set()

def rewrite_urls_css(css):
    """URLs inside assets/jp-app.css are relative to the css file (assets/)."""
    def sub(m):
        u = m.group(1).strip('"\'')
        if u.startswith('data:') or u.startswith('#'):
            return m.group(0)
        if u.startswith('/assets/'):
            return 'url("./app-assets/' + os.path.basename(u) + '")'
        if u.startswith('/images/'):
            return 'url("./app-images/' + os.path.basename(u) + '")'
        if u.startswith('http'):
            return m.group(0)
        if u.startswith('/'):
            URL_LOG.add(u)
            return 'url("https://justpercent.com' + u + '")'
        return m.group(0)
    return re.sub(r'url\(\s*([^)]+?)\s*\)', sub, css)

def rewrite_urls_dom(html):
    """URLs inside fragments resolve from the project root document."""
    def attr_sub(m):
        pre, u = m.group(1), m.group(2)
        u = re.sub(r'^((\.\./)+|\./|https://justpercent\.com/)', '/', u)
        if u.startswith('/images/'):
            return pre + 'assets/app-images/' + os.path.basename(u)
        if u.startswith('/assets/'):
            return pre + 'assets/app-assets/' + os.path.basename(u)
        if u.startswith('/') and not u.startswith('//'):
            return pre + 'https://justpercent.com' + u
        return m.group(0)
    html = re.sub(r'(src=")([^"]+)', attr_sub, html)
    html = re.sub(r'(href=")([^"]+)', lambda m: (m.group(1) + 'https://justpercent.com' + m.group(2)) if m.group(2).startswith('/') and not m.group(2).startswith('//') else m.group(0), html)
    # srcset
    def srcset_sub(m):
        parts = []
        for item in m.group(2).split(','):
            item = item.strip()
            if item.startswith('/images/'):
                item = 'assets/app-images/' + os.path.basename(item.split()[0]) + (' ' + ' '.join(item.split()[1:]) if len(item.split()) > 1 else '')
            parts.append(item)
        return m.group(1) + ', '.join(parts)
    html = re.sub(r'(srcset=")([^"]+)', srcset_sub, html)
    # inline style url()
    html = re.sub(r'url\((&quot;|"|\')?/images/([^)&"\']+)(&quot;|"|\')?\)',
                  lambda m: 'url(assets/app-images/' + os.path.basename(m.group(2)) + ')', html)
    return html

# ---------- css pipeline ----------

def transform_css(css):
    out = []
    for prelude, body in parse_blocks(css):
        if body is None:
            continue  # @import/@charset -- none expected
        p = prelude.strip()
        if p.startswith('@font-face'):
            out.append('@font-face { ' + body.strip() + ' }')
            continue
        if p.startswith('@keyframes') or p.startswith('@-webkit-keyframes'):
            out.append(p + ' { ' + body.strip() + ' }')
            continue
        if p.startswith('@media'):
            verdict = eval_media(p)
            if verdict is False:
                continue
            inner = transform_css_rules(body)
            if verdict is True:
                out.append(inner)
            else:
                out.append(p + ' {\n' + inner + '\n}')
            continue
        if p.startswith('@supports'):
            out.append(p + ' {\n' + transform_css_rules(body) + '\n}')
            continue
        if p.startswith('@'):
            # unknown at-rule: keep unscoped but log
            URL_LOG.add('AT:' + p[:60])
            out.append(p + ' { ' + body.strip() + ' }')
            continue
        out.append(scope_rule(p, body))
    return '\n'.join(out)

def transform_css_rules(body):
    """Transform rules inside a conditional group."""
    out = []
    for prelude, inner in parse_blocks(body):
        if inner is None:
            continue
        p = prelude.strip()
        if p.startswith('@media'):
            verdict = eval_media(p)
            if verdict is False:
                continue
            t = transform_css_rules(inner)
            out.append(t if verdict is True else p + ' {\n' + t + '\n}')
        elif p.startswith('@'):
            out.append(p + ' { ' + inner.strip() + ' }')
        else:
            out.append(scope_rule(p, inner))
    return '\n'.join(out)

def load_css(name):
    d = json.load(open(os.path.join(CAP, name)))
    if isinstance(d, str):
        d = json.loads(d)
    return d['css']

def main():
    os.makedirs(OUT_ASSETS, exist_ok=True)
    os.makedirs(OUT_IMAGES, exist_ok=True)
    os.makedirs(FRAG, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_CSS), exist_ok=True)

    # ---- merge CSS (order: home, calc, faq hub, faq page), dedupe identical top-level blocks
    merged, seen = [], set()
    for f in ['css-light.json', 'css-calc-page.json', 'css-faq-hub.json', 'css-faq-page.json']:
        css = load_css(f)
        for prelude, body in parse_blocks(css):
            key = (prelude, body)
            if key in seen:
                continue
            seen.add(key)
            if body is None:
                merged.append(prelude + ';')
            else:
                merged.append(prelude + ' {' + body + '}')
    merged_css = '\n'.join(merged)

    scoped = transform_css(merged_css)
    scoped = rewrite_units(scoped)
    scoped = rewrite_urls_css(scoped)

    overrides = '''
/* ---- film overrides: freeze all self-running motion (determinism) ---- */
[data-jp-scope] *, [data-jp-scope] *::before, [data-jp-scope] *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
  cursor: default !important;
}
[data-jp-scope] { display: block; }
[data-jp-scope] .jp-root { width: 100%; min-height: 100%; color: #000; }
/* the real app inherits its default text color from color-scheme on <html>;
   inside a scoped wrapper we must make it explicit */
[data-jp-scope] .jp-root.dark { color: #fff; }
[data-jp-scope] .jp-body { position: relative; width: 100%; }
[data-jp-scope] ::-webkit-scrollbar { display: none; }
'''
    with open(OUT_CSS, 'w') as fh:
        fh.write('/* generated by scripts/build_assets.py -- do not edit by hand */\n')
        fh.write(scoped + overrides)
    print('wrote', OUT_CSS, len(scoped))

    # ---- copy referenced dist assets (fonts, katex etc.)
    merged_all = merged_css
    asset_files = set(os.path.basename(u) for u in re.findall(r'url\("?(/assets/[^")]+)"?\)', merged_all))
    copied = 0
    for a in sorted(asset_files):
        srcp = os.path.join(DIST, 'assets', a)
        if os.path.exists(srcp):
            shutil.copy2(srcp, os.path.join(OUT_ASSETS, a))
            copied += 1
        else:
            print('MISSING dist asset:', a)
    print('copied assets:', copied)

    # ---- fragments + image collection
    img_files = set(re.findall(r'url\("?/images/([^")]+)"?\)', merged_all))
    frag_specs = [
        ('home-top-light.json', 'home-top-light'),
        ('home-search-tip-light.json', 'home-search-light'),
        ('home-pinned-tip-light.json', 'home-pinned-light'),
        ('calc-increase-top-light.json', 'calc-top-light'),
        ('calc-increase-top-dark.json', 'calc-top-dark'),
        ('calc-increase-pu-list-dark.json', 'calc-pulist-dark'),
        ('calc-increase-pinned-dark.json', 'calc-pinned-dark'),
        ('faqs-hub-dark.json', 'faqhub-dark'),
        ('faq-salary-raise-initial-dark.json', 'faq-initial-dark'),
        ('faq-salary-raise-changed-dark.json', 'faq-changed-dark'),
    ]
    meta = {}
    for fname, out in frag_specs:
        d = json.load(open(os.path.join(CAP, fname)))
        if isinstance(d, str):
            d = json.loads(d)
        html = d['bodyHTML']
        for m in re.findall(r'(?:src|href)="(?:(?:\.\./)+|\./|/|https://justpercent\.com/)images/([^"]+)"', html):
            img_files.add(m)
        for m in re.findall(r'srcset="([^"]+)"', html):
            for item in m.split(','):
                item = item.strip().split()[0] if item.strip() else ''
                if item.startswith('/images/'):
                    img_files.add(item[len('/images/'):])
        html = rewrite_urls_dom(html)
        html_cls = d['htmlAttrs'].get('class', '')
        body_cls = d['bodyAttrs'].get('class', '')
        frag = (f'<div class="jp-root {html_cls}"><div class="jp-body {body_cls}">'
                f'{html}</div></div>')
        with open(os.path.join(FRAG, out + '.html'), 'w') as fh:
            fh.write(frag)
        meta[out] = {'url': d['url'].split('?')[0], 'scrollY': d['scrollY'], 'docH': d['docH'], 'size': len(frag)}
        print('fragment', out, len(frag), 'scrollY', d['scrollY'])

    with open(os.path.join(FRAG, 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=2)

    ic = 0
    for i in sorted(img_files):
        for base in [os.path.join(DIST, 'images'), ]:
            srcp = os.path.join(base, i)
            if os.path.exists(srcp):
                os.makedirs(os.path.dirname(os.path.join(OUT_IMAGES, i)), exist_ok=True)
                shutil.copy2(srcp, os.path.join(OUT_IMAGES, i))
                ic += 1
                break
        else:
            print('MISSING image:', i)
    print('copied images:', ic)
    if URL_LOG:
        print('unmapped urls / at-rules:')
        for u in sorted(URL_LOG):
            print('  ', u)

if __name__ == '__main__':
    main()
