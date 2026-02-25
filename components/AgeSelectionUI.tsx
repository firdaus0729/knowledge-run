import React from 'react';
import { AgeGroup } from '../types';

interface AgeSelectionUIProps {
    onSelect: (age: AgeGroup) => void;
}

export const AgeSelectionUI: React.FC<AgeSelectionUIProps> = ({ onSelect }) => {
    
    const cards = [
        {
            id: '5-7',
            title: 'مستكشف صغير',
            subtitle: '(5-7 سنوات)',
            description: 'مغامرات بسيطة وممتعة 🎈',
            icon: '🔍',
            // Colors for the "Green" theme
            bgGradient: 'from-[#1a2e26] to-[#14231e]', // Deep green bg
            border: 'border-emerald-500/30',
            iconGradient: 'from-emerald-400 to-green-600',
            shadow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]',
            textHighlight: 'group-hover:text-emerald-400'
        },
        {
            id: '8-10',
            title: 'طالب ذكي',
            subtitle: '(8-10 سنوات)',
            description: 'تحديات تنمي التفكير 🧠',
            icon: '📚',
            // Colors for the "Blue" theme
            bgGradient: 'from-[#1a2333] to-[#141824]', // Deep blue bg
            border: 'border-blue-500/30',
            iconGradient: 'from-blue-400 to-indigo-600',
            shadow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]',
            textHighlight: 'group-hover:text-blue-400'
        },
        {
            id: '11-13',
            title: 'عالم ناشئ',
            subtitle: '(11-13 سنوات)',
            description: 'تحديات وأسئلة أعمق 🔬',
            icon: '🧪',
            // Colors for the "Purple" theme
            bgGradient: 'from-[#251a33] to-[#1d1424]', // Deep purple bg
            border: 'border-purple-500/30',
            iconGradient: 'from-purple-400 to-violet-600',
            shadow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]',
            textHighlight: 'group-hover:text-purple-400'
        }
    ];

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1a1625] font-['Cairo'] overflow-y-auto overflow-x-hidden" dir="rtl">
            
            {/* Ambient Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/10 rounded-full blur-[60px] md:blur-[100px] animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg px-6 py-6 md:py-8 flex flex-col items-center min-h-screen md:min-h-0 justify-center">
                
                {/* Header */}
                <div className="text-center mb-6 md:mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="relative inline-block mb-1 md:mb-2">
                         <div className="text-4xl md:text-6xl drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-bounce">🎯</div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-md mb-2 md:mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#ff9100]">اختر فئتك العمرية</span>
                    </h2>
                    <p className="text-white/60 text-sm md:text-lg font-bold tracking-wide">
                        لنختار مغامرة تناسبك ✨
                    </p>
                </div>

                {/* Cards */}
                <div className="w-full space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    {cards.map((card) => (
                        <button
                            key={card.id}
                            onClick={() => onSelect(card.id as any)}
                            className={`group relative w-full text-right transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] outline-none`}
                        >
                            <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl border-2 ${card.border} bg-gradient-to-br ${card.bgGradient} p-1 transition-all duration-300 ${card.shadow}`}>
                                
                                <div className="relative flex items-center justify-between p-3 md:p-4 rounded-[16px] md:rounded-[20px]">
                                    
                                    {/* Right: Icon & Text */}
                                    <div className="flex items-center gap-3 md:gap-5">
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${card.iconGradient} flex items-center justify-center text-xl md:text-3xl shadow-lg shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ring-1 ring-white/20`}>
                                            {card.icon}
                                        </div>

                                        <div className="flex flex-col">
                                            <h3 className={`text-lg md:text-2xl font-black text-white transition-colors duration-300 ${card.textHighlight}`}>
                                                {card.title}
                                            </h3>
                                            <span className="text-[10px] md:text-sm font-bold text-white/40 font-mono mb-0.5 md:mb-1">
                                                {card.subtitle}
                                            </span>
                                            <p className="text-[10px] md:text-sm font-bold text-gray-400 group-hover:text-white/80 transition-colors">
                                                {card.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Left: Arrow */}
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white/40 group-hover:text-white transform rotate-180 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                 {/* Footer hint */}
                 <div className="mt-6 md:mt-8 flex items-center gap-2 text-white/20 text-[10px] md:text-xs font-bold animate-in fade-in duration-1000 delay-500">
                    <span>💡</span>
                    <span>يمكنك تغيير الفئة لاحقاً</span>
                </div>
            </div>
        </div>
    );
};