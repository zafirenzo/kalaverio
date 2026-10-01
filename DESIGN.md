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

Scenes come from the parent house (Zafirenzo site, `public/assets/bg_architectural.png`, `bg_botanical.png`, `public/sculpture.png`), re-toned into Kalaverio's own palette with one colour lookup: ink shadows, sapphire mids, ivory highlights. This cyanotype treatment is what makes them Kalaverio's rather than Zafirenzo's.

| File | Source | Use |
|---|---|---|
| `public/images/sanctuary-wide.webp` / `-tall.webp` | bg_architectural.png | Home hero, desktop / phone |
| `public/images/garden-band.webp` | bg_botanical.png | Home interlude |
| `public/images/bust.webp` | sculpture.png, cropped inside its frame | Story hero |

All under 200 KB. None shows a garment, so none can be mistaken for the product. The Zenith damask and the Zafirenzo costume figures are deliberately not used.

Layering on dark scenes: photograph, a flat ink veil (52%), film grain (`.grain`), then type. One orchestrated entrance on load (`.rise`, staggered by `--d`), the hero photograph settling from 1.08 scale, and a slow scroll drift on scenes where `animation-timeline: view()` is supported. All of it is off under reduced motion.
