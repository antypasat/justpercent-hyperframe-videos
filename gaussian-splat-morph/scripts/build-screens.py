#!/usr/bin/env python3
"""Build self-contained screen documents (assets/screens/*.html) from captured DOM states.

Each captured state (capture/dom/*.json) is a JSON-encoded string with the full
serialized DOM of https://justpercent.com pages at 432x900 mobile viewport.
We convert them into offline, deterministic documents:
  - strip all <script>/<noscript>
  - replace <link rel=stylesheet> with the captured CSS bundles (inline)
  - strip site @font-face, inject local @font-face (fonts copied from the app's
    @fontsource packages -> assets/fonts/)
  - rewrite /images/*.webp -> ../img/*.webp (original app assets)
  - hide any residual CookieYes markup
  - per-screen state fixes (see below)
"""
import json, re, os, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = os.path.join(BASE, 'capture', 'dom')
CSS = os.path.join(BASE, 'capture', 'css')
OUT = os.path.join(BASE, 'assets', 'screens')
os.makedirs(OUT, exist_ok=True)

def load_json_str(p):
    with open(p) as f:
        return json.load(f)

site_css = load_json_str(os.path.join(CSS, 'site-css.json'))
faq_css = load_json_str(os.path.join(CSS, 'site-css-faq.json'))

def strip_font_faces(css):
    # remove @font-face blocks (we provide local ones)
    return re.sub(r'@font-face\s*\{[^}]*\}', '', css)

def css_for(name):
    css = site_css
    if name.startswith('faq'):
        css = site_css + '\n' + faq_css
    css = strip_font_faces(css)
    # kill entry animations/transitions so every seeked frame is stable
    return css

FONT_FACE = """
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:300;font-display:block;src:url('../fonts/ibm-plex-sans-latin-300-normal.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:400;font-display:block;src:url('../fonts/ibm-plex-sans-latin-400-normal.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:500;font-display:block;src:url('../fonts/ibm-plex-sans-latin-500-normal.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:600;font-display:block;src:url('../fonts/ibm-plex-sans-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:700;font-display:block;src:url('../fonts/ibm-plex-sans-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300;font-display:block;src:url('../fonts/space-grotesk-latin-300-normal.woff2') format('woff2')}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:700;font-display:block;src:url('../fonts/space-grotesk-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:400;font-display:block;src:url('../fonts/jetbrains-mono-latin-400-normal.woff2') format('woff2')}
"""

QUIET_CSS = """
/* deterministic playback: no self-running motion, no carets, no scrollbars */
*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}
html{scroll-behavior:auto!important}
::-webkit-scrollbar{display:none!important}
html,body{overscroll-behavior:none}
[class^="cky-"],[class*=" cky-"],[id^="cky"],[id^="ckyPreference"]{display:none!important}
#typewriter-cursor{visibility:hidden!important}
input::selection{background:transparent!important}
.solution-note-fallback{display:none!important}
"""

def process(name, src_json, extra_css='', transform=None):
    html = load_json_str(os.path.join(DOM, src_json))
    # strip scripts / noscript
    html = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', '', html)
    html = re.sub(r'<noscript\b[^>]*>[\s\S]*?</noscript>', '', html)
    # strip head resource links except title/meta (keep FA CDN? we self-host icons not needed offline)
    html = re.sub(r'<link\b[^>]*rel="(?:preload|modulepreload|prefetch|icon|apple-touch-icon|manifest|alternate|canonical|sitemap|preconnect|dns-prefetch)"[^>]*>', '', html)
    # replace stylesheet links (all captured css inlined once, right before </head>)
    html = re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*>', '', html)
    inline = '<style id="site-css">' + css_for(name) + '</style>' \
             + '<style id="fonts-css">' + FONT_FACE + '</style>' \
             + '<style id="quiet-css">' + QUIET_CSS + extra_css + '</style>'
    html = html.replace('</head>', inline + '</head>', 1)
    # en-US number formatting: the app formats some display values with
    # Intl using the BROWSER locale; the capture browser ran pl-PL, so a few
    # decimals rendered as "39,6" / "0,6". A US visitor sees dot decimals —
    # restore them (data-number attrs hold the canonical US value).
    html = re.sub(r'(data-number="([0-9]+\.[0-9]+)">)[0-9]+,[0-9]+(<)', r'\g<1>\g<2>\g<3>', html)
    html = re.sub(r'>([0-9]+),([0-9]{1,2})<', r'>\1.\2<', html)
    # rewrite image urls (any relative depth + absolute)
    html = re.sub(r'src="(?:https://justpercent\.com)?(?:\.{0,2}/)*images/([a-z0-9-]+\.webp)"', r'src="../img/\1"', html)
    html = re.sub(r'srcset="[^"]*"', '', html)
    if transform:
        html = transform(html)
    out = os.path.join(OUT, name + '.html')
    with open(out, 'w') as f:
        f.write(html)
    print(name, len(html))

