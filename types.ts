
export type AgeGroup = '5-7' | '8-10' | '11-13';

export interface NoorMessage {
    text: string;
    duration?: number; // ms, default 3000
    isSoftPause?: boolean; // If true, requires tap to dismiss/resume
}

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
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category?: 'math' | 'logic' | 'trivia' | 'science' | 'history' | 'geography' | 'language';
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
