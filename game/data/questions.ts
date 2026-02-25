
import { Question } from '../../types';

const QUESTION_POOL: Question[] = [
  // 1. General Knowledge (معلومات عامة)
  { id: 'q1', text: 'كم عدد أيام الأسبوع؟', options: ['٧', '٥', '١٠'], correctIndex: 0, category: 'trivia' },
  { id: 'q2', text: 'ما لون السماء في النهار؟', options: ['أزرق', 'أخضر', 'أحمر'], correctIndex: 0, category: 'science' },
  { id: 'q3', text: 'كم عدد حروف كلمة نور؟', options: ['٣', '٢', '٤'], correctIndex: 0, category: 'language' },
  { id: 'q4', text: 'أيهما أكبر؟', options: ['٣', '٥', '١'], correctIndex: 1, category: 'math' },
  { id: 'q5', text: 'ما الحيوان الذي يقول "موو"؟', options: ['قط', 'كلب', 'بقرة'], correctIndex: 2, category: 'trivia' },

  // 2. Simple Math (رياضيات بسيطة)
  { id: 'm1', text: '٢ + ١ = ؟', options: ['٤', '٣', '١'], correctIndex: 1, category: 'math' },
  { id: 'm2', text: '٥ − ٢ = ؟', options: ['٢', '٤', '٣'], correctIndex: 2, category: 'math' },
  { id: 'm3', text: 'أي رقم أصغر؟', options: ['٩', '٧', '١'], correctIndex: 2, category: 'math' },

  // 3. Basic Language (لغة عربية)
  { id: 'l1', text: 'حرف (أ) يأتي:', options: ['في النهاية', 'في الوسط', 'في البداية'], correctIndex: 2, category: 'language' },
  { id: 'l2', text: 'كلمة كتاب تعني:', options: ['لعبة', 'حيوان', 'شيء نقرأ به'], correctIndex: 2, category: 'language' },

  // 4. Astrolabe Puzzle (Special)
  { id: 'puzzle_astrolabe', text: 'صل النجوم! ما شكل هذا البرج السماوي؟', options: ['العقرب', 'الأسد (Leo)', 'الميزان'], correctIndex: 1, category: 'science' }
];

export const getQuestions = (): Question[] => {
    // Shuffle questions for randomness every run
    return [...QUESTION_POOL].sort(() => Math.random() - 0.5);
};
