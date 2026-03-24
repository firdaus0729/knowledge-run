
import { Question, QuestionOption } from '../../types';

const txt = (value: string): QuestionOption => ({ text: value });
const img = (name: string, alt: string): QuestionOption => ({
  image: `/images/questions/${name}.png`,
  alt,
  text: alt
});

const TEXT_QUESTIONS: Question[] = [
  { id: 't1', text: 'كم عدد أيام الأسبوع؟', options: [txt('خمسة'), txt('سبعة'), txt('عشرة')], correctIndex: 1, category: 'trivia' },
  { id: 't2', text: 'ما لون السماء؟', options: [txt('أزرق'), txt('أخضر'), txt('أحمر')], correctIndex: 0, category: 'science' },
  { id: 't3', text: 'كم عدد أصابع اليد؟', options: [txt('أربعة'), txt('خمسة'), txt('ستة')], correctIndex: 1, category: 'trivia' },
  { id: 't4', text: 'أين نعيش؟', options: [txt('في البحر'), txt('على الأرض'), txt('في السماء')], correctIndex: 1, category: 'trivia' },
  { id: 't5', text: 'ما الحيوان الذي يطير؟', options: [txt('الطائر'), txt('الحصان'), txt('السمكة')], correctIndex: 0, category: 'trivia' },
  { id: 't6', text: 'كم يساوي 2 + 2 ؟', options: [txt('3'), txt('4'), txt('5')], correctIndex: 1, category: 'math' },
  { id: 't7', text: 'كم عدد العيون عند الإنسان؟', options: [txt('واحدة'), txt('اثنتان'), txt('ثلاث')], correctIndex: 1, category: 'trivia' },
  { id: 't8', text: 'ما الذي نشربه عندما نعطش؟', options: [txt('الماء'), txt('الرمل'), txt('الحجارة')], correctIndex: 0, category: 'trivia' },
  { id: 't9', text: 'ما الحيوان الذي يعيش في البحر؟', options: [txt('السمكة'), txt('الجمل'), txt('الدجاجة')], correctIndex: 0, category: 'science' },
  { id: 't10', text: 'ما الذي نكتب به؟', options: [txt('القلم'), txt('الحجر'), txt('الحبل')], correctIndex: 0, category: 'language' },
  { id: 't11', text: 'ما الذي يضيء في النهار؟', options: [txt('الشمس'), txt('القمر'), txt('النجمة')], correctIndex: 0, category: 'science' },
  { id: 't12', text: 'ما الذي نراه في الليل؟', options: [txt('القمر'), txt('الشمس'), txt('الشجرة')], correctIndex: 0, category: 'science' },
  { id: 't13', text: 'ما لون العشب؟', options: [txt('أخضر'), txt('أزرق'), txt('أحمر')], correctIndex: 0, category: 'science' },
  { id: 't14', text: 'أين يعيش الجمل؟', options: [txt('الصحراء'), txt('البحر'), txt('الغابة')], correctIndex: 0, category: 'trivia' },
  { id: 't15', text: 'أين تعيش الأسماك؟', options: [txt('البحر'), txt('الجبل'), txt('الصحراء')], correctIndex: 0, category: 'science' },
  { id: 't16', text: 'كم عدد أرجل الكلب؟', options: [txt('اثنتان'), txt('أربع'), txt('ست')], correctIndex: 1, category: 'trivia' },
  { id: 't17', text: 'أي حيوان يقول موو؟', options: [txt('البقرة'), txt('الأسد'), txt('الحصان')], correctIndex: 0, category: 'trivia' },
  { id: 't18', text: 'أي حيوان يزحف؟', options: [txt('الثعبان'), txt('الحصان'), txt('البقرة')], correctIndex: 0, category: 'trivia' },
  { id: 't19', text: 'أي حيوان يطير في السماء؟', options: [txt('العصفور'), txt('الجمل'), txt('الحصان')], correctIndex: 0, category: 'trivia' },
  { id: 't20', text: 'أي حيوان يعيش في الماء؟', options: [txt('السمكة'), txt('القطة'), txt('الحصان')], correctIndex: 0, category: 'science' },
  { id: 't21', text: 'ماذا نقرأ؟', options: [txt('كتاب'), txt('حجر'), txt('كرة')], correctIndex: 0, category: 'language' },
  { id: 't22', text: 'ماذا نلبس في القدم؟', options: [txt('حذاء'), txt('قبعة'), txt('قفاز')], correctIndex: 0, category: 'trivia' },
  { id: 't23', text: 'ماذا نستخدم للأكل؟', options: [txt('ملعقة'), txt('قلم'), txt('كتاب')], correctIndex: 0, category: 'trivia' },
  { id: 't24', text: 'ماذا نستخدم للشرب؟', options: [txt('كوب'), txt('حجر'), txt('قلم')], correctIndex: 0, category: 'trivia' },
  { id: 't25', text: 'ماذا نستخدم للاتصال؟', options: [txt('هاتف'), txt('تفاحة'), txt('ملعقة')], correctIndex: 0, category: 'trivia' },
  { id: 't26', text: 'ما لون التفاحة غالباً؟', options: [txt('أحمر'), txt('أزرق'), txt('أسود')], correctIndex: 0, category: 'trivia' },
  { id: 't27', text: 'ما لون الموز؟', options: [txt('أصفر'), txt('أزرق'), txt('أخضر')], correctIndex: 0, category: 'trivia' },
  { id: 't28', text: 'ما لون الحليب؟', options: [txt('أبيض'), txt('أحمر'), txt('أسود')], correctIndex: 0, category: 'trivia' },
  { id: 't29', text: 'ما لون البحر؟', options: [txt('أزرق'), txt('أخضر'), txt('أصفر')], correctIndex: 0, category: 'science' },
  { id: 't30', text: 'ما لون الشمس؟', options: [txt('أصفر'), txt('أسود'), txt('بنفسجي')], correctIndex: 0, category: 'science' },
  { id: 't31', text: 'كم عدد الأرجل عند الإنسان؟', options: [txt('اثنتان'), txt('أربع'), txt('ست')], correctIndex: 0, category: 'trivia' },
  { id: 't32', text: 'كم عدد الأذنين؟', options: [txt('اثنتان'), txt('ثلاث'), txt('أربع')], correctIndex: 0, category: 'trivia' },
  { id: 't33', text: 'كم عدد العيون؟', options: [txt('اثنتان'), txt('ثلاث'), txt('أربع')], correctIndex: 0, category: 'trivia' },
  { id: 't34', text: 'ما الذي نلبسه في الرأس؟', options: [txt('قبعة'), txt('حذاء'), txt('قفاز')], correctIndex: 0, category: 'trivia' },
  { id: 't35', text: 'ما الذي نركبه للسفر؟', options: [txt('سيارة'), txt('كتاب'), txt('تفاحة')], correctIndex: 0, category: 'trivia' },
  { id: 't36', text: 'ما اسم كوكبنا؟', options: [txt('الأرض'), txt('المريخ'), txt('الزهرة')], correctIndex: 0, category: 'science' },
  { id: 't37', text: 'كم عدد الحروف في كلمة “علم”؟', options: [txt('3'), txt('4'), txt('5')], correctIndex: 0, category: 'language' },
  { id: 't38', text: 'كم عدد الحروف في كلمة “بيت”؟', options: [txt('3'), txt('2'), txt('5')], correctIndex: 0, category: 'language' },
  { id: 't39', text: 'ما عكس كلمة كبير؟', options: [txt('صغير'), txt('طويل'), txt('سريع')], correctIndex: 0, category: 'language' },
  { id: 't40', text: 'ما عكس كلمة بارد؟', options: [txt('حار'), txt('طويل'), txt('صغير')], correctIndex: 0, category: 'language' },
  { id: 't41', text: 'ماذا نزرع في الأرض؟', options: [txt('نبات'), txt('حجر'), txt('قلم')], correctIndex: 0, category: 'science' },
  { id: 't42', text: 'ما الذي يطير في السماء؟', options: [txt('طائرة'), txt('سيارة'), txt('قارب')], correctIndex: 0, category: 'trivia' },
  { id: 't43', text: 'ما الذي نستخدمه لقطع الطعام؟', options: [txt('سكين'), txt('قلم'), txt('كتاب')], correctIndex: 0, category: 'trivia' },
  { id: 't44', text: 'ما الذي ننام عليه؟', options: [txt('سرير'), txt('كتاب'), txt('طاولة')], correctIndex: 0, category: 'trivia' },
  { id: 't45', text: 'ما الذي نأكل به الطعام؟', options: [txt('ملعقة'), txt('هاتف'), txt('قلم')], correctIndex: 0, category: 'trivia' },
  { id: 't46', text: 'ما الذي نستخدمه للكتابة؟', options: [txt('قلم'), txt('حجر'), txt('موزة')], correctIndex: 0, category: 'language' },
  { id: 't47', text: 'ماذا نشرب؟', options: [txt('ماء'), txt('رمل'), txt('حجر')], correctIndex: 0, category: 'trivia' },
  { id: 't48', text: 'ما الحيوان الذي يعيش في الغابة؟', options: [txt('أسد'), txt('سمكة'), txt('جمل')], correctIndex: 0, category: 'trivia' },
  { id: 't49', text: 'ما الشيء الذي يطير وله جناحان؟', options: [txt('طائر'), txt('حصان'), txt('قطة')], correctIndex: 0, category: 'trivia' },
  { id: 't50', text: 'ما الشيء الذي نقرأه؟', options: [txt('كتاب'), txt('حذاء'), txt('ملعقة')], correctIndex: 0, category: 'language' }
];

