import React from 'react';

interface IntroUIProps {
    onConfirm: () => void;
}

export const IntroUI: React.FC<IntroUIProps> = ({ onConfirm }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1a1625]/80 backdrop-blur-md p-4 animate-in fade-in duration-500 font-['Cairo']" dir="rtl">
            <div className="bg-[#1a1625] border-2 border-[#ffd700] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col">
                 
                 {/* Image Section */}
                 <div className="h-72 w-full bg-[#2d2640] relative">
                    <img 
                        src="https://ucarecdn.com/c55ae69a-aeb3-486a-95ec-8e8319f979d1/Gemini_Generated_Image_k27yi0k27yi0k27y1.png" 
                        alt="Prince Noor"
                        className="w-full h-full object-cover object-top"
                    />
                    {/* Gradient Fade at bottom of image to blend into card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1625] via-transparent to-transparent"></div>
                 </div>

                 {/* Content Section */}
                 <div className="p-8 text-center relative z-10 -mt-4 flex flex-col items-center">
                    
                    {/* Header */}
                    <h2 className="text-[#ffd700] text-2xl font-black mb-4 drop-shadow-md flex items-center gap-2">
                        <span>✨</span>
                        <span>مرحبًا بك! أنا الأمير نور</span>
                        <span>✨</span>
                    </h2>
                    
                    {/* Body Text */}
                    <p className="text-white/90 text-lg leading-relaxed mb-6 font-bold">
                        أحمل كتاب العلم وقلم النور، وسأرافقك في رحلة مليئة بالاكتشاف.
                    </p>
                    
                    {/* Question */}
                    <p className="text-[#ffd700] text-xl font-bold mb-8 drop-shadow-sm">
                        هل أنت مستعد؟
                    </p>

                    {/* Action Button */}
                    <button 
                        onClick={onConfirm}
                        className="w-full py-4 bg-gradient-to-r from-[#ffbf00] to-[#ff9100] rounded-full text-[#1a1625] text-xl font-black shadow-[0_0_20px_rgba(255,191,0,0.4)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 group"
                    >
                        <span>هيا نبدأ</span>
                        <span className="group-hover:-translate-x-1 transition-transform">✨</span>
                    </button>
                 </div>
            </div>
        </div>
    );
};