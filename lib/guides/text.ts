/** Shared pieces for the written exercise guides. Every line is [English, Arabic]. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Equip } from './match';

export type T = [string, string];
export type Guide = { steps: T[]; tips: T[] };
export type Eq = { kind: Equip; en: string; ar: string; one: boolean };
export type G = (o: Record<string, any>, e: Eq) => Guide;

const NAMES: Record<string, [string, string, string, string]> = {
  // [two hands EN, two hands AR, one hand EN, one hand AR]
  barbell: ['the barbell', 'البار', 'the barbell', 'البار'],
  ezbar: ['the EZ bar', 'بار الـEZ', 'the EZ bar', 'بار الـEZ'],
  dumbbell: ['the dumbbells', 'الدمبلز', 'the dumbbell', 'الدمبل'],
  kettlebell: ['the kettlebells', 'الكيتل بيل', 'the kettlebell', 'الكيتل بيل'],
  cable: ['the cable handle', 'مقبض الكابل', 'the cable handle', 'مقبض الكابل'],
  band: ['the band', 'الحبل المطاطي', 'the band', 'الحبل المطاطي'],
  machine: ['the machine handles', 'مقابض الجهاز', 'the machine handle', 'مقبض الجهاز'],
  smith: ['the Smith machine bar', 'بار جهاز سميث', 'the Smith machine bar', 'بار جهاز سميث'],
  plate: ['the weight plate', 'قرص الوزن', 'the weight plate', 'قرص الوزن'],
  medball: ['the medicine ball', 'الكرة الطبية', 'the medicine ball', 'الكرة الطبية'],
  sandbag: ['the sandbag', 'كيس الرمل', 'the sandbag', 'كيس الرمل'],
  bodyweight: ['', '', '', ''],
  other: ['the weight', 'الوزن', 'the weight', 'الوزن'],
};

export function eqOf(kind: Equip, one: boolean): Eq {
  const n = NAMES[kind] ?? NAMES.other;
  return { kind, one, en: one ? n[2] : n[0], ar: one ? n[3] : n[1] };
}

export const has = (e: Eq) => e.kind !== 'bodyweight' && e.en !== '';
export const free = (e: Eq) => ['barbell', 'ezbar', 'dumbbell', 'kettlebell', 'plate', 'medball', 'sandbag', 'other'].includes(e.kind);

/** "Hold the dumbbells / Hold the dumbbell in one hand". Empty for body weight. */
export function grip(e: Eq, how: T = ['', '']): T[] {
  if (!has(e)) return [];
  if (e.kind === 'cable') return [[`Attach a handle to the cable, set the pulley${how[0] ? ' ' + how[0] : ''}, and take hold of it.`, `ثبّت مقبضًا في الكابل، واضبط البكرة${how[1] ? ' ' + how[1] : ''}، ثم أمسك المقبض.`]];
  if (e.kind === 'band') return [[`Anchor the band${how[0] ? ' ' + how[0] : ''} and hold the ends with tension already on it.`, `ثبّت الحبل المطاطي${how[1] ? ' ' + how[1] : ''} وأمسك طرفيه مع وجود شدّ بسيط من البداية.`]];
  if (e.kind === 'machine') return [['Adjust the seat and pads so the machine fits your body, then choose the weight.', 'اضبط المقعد والوسائد لتناسب جسمك، ثم اختر الوزن.']];
  if (e.kind === 'smith') return [['Set the bar on the Smith machine hooks at the right height and unhook it by turning your wrists.', 'اضبط بار جهاز سميث على الخطافات بالارتفاع المناسب، وحرّره بتدوير معصميك.']];
  return [[`Hold ${e.en}${e.one ? ' in one hand' : ''} with a firm grip.`, `أمسك ${e.ar}${e.one ? ' بيد واحدة' : ''} بقبضة ثابتة.`]];
}

