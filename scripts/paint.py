"""Kalaverio's paintings: sapphire ink-wash landscapes on ivory paper, made from code.

Every image on the site is drawn here, so the house owns all of it. Run from the repo root:
    python3 scripts/paint.py
Writes WebP files to public/images/. Deterministic: same seed, same painting.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = 'public/images/'
IVORY = np.array([245, 240, 232]) / 255
# Day: density walks paper -> pale wash -> sapphire -> deep ink.
DAY = np.array([[245, 240, 232], [200, 208, 228], [120, 141, 192], [11, 42, 111], [6, 12, 34]]) / 255
# Night: the ground is sapphire; density walks toward ink, light walks toward ivory.
NIGHT = np.array([[14, 44, 112], [11, 34, 92], [8, 22, 62], [6, 12, 34], [4, 7, 18]]) / 255


def noise(h, w, cell, rng, aspect=1.0):
    gh, gw = max(2, int(h / (cell * aspect))), max(2, int(w / cell))
    a = rng.random((gh, gw)).astype(np.float32)
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255


def fbm(h, w, rng, cells, weights=(0.5, 0.28, 0.15, 0.07), aspect=1.0):
    return sum(wt * noise(h, w, c, rng, aspect) for c, wt in zip(cells, weights))


def ridge(w, rng, rough, octaves=8):
    x = np.linspace(0, 1, w)
    y = np.zeros(w)
    for o in range(octaves):
        n = 2 ** (o + 2)
        y += np.interp(x * n, np.arange(n + 1), rng.uniform(-1, 1, n + 1)) * rough ** o
    return y * (1 - rough)


def blur(a, r):
    if r <= 0:
        return a
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), np.float32) / 255


def pines(draw, top, w, h, size, rng, density):
    """Clustered pines along a ridge: some groves, some bare stretches."""
    grove = noise(1, w, w / 7, rng)[0]
    x = 0
    while x < w:
        x += int(rng.uniform(0.4, 1.6) * size * 0.55)
        if x >= w or grove[x] < 1 - density:
            continue
        y = top[x] + rng.uniform(0, size * 0.25)
        s = size * rng.uniform(0.55, 1.25)
        lean = rng.uniform(-0.06, 0.06) * s
        draw.line([(x, y), (x + lean, y - s)], fill=255, width=max(1, round(s / 14)))
        tiers = int(rng.integers(3, 6))
        for k in range(tiers):
            t = 0.22 + k * (0.7 / tiers)
            yy = y - s * t
            ww = s * (0.34 - k * 0.055) * rng.uniform(0.8, 1.2)
            cx = x + lean * t
            draw.line([(cx - ww, yy + ww * 0.32), (cx, yy - ww * 0.05), (cx + ww * 0.9, yy + ww * 0.28)], fill=235, width=max(1, round(s / 16)))


def paint(w, h, seed, c, ramp=DAY, night=False):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    X = np.linspace(0, 1, w)
    D = np.zeros((h, w), np.float32)  # ink
    L = np.zeros((h, w), np.float32)  # light (night only: mist, water, moon)
    trees = Image.new('L', (w, h), 0)
    td = ImageDraw.Draw(trees)
    tops = []
    for i, s in enumerate(c['layers']):
        lift = sum(ph * np.exp(-(np.abs(X - px) / pw) ** 1.25) for px, ph, pw in s.get('peaks', []))
        tilt = s.get('tilt', 0) * (1 - X) ** 1.6  # ranges sink toward the left, leaving paper for type
        top = (s['base'] + ridge(w, rng, s['rough']) * s['amp'] - lift + tilt) * h
        tops.append(top)
        dy = yy - top[None, :]
        edge = np.exp(-np.clip(dy, 0, None) / (s['falloff'] * h * 0.16))
        body = np.exp(-np.clip(dy, 0, None) / (s['falloff'] * h))
        d = (0.8 * edge + 0.4 * body) * np.clip(dy / 2 + 0.5, 0, 1)
        # Cun: vertical texture strokes on the rock, stronger on nearer ranges.
        cun = fbm(h, w, rng, cells=(w / 5, w / 26, w / 90, 5), aspect=s.get('streak', 3))
        d *= 0.45 + s.get('texture', 0.9) * cun
        d = blur(np.clip(d * s['strength'], 0, 1), s.get('haze', 0))  # far ranges sit in the air
        D = 1 - (1 - D) * (1 - d)
        if s.get('pines'):
            pines(td, top, w, h, s['pines'] * h, rng, s.get('grove', 0.55))

    for f in c.get('falls', []):
        fx, a, b, fw = f['x'], f['from'], f['to'], f['w']
        xi = int(fx * w)
        y0, y1 = tops[a][xi] + 2, tops[b][xi] + h * 0.01
        band = (yy > y0) & (yy < y1)
        prog = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
        for k, (off, scale) in enumerate(f.get('strands', [(0, 1)])):
            wob = (noise(h, 1, h / 30, rng)[:, 0] - 0.5)[:, None] * fw * w * 0.8
            cx = (fx + off) * w + wob
            half = fw * w * scale * (0.7 + 0.6 * prog) * (0.75 + 0.5 * noise(h, w, 6, rng, aspect=8))
            dist = np.abs(xx - cx) / half
            water = np.where(band, np.clip(1.2 - dist, 0, 1) ** 0.8, 0)
            lip = np.where(band, np.exp(-((dist - 1.3) / 0.5) ** 2), 0) * (D > 0.08) * 0.35 * cun_like(h, w, rng)
            D = np.clip(D * (1 - water) + lip, 0, 1)
            streak = 0.6 + 0.4 * noise(h, w, 2.5, rng, aspect=40)
            L = np.maximum(L, blur(water, 1.2) * streak * (0.42 if night else 0))
            D = np.clip(D + water * (1 - streak) * (0 if night else 0.12), 0, 1)
        pool = np.exp(-(((yy - y1) / (h * 0.045)) ** 2 + ((xx - fx * w) / (w * fw * 14)) ** 2))
        D *= 1 - 0.85 * pool
        L = np.maximum(L, pool * (0.35 if night else 0))

    for my, mh, ms in c.get('mist', []):
        m = ms * np.exp(-((yy - my * h) / (mh * h)) ** 2) * (0.6 + 0.4 * noise(h, w, w / 9, rng))
        D *= 1 - m
        if night:
            L = np.maximum(L, m * 0.32)

    if 'moon' in c:
        mx, my, mr = c['moon']
        r = np.hypot(xx - mx * w, yy - my * h) / (mr * h)
        disc = np.clip((1 - r) * 40, 0, 1)
        if night:
            L = np.maximum(L, disc * 0.9 + np.exp(-(r - 1).clip(0) * 3) * 0.08)
        else:
            D = np.maximum(D, disc * 0.09 * (1 - 0.4 * noise(h, w, 30, rng)))

    for bx, by, bs in c.get('birds', []):  # a few strokes, two flicks each
        x0, y0, s = bx * w, by * h, bs * h
        td.line([(x0 - s, y0 - s * 0.35), (x0 - s * 0.3, y0 - s * 0.05), (x0, y0)], fill=210, width=max(1, round(s / 7)))
        td.line([(x0, y0), (x0 + s * 0.35, y0 - s * 0.12), (x0 + s, y0 - s * 0.5)], fill=210, width=max(1, round(s / 7)))

    t = np.asarray(trees.filter(ImageFilter.GaussianBlur(0.5)), np.float32) / 255
    D = 1 - (1 - D) * (1 - t * 0.92)
    D = np.clip(D + 0.5 * np.clip(D - blur(D, 5), 0, 1), 0, 1)  # wet edges: pigment gathers where a wash dries
    D = np.clip(D * (0.88 + 0.24 * noise(h, w, 1.6, rng)), 0, 1)  # granulation
    idx = np.clip(D, 0, 0.999) * (len(ramp) - 1)
    i0 = idx.astype(int)
    f = (idx - i0)[..., None]
    rgb = ramp[i0] * (1 - f) + ramp[i0 + 1] * f
    if night:
        Lf = np.clip(L * (0.85 + 0.3 * noise(h, w, 2, rng)), 0, 1)[..., None]
        rgb = rgb * (1 - Lf) + np.array([196, 210, 238]) / 255 * Lf
    tooth = 1 - (0.03 * noise(h, w, 1.4, rng) + 0.025 * fbm(h, w, rng, cells=(w / 3, w / 12, 40, 4)))
    rgb = rgb * tooth[..., None]
    return Image.fromarray(np.clip(rgb * 255, 0, 255).astype(np.uint8))


def cun_like(h, w, rng):
    return 0.6 + 0.8 * noise(h, w, 4, rng, aspect=6)


def save(img, name, q):
    img.save(OUT + name, 'WEBP', quality=q, method=6)
    print(name, img.size)


# Hero: open paper on the left for the type; peaks rise to the right with a fall between them.
HERO = {
    'layers': [
        dict(base=0.54, amp=0.10, rough=0.6, strength=0.34, falloff=0.6, haze=3, texture=0.6, tilt=0.26,
             peaks=[(0.62, 0.16, 0.10), (0.84, 0.24, 0.07), (0.97, 0.12, 0.06)]),
        dict(base=0.64, amp=0.09, rough=0.62, strength=0.55, falloff=0.45, haze=1.2, tilt=0.2,
             peaks=[(0.53, 0.20, 0.05), (0.66, 0.28, 0.045), (0.9, 0.16, 0.08)], pines=0.012, grove=0.35),
        dict(base=0.80, amp=0.06, rough=0.62, strength=0.78, falloff=0.32, tilt=0.08,
             peaks=[(0.47, 0.07, 0.06), (0.76, 0.10, 0.06)], pines=0.02, grove=0.5),
        dict(base=0.95, amp=0.04, rough=0.62, strength=0.95, falloff=0.22, peaks=[(0.3, 0.02, 0.15), (0.9, 0.05, 0.1)],
             pines=0.03, grove=0.45),
    ],
    'falls': [dict(x=0.598, **{'from': 1, 'to': 2}, w=0.0045, strands=[(0, 1), (0.006, 0.55)])],
    'mist': [(0.72, 0.045, 0.6), (0.85, 0.035, 0.55)],
    'moon': (0.86, 0.16, 0.065),
    'birds': [(0.52, 0.26, 0.010), (0.55, 0.23, 0.007), (0.575, 0.27, 0.006)],
}
PHONE = {
    'layers': [
        dict(base=0.60, amp=0.06, rough=0.6, strength=0.34, falloff=0.55, haze=2, texture=0.6,
             peaks=[(0.25, 0.10, 0.14), (0.78, 0.13, 0.10)]),
        dict(base=0.70, amp=0.05, rough=0.62, strength=0.56, falloff=0.42, haze=1,
             peaks=[(0.45, 0.13, 0.08), (0.62, 0.17, 0.07)], pines=0.010, grove=0.35),
        dict(base=0.82, amp=0.035, rough=0.62, strength=0.8, falloff=0.3, peaks=[(0.15, 0.04, 0.1), (0.9, 0.05, 0.1)],
             pines=0.014, grove=0.5),
        dict(base=0.95, amp=0.02, rough=0.62, strength=0.95, falloff=0.2, pines=0.02, grove=0.45),
    ],
    'falls': [dict(x=0.535, **{'from': 1, 'to': 2}, w=0.008, strands=[(0, 1), (0.012, 0.5)])],
    'mist': [(0.76, 0.03, 0.6), (0.88, 0.025, 0.5)],
    'moon': (0.78, 0.47, 0.035),
}
NIGHTFALL = {
    'layers': [
        dict(base=0.48, amp=0.10, rough=0.6, strength=0.45, falloff=0.6, haze=3, texture=0.6,
             peaks=[(0.22, 0.14, 0.09), (0.40, 0.2, 0.06), (0.8, 0.18, 0.08)]),
        dict(base=0.62, amp=0.08, rough=0.62, strength=0.7, falloff=0.45, haze=1,
             peaks=[(0.60, 0.24, 0.05), (0.72, 0.18, 0.05)], pines=0.012, grove=0.4),
        dict(base=0.86, amp=0.05, rough=0.62, strength=0.95, falloff=0.3, pines=0.022, grove=0.5),
    ],
    'falls': [dict(x=0.655, **{'from': 1, 'to': 2}, w=0.005, strands=[(0, 1), (0.007, 0.6)])],
    'mist': [(0.74, 0.05, 0.55), (0.58, 0.03, 0.3)],
    'moon': (0.86, 0.2, 0.055),
}
CLEFT = {
    'layers': [
        dict(base=0.34, amp=0.06, rough=0.6, strength=0.32, falloff=0.7, haze=2.5, texture=0.6,
             peaks=[(0.35, 0.10, 0.08), (0.62, 0.14, 0.07)]),
        dict(base=0.50, amp=0.07, rough=0.62, strength=0.7, falloff=0.75, haze=0.8, streak=5,
             peaks=[(0.12, 0.30, 0.13), (0.88, 0.34, 0.12), (0.5, 0.12, 0.08)], pines=0.011, grove=0.45),
        dict(base=0.88, amp=0.03, rough=0.62, strength=0.92, falloff=0.22, pines=0.02, grove=0.5),
    ],
    'falls': [dict(x=0.5, **{'from': 1, 'to': 2}, w=0.012, strands=[(0, 1), (-0.016, 0.5), (0.015, 0.45)])],
    'mist': [(0.86, 0.04, 0.65), (0.62, 0.05, 0.35)],
    'birds': [(0.30, 0.22, 0.012), (0.34, 0.19, 0.008)],
}

def stroke(w, h, seed, rgb):
    """One brush stroke, left to right: pressed down wet, dragged, lifted off dry."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = xx / w
    centre = h * (0.56 - 0.12 * np.sin(t * np.pi * 1.1) + 0.04 * t)
    press = np.clip(t / 0.05, 0, 1) ** 0.5 * np.clip((1 - t) / 0.35, 0, 1) ** 0.7  # down, hold, lift
    half = h * 0.34 * (0.35 + 0.65 * press) + 2
    v = (yy - centre) / half  # -1..1 across the stroke
    body = np.clip((1 - np.abs(v)) * 6, 0, 1)
    # Bristle grooves run along the stroke; they open up as the brush runs dry.
    grooves = 0.6 * noise(h, w, 140, rng, aspect=1 / 90) + 0.4 * noise(h, w, 40, rng, aspect=1 / 30)
    dryness = np.clip((t - 0.45) / 0.5, 0, 1) ** 1.4 + 0.25 * np.abs(v) ** 3
    ink = body * np.clip((grooves - dryness * 0.8) * 4 + 0.15 - dryness * 0.2, 0, 1) ** 0.8
    ink *= 0.82 + 0.18 * noise(h, w, 6, rng)
    A = blur(np.clip(ink, 0, 1), 0.7)
    A = np.clip(A + 0.35 * np.clip(A - blur(A, 4), 0, 1), 0, 1)  # pigment gathers at the wet edge
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = rgb
    out[..., 3] = np.clip(A * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    save(paint(2000, 1180, 7, HERO), 'valley-wide.webp', 72)
    save(paint(900, 1500, 11, PHONE), 'valley-tall.webp', 72)
    save(paint(2000, 1000, 23, NIGHTFALL, ramp=NIGHT, night=True), 'nightfall.webp', 70)
    save(paint(800, 1100, 31, CLEFT), 'cleft.webp', 74)
    save(stroke(900, 330, 5, (11, 42, 111)), 'stroke.webp', 82)
    paint(1200, 630, 7, HERO).convert('RGB').save('lib/og/valley.jpg', 'JPEG', quality=82, optimize=True)  # share cards