const IMAGE_QUESTIONS: Question[] = [
  { id: 'i1', text: 'أي حيوان يطير؟', options: [img('animals/bird', 'طائر'), img('animals/horse', 'حصان'), img('animals/fish', 'سمكة')], correctIndex: 0, category: 'image' },
  { id: 'i2', text: 'أي حيوان يعيش في البحر؟', options: [img('animals/fish', 'سمكة'), img('animals/cat', 'قطة'), img('animals/camel', 'جمل')], correctIndex: 0, category: 'image' },
  { id: 'i3', text: 'أي حيوان يقول موو؟', options: [img('animals/cow', 'بقرة'), img('animals/lion', 'أسد'), img('animals/dog', 'كلب')], correctIndex: 0, category: 'image' },
  { id: 'i4', text: 'أي حيوان يركض بسرعة؟', options: [img('animals/horse', 'حصان'), img('animals/turtle', 'سلحفاة'), img('animals/fish', 'سمكة')], correctIndex: 0, category: 'image' },
  { id: 'i5', text: 'أي حيوان يعيش في الصحراء؟', options: [img('animals/camel', 'جمل'), img('animals/penguin', 'بطريق'), img('animals/whale', 'حوت')], correctIndex: 0, category: 'image' },
  { id: 'i6', text: 'أي شيء نأكله؟', options: [img('food/apple', 'تفاحة'), img('objects/stone', 'حجر'), img('objects/shoe', 'حذاء')], correctIndex: 0, category: 'image' },
  { id: 'i7', text: 'أي هذا فاكهة؟', options: [img('food/banana', 'موز'), img('objects/book', 'كتاب'), img('objects/pen', 'قلم')], correctIndex: 0, category: 'image' },
  { id: 'i8', text: 'أي هذا خضار؟', options: [img('food/carrot', 'جزر'), img('objects/ball', 'كرة'), img('objects/phone', 'هاتف')], correctIndex: 0, category: 'image' },
  { id: 'i9', text: 'أي هذا حلوى؟', options: [img('food/cake', 'كعكة'), img('objects/rock', 'صخرة'), img('objects/spoon', 'ملعقة')], correctIndex: 0, category: 'image' },
  { id: 'i10', text: 'أي هذا نشربه؟', options: [img('food/water', 'ماء'), img('objects/sand', 'رمل'), img('objects/stone', 'حجر')], correctIndex: 0, category: 'image' },
  { id: 'i11', text: 'ما الذي يضيء في النهار؟', options: [img('nature/sun', 'الشمس'), img('nature/moon', 'القمر'), img('nature/star', 'نجمة')], correctIndex: 0, category: 'image' },
  { id: 'i12', text: 'ما الذي نراه في الليل؟', options: [img('nature/moon', 'القمر'), img('nature/sun', 'الشمس'), img('food/apple', 'تفاحة')], correctIndex: 0, category: 'image' },
  { id: 'i13', text: 'ما الذي يسقط من السماء عندما تمطر؟', options: [img('nature/rain', 'المطر'), img('objects/stones', 'الحجارة'), img('objects/books', 'كتب')], correctIndex: 0, category: 'image' },
  { id: 'i14', text: 'ما لون السماء؟', options: [img('colors/sky_blue', 'سماء زرقاء'), img('colors/sky_green', 'سماء خضراء'), img('colors/sky_black', 'سماء سوداء')], correctIndex: 0, category: 'image' },
  { id: 'i15', text: 'أين تعيش الأسماك؟', options: [img('nature/sea', 'البحر'), img('nature/desert', 'الصحراء'), img('nature/mountain', 'الجبل')], correctIndex: 0, category: 'image' },
  { id: 'i16', text: 'بماذا نكتب؟', options: [img('objects/pen', 'قلم'), img('objects/shoe', 'حذاء'), img('objects/spoon', 'ملعقة')], correctIndex: 0, category: 'image' },
  { id: 'i17', text: 'ماذا نقرأ؟', options: [img('objects/book', 'كتاب'), img('objects/ball', 'كرة'), img('food/apple', 'تفاحة')], correctIndex: 0, category: 'image' },
  { id: 'i18', text: 'ماذا نلبس في القدم؟', options: [img('objects/shoe', 'حذاء'), img('objects/hat', 'قبعة'), img('objects/book', 'كتاب')], correctIndex: 0, category: 'image' },
  { id: 'i19', text: 'ماذا نستخدم لنشرب؟', options: [img('objects/cup', 'كوب'), img('objects/stone', 'حجر'), img('objects/pen', 'قلم')], correctIndex: 0, category: 'image' },
  { id: 'i20', text: 'ماذا نستخدم للاتصال؟', options: [img('objects/phone', 'هاتف'), img('food/banana', 'موزة'), img('objects/spoon', 'ملعقة')], correctIndex: 0, category: 'image' },
  { id: 'i21', text: 'ما لون التفاحة الحمراء؟', options: [img('colors/apple_red', 'تفاحة حمراء'), img('colors/apple_blue', 'تفاحة زرقاء'), img('colors/apple_black', 'تفاحة سوداء')], correctIndex: 0, category: 'image' },
  { id: 'i22', text: 'ما لون الموز؟', options: [img('colors/yellow', 'أصفر'), img('colors/blue', 'أزرق'), img('colors/black', 'أسود')], correctIndex: 0, category: 'image' },
  { id: 'i23', text: 'ما لون العشب؟', options: [img('colors/green', 'أخضر'), img('colors/purple', 'بنفسجي'), img('colors/black', 'أسود')], correctIndex: 0, category: 'image' },
  { id: 'i24', text: 'ما لون الحليب؟', options: [img('colors/white', 'أبيض'), img('colors/black', 'أسود'), img('colors/blue', 'أزرق')], correctIndex: 0, category: 'image' },
  { id: 'i25', text: 'ما لون البحر غالباً؟', options: [img('colors/blue', 'أزرق'), img('colors/red', 'أحمر'), img('colors/pink', 'وردي')], correctIndex: 0, category: 'image' },
  { id: 'i26', text: 'كم عدد عيون الإنسان؟', options: [img('logic/two_eyes', 'عينان'), img('logic/three_eyes', 'ثلاث عيون'), img('logic/one_eye', 'عين واحدة')], correctIndex: 0, category: 'image' },
  { id: 'i27', text: 'كم عدد أصابع اليد؟', options: [img('logic/five_fingers', 'خمس أصابع'), img('logic/three_fingers', 'ثلاث أصابع'), img('logic/seven_fingers', 'سبع أصابع')], correctIndex: 0, category: 'image' },
  { id: 'i28', text: 'أي هذا وسيلة نقل؟', options: [img('objects/car', 'سيارة'), img('food/apple', 'تفاحة'), img('objects/book', 'كتاب')], correctIndex: 0, category: 'image' },
  { id: 'i29', text: 'أي هذا طعام؟', options: [img('food/pizza', 'بيتزا'), img('objects/pen', 'قلم'), img('objects/shoe', 'حذاء')], correctIndex: 0, category: 'image' },
  { id: 'i30', text: 'أي هذا لعبة؟', options: [img('objects/ball', 'كرة'), img('objects/stone', 'حجر'), img('objects/spoon', 'ملعقة')], correctIndex: 0, category: 'image' }
];

const ALL_QUESTIONS: Question[] = [...TEXT_QUESTIONS, ...IMAGE_QUESTIONS];

let noRepeatOrder: Question[] = [];
let cursor = 0;

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const refillIfNeeded = () => {
  if (cursor >= noRepeatOrder.length) {
    noRepeatOrder = shuffle(ALL_QUESTIONS);
    cursor = 0;
  }
};

export const getQuestions = (): Question[] => {
  refillIfNeeded();
  const head = noRepeatOrder.slice(cursor);
  cursor = noRepeatOrder.length;
  return [...head];
};

export const getNextQuestion = (): Question => {
  refillIfNeeded();
  const q = noRepeatOrder[cursor];
  cursor += 1;
  return q;
};