// Short, reusable trainer cues.
export const C = {
  breathePush: ['Breathe out as you push, breathe in as you lower.', 'أخرج النفس أثناء الدفع، وخذ نفسًا أثناء النزول.'] as T,
  breathePull: ['Breathe out as you pull, breathe in as you return.', 'أخرج النفس أثناء السحب، وخذ نفسًا أثناء الرجوع.'] as T,
  breatheLift: ['Breathe out as you lift, breathe in as you lower.', 'أخرج النفس أثناء الرفع، وخذ نفسًا أثناء الإنزال.'] as T,
  brace: ['Brace your stomach like you are about to be pushed, and keep it tight the whole rep.', 'شدّ عضلات بطنك كأن أحدًا سيدفعك، وأبقها مشدودة طوال التكرار.'] as T,
  neutralBack: ['Keep your back flat and your chest proud; never let your lower back round.', 'حافظ على ظهرك مستقيمًا وصدرك مرفوعًا، ولا تسمح لأسفل ظهرك بالتقوّس.'] as T,
  slowDown: ['Lower slowly, about 2 to 3 seconds; do not let the weight drop.', 'انزل ببطء لمدة 2 إلى 3 ثوانٍ تقريبًا، ولا تترك الوزن يسقط.'] as T,
  noSwing: ['Do not swing or use momentum; if you have to, the weight is too heavy.', 'لا تتأرجح ولا تستعمل الاندفاع؛ إن اضطررت لذلك فالوزن ثقيل جدًا.'] as T,
  shouldersDown: ['Keep your shoulders down and away from your ears.', 'أبقِ كتفيك منخفضين وبعيدين عن أذنيك.'] as T,
  kneesToes: ['Push your knees out in line with your toes; do not let them cave inward.', 'ادفع ركبتيك للخارج باتجاه أصابع قدميك، ولا تدعها تنحني للداخل.'] as T,
  heelsDown: ['Keep your whole foot flat, with weight through your heels and mid-foot.', 'أبقِ قدمك كاملة على الأرض، والوزن على الكعب ووسط القدم.'] as T,
  elbowsStill: ['Keep your upper arms still; only your forearms move.', 'أبقِ أعلى ذراعيك ثابتًا؛ فقط الساعدان يتحركان.'] as T,
  fullRange: ['Use the full range you can control, from a full stretch to a full squeeze.', 'استخدم المدى الكامل الذي تتحكم به، من التمدد الكامل إلى الانقباض الكامل.'] as T,
  squeeze: ['Pause for one second at the top and squeeze the working muscle.', 'توقّف ثانية واحدة في الأعلى واعصر العضلة العاملة.'] as T,
  startLight: ['Start light and learn the movement before adding weight.', 'ابدأ بوزن خفيف وتعلّم الحركة قبل زيادة الوزن.'] as T,
  steadyPace: ['Keep a pace you could hold while still speaking a few words.', 'حافظ على وتيرة تستطيع معها قول بضع كلمات.'] as T,
  warmUp: ['Warm up for a few minutes at an easy pace first.', 'سخّن لبضع دقائق بوتيرة سهلة أولًا.'] as T,
  land: ['Land softly on the balls of your feet with your knees slightly bent.', 'اهبط بنعومة على مقدمة قدميك مع ثني ركبتيك قليلًا.'] as T,
  neck: ['Keep your neck in line with your spine; look slightly ahead, not up.', 'أبقِ رقبتك على استقامة العمود الفقري، وانظر للأمام قليلًا لا للأعلى.'] as T,
  sides: ['Do all reps on one side, then switch.', 'نفّذ كل التكرارات على جهة واحدة، ثم بدّل.'] as T,
  alternate: ['Alternate sides each rep.', 'بدّل الجهة في كل تكرار.'] as T,
  hold: ['Hold the position and keep breathing steadily.', 'اثبت في الوضعية وتنفّس بانتظام.'] as T,
};

export const t = (en: string, ar: string): T => [en, ar];
