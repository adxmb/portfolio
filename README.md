# Portfolio

Next.js 16, Tailwind v4, Motion, GSAP + ScrollTrigger, Lenis,
self-hosted Cabinet Grotesk and Geist.

## Run it

1. `npm install`
2. Add the display font (one time): download the **variable** Cabinet Grotesk
   file from https://www.fontshare.com/fonts/cabinet-grotesk and save it as
   `src/fonts/CabinetGrotesk-Variable.woff2`. `npm run dev` / `npm run build`
   stop with a message until it is there.
3. `npm run dev` (http://localhost:3000)

## Scrolling

Plain smooth scrolling, no section locking. `src/components/SmoothScrollProvider.tsx`
runs Lenis at `lerp: 0.07`, `duration: 1.2`, a quartic ease-out — a long, liquid
trail behind the input. Lenis shares its clock with GSAP's ticker and keeps
ScrollTrigger in sync; reduced motion leaves the wheel native.

## Landing page

Three movements:

1. **The name**, centred both ways, the one interactive element (for three of
   its four variants).
2. **The story**: a static headline, then a preview of Professional, Projects
   and Sidequests. No metrics section. Each of these four sections has its own
   background image; scrolling from one into the next plays the selected
   transition between their two images (`src/components/background/SectionBackgroundManager.tsx`).
3. **The closing contact block.**

### Name variants — `home.nameVariant`

| Value        | File                    | Effect                                                                                 |
| ------------ | ----------------------- | -------------------------------------------------------------------------------------- |
| `"magnetic"` | `name/MagneticName.tsx` | 3D letters lean, lift and rotate toward the cursor with per-letter springs             |
| `"liquid"`   | `name/LiquidName.tsx`   | weight, tracking, skew and colour fringing driven by pointer speed                     |
| `"glitch"`   | `name/GlitchName.tsx`   | thin coloured bands of each letter offset a few px, scaled by speed and proximity      |
| `"horizon"`  | `name/HorizonName.tsx`  | one-time load animation: letters rotate up out of a clipping mask, no pointer response |

### Background transitions — `home.backgroundTransition`

| Value        | File                     | Effect                                                                                                                                     |
| ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `"mask"`     | `MaskTransition.tsx`     | a tilted edge wipes from one image to the next                                                                                             |
| `"blur"`     | `BlurTransition.tsx`     | cross-fade through blur and saturation                                                                                                     |
| `"rgbSplit"` | `RgbSplitTransition.tsx` | the image is split into its R/G/B channels (via SVG `feColorMatrix`, screen-blended) which drift apart and back as the next image fades in |
| `"radial"`   | `RadialTransition.tsx`   | a circular mask expands from the centre to reveal the next image                                                                           |

The switch panel, bottom right, compares all four × four live. Set
`home.preview.enabled` to `false` once you've chosen, and set `nameVariant` /
`backgroundTransition` to match.

## Asset replacement guide

All content and image paths live in **`src/config/portfolioData.ts`**.
Placeholders are wrapped in `[[double brackets]]`; run `npm run placeholders`
for a full list with line numbers.

**Landing page background images** — `portfolio.home.background.images`, an
array of exactly four, in this order:

```ts
images: [
  { src: "/images/bg-headline.jpg", ... },      // 0: behind the static headline
  { src: "/images/bg-professional.jpg", ... },  // 1: behind the Professional preview
  { src: "/images/bg-projects.jpg", ... },      // 2: behind the Projects preview
  { src: "/images/bg-sidequests.jpg", ... },    // 3: behind the Sidequests preview
]
```

To replace one: drop a landscape photo (1920×1080 or larger) into
`public/images/`, matching the filename above (or point `src` at your own
filename), and write a real `alt` description. Leaving `src: ""` shows a
labelled placeholder frame instead of a broken image.

**Sidequests ring** — `portfolio.sidequests.items` holds 12 entries, generated
by `placeholderSidequest(n)`. Fill one in by editing that entry (or replacing
the call with a full object) and saving a square photo as
`/public/images/sidequest-n.jpg`. Slots without a photo show a numbered tinted
block, not a broken image.

**Hero / person / CV / projects copy** — all in the same file, same pattern.

## Sidequests rotator

`src/components/sidequests/SidequestRotator.tsx`. All 12 satellites sit on one
flat horizon exactly level with the centre of the large central image
(`ringCy` equals the central image's own vertical centre, not an offset from
its edge). The ring's radius is tightened (`rx`/`ry` reduced) to sit closer to
the core. Satellites carry no motion beyond the shared rotation value — no
hover scale, no idle float, no bobbing; drag, sideways wheel, click and arrow
keys are the only ways it moves.

## Backdrop

Inner pages only (not the landing page), mounted once in the root layout so it
survives navigation between them; releases its WebGL context on unmount.
`backdrop.enabled` / `backdrop.effect` in the config.
