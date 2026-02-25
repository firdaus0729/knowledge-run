import React from 'react';

interface HomeUIProps {
    onStart: () => void;
}

export const HomeUI: React.FC<HomeUIProps> = ({ onStart }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-between z-20 py-12 pointer-events-none font-['Cairo']">
            
            {/* Top Section: Title & Branding */}
            <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-10 duration-1000 mt-4 md:mt-8">
                <div className="relative mb-4">
                    {/* Glowing Moon Icon / Logo Placeholder */}
                    <div className="w-20 h-20 bg-yellow-400 rounded-full blur-2xl opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    <span className="text-4xl">🏰</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#fdb931] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-tight mb-2">
                    مدينة العلم
                </h1>
                
                {/* Floating Particles Decoration (CSS) */}
                <div className="absolute -z-10 w-full h-full overflow-hidden opacity-50">
                    <div className="absolute top-10 left-10 text-yellow-400 animate-pulse text-xl">✨</div>
                    <div className="absolute top-20 right-20 text-yellow-400 animate-pulse delay-700 text-sm">✦</div>
                </div>
            </div>

            {/* Bottom Section: Call to Action */}
            <div className="flex flex-col items-center w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 pointer-events-auto mb-4 relative z-10">
                
                {/* Instructions Bubble */}
                <div className="relative bg-[#1a1625]/80 backdrop-blur-md border border-[#ffd700]/30 rounded-2xl p-6 text-center mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#1a1625] border-t border-l border-[#ffd700]/30 rotate-45"></div>
                    <p className="text-[#ffd700] text-lg font-bold mb-1 dir-rtl">
                        ...افتح الكتاب السحري 📚
                    </p>
                    <p className="text-white/70 text-sm">
                        وانطلق في رحلة عبر مدينة مليئة بالأسرار
                    </p>
                </div>

                {/* Main Action Button */}
                <button 
                    onClick={onStart}
                    className="group relative w-full py-6 bg-gradient-to-r from-[#ffbf00] to-[#ff9100] rounded-full shadow-[0_0_40px_rgba(255,165,0,0.4)] overflow-hidden transition-transform transform hover:scale-105 active:scale-95"
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    
                    <div className="relative flex items-center justify-center gap-4">
                        <span className="text-[#1a1625] text-2xl font-black uppercase tracking-wider">
                            ابدأ المغامرة
                        </span>
                        <span className="text-2xl group-hover:-translate-x-2 transition-transform">🚀</span>
                    </div>
                </button>
            </div>
        </div>
    );
};