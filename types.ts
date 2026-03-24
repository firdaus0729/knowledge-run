
export type AgeGroup = '5-7' | '8-10' | '11-13';

export interface NoorMessage {
    text: string;
    duration?: number; // ms, default 3000
    isSoftPause?: boolean; // If true, requires tap to dismiss/resume
}

// --- MINI PUZZLES (Storm / Library / Dual Path) ---
export type PuzzleType = 'STORM' | 'LIBRARY' | 'DUAL_PATH' | 'CARPET_GATE' | 'BRIDGE_BOX';

export type PuzzleMode = 'MCQ' | 'ONE_LINE' | 'MEMORY' | 'MATCH';

export interface PuzzlePoint {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
}

export interface MatchPair {
  leftIndex: number;
  rightIndex: number;
}

export interface BasePuzzle {
  type: PuzzleType;
  mode: PuzzleMode;
  id: string;
  prompt: string;
  /** Auto-timeout duration in ms (5–10 seconds). */
  timeoutMs: number;
}

export interface McqPuzzle extends BasePuzzle {
  mode: 'MCQ';
  options: string[];
  correctIndex: number;
}

export interface OneLinePuzzle extends BasePuzzle {
  mode: 'ONE_LINE';
  shapeId: string;
  points: PuzzlePoint[];
}

export interface MemoryPuzzle extends BasePuzzle {
  mode: 'MEMORY';
  sequence: string[];
  showMs: number;
}

export interface MatchPuzzle extends BasePuzzle {
  mode: 'MATCH';
  leftItems: string[];
  rightItems: string[];
  pairs: MatchPair[];
}

export type ActivePuzzle = McqPuzzle | OneLinePuzzle | MemoryPuzzle | MatchPuzzle;

export type PuzzleAnswerPayload =
  | { mode: 'MCQ'; selectedIndex: number }
  | { mode: 'ONE_LINE'; success: boolean }
  | { mode: 'MEMORY'; order: number[] }
  | { mode: 'MATCH'; pairs: MatchPair[] };

/** Shown after desert end or library event */
export interface StageResultsData {
  stageName: string;
  distance: number;
  stars: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSeconds: number;
}

export interface GameState {
  distance: number;
  hearts: number;
  stars: number;
  isGameOver: boolean;
  activeQuestion?: Question | null; // null if running, object if waiting for answer
  activeMessage?: string; // Generic system messages (e.g. upgrades)
  noorMessage?: NoorMessage | null; // The new Guidance System state
  ageGroup?: AgeGroup;
  // Phase 4: Earthquake/Climbing
  isHanging?: boolean;
  climbProgress?: number; // 0 to 100
  /** End-of-stage results (desert / library); show StageResultsUI and call onContinue */
  stageResults?: StageResultsData | null;
  // Step 2 – Progress system
  /** 0–100, from actual distance / stage length */
  stageProgressPercent?: number;
  /** Current stage (1 = desert, 2 = city) */
  currentStage?: number;
  /** Stage title overlay (Arabic); show 2–3 s then fade out */
  stageTitle?: string | null;
  /** When true, game has ended (e.g. after Bayt Al-Hikma); React should show home. */
  returnToMenu?: boolean;
  /** Step 5 – Audio: SFX on/off (persisted in localStorage). */
  soundEnabled?: boolean;
  /** Step 5 – Audio: BGM on/off (persisted in localStorage). */
  musicEnabled?: boolean;
  /** Active mini-puzzle (storm / library / dual path); null when none. */
  activePuzzle?: ActivePuzzle | null;
  /** True when the pause menu is open (Resume / Restart / Return to menu). */
  isPaused?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctIndex: number;
  category?: 'math' | 'logic' | 'trivia' | 'science' | 'history' | 'geography' | 'language' | 'image';
}

export interface QuestionOption {
  text?: string;
  image?: string;
  alt?: string;
}

// Colors for the Arabic/Evening theme
export enum ThemeColors {
  SkyTop = 0x1a1625,    // Deep purple/black
  SkyBottom = 0x4a3b69, // Muted purple
  Ground = 0xc2b280,    // Earth tone (Sand/Clay)
  GroundDark = 0x8c7e56, // Shadowed ground
  StoneLight = 0xeaddcf, // Pale limestone top
  Gold = 0xffd700,      // Noor/UI highlight
  CityBack = 0x2d2640,  // Distant silhouette
  CityMid = 0x3d3252,   // Midground silhouette
}
