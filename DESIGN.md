# Design

Ivory pages, sapphire for action, one thin gold line as the signature.

| Token | Hex | Use |
|---|---|---|
| Ivory | #F5F0E8 | page ground |
| Ink | #0B0F1A | text, dark sections, footer, chips |
| Sapphire | #0B2A6F | buttons, links, hero blocks, How it works, Register numerals |
| Zari gold | #C9A227 | hairlines, Nº numerals, hover underline. Text only on ink or sapphire |
| Sand | #EAD2A8 | name strip, rule box, "flat on ivory" plates |
| Mute | #5B6070 | secondary text |

Type: DM Serif Display (headings; 34/40 phone, 48/56 desktop; hero and page titles larger as display), Inter 16/26 body, Cinzel 12px caps for wordmark, chips and Nº numerals only.

Signature: `.sig` draws a 1px x 48px gold line under each section heading once on load (900ms ease-out). Fades are 240ms. Everything stops under reduced motion.

Plates (`components/Plate.tsx`): until photographs exist, each image slot renders a woven plate: a fine weave texture, the set's own zari border motif (six motifs), a tailor's flat line drawing of the cut, and a caption naming the photograph that belongs there. Drop a `src` into the set's `photos` and the real image replaces it.

The Register grid (`components/RegisterGrid.tsx`): sixty cells that fill in sapphire as places are paid for. Used on Home and /register.

Controls: primary button sapphire fill, 48px, 2px corners, full width on phone, gold inset underline on hover. Focus ring 2px sapphire (gold on dark). Size chips are native radios. Folding panels are `<details>`. Phone menu is a native popover.

## Imagery

Every image is Kalaverio's own, painted by `scripts/paint.py` (numpy + Pillow, seeded, re-runnable). Nothing is borrowed: the Zafirenzo reference images are rights-unclear per the Commerce playbook, so none ship here.

The language is sapphire ink wash on ivory paper, in the shan-shui tradition: ranges that dissolve into mist, cun texture strokes on rock, wet edges where washes dry, granulation, paper tooth, pines in groves, a falling stream through a cleft. One ink on a natural ground, as the playbook asks.

| File | Painting | Use |
|---|---|---|
| `valley-wide.webp` / `valley-tall.webp` | The sanctuary valley: open paper on the left for type, peaks and a waterfall to the right, moon, three birds | Home hero, desktop / phone |
| `nightfall.webp` | The same valley at night, sapphire ground, the stream and mist the only light | Home interlude |
| `cleft.webp` | A tall fall through a mountain cleft into a misted pool | Story hero |
| `stroke.webp` | One dry-brush stroke: pressed wet, dragged, lifted dry | Behind "Kala" on the home strip |
| `lib/og/valley.jpg` | The valley at share-card size | Background of every share image |

Line drawings (`components/Tools.tsx`, the garment flats in `Plate.tsx`) are hairline, to scale and numbered: the tools of kala are two for art (round brush, flat brush, rigger) and two for craft (shears, needle and thread).

Motion: one staggered entrance on load (`.rise`, delay in `--d`), the hero painting settling, and a slow scroll drift where `animation-timeline: view()` is supported. All off under reduced motion.