# ---------- per-screen transforms ----------

def t_home_search(html):
    # keep dropdown portal but let the composition control its visibility:
    # give it a hook id-preserving inline style (hidden class removed by app already).
    return html

# presentation container template used by the app (verbatim structure from s3 capture),
# populated with the Sale Discount practical use of the decreased-value calculator.
PRES_SALE_DISCOUNT = '''<div class="practical-use-presentation-container mb-4 is-visible" id="gsm-pres" style="opacity:0">
  <div class="practical-use-presentation-wrapper relative bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
    <div class="practical-use-presentation-header mb-2 pr-8">
      <span class="practical-use-presentation-pin" aria-hidden="true"><span class="practical-use-presentation-pin-wrapper"><span class="practical-use-presentation-pin-head"></span><span class="practical-use-presentation-pin-needle"></span></span></span>
      <p class="practical-use-presentation-title text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Selected Practical Use Example</p>
    </div>
    <button type="button" class="practical-use-presentation-close absolute top-2 right-2 text-gray-400 p-1 rounded-full" aria-label="Close presentation"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    <ul class="practical-use-presentation-content list-none m-0 p-0 text-sm sm:text-base"><li class="practical-use practical-use--presentation" tabindex="0" data-astro-cid-yv6xsh4l="">   <span class="practical-use-content" data-astro-cid-yv6xsh4l=""><strong>Sale Discount:</strong><span class="pu-line-gap" aria-hidden="true"></span>
        A
        <span data-field="input1" data-tooltip-text="Original price" class="pu-hl-input1">$<span data-number="300">300</span> <strong>[Original]</strong> winter parka</span>
        with a
        <span data-field="input2" data-tooltip-text="Discount" class="pu-hl-input2"><span data-number="30">30</span>% <strong>[Decrease]</strong> discount</span>
        costs
        <span data-field="answer" data-tooltip-text="Final price" class="pu-hl-answer">what <strong>[New]</strong>?</span><span class="pu-line-gap" aria-hidden="true"></span>
        <span data-field="answer" class="pu-hl-answer">$<span data-number="210">210</span></span></span></li></ul>
  </div>
</div>'''

PIN_HL_CSS = '''
/* pinned-state highlighter markers (same visual language as the live app) */
#gsm-pres .pu-hl-input1{background:linear-gradient(105deg,rgba(253,224,71,0) 0%,rgba(253,224,71,.9) 8%,rgba(253,224,71,1) 92%,rgba(253,224,71,0) 100%);border-radius:4px;padding:0 4px;color:#111827;-webkit-box-decoration-break:clone;box-decoration-break:clone}
#gsm-pres .pu-hl-input2{background:linear-gradient(105deg,rgba(163,230,53,0) 0%,rgba(163,230,53,.9) 8%,rgba(163,230,53,1) 92%,rgba(163,230,53,0) 100%);border-radius:4px;padding:0 4px;color:#111827;-webkit-box-decoration-break:clone;box-decoration-break:clone}
#gsm-pres .pu-hl-answer{background:linear-gradient(105deg,rgba(244,114,182,0) 0%,rgba(244,114,182,.9) 8%,rgba(244,114,182,1) 92%,rgba(244,114,182,0) 100%);border-radius:4px;padding:0 4px;color:#111827;-webkit-box-decoration-break:clone;box-decoration-break:clone}
#gsm-pres .practical-use-presentation-pin-head{background:rgb(239,68,68);border-color:rgb(220,38,38)}
'''

def t_calc_decreased(html):
    # inject the presentation container (initially transparent; the composition
    # timeline reveals it exactly like the app's .is-visible transition) right
    # before the round-checkbox row of the decreased-value card.
    m = re.search(r'<div class="round-checkbox-row', html)
    assert m, 'round-checkbox-row not found'
    html = html[:m.start()] + PRES_SALE_DISCOUNT + html[m.start():]
    return html

process('home-light', 's1-home-light-top.json', transform=None)
process('home-light-search', 's2-home-light-search-tip.json', transform=t_home_search)
process('home-light-pinned', 's3-home-light-tip-pinned.json')
process('calc-decreased-light', 's5-decreased-light-pinned.json', extra_css=PIN_HL_CSS, transform=t_calc_decreased)
process('home-dark', 's6-home-dark-top.json')
process('faqs-dark', 's7-faqs-dark-top.json')
process('faq-billsplit-dark', 's8-faq-billsplit-dark.json')
print('OK')
