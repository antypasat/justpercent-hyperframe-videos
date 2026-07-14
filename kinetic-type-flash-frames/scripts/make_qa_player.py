#!/usr/bin/env python3
"""Build qa/player.html — a minimal deterministic runtime shim.

Inlines every composition's template content + scripts into one page,
sequences them on a master clock (same ordering as index.html), and exposes
window.__seek(seconds) for automated frame QA. This mirrors HyperFrames
semantics for our project (paused GSAP timelines, clip mount windows).
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
COMP = os.path.join(ROOT, 'compositions')

ORDER = ['s1-hook', 's2-home', 's3-calc', 's4-flip', 's5-practical', 's6-faq', 's7-endcard']

index = open(os.path.join(ROOT, 'index.html')).read()
m = re.search(r'<style>(.*?)</style>', index, re.S)
index_css = m.group(1)

scene_blocks = []
for name in ORDER:
    src = open(os.path.join(COMP, name + '.html')).read()
    m = re.search(r'<template[^>]*>(.*)</template>', src, re.S)
    inner = m.group(1)
    # drop per-template gsap CDN loads (loaded once in head)
    inner = re.sub(r'<script src="https://cdn\.jsdelivr\.net[^"]*"></script>', '', inner)
    scene_blocks.append(f'<div class="hf-clip" id="clip-{name}" style="display:none">{inner}</div>')

brand_bar = re.search(r'(<div id="brand-bar".*?</div>)', index, re.S).group(1)
main_script = re.search(r'<script>\s*\(function \(\) \{(.*?)\}\)\(\);\s*</script>', index, re.S).group(1)

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<base href="../" />
<link rel="stylesheet" href="assets/jp-app.css" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{index_css}
.hf-clip {{ position: absolute; inset: 0; }}
#hud {{ position: fixed; left: 8px; top: 8px; z-index: 999; font: 14px monospace; color: #0f0;
  background: rgba(0,0,0,.6); padding: 4px 8px; border-radius: 6px; }}
</style>
</head>
<body>
<div id="stage" style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#05060d">
{chr(10).join(scene_blocks)}
{brand_bar}
</div>
<div id="hud">t=0.00</div>
<script>
(function () {{{main_script}}})();
</script>
<script>
(function () {{
  var order = {ORDER!r};
  var tls = window.__timelines;
  var starts = {{}}, t0 = 0;
  order.forEach(function (id) {{ starts[id] = t0; t0 += tls[id].duration(); }});
  var total = t0;
  window.__seek = function (t) {{
    t = Math.max(0, Math.min(t, total - 0.0001));
    order.forEach(function (id) {{
      var el = document.getElementById('clip-' + id);
      var s = starts[id], d = tls[id].duration();
      if (t >= s && t < s + d) {{
        el.style.display = 'block';
        tls[id].time(t - s, false);
      }} else {{
        el.style.display = 'none';
      }}
    }});
    if (tls['main']) tls['main'].time(Math.min(t, tls['main'].duration() - 0.001), false);
    document.getElementById('hud').textContent = 't=' + t.toFixed(2) + ' / ' + total.toFixed(2);
    window.__t = t;
    return t;
  }};
  window.__total = total;
  var q = new URLSearchParams(location.search);
  var t = parseFloat(q.get('t') || '0');
  function firstSeek() {{
    requestAnimationFrame(function () {{ requestAnimationFrame(function () {{ window.__seek(t); window.__ready = true; }}); }});
  }}
  Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    document.readyState === 'complete' ? Promise.resolve() : new Promise(function (r) {{ window.addEventListener('load', r); }})
  ]).then(firstSeek);
  document.addEventListener('keydown', function (e) {{
    if (e.key === 'ArrowRight') window.__seek((window.__t || 0) + (e.shiftKey ? 1 : 1/30));
    if (e.key === 'ArrowLeft') window.__seek((window.__t || 0) - (e.shiftKey ? 1 : 1/30));
  }});
}})();
</script>
</body>
</html>'''

out = os.path.join(ROOT, 'qa', 'player.html')
open(out, 'w').write(html)
print('wrote', out, len(html))
