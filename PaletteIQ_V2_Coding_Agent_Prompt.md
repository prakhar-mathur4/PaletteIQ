# PaletteMe V2 — Coding Agent Prompt
> ML-Enhanced Skin Tone Color Palette Web App  
> Version 2.0 | May 2026

---

## Overview

Build a **single-page web application** called **PaletteMe** that uses an ML pipeline to analyze a user's skin tone from a photo and recommend a personalized color palette for fashion, makeup, and styling.

---

## Core User Flow

1. **Landing screen** — headline + CTA ("Discover Your Colors"). BlazeFace model pre-loads in the background with a progress bar.
2. **Photo input** — user either uploads a photo (drag-and-drop or file picker) OR captures via webcam (`getUserMedia`)
3. **ML Analysis** — 4-stage pipeline runs client-side (detailed below)
4. **Results screen** — detected skin tone swatch + undertone badge, three palette sections (Wardrobe Staples / Accent Colors / Colors to Avoid), written analysis sentence
5. **Export** — copy individual hex codes to clipboard OR download palette as PNG or JSON

---

## ML Analysis Pipeline

Implement these four stages in order:

### Stage 1 — Face Detection

- Load `@tensorflow-models/blazeface` lazily after the landing screen renders (~1 MB)
- Call `blazeface.load()` then `model.estimateFaces(imageElement)`
- Extract bounding box `(topLeft, bottomRight)` and the 6 landmark points (eye positions, nose tip, mouth corners)
- If `estimateFaces()` returns an empty array → activate center-crop fallback (see Edge Cases) and show a warning banner

### Stage 2 — Skin Zone Estimation

From the bounding box + landmarks, compute four sampling rectangles:

- **Forehead** — top 25% of bounding box, center 40% width
- **Left cheek** — from left eye landmark, offset 20% down and 15% outward, 15% × 15% patch
- **Right cheek** — mirror of left cheek
- **Nose bridge** — midpoint between eyes, offset 10% down, 10% × 10% patch

Draw the image onto a hidden `<canvas>` and use `ctx.getImageData()` to extract pixel arrays from each zone.

### Stage 3 — HSV Skin Masking

Convert each sampled pixel from RGB → HSV using a pure JS utility function. Keep only pixels passing **all three** conditions:

| Channel | Range |
|---|---|
| Hue | 0° – 50° |
| Saturation | 0.10 – 0.80 |
| Value | 0.20 – 0.95 |

Discard all other pixels before passing to clustering.

### Stage 4 — K-Means Clustering

- Implement K-Means with **K=3** using `tf.tensor2d`, `tf.norm`, and `tf.moments` — do NOT use an external clustering library
- Run for a maximum of 20 iterations or until centroids converge (delta < 0.5)
- Select the centroid with the highest pixel count as the **representative skin tone RGB**
- Convert this RGB to HSL for classification

---

## Classification Logic

```
RGB → HSL

Depth (by HSL Lightness):
  Fair   → L > 0.78
  Light  → L 0.65 – 0.78
  Medium → L 0.52 – 0.65
  Tan    → L 0.40 – 0.52
  Deep   → L 0.27 – 0.40
  Rich   → L < 0.27

Undertone (by Hue + Saturation):
  Warm    → H 20–50°,  S > 0.25
  Cool    → H 340–20°, S > 0.20
  Neutral → S < 0.15  →  fall back to Warm palette
```

This gives **12 combinations**. Hardcode a palette map object with all 12 keys (e.g. `"medium_warm"`, `"fair_cool"`).

Each key maps to:

```js
{
  staples: [{ hex: "#RRGGBB", name: "Color Name" }],  // 4 colors
  accents: [{ hex: "#RRGGBB", name: "Color Name" }],  // 4 colors
  avoid:   [{ hex: "#RRGGBB", name: "Color Name" }],  // 4 colors
}
```

### Palette Map Reference

