import React from 'react';

interface GameDetailsUIProps {
    onNext: () => void;
}

export const GameDetailsUI: React.FC<GameDetailsUIProps> = ({ onNext }) => {
    
    const items = [
        {
            text: "اجمع النجوم +10",
            icon: "⭐",
            bg: "bg-[#1e1b2e]",
            border: "border-yellow-500/30",
            iconBg: "bg-yellow-500/20 text-yellow-400",
            glow: "shadow-yellow-500/10"
        },
        {
            text: "افتح البوابات السحرية",
            icon: "🚪", 
            bg: "bg-[#1e1b2e]",
            border: "border-purple-500/30",
            iconBg: "bg-purple-500/20 text-purple-400",
            glow: "shadow-purple-500/10"
        },
        {
            text: "احذر من العقبات!",
            icon: "⚠️",
            bg: "bg-[#1e1b2e]",
            border: "border-red-500/30",
            iconBg: "bg-red-500/20 text-red-400",
            glow: "shadow-red-500/10"
        }
    ];

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#151120] font-['Cairo'] overflow-hidden" dir="rtl">
            
            {/* Background Atmosphere */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                 <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
                 <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-md px-6 py-8 flex flex-col justify-center min-h-screen md:min-h-0">
                
                {/* Title Section */}
                <div className="text-center mb-8 animate-in zoom-in duration-500">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ff9100] drop-shadow-sm mb-3 tracking-tight">
                        مغامرة العلم
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base font-bold leading-relaxed max-w-xs mx-auto">
                        اجري في شوارع المدينة القديمة واجمع المعرفة!
                    </p>
                </div>

                {/* Legend Items List */}
                <div className="w-full space-y-4 mb-10">
                    {items.map((item, idx) => (
                        <div 
                            key={idx} 
                            className={`relative ${item.bg} border ${item.border} rounded-2xl p-4 flex items-center gap-4 shadow-lg ${item.glow} animate-in slide-in-from-right-8 transition-transform hover:scale-[1.02]`}
                            style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'backwards' }}
                        >
                             <div className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center text-xl shrink-0 shadow-inner`}>
                                {item.icon}
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-white text-lg font-bold tracking-wide">
                                    {item.text}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Start Button */}
                <button 
                    onClick={onNext}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl text-[#1a1625] text-xl font-black shadow-[0_4px_20px_rgba(255,165,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 delay-500"
                >
                    ابدأ المغامرة
                </button>

            </div>
        </div>
    );
};