// Fallback to 800x600 if window dimensions are reported as 0 (e.g. headless/unmounted state)
export const GAME_WIDTH = window.innerWidth > 0 ? window.innerWidth : 800;
export const GAME_HEIGHT = window.innerHeight > 0 ? window.innerHeight : 600;

// Camera tuning – zoom in slightly so the road and obstacles feel larger.
export const GAMEPLAY_CAMERA_ZOOM = 1.18;

/** Ground: run surface is this many pixels from the bottom (raised = larger value). */
export const RUN_SURFACE_FROM_BOTTOM = 182;
export const GROUND_TILE_HEIGHT = 128;

/** Y coordinate of the run surface (top of ground). */
export function getGroundY(screenHeight: number): number {
  return screenHeight - RUN_SURFACE_FROM_BOTTOM;
}

/** Player spawn Y so feet sit on the run surface (accounts for body offset). */
export function getPlayerSpawnY(screenHeight: number): number {
  const FEET_BELOW_ORIGIN = 39;
  return getGroundY(screenHeight) - FEET_BELOW_ORIGIN;
}

/** Player spawn/reset X – accurate on both PC and mobile. */
export function getPlayerStartX(viewWidth: number): number {
  const MOBILE_BREAKPOINT = 600;
  const DESKTOP_X = 120;
  if (viewWidth >= MOBILE_BREAKPOINT) return DESKTOP_X;
  const pct = 0.11;
  const min = 80;
  return Math.max(min, Math.round(viewWidth * pct));
}

// Physics Tuning - "Variable Height"
export const PHYSICS = {
  GRAVITY: 2000,        // Heavy gravity for a snappy 0.7s jump
  JUMP_FORCE: -800,    // Force calculated to give ~0.7s hang time with the new gravity
  RUN_SPEED: 350,       // Normal/max run speed
  RUN_SPEED_START: 290, // Slower start so player can read the environment
  COYOTE_TIME: 100,     // ms
  BUFFER_TIME: 150,     // ms
};

/** Distance in meters with no obstacles at run start (tutorial: Nur explains jump first). */
export const INTRO_SAFE_DISTANCE_M = 22;

export const UI_STRINGS = {
  TITLE: "Knowledge Run",
  JUMP_INSTRUCTION: "Click or Tap to Jump",
};

/** Step 2 – Progress system: distance in meters, ~4.5–5 m/s at base speed */
export const PROGRESS = {
  /** Stage 1 length in meters (~90–100 s at ~4.8 m/s) */
  STAGE_1_LENGTH_M: 450,
  /** Stage 2 length in meters (progress bar cap; longer city before library) */
  STAGE_2_LENGTH_M: 600,
  /** Converts world movement to displayed meters (~4.8 m/s at RUN_SPEED 350) */
  DISTANCE_SCALE: 0.0137,
};