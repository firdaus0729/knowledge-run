import React from 'react';

interface HowToPlayUIProps {
    onNext: () => void;
}

export const HowToPlayUI: React.FC<HowToPlayUIProps> = ({ onNext }) => {
    
    const steps = [
        {
            title: "اركض واقفز",
            desc: "اضغط على الشاشة للقفز وتجاوز العقبات",
            icon: "🏃",
            gradient: "from-blue-500 to-blue-600",
            shadow: "shadow-blue-500/20"
        },
        {
            title: "اجمع النجوم",
            desc: "النجوم تزيد من نقاطك",
            icon: "⭐",
            gradient: "from-yellow-400 to-yellow-500",
            shadow: "shadow-yellow-500/20"
        },
        {
            title: "افتح البوابات",
            desc: "أجب على الأسئلة لتفتح البوابات السحرية",
            icon: "🚪",
            gradient: "from-purple-500 to-purple-600",
            shadow: "shadow-purple-500/20"
        },
        {
            title: "قوة المعرفة",
            desc: "العلم هو مفتاحك للتقدم",
            icon: "💡",
            gradient: "from-orange-500 to-orange-600",
            shadow: "shadow-orange-500/20"
        }
    ];

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#151120] font-['Cairo'] overflow-hidden" dir="rtl">
            
            {/* Background Atmosphere */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            </div>

            {/* Main Layout Container */}
            <div className="relative z-10 w-full h-full md:h-auto max-w-md px-6 flex flex-col pt-10 pb-6 md:py-8">
                
                {/* Header Section */}
                <div className="text-center mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-b from-yellow-400 to-orange-500 rounded-[24px] flex items-center justify-center text-4xl shadow-lg shadow-orange-500/20 mb-4 transform hover:scale-105 transition-transform duration-300">
                        📖
                    </div>
                    
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                        كيف تلعب؟
                    </h2>
                    <p className="text-gray-400 text-sm font-bold">
                        اتبع الخطوات لتصبح بطلاً
                    </p>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4 pb-4">
                    <div className="space-y-3">
                        {steps.map((step, idx) => (
                            <div 
                                key={idx}
                                className="group relative bg-[#1e1b2e]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#252136] transition-all duration-300 animate-in slide-in-from-bottom-4 shadow-sm"
                                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-xl text-white shadow-lg ${step.shadow} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    {step.icon}
                                </div>
                                
                                <div className="flex-1 text-right">
                                    <h3 className="text-white font-black text-base mb-1 group-hover:text-yellow-400 transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 text-xs font-bold leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Button Section */}
                    <div className="mt-6 pt-2">
                        <button 
                            onClick={onNext}
                            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl text-[#1a1625] text-xl font-black shadow-[0_4px_20px_rgba(255,165,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 delay-500 flex items-center justify-center gap-2"
                        >
                            <span>انطلق</span>
                            <span className="text-2xl">🚀</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};