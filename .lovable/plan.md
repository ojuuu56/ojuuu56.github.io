# Interactive 3D Art Gallery — "The Hangar"

Replace the Conjure prompt-box with a real interlude: a small 3D room where visitors can drift between framed pieces, play a couple of tiny games, and stumble on hidden art. Pre-generated photoreal images (created by me now, saved as project assets) hang on the walls with subtle motion.

## What the visitor sees

A single fullscreen scene pinned inside the scroll flow (between Work 10 and Work 11). Inside:

1. A softly-lit octagonal hangar with 6 framed pieces on the walls, gently swaying / breathing / catching light.
2. A floating "orb of curiosity" the visitor drags with the mouse (or finger) — release it to see it drift back with spring physics.
3. Three tiny interactive vignettes ("games") mounted like plinths:
   - **Paper Plane Toss** — click-drag to throw a paper plane; it arcs and lands, score = distance.
   - **Constellation** — click 5 stars to connect them; a hidden artwork fades in when the shape closes.
   - **Ripple Pond** — click anywhere on a water plane to send GLSL ripples; long-press reveals a reflected piece.
4. A quiet "exit" prompt at the bottom that resumes the scroll.

Photoreal aesthetic, no cartoon shading. Grain + bloom carries over from the existing post-processing.

## Tech (matches existing stack)

React, R3F (Three.js), GSAP + ScrollTrigger, custom GLSL for ripples / frame shimmer, lucide-react for the tiny HUD icons.

## Files

```text
src/assets/gallery/
  piece-01.jpg.asset.json … piece-06.jpg.asset.json   (6 photoreal images I generate now)
src/components/gallery/
  Hangar.tsx              // R3F scene: room, frames, orb, plinths, camera rig
  Frame.tsx               // Framed artwork with hover lift + light response
  Orb.tsx                 // Draggable spring-physics orb
  games/
    PaperPlane.tsx
    Constellation.tsx
    RipplePond.tsx        // GLSL ripple shader
  ui/GalleryHUD.tsx       // Score chips, hint text, exit cue
src/components/cinematic/
  Overlay.tsx             // Swap <Conjure /> for <GallerySection />
  GallerySection.tsx      // Sticky wrapper hosting Hangar + HUD
```

Delete `Conjure.tsx`, `streamImage.ts`, `src/routes/api/generate-image.ts`.

## Interaction / motion notes

- Camera: orbits slowly around the room center; the visitor can nudge it with pointer drag (damped OrbitControls-lite, clamped angles).
- Frames: each is a `<mesh>` with the generated image as texture, `MeshStandardMaterial`, subtle rotateY sway keyed off `useFrame` (sine, seeded per frame). Hover triggers a GSAP tween lifting it forward + brightening a spotlight.
- Orb: `useDrag` via pointer events; released orb runs a spring back to origin (GSAP `elastic.out`).
- Paper Plane: pointer-drag charges throw vector; on release, animate along a bezier arc with GSAP; scoreboard in HUD.
- Constellation: 5 twinkling point-sprites; clicking each draws an additive-blended line segment; on completion, a hidden 7th frame fades in on the ceiling.
- Ripple Pond: fullscreen-ish plane on the floor; GLSL fragment computes concentric ripples from click positions stored in a small uniform array; each click also drops a caustic light.

## Scroll choreography

`GallerySection` uses `position: sticky; height: 300vh`. ScrollTrigger pins it, freezes body scroll while pointer is engaged with a game (via `ScrollTrigger.disable()` on pointerdown inside canvas, re-enable on pointerup + 400ms). Cinematic Scene behind stays visible through the transparent canvas background so the plane still flies past outside the hangar windows.

## Responsiveness

- Desktop: full 3D hangar, all games enabled.
- Tablet: same, camera fov widened, HUD collapses to icons.
- Mobile (<640px): drop to a simplified 2.5D — frames laid out as parallax cards drifting in a horizontal swipe, single game (Ripple Pond) still active. Detected via `matchMedia`.

## Performance

- One shared `MeshStandardMaterial` per frame, textures loaded via `useTexture` with `anisotropy: 8`, `colorSpace: SRGB`.
- Instanced dust particles reused from existing `ParticleField`.
- Ripple shader uses max 8 active ripples; older entries evicted.
- `dpr={[1, 1.75]}`, `frameloop="demand"` while idle, switch to `"always"` on pointer activity.

## Image generation

I generate 6 photoreal images now via `imagegen--generate_image` (standard quality, warm cinematic tones matching the sky palette) and upload each with `lovable-assets create` so they ship as CDN pointers, not repo binaries. Themes: a lone lantern in mist, a paper crane on marble, a red door in snow, a violin case on velvet, a hallway of arches, a hand holding a match. All 1024×1024, dimmed edges so they read as gallery pieces.

## Out of scope

- No text prompt / on-the-fly generation (removed per feedback).
- No multiplayer / persistence — scores live in local state.
- No audio (can be added later).