| Combination | Staples Direction | Avoid |
|---|---|---|
| Fair + Cool | Soft pastels, icy blues, lavender, rose | Orange, mustard |
| Fair + Warm | Peach, cream, golden yellow, warm blush | Stark cool greys |
| Light + Cool | Dusty mauve, sage green, slate blue, powder pink | Neon, harsh black |
| Light + Warm | Terracotta, apricot, warm white, camel | Cool pastels |
| Medium + Cool | Sapphire, emerald, fuchsia, cool red | Muted browns |
| Medium + Warm | Burnt sienna, warm olive, rust, golden brown | Icy pastels |
| Tan + Cool | Cobalt, magenta, true white, burgundy | Beige, khaki |
| Tan + Warm | Mustard, coppery orange, warm caramel | Cool grey |
| Deep + Cool | Royal blue, violet, hot pink, crisp white | Muddy browns |
| Deep + Warm | Deep burgundy, burnt orange, copper, warm gold | Pastels |
| Rich + Cool | Electric blue, fuchsia, bright white, cool purple | Earth tones |
| Rich + Warm | Mahogany, amber, warm red, champagne gold | Cool whites |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React (functional components + hooks) — single `.jsx` artifact |
| ML Model | `@tensorflow-models/blazeface` via CDN (lazy-loaded) |
| TF Runtime | `@tensorflow/tfjs` via CDN |
| Styling | Tailwind CSS core utility classes only |
| Icons | `lucide-react@0.383.0` |
| Canvas | HTML5 Canvas API — hidden element for pixel extraction |
| Export | `Canvas.toBlob()` for PNG, `JSON.stringify()` for JSON |
| Webcam | `navigator.mediaDevices.getUserMedia()` — HTTPS required |
| Backend | None — fully client-side, zero server dependency |

---

## UI & Design

**Aesthetic:** Soft luxury — editorial beauty magazine meets digital-native warmth.

| Token | Value |
|---|---|
| Background | `#FDF8F5` (warm ivory) |
| Primary accent | `#D4748C` (muted rose) |
| Text | `#2D2D2D` (deep charcoal) |
| Font — display | Serif (headlines, palette names) |
| Font — body | Humanist sans-serif |

### Screen-by-Screen

**Landing**
- Centered hero with headline and subtitle
- Upload zone (dashed border, drag-and-drop) and "Take Photo" button side by side
- Model loading → subtle progress bar at top with label "Preparing your color analysis…"

**Analysis (in progress)**
- Full-screen overlay spinner
- Stage label updates: "Detecting face…" → "Analysing skin tone…" → "Matching palette…"

**Results**
- Full-width skin tone strip: large swatch + hex code + undertone badge (e.g. "Warm · Medium")
- Three horizontal swatch rows: Wardrobe Staples / Accent Colors / Colors to Avoid
- One-paragraph written analysis below the swatches
- Export bar at the bottom: "Copy All Hex" + "Download PNG" + "Download JSON"

**Swatch Component**
- Rounded square color block
- Hex code below in monospace
- Color name below that
- Click anywhere to copy hex → toast confirmation "Copied #RRGGBB"

**Layout**
- Mobile-first, single column
- Two-column upload options on desktop (≥ 768px)

---

## Edge Cases

| Scenario | Handling |
|---|---|
| No face detected | Center-crop fallback (sample center 20% × 20%); show orange warning banner: "We couldn't detect a face — results may be less accurate" |
| Image too dark (avg V < 0.20) | Block analysis; show error: "Photo is too dark — try a well-lit selfie" |
| Image too bright (avg V > 0.95) | Block analysis; show error: "Photo is overexposed — try moving out of direct sunlight" |
| Non-JPEG/PNG file | Validate on drop/select; show error before any processing begins |
| Webcam permission denied | Hide webcam option; switch to upload-only mode with an explanatory note |
| < 50 pixels pass HSV mask | Fall back to unmasked zone average; show accuracy warning: "Limited skin data — result may be approximate" |
| Model load failure | Show retry button with message: "Couldn't load the analysis model — check your connection and try again" |

---

## Implementation Notes

- Inject TF.js and BlazeFace CDN `<script>` tags into `document.head` on component mount; wrap in a `Promise` that resolves when `window.blazeface` is available before starting any analysis
- The hidden `<canvas>` element should be sized to match the natural image dimensions (not CSS dimensions) to avoid coordinate scaling bugs in `getImageData()`
- K-Means centroids should be initialized using K-Means++ seeding (pick first centroid randomly, then pick subsequent ones with probability proportional to squared distance) for faster, more stable convergence
- Dispose TF.js tensors with `tf.dispose()` or `tf.tidy()` after each analysis run to prevent memory leaks across multiple photo uploads
- Validate image dimensions before processing — reject images narrower than 100px or taller than 8000px


---

## Deliverable

A single self-contained React `.jsx` file that runs in the artifact viewer with no build step. All ML model loading, pixel processing, clustering, classification, palette lookup, and UI rendering in one file.


---

## Out of Scope

- No backend, no user accounts, no image storage
- No FaceMesh (468 landmarks) — BlazeFace bounding box only for V2
- No seasonal colour typing (Spring / Summer / Autumn / Winter) — V3 roadmap
- No social sharing or affiliate product links — V3 roadmap
- No OpenCV.js — TF.js pipeline is sufficient for V2 accuracy targets
