// Shared reveal signal between Overlay (DOM/GSAP) and Scene (R3F/GLSL).
// Overlay pushes a 0..1 intensity when a card reveal is active;
// Scene reads it each frame to boost grain, dust and bloom subtly.
export const revealSignal = { v: 0, target: 0 };
