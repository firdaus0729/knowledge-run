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
      setGameState(prev => ({
        ...prev,
        distance: data.distance !== undefined ? data.distance : prev.distance,
        stars: data.stars !== undefined ? data.stars : prev.stars,
        hearts: (data as any).hearts !== undefined ? (data as any).hearts : prev.hearts,
        isGameOver: (data as any).isGameOver !== undefined ? (data as any).isGameOver : prev.isGameOver,
        activeQuestion: (data as any).activeQuestion,
        activeMessage: (data as any).activeMessage,
        noorMessage: (data as any).noorMessage,
        stageResults: (data as any).stageResults
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