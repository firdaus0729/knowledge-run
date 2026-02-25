import React from 'react';

interface StageStatsUIProps {
    type: 'DESERT_END' | 'LIBRARY_END';
    distance: number;
    stars: number;
    correctAnswers: number;
    wrongAnswers: number;
    timeSpent: string;
    onContinue: () => void;
}

export const StageStatsUI: React.FC<StageStatsUIProps> = ({ 
    type, distance, stars, correctAnswers, wrongAnswers, timeSpent, onContinue 
}) => {
    
    const title = type === 'DESERT_END' ? 'نهاية الصحراء' : 'نهاية المكتبة';
    const subTitle = type === 'DESERT_END' ? 'تم الوصول إلى مدينة العلم' : 'تم اكتشاف أسرار المكتبة';

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500 font-['Cairo']" dir="rtl">
            <div className="bg-[#1a1625] border-2 border-[#ffd700] rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(255,215,0,0.3)] relative flex flex-col p-8">
                 
                 {/* Header */}
                 <div className="text-center mb-8">
                    <h2 className="text-[#ffd700] text-4xl font-black mb-2 drop-shadow-md">{title}</h2>
                    <p className="text-white/80 text-xl font-bold">{subTitle}</p>
                 </div>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Distance */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                        <span className="text-white/50 text-sm font-bold mb-1">المسافة المقطوعة</span>
                        <span className="text-white text-3xl font-black font-mono">{distance}م</span>
                    </div>
                    
                    {/* Stars */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                        <span className="text-yellow-400/60 text-sm font-bold mb-1">النجوم</span>
                        <span className="text-yellow-400 text-3xl font-black">{stars} ⭐</span>
                    </div>

                    {/* Answers */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center col-span-2 md:col-span-1">
                        <span className="text-white/50 text-sm font-bold mb-1">الإجابات</span>
                        <div className="flex gap-4">
                            <span className="text-green-400 text-2xl font-black">✓ {correctAnswers}</span>
                            <span className="text-red-400 text-2xl font-black">✕ {wrongAnswers}</span>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center col-span-2 md:col-span-1">
                        <span className="text-white/50 text-sm font-bold mb-1">الوقت المستغرق</span>
                        <span className="text-white text-3xl font-black font-mono">{timeSpent}</span>
                    </div>
                 </div>

                 {/* Continue Button */}
                 <button 
                    onClick={onContinue}
                    className="w-full py-4 bg-gradient-to-r from-[#ffbf00] to-[#ff9100] rounded-full text-[#1a1625] text-xl font-black shadow-[0_0_20px_rgba(255,191,0,0.4)] hover:scale-105 active:scale-95 transition-transform group"
                 >
                    <span className="group-hover:tracking-wider transition-all">استمرار الرحلة ➔</span>
                 </button>
            </div>
        </div>
    );
};
