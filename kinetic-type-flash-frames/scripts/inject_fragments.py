#!/usr/bin/env python3
"""Inject captured page fragments into scene templates -> compositions/*.html"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(HERE, 'scenes')
FRAG = os.path.join(ROOT, 'capture', 'fragments')
OUT = os.path.join(ROOT, 'compositions')

os.makedirs(OUT, exist_ok=True)

frags = {}
def frag(name):
    if name not in frags:
        with open(os.path.join(FRAG, name + '.html')) as fh:
            frags[name] = fh.read()
    return frags[name]

for f in sorted(os.listdir(SRC)):
    if not f.endswith('.html'):
        continue
    src = open(os.path.join(SRC, f)).read()
    out = re.sub(r'\{\{FRAG:([a-z0-9-]+)\}\}', lambda m: frag(m.group(1)), src)
    with open(os.path.join(OUT, f), 'w') as fh:
        fh.write(out)
    print(f, len(src), '->', len(out))
