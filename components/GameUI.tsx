
import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';

interface GameUIProps {
  gameState: GameState;
  onRestart?: () => void;
  onAnswer?: (isCorrect: boolean) => void;
  onIntroComplete?: () => void;
  onMessageDismiss?: () => void;
  onSoundToggle?: () => void;
  onMusicToggle?: () => void;
  onPauseClick?: () => void;
  onResumeClick?: () => void;
  onRestartStageClick?: () => void;
  onReturnToMenuClick?: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, onRestart, onAnswer, onMessageDismiss, onSoundToggle, onMusicToggle, onPuzzleAnswer, onPauseClick, onResumeClick, onRestartStageClick, onReturnToMenuClick }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

  // Step 2: smooth distance display (lerp toward game state)
  const [displayDistance, setDisplayDistance] = useState(0);
  const distanceRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Noor Guide State
  const [showNoor, setShowNoor] = useState(false);
  const [noorText, setNoorText] = useState('');

  // Stage title: optional fade-out before clearing (keep title visible for fade-out)
  const [stageTitleDisplay, setStageTitleDisplay] = useState<string | null>(null);
  const [stageTitleFadeOut, setStageTitleFadeOut] = useState(false);
  const stageTitleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle Noor Messages
  useEffect(() => {
    if (gameState.noorMessage) {
        setNoorText(gameState.noorMessage.text);
        setShowNoor(true);
    } else {
        setShowNoor(false);
    }
  }, [gameState.noorMessage]);

  // Reset question state
  useEffect(() => {
    if (gameState.activeQuestion) {
        setSelectedOption(null);
        setShowResult(null);
    }
  }, [gameState.activeQuestion]);

  // Step 2: smooth distance lerp (no jumps)
  useEffect(() => {
    const target = gameState.distance ?? 0;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const start = distanceRef.current;
    const startTime = performance.now();
    const duration = 120;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const value = start + (target - start) * eased;
      distanceRef.current = value;
      setDisplayDistance(value);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState.distance]);

  // Step 2: stage title – show on set, fade out when cleared
  useEffect(() => {
    if (gameState.stageTitle) {
      if (stageTitleTimeoutRef.current) {
        clearTimeout(stageTitleTimeoutRef.current);
        stageTitleTimeoutRef.current = null;
      }
      setStageTitleDisplay(gameState.stageTitle);
      setStageTitleFadeOut(false);
    } else if (stageTitleDisplay) {
      setStageTitleFadeOut(true);
      stageTitleTimeoutRef.current = setTimeout(() => {
        stageTitleTimeoutRef.current = null;
        setStageTitleDisplay(null);
        setStageTitleFadeOut(false);
      }, 500);
    }
    return () => {
      if (stageTitleTimeoutRef.current) {
        clearTimeout(stageTitleTimeoutRef.current);
        stageTitleTimeoutRef.current = null;
      }
    };
  }, [gameState.stageTitle, stageTitleDisplay]);

  const handleOptionClick = (index: number) => {
      if (showResult === 'correct' || !gameState.activeQuestion) return;
      
      const isCorrect = index === gameState.activeQuestion.correctIndex;
      setSelectedOption(index);

      if (isCorrect) {
          setShowResult('correct');
          setTimeout(() => {
              if (onAnswer) onAnswer(true);
          }, 1000);
      } else {
          setShowResult('wrong');
          if (onAnswer) onAnswer(false);
          setTimeout(() => {
            setSelectedOption(null);
            setShowResult(null);
          }, 1000);
      }
  };

  const handleOverlayClick = () => {
      // General dismiss handler for system messages (like Stage 2 unlock)
      if (gameState.activeMessage && onMessageDismiss) {
          onMessageDismiss();
      }
  };

  const progressPercent = Math.min(100, gameState.stageProgressPercent ?? 0);
  const isProgressComplete = progressPercent >= 100;

  return (
    <div className="font-['Cairo']" dir="rtl">

      {/* MINI PUZZLE OVERLAY (Storm / Library / Dual Path) */}
      {gameState.activePuzzle && onPuzzleAnswer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1625]/95 border border-[#ffd700]/50 rounded-3xl px-5 py-6 w-[90%] max-w-md text-center shadow-2xl">
            <p className="text-[#ffd700] text-lg md:text-xl font-black mb-4">
              لغز صغير ✨
            </p>
            <p className="text-white text-sm md:text-base leading-relaxed mb-5 whitespace-pre-line">
              {gameState.activePuzzle.prompt}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {gameState.activePuzzle.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPuzzleAnswer(idx)}
                  className="pointer-events-auto min-w-[72px] min-h-[44px] px-4 py-2 rounded-2xl bg-black/60 border border-[#ffd700]/60 text-white font-bold text-sm md:text-base hover:bg-[#ffd700]/20 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Stage title overlay (Arabic) – fade in, then fade out when cleared */}
      {stageTitleDisplay && (
        <div
          className={`absolute inset-0 z-40 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
            stageTitleFadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p className="text-[#ffd700] text-2xl md:text-3xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-in fade-in duration-500">
            {stageTitleDisplay}
          </p>
        </div>
      )}

      {/* Nur guidance message – sits below Nur (drawn in Phaser at ~26% from top) */}
      <div 
        className={`absolute top-36 left-0 right-0 z-30 flex justify-center pointer-events-none transition-all duration-500 transform ${showNoor ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
      >
          <div className="bg-[#1a1625]/92 backdrop-blur-md border border-[#ffd700]/40 px-4 py-3 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.35)] max-w-[90%] md:max-w-md animate-in slide-in-from-top-4 duration-500">
             <p className="text-white font-bold text-sm md:text-base leading-relaxed text-center">
                 {noorText}
             </p>
          </div>
      </div>

      {/* CLIMB QTE OVERLAY */}
      {gameState.isHanging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
              <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                  <div className="text-[#ffd700] text-4xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-pulse mb-4">
                      تسلق!
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-64 h-8 bg-black/60 rounded-full border-2 border-white/20 overflow-hidden shadow-xl backdrop-blur-sm relative">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-100 ease-out"
                        style={{ width: `${gameState.climbProgress || 0}%` }}
                      />
                      {/* Scanlines */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-white/80 font-bold text-sm bg-black/40 px-4 py-2 rounded-full">
                      <span className="text-2xl animate-bounce">👆</span>
                      <span>اضغط بسرعة!</span>
                  </div>
              </div>
          </div>
      )}

      {/* PAUSE MENU */}
      {gameState.isPaused && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="bg-[#1a1625] border-2 border-[#ffd700]/50 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[#ffd700] text-xl font-black text-center mb-6">إيقاف مؤقت</h3>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onResumeClick}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/50 text-white font-bold transition-colors"
              >
                متابعة اللعب
              </button>
              <button
                type="button"
                onClick={onRestartStageClick}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 border border-amber-400/50 text-white font-bold transition-colors"
              >
                إعادة المرحلة
              </button>
              <button
                type="button"
                onClick={onReturnToMenuClick}
                className="w-full py-3 px-4 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white font-bold transition-colors"
              >
                العودة للقائمة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SYSTEM MESSAGE OVERLAY (For major unlocks only) */}
      {gameState.activeMessage && (
          <div 
             className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-pointer"
             onClick={handleOverlayClick}
          >
              <div className="bg-[#1a1625] border border-[#ffd700] rounded-3xl p-8 max-w-lg text-center shadow-2xl animate-in zoom-in-95 duration-300">
                  <h3 className="text-[#ffd700] text-xl font-black mb-4">رسالة جديدة ✨</h3>
                  <p className="text-white text-lg font-bold mb-6">{gameState.activeMessage}</p>
                  <p className="text-white/40 text-xs animate-pulse">اضغط للمتابعة</p>
              </div>
          </div>
      )}

      {/* 3. GAMEPLAY UI */}
      <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10 transition-opacity duration-500 ${gameState.activeMessage ? 'opacity-0' : 'opacity-100'}`}>

        {/* Step 2: Progress bar (top), then stars (left) / distance + hearts (right) */}
        <div className={`w-full transition-opacity duration-300 ${gameState.isGameOver ? 'opacity-0' : 'opacity-100'}`}>
          {/* Progress bar – full width, 0–100% from distance */}
          <div className="relative w-full h-2 md:h-2.5 rounded-full bg-black/50 border border-white/10 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-[#ffd700] transition-all duration-150 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {isProgressComplete && (
              <div className="absolute inset-0 rounded-full bg-[#ffd700]/20 animate-pulse pointer-events-none" style={{ boxShadow: '0 0 10px rgba(255,215,0,0.5)' }} />
            )}
          </div>
          <div className="flex justify-between items-start w-full">
            {/* Stars – top left */}
            <div className="bg-black/40 backdrop-blur-md px-3.5 py-2.5 md:px-5 md:py-3 rounded-xl border border-white/10 shadow-lg">
              <div className="flex flex-col items-center leading-tight text-yellow-400">
                <span className="text-yellow-400/60 text-[10px] md:text-xs uppercase tracking-widest font-bold">النجوم</span>
                <span className="text-xl md:text-2xl font-black">{gameState.stars}</span>
              </div>
            </div>
            {/* Distance + Hearts + Audio + Pause – top right */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Pause button (player icon) – only when playing and not game over */}
              {!gameState.isGameOver && gameState.isPaused !== true && onPauseClick && (
                <button
                  type="button"
                  onClick={onPauseClick}
                  className="p-1.5 md:p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 hover:border-[#ffd700]/40 transition-colors pointer-events-auto"
                  title="إيقاف مؤقت"
                  aria-label="Pause"
                >
                  <span className="text-lg md:text-xl">⏸</span>
                </button>
              )}
              {/* Step 5 – Audio: Sound & Music toggles (persisted in localStorage) */}
              <div className="flex items-center gap-1 pointer-events-auto">
                {onSoundToggle && (
                  <button
                    type="button"
                    onClick={onSoundToggle}
                    className="p-1.5 md:p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 hover:border-[#ffd700]/40 transition-colors"
                    title={gameState.soundEnabled !== false ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                    aria-label={gameState.soundEnabled !== false ? 'Sound on' : 'Sound off'}
                  >
                    <span className="text-lg md:text-xl">{gameState.soundEnabled !== false ? '🔊' : '🔇'}</span>
                  </button>
                )}
                {onMusicToggle && (
                  <button
                    type="button"
                    onClick={onMusicToggle}
                    className={`p-1.5 md:p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 hover:border-[#ffd700]/40 transition-colors ${gameState.musicEnabled === false ? 'opacity-60' : ''}`}
                    title={gameState.musicEnabled !== false ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
                    aria-label={gameState.musicEnabled !== false ? 'Music on' : 'Music off'}
                  >
                    <span className="text-lg md:text-xl">🎵</span>
                  </button>
                )}
              </div>
              <div className="bg-black/40 backdrop-blur-md px-3.5 py-2.5 md:px-5 md:py-3 rounded-xl border border-white/10 shadow-lg">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-white/60 text-[10px] md:text-xs uppercase tracking-widest font-bold">المسافة</span>
                  <span className="text-white text-xl md:text-2xl font-black font-mono tracking-tighter">
                    {Math.floor(displayDistance)}<span className="text-sm text-white/50 mr-0.5">م</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 md:gap-2 flex-row-reverse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 md:w-7 md:h-7 transform transition-all duration-300 ${
                      i < gameState.hearts ? 'scale-110' : 'scale-90 opacity-30 grayscale'
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={i < gameState.hearts ? 'text-red-500' : 'text-gray-500'}
                      style={{
                        filter: i < gameState.hearts ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))' : 'none'
                      }}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cinematic Vignette */}
        <div className="absolute bottom-0 left-0 w-full h-24 md:h-40 bg-gradient-to-t from-[#1a1625]/80 to-transparent pointer-events-none" />
      </div>

      {/* MAGIC GATE QUESTION POPUP */}
      {gameState.activeQuestion && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none px-4">
              <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 pointer-events-auto">
                  
                  {/* CHARACTER PORTRAIT (First in flex row = Right side in RTL) */}
                  <div className="shrink-0 relative group animate-in zoom-in duration-500">
                        {/* The Circle */}
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-[#ffd700] bg-[#1a1625] overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.3)] relative z-10 ring-4 ring-black/20">
                            <img 
                                src="https://ucarecdn.com/64926886-4015-49f7-9ebc-f3f206cf82e0/Gemini_Generated_Image_x273efx273efx273removebgpreview.png"
                                alt="Prince Noor"
                                className="w-full h-full object-cover object-top transform scale-110 translate-y-2" 
                            />
                        </div>
                        {/* Name Badge */}
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-yellow-600 to-yellow-400 text-[#1a1625] px-4 py-1 rounded-full font-bold text-sm shadow-lg whitespace-nowrap border-2 border-[#1a1625]">
                            الأمير نور
                        </div>
                        {/* Decorative Glow */}
                        <div className="absolute inset-0 rounded-full bg-[#ffd700]/20 blur-2xl -z-10 animate-pulse"></div>
                  </div>

                  {/* Floating Card */}
                  <div className="pointer-events-auto bg-[#1a1625]/95 backdrop-blur-xl border-2 border-[#ffd700] rounded-3xl p-6 md:p-10 w-full max-w-lg shadow-[0_0_80px_rgba(255,215,0,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                      
                      {/* Decorative Glow */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent"></div>
                      
                      {/* Icon */}
                      <div className="mb-6 w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center border border-yellow-400/30 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                        <span className="text-3xl">🔑</span>
                      </div>

                      {/* Question Header */}
                      <div className="mb-8 relative z-10 w-full">
                          <h3 className="text-[#ffd700] text-sm tracking-[0.2em] font-bold uppercase mb-3 opacity-80">سؤال البوابة</h3>
                          <h2 className="text-white text-2xl md:text-3xl font-black leading-tight drop-shadow-md">
                            {gameState.activeQuestion.text}
                          </h2>
                      </div>

                      {/* Options */}
                      <div className="grid gap-3 w-full relative z-10">
                          {gameState.activeQuestion.options.map((opt, idx) => {
                              let btnClass = "bg-white/5 border border-white/10 hover:bg-white/10 text-white";
                              let icon = null;

                              if (selectedOption === idx) {
                                  if (showResult === 'correct') {
                                      btnClass = "bg-green-500/20 border-green-500 text-green-400";
                                      icon = "✓";
                                  } else if (showResult === 'wrong') {
                                      btnClass = "bg-red-500/20 border-red-500 text-red-400 animate-shake";
                                      icon = "✕";
                                  }
                              }

                              return (
                                  <button
                                      key={idx}
                                      disabled={showResult === 'correct'}
                                      onClick={() => handleOptionClick(idx)}
                                      className={`p-4 rounded-xl text-lg font-bold transition-all duration-200 w-full flex items-center justify-between px-6 ${btnClass} shadow-md active:scale-[0.98]`}
                                  >
                                      <span>{opt}</span>
                                      {icon && <span>{icon}</span>}
                                  </button>
                              )
                          })}
                      </div>
                      
                      {/* Feedback Text */}
                      <div className="h-8 mt-4 flex items-center justify-center">
                        {showResult === 'wrong' && (
                            <span className="text-red-400 font-bold text-sm animate-pulse">حاول مرة أخرى!</span>
                        )}
                        {showResult === 'correct' && (
                            <span className="text-green-400 font-bold text-sm">البوابة تفتح...</span>
                        )}
                      </div>

                  </div>
              </div>
          </div>
      )}

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1a1625]/90 backdrop-blur-sm animate-in fade-in duration-500 px-4">
          <div className="flex flex-col items-center text-center p-6 md:p-8 border border-white/10 rounded-3xl bg-black/40 shadow-2xl max-w-md w-full">
             <h2 className="text-red-500 font-bold text-4xl md:text-5xl mb-6 md:mb-8 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">انتهت اللعبة</h2>
             <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mb-6 md:mb-8">
                <div className="bg-white/5 p-3 md:p-4 rounded-xl flex flex-col items-center border border-white/5">
                   <span className="text-white/50 text-[10px] md:text-xs tracking-widest mb-1">المسافة المقطوعة</span>
                   <span className="text-white text-2xl md:text-3xl font-black font-mono">{Math.floor(gameState.distance)}م</span>
                </div>
                <div className="bg-white/5 p-3 md:p-4 rounded-xl flex flex-col items-center border border-white/5">
                   <span className="text-yellow-400/50 text-[10px] md:text-xs tracking-widest mb-1">النجوم المجمعة</span>
                   <span className="text-yellow-400 text-2xl md:text-3xl font-black">{gameState.stars}</span>
                </div>
             </div>
             <button 
                onClick={onRestart}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-[#1a1625] font-black text-xl rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(250,204,21,0.4)]"
             >
                العب مجدداً
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
