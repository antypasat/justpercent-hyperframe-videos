#!/usr/bin/env python3
"""Generate qa/full.html — a standalone QA harness that stacks all beat
compositions with the root schedule and exposes window.__qaSeek(T) so frames
can be inspected at any global time via file:// (no preview server needed).
Layout, fonts and asset paths are identical to the real player (qa/ sits at the
same depth as compositions/)."""
import os, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMP = os.path.join(BASE, 'compositions')
QA = os.path.join(BASE, 'qa')
os.makedirs(QA, exist_ok=True)

# keep in sync with index.html
SCHEDULE = [
    ('b1-hook', 0.0, 3.4, 1),
    ('b2-home-flythrough', 3.4, 5.8, 1),
    ('b3-calc-practical-use', 9.2, 7.0, 1),
    ('b4-search-to-answer', 16.2, 6.2, 1),
    ('b5-theme-flip', 22.4, 2.8, 1),
    ('b6-faq-live', 25.2, 7.0, 1),
    ('b7-endcard', 32.2, 4.3, 1),
    ('chrome-overlay', 0.0, 32.6, 2),
]

screens_used = set()

def inner(name):
    src = open(os.path.join(COMP, name + '.html')).read()
    m = re.search(r'<template[^>]*>\s*([\s\S]*?)\s*</template>\s*$', src)
    assert m, name
    body = m.group(1)
    # file:// QA: real player serves over http (iframe src is same-origin there);
    # under file:// we swap src -> srcdoc (same opaque origin) via screens-data.js
    def swap(mm):
        screens_used.add(mm.group(1))
        return 'data-gsm-screen="%s"' % mm.group(1)
    body = re.sub(r'src="\.\./assets/screens/([a-z0-9-]+)\.html"', swap, body)
    return body

clips = []
for cid, start, dur, track in sorted(SCHEDULE, key=lambda s: s[3]):
    clips.append(
        '<div class="qa-clip" data-cid="%s" data-qstart="%s" data-qdur="%s" style="position:absolute;inset:0;display:none;">\n%s\n</div>'
        % (cid, start, dur, inner(cid)))

html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>QA harness — gaussian-splat-morph</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="screens-data.js"></script>
<script>
window.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('iframe[data-gsm-screen]').forEach(function (f) {
    f.setAttribute('srcdoc', window.__qaScreens[f.getAttribute('data-gsm-screen')]);
  });
});
</script>
<style>
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:300;font-display:block;src:url('../assets/fonts/ibm-plex-sans-latin-300-normal.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:400;font-display:block;src:url('../assets/fonts/ibm-plex-sans-latin-400-normal.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:500;font-display:block;src:url('../assets/fonts/ibm-plex-sans-latin-500-normal.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:700;font-display:block;src:url('../assets/fonts/ibm-plex-sans-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300;font-display:block;src:url('../assets/fonts/space-grotesk-latin-300-normal.woff2') format('woff2')}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:700;font-display:block;src:url('../assets/fonts/space-grotesk-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:400;font-display:block;src:url('../assets/fonts/jetbrains-mono-latin-400-normal.woff2') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#070812}
#qa-stage{position:relative;width:1080px;height:1920px;overflow:hidden}
</style>
</head>
<body>
<div id="qa-stage">
__CLIPS__
</div>
<script>
window.__timelines = window.__timelines || {};
window.__qaSeek = function (T) {
  document.querySelectorAll('.qa-clip').forEach(function (c) {
    var cid = c.dataset.cid, s = parseFloat(c.dataset.qstart), d = parseFloat(c.dataset.qdur);
    var tl = window.__timelines[cid];
    if (T >= s && T < s + d) {
      c.style.display = 'block';
      if (tl) { tl.pause(); tl.seek(Math.max(0, T - s), false); }
    } else {
      c.style.display = 'none';
    }
  });
  window.__qaT = T;
};
window.__qaReady = function () {
  if (!document.fonts || document.fonts.status !== 'loaded') return false;
  var frames = document.querySelectorAll('iframe');
  for (var i = 0; i < frames.length; i++) {
    var d = frames[i].contentDocument;
    if (!d || d.readyState !== 'complete' || !d.body || d.body.children.length === 0) return false;
  }
  return true;
};
(function () {
  var m = location.search.match(/[?&]t=([0-9.]+)/);
  var t = m ? parseFloat(m[1]) : 0;
  function tick() {
    if (window.__qaReady()) { window.__qaSeek(t); document.title = 'QA ready t=' + t; }
    else setTimeout(tick, 200);
  }
  window.addEventListener('load', function () { setTimeout(tick, 300); });
})();
</script>
</body>
</html>
"""
html = html.replace('__CLIPS__', '\n'.join(clips))
open(os.path.join(QA, 'full.html'), 'w').write(html)
print('qa/full.html', len(html))

# screens-data.js: JSON-encoded screen documents with a <base> so relative
# ../fonts and ../img resolve from inside srcdoc (parent base = qa/)
import json
SCREENS = os.path.join(BASE, 'assets', 'screens')
parts = ['window.__qaScreens = {};']
for name in sorted(screens_used):
    doc = open(os.path.join(SCREENS, name + '.html')).read()
    doc = doc.replace('<head>', '<head><base href="../assets/screens/">', 1)
    parts.append('window.__qaScreens[%s] = %s;' % (json.dumps(name), json.dumps(doc)))
data = '\n'.join(parts)
open(os.path.join(QA, 'screens-data.js'), 'w').write(data)
print('qa/screens-data.js', len(data))
