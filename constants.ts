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

/** Step 2 – Progress system: distance in meters, ~4.5–5 m/s at base speed */
export const PROGRESS = {
  /** Stage 1 length in meters (~90–100 s at ~4.8 m/s) */
  STAGE_1_LENGTH_M: 450,
  /** Stage 2 length in meters (progress bar cap; can be tuned) */
  STAGE_2_LENGTH_M: 500,
  /** Converts world movement to displayed meters (~4.8 m/s at RUN_SPEED 350) */
  DISTANCE_SCALE: 0.0137,
};