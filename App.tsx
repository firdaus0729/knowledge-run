import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGame } from './game/game';
import { GameUI } from './components/GameUI';
import { StageResultsUI } from './components/StageResultsUI';
import { HomeUI } from './components/HomeUI';
import { HowToPlayUI } from './components/HowToPlayUI';
import { GameDetailsUI } from './components/GameDetailsUI';
import { AgeSelectionUI } from './components/AgeSelectionUI';
import { GameState, AgeGroup } from './types';
import { MainScene } from './game/scenes/MainScene';
import { HomeScene } from './game/scenes/HomeScene';

type GameStatus = 'intro_gate' | 'home' | 'how_to_play' | 'age_select' | 'game_details' | 'loading_play' | 'playing';

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const uiButtonAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const menuBgmAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Game Flow: intro_gate -> home -> how_to_play -> age_select -> game_details -> playing
  const [gameStatus, setGameStatus] = useState<GameStatus>('intro_gate');
  
  const [gameState, setGameState] = useState<GameState>({
    distance: 0,
    hearts: 3,
    stars: 0,
    isGameOver: false,
    activeQuestion: null,
    activeMessage: undefined,
    noorMessage: null,
    ageGroup: undefined
  });

  useEffect(() => {
    if (gameRef.current) return;

    const game = createGame('game-container', (data) => {
      const d = data as Record<string, unknown>;
      if (d.returnToMenu) {
        setGameStatus('home');
        // When returning to the main menu after gameplay, resume the menu music.
        try {
          const musicDisabled =
            typeof localStorage !== 'undefined' && localStorage.getItem('musicEnabled') === '0';
          if (!musicDisabled && menuBgmAudioRef.current) {
            void menuBgmAudioRef.current.play();
          }
        } catch {
          // ignore
        }
      }
      setGameState(prev => ({
        ...prev,
        distance: d.distance !== undefined ? (d.distance as number) : prev.distance,
        stars: d.stars !== undefined ? (d.stars as number) : prev.stars,
        hearts: d.hearts !== undefined ? (d.hearts as number) : prev.hearts,
        isGameOver: d.isGameOver !== undefined ? (d.isGameOver as boolean) : prev.isGameOver,
        activeQuestion: d.activeQuestion as GameState['activeQuestion'],
        activeMessage: d.activeMessage as GameState['activeMessage'],
        noorMessage: d.noorMessage as GameState['noorMessage'],
        stageResults: d.stageResults as GameState['stageResults'],
        isHanging: d.isHanging !== undefined ? (d.isHanging as boolean) : prev.isHanging,
        climbProgress: d.climbProgress !== undefined ? (d.climbProgress as number) : prev.climbProgress,
        stageProgressPercent: d.stageProgressPercent !== undefined ? (d.stageProgressPercent as number) : prev.stageProgressPercent,
        currentStage: d.currentStage !== undefined ? (d.currentStage as number) : prev.currentStage,
        stageTitle: 'stageTitle' in d ? (d.stageTitle as string | null) : prev.stageTitle,
        soundEnabled: d.soundEnabled !== undefined ? (d.soundEnabled as boolean) : prev.soundEnabled,
        musicEnabled: d.musicEnabled !== undefined ? (d.musicEnabled as boolean) : prev.musicEnabled,
        activePuzzle: 'activePuzzle' in d ? (d.activePuzzle as GameState['activePuzzle']) : prev.activePuzzle,
        isPaused: 'isPaused' in d ? (d.isPaused as boolean) : prev.isPaused
      }));
    });

    gameRef.current = game;

    const waitForAudio = (audio: HTMLAudioElement | null): Promise<void> =>
      new Promise((resolve) => {
        if (!audio) return resolve();
        const onReady = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('loadeddata', onReady);
          resolve();
        };
        audio.addEventListener('canplaythrough', onReady);
        audio.addEventListener('loadeddata', onReady);
        // Fallback in case events never fire
        setTimeout(() => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('loadeddata', onReady);
          resolve();
        }, 4000);
        try {
          audio.load();
        } catch {
          resolve();
        }
      });

    const preloadUiAndMenuAudio = async () => {
      // Prepare UI button sound
      if (!uiButtonAudioRef.current) {
        const btn = new Audio('/audio/button.wav');
        btn.preload = 'auto';
        btn.volume = 0.6;
        uiButtonAudioRef.current = btn;
      }

      // Prepare main menu BGM
      if (!menuBgmAudioRef.current) {
        const menu = new Audio('/audio/mainMenu.mp3');
        menu.preload = 'auto';
        menu.loop = true;
        menu.volume = 0.28;
        menuBgmAudioRef.current = menu;
      }

      await Promise.all([
        waitForAudio(uiButtonAudioRef.current),
        waitForAudio(menuBgmAudioRef.current)
      ]);
    };

    void (async () => {
      try {
        await preloadUiAndMenuAudio();
      } finally {
        setIsLoaded(true);
      }
    })();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Global BGM controller (HTMLAudio) so it can start on first user gesture.
  useEffect(() => {
    try {
      if (!bgmAudioRef.current) {
        const a = new Audio('/audio/background-music.mp3');
        a.preload = 'auto';
        a.loop = true;
        a.volume = 0.28;
        bgmAudioRef.current = a;
      }
      (globalThis as any).__kr_bgm = {
        start: async () => {
          const a = bgmAudioRef.current;
          if (!a) return;
          try { await a.play(); } catch (_) { /* autoplay blocked */ }
        },
        pause: () => { bgmAudioRef.current?.pause(); },
        resume: async () => {
          const a = bgmAudioRef.current;
          if (!a) return;
          try { await a.play(); } catch (_) { /* autoplay blocked */ }
        },
        stop: () => {
          const a = bgmAudioRef.current;
          if (!a) return;
          a.pause();
          try { a.currentTime = 0; } catch (_) { /* ignore */ }
        }
      };
    } catch (_) {
      // ignore
    }
    return () => {
      try { delete (globalThis as any).__kr_bgm; } catch (_) { /* ignore */ }
    };
  }, []);

  // Auto-attempt to start main menu BGM as soon as LOADING WORLD finishes
  // and the home screen is visible. Browsers may still block this on
  // very first load; we catch and ignore that case so it doesn't log errors.
  useEffect(() => {
    if (!isLoaded || gameStatus !== 'home') return;

    const musicDisabled =
      typeof localStorage !== 'undefined' && localStorage.getItem('musicEnabled') === '0';
    if (musicDisabled) return;

    if (!menuBgmAudioRef.current) {
      const menu = new Audio('/audio/mainMenu.mp3');
      menu.preload = 'auto';
      menu.loop = true;
      menu.volume = 0.28;
      menuBgmAudioRef.current = menu;
    }

    const menu = menuBgmAudioRef.current;
    if (!menu) return;

    void menu.play().catch(() => {
      // Autoplay blocked – will be retried on first button click.
    });
  }, [isLoaded, gameStatus]);

  // When MainScene finishes heavy setup and shows Nur's first intro bubble,
  // `noorMessage` becomes non-null. Keep the \"PREPARING YOUR ADVENTURE\"
  // overlay visible until that happens so the player doesn't see a frozen frame.
  useEffect(() => {
    if (gameStatus === 'loading_play' && gameState.noorMessage) {
      setGameStatus('playing');
    }
  }, [gameStatus, gameState.noorMessage]);

  const playUIButton = () => {
    try {
      if (!uiButtonAudioRef.current) {
        const a = new Audio('/audio/button.wav');
        a.preload = 'auto';
        a.volume = 0.6;
        uiButtonAudioRef.current = a;
      }
      // Clone so rapid clicks don't cut each other off.
      const a = uiButtonAudioRef.current.cloneNode(true) as HTMLAudioElement;
      a.volume = uiButtonAudioRef.current.volume;
      void a.play();
    } catch (_) {
      // ignore (browser policy / missing audio device)
    }

    // Also trigger Phaser-side (when MainScene exists).
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.playButton?.();
    }
  };

  // Intro gate: shown once after LOADING WORLD, before the animated home menu.
  // Starts menu music and resumes Phaser audio context on the very first user tap.
  const handleIntroGateClick = () => {
    playUIButton();

    try {
      const musicDisabled =
        typeof localStorage !== 'undefined' && localStorage.getItem('musicEnabled') === '0';
      if (!musicDisabled) {
        if (!menuBgmAudioRef.current) {
          const menu = new Audio('/audio/mainMenu.mp3');
          menu.preload = 'auto';
          menu.loop = true;
          menu.volume = 0.28;
          menuBgmAudioRef.current = menu;
        }
        void menuBgmAudioRef.current?.play();
      }

      // Also resume Phaser's Web Audio context on the first click to avoid warnings.
      const anyGame = gameRef.current as any;
      const audioCtx = anyGame?.sound?.context as AudioContext | undefined;
      if (audioCtx && audioCtx.state === 'suspended') {
        void audioCtx.resume();
      }
    } catch {
      // ignore – browser may still block, but subsequent clicks can retry
    }

    setGameStatus('home');
  };

  // 1. Home -> How To Play
  const handleStartGameClick = () => {
      playUIButton();

      if (gameRef.current) {
          const homeScene = gameRef.current.scene.getScene('HomeScene') as HomeScene;
          
          if (homeScene) {
              homeScene.startGameTransition(() => {
                  setGameStatus('how_to_play');
              });
          } else {
              setGameStatus('how_to_play');
          }
      }
  };

  // 2. How To Play -> Age Selection
  const handleHowToPlayNext = () => {
      playUIButton();
      setGameStatus('age_select');
  };

  // 3. Age Selection -> Game Details
  const handleAgeSelect = (age: AgeGroup) => {
      playUIButton();
      setGameState(prev => ({ ...prev, ageGroup: age }));
      setGameStatus('game_details');
  };

  // 4. Game Details -> Playing (show loading while MainScene create() runs)
  const handleGameDetailsNext = () => {
      playUIButton();
      // Start background music when entering the actual game.
      try {
        // Stop menu BGM when switching into gameplay.
        if (menuBgmAudioRef.current) {
          menuBgmAudioRef.current.pause();
          try { menuBgmAudioRef.current.currentTime = 0; } catch { /* ignore */ }
        }
        void (globalThis as any).__kr_bgm?.start?.();
      } catch (_) {
        /* ignore */
      }
      setGameStatus('loading_play');
      // Yield so the "Preparing your adventure..." overlay can paint before blocking create().
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (gameRef.current) {
            gameRef.current.scene.stop('HomeScene');
            gameRef.current.scene.start('MainScene');
          }
        }, 0);
      });
  };

  const handleRestart = () => {
    playUIButton();
    try { void (globalThis as any).__kr_bgm?.start?.(); } catch (_) { /* ignore */ }
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene');
      if (scene) {
        scene.scene.restart();
      }
    }
    setGameState(prev => ({
      ...prev,
      distance: 0,
      hearts: 3,
      stars: 0,
      isGameOver: false,
      activeQuestion: null,
      activeMessage: undefined,
      noorMessage: null,
      stageResults: undefined
    }));
  };
  
  const handleNoorAnswer = (isCorrect: boolean) => {
    playUIButton();
    if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
        if (scene) {
            scene.resumeGameFromNoor(isCorrect);
        }
    }
  };

  const handleMessageDismiss = () => {
    playUIButton();
    if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
        if (scene) {
            scene.dismissMessage();
        }
    }
  };

  const handleStageResultsContinue = () => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (scene) {
        scene.continueAfterStageResults();
      }
    }
  };

  const handleSoundToggle = () => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (scene?.setSoundEnabled) scene.setSoundEnabled(!(gameState.soundEnabled !== false));
    }
  };

  const handlePuzzleAnswer = (index: number) => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (scene && typeof (scene as any).resolvePuzzleAnswer === 'function') {
        (scene as any).resolvePuzzleAnswer(index);
      }
    }
  };

  const handleMusicToggle = () => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (scene?.setMusicEnabled) scene.setMusicEnabled(!(gameState.musicEnabled !== false));
    }
  };

  const handlePauseClick = () => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.pauseGame?.();
    }
  };

  const handleResumeClick = () => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.resumeGame?.();
    }
  };

  const handleRestartStageClick = () => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.restartStage?.();
    }
  };

  const handleReturnToMenuClick = () => {
    playUIButton();
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.returnToMainMenu?.();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver && e.key.toLowerCase() === 'r') {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState.isGameOver]);

  return (
    <div className="relative w-full h-screen bg-[#1a1625] overflow-hidden select-none touch-none">
       {/* Game Container */}
      <div id="game-container" className="absolute inset-0 z-0" />
      
      {/* Intro Gate: subtle tap-to-begin screen before main menu */}
      {isLoaded && gameStatus === 'intro_gate' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1625] z-20">
          <div className="flex flex-col items-center gap-6 px-4 text-center">
            <div className="text-yellow-300 text-2xl md:text-3xl font-bold tracking-wide">
              اضغط لبدء المغامرة
            </div>
            <button
              type="button"
              onClick={handleIntroGateClick}
              className="px-10 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-lg shadow-lg shadow-amber-500/40 transition transform hover:-translate-y-0.5"
            >
              ابدأ المغامرة
            </button>
          </div>
        </div>
      )}
      
      {/* 1. Home Screen UI */}
      {isLoaded && gameStatus === 'home' && (
          <HomeUI onStart={handleStartGameClick} />
      )}
      
      {/* 2. How To Play */}
      {isLoaded && gameStatus === 'how_to_play' && (
          <HowToPlayUI onNext={handleHowToPlayNext} />
      )}

      {/* 3. Age Selection */}
      {isLoaded && gameStatus === 'age_select' && (
          <AgeSelectionUI onSelect={handleAgeSelect} />
      )}

      {/* 4. Game Details */}
      {isLoaded && gameStatus === 'game_details' && (
          <GameDetailsUI onNext={handleGameDetailsNext} />
      )}

      {/* 4b. Loading before play (MainScene create / Nur intro prep) */}
      {isLoaded && gameStatus === 'loading_play' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1625] z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-amber-400 font-bold text-xl tracking-widest">جاري تحضير مغامرتك</div>
          </div>
        </div>
      )}
      
      {/* 5. Gameplay UI Overlay */}
      {isLoaded && gameStatus === 'playing' && (
        <>
          <GameUI 
            gameState={gameState} 
            onRestart={handleRestart} 
            onAnswer={handleNoorAnswer} 
            onMessageDismiss={handleMessageDismiss}
            onPuzzleAnswer={handlePuzzleAnswer}
            onSoundToggle={handleSoundToggle}
            onMusicToggle={handleMusicToggle}
            onPauseClick={handlePauseClick}
            onResumeClick={handleResumeClick}
            onRestartStageClick={handleRestartStageClick}
            onReturnToMenuClick={handleReturnToMenuClick}
          />
          {gameState.stageResults && (
            <StageResultsUI
              data={gameState.stageResults}
              onContinue={handleStageResultsContinue}
            />
          )}
        </>
      )}

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1625] z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-yellow-400 font-bold text-xl tracking-widest">جاري تحميل العالم</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;