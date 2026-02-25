// Fallback to 800x600 if window dimensions are reported as 0 (e.g. headless/unmounted state)
export const GAME_WIDTH = window.innerWidth > 0 ? window.innerWidth : 800;
export const GAME_HEIGHT = window.innerHeight > 0 ? window.innerHeight : 600;

// Physics Tuning - "Variable Height"
export const PHYSICS = {
  GRAVITY: 2000,        // Heavy gravity for a snappy 0.7s jump
  JUMP_FORCE: -800,    // Force calculated to give ~0.7s hang time with the new gravity
  RUN_SPEED: 350,       // Base speed
  COYOTE_TIME: 100,     // ms
  BUFFER_TIME: 150,     // ms
};

export const UI_STRINGS = {
  TITLE: "Knowledge Run",
  JUMP_INSTRUCTION: "Click or Tap to Jump",
};