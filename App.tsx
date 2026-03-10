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

type GameStatus = 'home' | 'how_to_play' | 'age_select' | 'game_details' | 'playing';

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Game Flow: home -> how_to_play -> age_select -> game_details -> playing
  const [gameStatus, setGameStatus] = useState<GameStatus>('home');
  
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
      if (d.returnToMenu) setGameStatus('home');
      setGameState(prev => ({
        ...prev,
        distance: d.distance !== undefined ? d.distance as number : prev.distance,
        stars: d.stars !== undefined ? d.stars as number : prev.stars,
        hearts: d.hearts !== undefined ? d.hearts as number : prev.hearts,
        isGameOver: d.isGameOver !== undefined ? d.isGameOver as boolean : prev.isGameOver,
        activeQuestion: d.activeQuestion as GameState['activeQuestion'],
        activeMessage: d.activeMessage as GameState['activeMessage'],
        noorMessage: d.noorMessage as GameState['noorMessage'],
        stageResults: d.stageResults as GameState['stageResults'],
        isHanging: d.isHanging !== undefined ? d.isHanging as boolean : prev.isHanging,
        climbProgress: d.climbProgress !== undefined ? d.climbProgress as number : prev.climbProgress,
        stageProgressPercent: d.stageProgressPercent !== undefined ? d.stageProgressPercent as number : prev.stageProgressPercent,
        currentStage: d.currentStage !== undefined ? d.currentStage as number : prev.currentStage,
        stageTitle: 'stageTitle' in d ? (d.stageTitle as string | null) : prev.stageTitle,
        soundEnabled: d.soundEnabled !== undefined ? d.soundEnabled as boolean : prev.soundEnabled,
        musicEnabled: d.musicEnabled !== undefined ? d.musicEnabled as boolean : prev.musicEnabled,
        activePuzzle: 'activePuzzle' in d ? (d.activePuzzle as GameState['activePuzzle']) : prev.activePuzzle,
        isPaused: 'isPaused' in d ? (d.isPaused as boolean) : prev.isPaused
      }));
    });

    gameRef.current = game;
    setIsLoaded(true);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // 1. Home -> How To Play
  const handleStartGameClick = () => {
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
      setGameStatus('age_select');
  };

  // 3. Age Selection -> Game Details
  const handleAgeSelect = (age: AgeGroup) => {
      setGameState(prev => ({ ...prev, ageGroup: age }));
      setGameStatus('game_details');
  };

  // 4. Game Details -> Playing
  const handleGameDetailsNext = () => {
      if (gameRef.current) {
        gameRef.current.scene.stop('HomeScene');
        gameRef.current.scene.start('MainScene');
        setGameStatus('playing');
      }
  };

  const handleRestart = () => {
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
    if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
        if (scene) {
            scene.resumeGameFromNoor(isCorrect);
        }
    }
  };

  const handleMessageDismiss = () => {
    if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
        if (scene) {
            scene.dismissMessage();
        }
    }
  };

  const handleStageResultsContinue = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (scene) {
        scene.continueAfterStageResults();
      }
    }
  };

  const handleSoundToggle = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.playSfx?.('buttonConfirm');
      if (scene?.setSoundEnabled) scene.setSoundEnabled(!(gameState.soundEnabled !== false));
    }
  };

  const handlePuzzleAnswer = (index: number) => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (scene && typeof (scene as any).resolvePuzzleAnswer === 'function') {
        (scene as any).resolvePuzzleAnswer(index);
      }
    }
  };

  const handleMusicToggle = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.playSfx?.('buttonConfirm');
      if (scene?.setMusicEnabled) scene.setMusicEnabled(!(gameState.musicEnabled !== false));
    }
  };

  const handlePauseClick = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.pauseGame?.();
    }
  };

  const handleResumeClick = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.resumeGame?.();
    }
  };

  const handleRestartStageClick = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
      scene?.restartStage?.();
    }
  };

  const handleReturnToMenuClick = () => {
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
            <div className="text-yellow-400 font-bold text-xl tracking-widest">LOADING WORLD</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;