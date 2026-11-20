/** Guides: Olympic lifts, full body, conditioning, cardio, neck and shoulder-blade work. */
import { C, has, t, type G } from './text';

export const FULL: Record<string, G> = {
  highPull: (_o, e) => ({
    steps: [
      t(`Hold ${e.en} in front of your thighs with an overhand grip, slightly wider than your hips.`, `أمسك ${e.ar} أمام فخذيك بقبضة علوية، أعرض قليلًا من الورك.`),
      t('Hinge slightly and bend your knees a little, back flat.', 'انحنِ قليلًا واثنِ ركبتيك قليلًا مع استقامة الظهر.'),
      t('Drive your hips forward and rise onto your toes, then pull the weight up to your chest with your elbows high and out.', 'ادفع وركيك للأمام وارتفع على أصابع قدميك، ثم اسحب الوزن إلى صدرك والمرفقان مرتفعان للخارج.'),
      t('Lower it back to your thighs with control.', 'أنزله إلى فخذيك بتحكّم.'),
    ],
    tips: [t('The power comes from your legs and hips first, arms last.', 'القوة تأتي من الساقين والورك أولًا، ثم الذراعين.'), C.neutralBack],
  }),
  clean: (o, e) => ({
    steps: [
      o.hang ? t(`Stand tall holding ${e.en}, then hinge until it is just above your knees.`, `قف مستقيمًا ممسكًا ${e.ar}، ثم انحنِ حتى يصبح فوق ركبتيك مباشرة.`) : t(`Set up like a deadlift with ${e.en} over your mid-foot, back flat, arms straight.`, `اتخذ وضعية الرفعة المميتة و${e.ar} فوق منتصف قدميك، والظهر مستقيم والذراعان مستقيمتان.`),
      t('Lift the weight past your knees by pushing the floor away, keeping it close to your legs.', 'ارفع الوزن متجاوزًا ركبتيك بدفع الأرض، مع إبقائه قريبًا من ساقيك.'),
      t('Jump: drive your hips forward hard and shrug, letting the weight float up.', 'اقفز: ادفع وركيك للأمام بقوة وارفع كتفيك، ليرتفع الوزن.'),
      t('Pull yourself under it, whipping your elbows forward to catch it on the front of your shoulders in a quarter squat.', 'اسحب جسمك تحته، وأدر مرفقيك بسرعة للأمام لتلتقطه على مقدمة كتفيك في ربع سكوات.'),
      t('Stand up tall, then lower the weight back down with control.', 'قف مستقيمًا، ثم أنزل الوزن بتحكّم.'),
    ],
    tips: [t('Learn it with an empty bar or light weight from a coach if you can.', 'تعلّمه ببار فارغ أو وزن خفيف، ومع مدرب إن أمكن.'), C.neutralBack],
  }),
  snatch: (_o, e) => ({
    steps: [
      t(`Set up like a deadlift, gripping ${e.en} ${e.kind === 'barbell' ? 'very wide' : 'in one hand'}.`, `اتخذ وضعية الرفعة المميتة، ممسكًا ${e.ar} ${e.kind === 'barbell' ? 'بقبضة واسعة جدًا' : 'بيد واحدة'}.`),
      t('Lift it past your knees keeping your back flat and the weight close.', 'ارفعه متجاوزًا ركبتيك مع استقامة الظهر وإبقاء الوزن قريبًا.'),
      t('Drive your hips forward explosively and pull the weight up in one motion.', 'ادفع وركيك للأمام بقوة واسحب الوزن للأعلى في حركة واحدة.'),
      t('Punch it overhead and catch it with locked arms, dropping into a squat if needed.', 'ادفعه فوق رأسك والتقطه بذراعين مفرودتين، مع النزول في سكوات إن لزم.'),
      t('Stand up with the weight overhead, then lower it under control.', 'قف والوزن فوق رأسك، ثم أنزله بتحكّم.'),
    ],
    tips: [t('This is a technical lift; practise with a very light weight first.', 'هذه رفعة فنية؛ تدرّب عليها بوزن خفيف جدًا أولًا.'), ...(e.kind === 'barbell' ? [] : [C.sides])],
  }),
  cleanPress: (o, e) => ({
    steps: [
      t(`Clean ${has(e) ? e.en : 'the weight'} from the floor to the front of your shoulders.`, `ارفع ${has(e) ? e.ar : 'الوزن'} من الأرض إلى مقدمة كتفيك (كلين).`),
      t('Stand tall and brace your stomach.', 'قف مستقيمًا وشدّ بطنك.'),
      o.jerk ? t('Dip your knees, drive up hard and split your feet as you punch the weight overhead.', 'اثنِ ركبتيك قليلًا، ثم ادفع بقوة وباعد قدميك أمامًا وخلفًا أثناء دفع الوزن فوق رأسك.') : t('Press the weight straight overhead until your arms are locked.', 'ادفع الوزن مباشرة فوق رأسك حتى تُفرد ذراعاك.'),
      ...(o.jerk ? [t('Bring your feet back together under the weight.', 'أعد قدميك معًا تحت الوزن.')] : []),
      t('Lower it to your shoulders, then back to the floor with a flat back.', 'أنزله إلى كتفيك، ثم إلى الأرض مع استقامة الظهر.'),
    ],
    tips: [C.brace, C.neutralBack, C.startLight],
  }),
  thruster: (_o, e) => ({
    steps: [
      t(`Hold ${has(e) ? e.en : 'the weight'} at the front of your shoulders, feet shoulder-width.`, `أمسك ${has(e) ? e.ar : 'الوزن'} عند مقدمة كتفيك، والقدمان بعرض الكتفين.`),
      t('Squat down until your thighs are about parallel, chest up.', 'انزل بالسكوات حتى يصبح فخذاك موازيين تقريبًا، والصدر مرفوع.'),
      t('Drive up hard and, as you stand, press the weight straight overhead in one smooth motion.', 'ادفع للأعلى بقوة، وأثناء الوقوف ادفع الوزن فوق رأسك في حركة واحدة سلسة.'),
      t('Lower it back to your shoulders as you go into the next squat.', 'أنزله إلى كتفيك أثناء النزول للسكوات التالي.'),
    ],
    tips: [t('Use the push from your legs to help the press.', 'استفد من دفعة الساقين لمساعدة الضغط.'), C.kneesToes],
  }),
  burpee: (o, e) => ({
    steps: [
      t(`Stand tall${has(e) && o.hold === 'hands' ? ` with ${e.en} on the floor in front of you` : ''}.`, `قف مستقيمًا${has(e) && o.hold === 'hands' ? ` و${e.ar} على الأرض أمامك` : ''}.`),
      t(`Squat down and place your hands ${has(e) && o.hold === 'hands' ? 'on the dumbbells' : 'on the floor'}.`, `انزل بالسكوات وضع يديك ${has(e) && o.hold === 'hands' ? 'على الدمبلز' : 'على الأرض'}.`),
      t('Jump or step your feet back into a plank, lower your chest to the floor and push back up.', 'اقفز أو أرجع قدميك إلى وضعية البلانك، وأنزل صدرك إلى الأرض ثم ادفع للأعلى.'),
      t('Jump or step your feet back in next to your hands.', 'اقفز أو قدّم قدميك بجانب يديك.'),
      o.press ? t('Stand up and swing or press the weights overhead in one motion.', 'قف وارفع الأوزان فوق رأسك في حركة واحدة.') : o.bar ? t('Jump up and grab the bar, then do one pull-up.', 'اقفز وأمسك البار، ثم نفّذ عقلة واحدة.') : o.noJump ? t(`Stand back up${has(e) && o.hold === 'hands' ? ' with a deadlift' : ''}.`, `قف من جديد${has(e) && o.hold === 'hands' ? ' برفعة مميتة' : ''}.`) : t('Jump straight up with your arms overhead.', 'اقفز للأعلى مع رفع ذراعيك فوق رأسك.'),
    ],
    tips: [t('Keep your back flat when you squat down.', 'أبقِ ظهرك مستقيمًا عند النزول.'), t('Step instead of jumping to make it easier.', 'تحرّك خطوة بخطوة بدل القفز لتسهيله.'), C.land],
  }),
  inchworm: () => ({
    steps: [
      t('Stand tall, then bend forward and place your hands on the floor (bend your knees if needed).', 'قف مستقيمًا، ثم انحنِ وضع يديك على الأرض (اثنِ ركبتيك إن لزم).'),
      t('Walk your hands forward until you are in a high plank.', 'تقدّم بيديك حتى تصل إلى وضعية البلانك العالي.'),
      t('Walk your hands back toward your feet and stand up.', 'ارجع بيديك نحو قدميك وقف.'),
    ],
    tips: [t('Keep your stomach tight in the plank.', 'أبقِ بطنك مشدودًا في البلانك.')],
  }),
  crawl: () => ({
    steps: [
      t('Get on your hands and knees, then lift your knees a few centimetres off the floor.', 'اتخذ وضعية الركوع على اليدين والركبتين، ثم ارفع ركبتيك بضعة سنتيمترات عن الأرض.'),
      t('Crawl forward by moving one hand and the opposite foot at the same time.', 'ازحف للأمام بتحريك يد والقدم المعاكسة في الوقت نفسه.'),
      t('Keep your back flat and hips low as you move.', 'أبقِ ظهرك مستقيمًا ووركيك منخفضين أثناء الحركة.'),
    ],
    tips: [t('Small steps keep your body steady.', 'الخطوات الصغيرة تحافظ على ثبات جسمك.')],
  }),
  muscleUp: (o) => ({
    steps: [
      t(`Hang from the ${o.rings ? 'rings with a false grip (wrists over the rings)' : 'bar with a firm overhand grip'}.`, `تعلّق ${o.rings ? 'بالحلقات بقبضة كاذبة (المعصمان فوق الحلقات)' : 'بالبار بقبضة علوية ثابتة'}.`),
      t('Swing slightly and pull explosively, bringing the bar toward your lower chest.', 'تأرجح قليلًا واسحب بقوة، مقرّبًا البار من أسفل صدرك.'),
      t('Lean forward and turn your wrists over the bar to get your chest above it.', 'امِل للأمام وأدر معصميك فوق البار ليصبح صدرك فوقه.'),
      t('Press up to straight arms, then lower back down with control.', 'ادفع للأعلى حتى تستقيم ذراعاك، ثم انزل بتحكّم.'),
    ],
    tips: [t('You need strong pull-ups and dips first.', 'تحتاج أولًا إلى إتقان العقلة والغطس بقوة.')],
  }),
  jacks: (o) => ({
    steps: [
      t('Stand with feet together and arms at your sides.', 'قف والقدمان معًا والذراعان بجانبيك.'),
      t(o.star ? 'Squat a little, then jump up spreading your arms and legs wide like a star.' : 'Jump your feet out wide while raising your arms overhead.', o.star ? 'انزل قليلًا، ثم اقفز للأعلى مع فتح ذراعيك وساقيك كالنجمة.' : 'اقفز بقدميك للخارج مع رفع ذراعيك فوق رأسك.'),
      t('Jump back to the start.', 'اقفز للعودة إلى البداية.'),
    ],
    tips: [C.land, C.steadyPace],
  }),
  skater: () => ({
    steps: [
      t('Stand on one leg with a slight bend in the knee.', 'قف على ساق واحدة مع ثني بسيط في الركبة.'),
      t('Leap sideways and land softly on the other leg.', 'اقفز جانبيًا واهبط بنعومة على الساق الأخرى.'),
      t('Let the free leg sweep behind you and swing your arms for balance, then leap back.', 'دع الساق الحرة تمر خلفك وأرجح ذراعيك للتوازن، ثم اقفز عائدًا.'),
    ],
    tips: [C.land],
  }),
  shuffle: () => ({
    steps: [
      t('Get into an athletic stance: knees bent, chest up, weight on the balls of your feet.', 'اتخذ وقفة رياضية: الركبتان مثنيتان، الصدر مرفوع، والوزن على مقدمة القدمين.'),
      t('Shuffle sideways quickly without crossing your feet.', 'تحرّك جانبيًا بسرعة دون تقاطع قدميك.'),
      t('Change direction after a few steps.', 'غيّر الاتجاه بعد بضع خطوات.'),
    ],
    tips: [t('Stay low the whole time.', 'ابقَ منخفضًا طوال الوقت.')],
  }),
  run: (o) => ({
    steps: o.walk ? [
      t(o.treadmill ? 'Step onto the treadmill, clip on the safety key, and start at a slow speed.' : 'Start walking at an easy pace on a safe route.', o.treadmill ? 'اصعد على جهاز المشي، وثبّت مفتاح الأمان، وابدأ بسرعة بطيئة.' : 'ابدأ المشي بوتيرة سهلة في طريق آمن.'),
      t('Stand tall, look ahead and let your arms swing naturally.', 'قف مستقيمًا، وانظر للأمام، ودع ذراعيك تتأرجحان بشكل طبيعي.'),
      t('Land on your heel and roll through to your toes.', 'اهبط على الكعب ثم انتقل إلى أصابع القدم.'),
      t('Raise the speed or incline gradually to the level you want.', 'ارفع السرعة أو الميل تدريجيًا إلى المستوى المطلوب.'),
    ] : o.knees ? [
      t('Run in place, driving each knee up to hip height.', 'اركض في مكانك، رافعًا كل ركبة إلى مستوى الورك.'),
      t('Pump your arms and stay on the balls of your feet.', 'حرّك ذراعيك بقوة وابقَ على مقدمة قدميك.'),
      t('Keep it quick and light.', 'حافظ على السرعة والخفة.'),
    ] : o.kicks ? [
      t('Jog in place, kicking each heel up toward your glutes.', 'اركض ببطء في مكانك، رافعًا كل كعب نحو مؤخرتك.'),
      t('Keep your knees pointing down and your body upright.', 'أبقِ ركبتيك متجهتين للأسفل وجسمك معتدلًا.'),
      t('Swing your arms in rhythm and stay light on the balls of your feet.', 'حرّك ذراعيك بإيقاع منتظم وابقَ خفيفًا على مقدمة قدميك.'),
    ] : [
      t(o.treadmill ? 'Step onto the treadmill, clip on the safety key and warm up walking.' : o.stairs ? 'Find a safe flight of stairs and warm up first.' : 'Warm up with a few minutes of easy jogging.', o.treadmill ? 'اصعد على جهاز المشي، وثبّت مفتاح الأمان، وسخّن بالمشي.' : o.stairs ? 'اختر درجًا آمنًا وسخّن أولًا.' : 'سخّن ببضع دقائق من الركض الخفيف.'),
      t(o.stairs ? 'Run up the stairs on the balls of your feet, one step at a time, pumping your arms.' : 'Run tall with a slight forward lean, landing under your body, not far in front.', o.stairs ? 'اصعد الدرج ركضًا على مقدمة قدميك، درجة بدرجة، مع تحريك ذراعيك بقوة.' : 'اركض مستقيمًا مع ميل بسيط للأمام، واهبط تحت جسمك لا بعيدًا أمامه.'),
      t('Swing your arms forward and back, elbows bent at about 90°.', 'أرجح ذراعيك للأمام وللخلف، والمرفقان مثنيان 90 درجة تقريبًا.'),
      o.sprint ? t(`Sprint hard for a short distance${o.hill ? ' up the hill' : ''}, then walk back to recover fully before the next one.`, `اركض بأقصى سرعة لمسافة قصيرة${o.hill ? ' صعودًا على التل' : ''}، ثم امشِ عائدًا لتستعيد نشاطك قبل التالية.`) : o.stairs ? t('Walk down carefully to recover.', 'انزل مشيًا بحذر للاستشفاء.') : t('Keep a steady pace and breathe rhythmically.', 'حافظ على وتيرة ثابتة وتنفّس بإيقاع منتظم.'),
    ],
    tips: o.sprint ? [C.warmUp, t('Quality over quantity: rest fully between sprints.', 'الجودة قبل الكمية: استرح تمامًا بين الجولات.')] : [C.steadyPace, t('Short, quick steps are easier on your joints than long strides.', 'الخطوات القصيرة السريعة ألطف على المفاصل من الخطوات الطويلة.')],
  }),
  bike: (o) => ({
    steps: [
      t(o.outdoor ? 'Wear a helmet and set the saddle so your leg is almost straight at the bottom of the pedal stroke.' : 'Set the seat height so your leg is almost straight at the bottom of the pedal stroke.', o.outdoor ? 'ارتدِ خوذة واضبط المقعد بحيث تكاد ساقك تستقيم في أسفل دورة الدوّاسة.' : 'اضبط ارتفاع المقعد بحيث تكاد ساقك تستقيم في أسفل دورة الدوّاسة.'),
      t(o.recumbent ? 'Sit back against the backrest and put your feet in the pedals.' : 'Sit on the saddle and hold the handlebars lightly.', o.recumbent ? 'اجلس مستندًا إلى الظهر وضع قدميك في الدوّاسات.' : 'اجلس على المقعد وأمسك المقود بخفة.'),
      t(o.assault ? 'Pedal while pushing and pulling the handles with your arms.' : 'Pedal in smooth circles, pushing down and pulling up.', o.assault ? 'دوّس مع دفع وسحب المقابض بذراعيك.' : 'دوّس بدوائر سلسة، مع الدفع للأسفل والسحب للأعلى.'),
      t('Adjust the resistance to keep the effort you want.', 'اضبط المقاومة للحفاظ على الجهد المطلوب.'),
    ],
    tips: [t('Keep your knees in line with your feet.', 'أبقِ ركبتيك على خط قدميك.'), C.steadyPace],
  }),
  rower: () => ({
    steps: [
      t('Strap your feet in and hold the handle with straight arms, knees bent, shins vertical (the catch).', 'ثبّت قدميك وأمسك المقبض بذراعين مستقيمتين، والركبتان مثنيتان، والساقان عموديتان (البداية).'),
      t('Push with your legs first.', 'ادفع بساقيك أولًا.'),
      t('As your legs straighten, lean back slightly, then pull the handle to your lower ribs.', 'عندما تستقيم ساقاك، امِل للخلف قليلًا، ثم اسحب المقبض إلى أسفل أضلاعك.'),
      t('Return in reverse order: arms, then body, then bend your knees.', 'ارجع بالترتيب العكسي: الذراعان، ثم الجسم، ثم اثنِ ركبتيك.'),
    ],
    tips: [t('Legs, body, arms on the way out; arms, body, legs on the way back.', 'الساقان ثم الجسم ثم الذراعان عند السحب؛ والعكس عند العودة.'), C.neutralBack],
  }),
  elliptical: (o) => ({
    steps: [
      t(o.climber ? 'Step onto the climber and hold the handles above you.' : 'Step onto the pedals and hold the moving handles.', o.climber ? 'اصعد على الجهاز وأمسك المقابض فوقك.' : 'اصعد على الدوّاسات وأمسك المقابض المتحركة.'),
      t(o.climber ? 'Climb by pushing down with one leg while pulling down with the opposite arm.' : 'Push and pull the handles while your legs move in a smooth oval.', o.climber ? 'تسلّق بالدفع لأسفل بساق والسحب لأسفل بالذراع المعاكسة.' : 'ادفع واسحب المقابض بينما تتحرك ساقاك بشكل بيضاوي سلس.'),
      t('Stand tall and keep your whole foot on the pedal.', 'قف مستقيمًا وأبقِ قدمك كاملة على الدوّاسة.'),
      t('Set the resistance to the effort you want.', 'اضبط المقاومة حسب الجهد المطلوب.'),
    ],
    tips: [t('Do not lean on the machine; let your legs carry you.', 'لا تتكئ على الجهاز؛ دع ساقيك تحملانك.'), C.steadyPace],
  }),
  stepper: () => ({
    steps: [
      t('Step on, hold the rails lightly and start at a slow speed.', 'اصعد، وأمسك المساند بخفة وابدأ بسرعة بطيئة.'),
      t('Climb with your whole foot on each step, standing tall.', 'اصعد بقدمك كاملة على كل درجة وأنت مستقيم.'),
      t('Raise the speed gradually.', 'ارفع السرعة تدريجيًا.'),
    ],
    tips: [t('Do not lean your weight onto the rails.', 'لا تتكئ بوزنك على المساند.'), C.steadyPace],
  }),
  skiErg: () => ({
    steps: [
      t('Stand facing the machine and reach up for the handles.', 'قف مقابل الجهاز ومدّ يديك للأعلى لإمساك المقابض.'),
      t('Pull down by hinging at your hips and bending your knees slightly, arms nearly straight.', 'اسحب للأسفل بالانحناء من الورك وثني الركبتين قليلًا، والذراعان شبه مستقيمتين.'),
      t('Finish with your hands by your thighs.', 'أنهِ ويداك بجانب فخذيك.'),
      t('Stand back up and reach overhead for the next pull.', 'قف من جديد ومدّ يديك للأعلى للسحبة التالية.'),
    ],
    tips: [C.neutralBack, t('The power comes from your hips and core, not just your arms.', 'القوة تأتي من الورك والجذع لا من الذراعين فقط.')],
  }),
  box: (o) => ({
    steps: [
      t('Stand side-on in a fighting stance, hands up guarding your chin.', 'قف جانبيًا في وقفة القتال، ويداك مرفوعتان تحميان ذقنك.'),
      t(o.bag ? 'Stand an arm\'s length from the bag.' : 'Imagine a target an arm\'s length away.', o.bag ? 'قف على بُعد ذراع من الكيس.' : 'تخيّل هدفًا على بُعد ذراع.'),
      t('Throw straight punches, turning your shoulder and hip into each one.', 'وجّه لكمات مستقيمة، مع لفّ كتفك ووركك في كل لكمة.'),
      t('Bring each hand straight back to guard and keep moving your feet.', 'أعد كل يد مباشرة للحماية واستمر بتحريك قدميك.'),
    ],
    tips: [t('Do not lock your elbows hard on each punch.', 'لا تفرد مرفقيك بقوة في كل لكمة.'), ...(o.bag ? [t('Wear hand wraps and gloves.', 'استخدم لفافات اليد والقفازات.')] : []), C.steadyPace],
  }),
  swim: () => ({
    steps: [
      t('Float face down with your body long and flat.', 'اطفُ على بطنك وجسمك ممدود ومستوٍ.'),
      t('Reach one arm forward, pull it down and back under your body, then recover it over the water.', 'مدّ ذراعًا للأمام، واسحبها للأسفل وللخلف تحت جسمك، ثم أعدها فوق الماء.'),
      t('Alternate arms while kicking with straight legs from the hips.', 'بدّل الذراعين مع الركل بساقين مستقيمتين من الورك.'),
      t('Turn your head to the side to breathe every few strokes.', 'أدر رأسك جانبًا للتنفس كل بضع ضربات.'),
    ],
    tips: [t('Only swim where it is safe and supervised.', 'اسبح فقط في مكان آمن وتحت إشراف.'), C.steadyPace],
  }),
  tuckJump: () => ({
    steps: [
      t('Stand with feet hip-width apart.', 'قف والقدمان بعرض الورك.'),
      t('Dip and jump as high as you can.', 'انزل قليلًا واقفز لأعلى ما يمكن.'),
      t('Pull your knees up toward your chest at the top.', 'اسحب ركبتيك نحو صدرك في الأعلى.'),
      t('Straighten your legs and land softly.', 'افرد ساقيك واهبط بنعومة.'),
    ],
    tips: [C.land],
  }),
  broadJump: () => ({
    steps: [
      t('Stand with feet hip-width apart.', 'قف والقدمان بعرض الورك.'),
      t('Swing your arms back and dip into a quarter squat.', 'أرجح ذراعيك للخلف وانزل في ربع سكوات.'),
      t('Jump forward as far as you can, swinging your arms forward.', 'اقفز للأمام لأبعد ما يمكن، مع أرجحة ذراعيك للأمام.'),
      t('Land softly on both feet, then walk back to the start.', 'اهبط بنعومة على القدمين، ثم امشِ عائدًا إلى البداية.'),
    ],
    tips: [C.land, C.kneesToes],
  }),
  sled: (o) => ({
    steps: o.pull ? [
      t('Hold the rope or straps attached to the sled.', 'أمسك الحبل أو الأشرطة المثبتة بالمزلجة.'),
      t('Lean back slightly and walk backwards with small steps, pulling the sled toward you.', 'امِل للخلف قليلًا وامشِ للخلف بخطوات صغيرة، ساحبًا المزلجة نحوك.'),
      t('Keep your chest up and drive through your legs.', 'أبقِ صدرك مرفوعًا وادفع بساقيك.'),
    ] : [
      t('Grip the sled poles with straight arms and lean forward about 45°.', 'أمسك أعمدة المزلجة بذراعين مستقيمتين وامِل للأمام 45 درجة تقريبًا.'),
      t('Drive the sled forward with short, powerful steps, pushing through the balls of your feet.', 'ادفع المزلجة للأمام بخطوات قصيرة قوية، دافعًا بمقدمة قدميك.'),
      t('Keep your back flat and your head in line with your body.', 'أبقِ ظهرك مستقيمًا ورأسك على خط جسمك.'),
    ],
    tips: [C.neutralBack, t('Choose a weight you can keep moving the whole distance.', 'اختر وزنًا تستطيع تحريكه طوال المسافة.')],
  }),
  slam: (o) => ({
    steps: o.wall ? [
      t('Stand an arm\'s length from a wall holding the ball at your chest.', 'قف على بُعد ذراع من الجدار ممسكًا الكرة عند صدرك.'),
      t('Squat down until your thighs are about parallel.', 'انزل بالسكوات حتى يصبح فخذاك موازيين تقريبًا.'),
      t('Drive up and throw the ball to the target high on the wall.', 'ادفع للأعلى وارمِ الكرة نحو الهدف المرتفع على الجدار.'),
      t('Catch it and go straight into the next squat.', 'التقطها وانتقل مباشرة إلى السكوات التالي.'),
    ] : [
      t('Stand holding the ball overhead with straight arms, rising onto your toes.', 'قف ممسكًا الكرة فوق رأسك بذراعين مستقيمتين، مرتفعًا على أصابع قدميك.'),
      t('Slam it into the floor in front of you as hard as you can, bending your hips and knees.', 'اضرب بها الأرض أمامك بأقصى قوة، مع ثني الورك والركبتين.'),
      t('Squat to pick it up with a flat back and repeat.', 'انزل لالتقاطها بظهر مستقيم وكرّر.'),
    ],
    tips: [t('Use a slam ball that does not bounce back.', 'استخدم كرة لا ترتد بقوة.'), C.neutralBack],
  }),
  ropes: () => ({
    steps: [
      t('Hold one rope end in each hand, feet shoulder-width, in a half squat.', 'أمسك طرف حبل بكل يد، والقدمان بعرض الكتفين، في نصف سكوات.'),
      t('Move your arms up and down quickly to send waves along the ropes.', 'حرّك ذراعيك للأعلى وللأسفل بسرعة لإرسال موجات على الحبال.'),
      t('Alternate arms or move both together for the set time.', 'بدّل الذراعين أو حرّكهما معًا للمدة المحددة.'),
    ],
    tips: [t('Stay low and keep your stomach tight.', 'ابقَ منخفضًا وأبقِ بطنك مشدودًا.'), C.steadyPace],
  }),
  tireFlip: () => ({
    steps: [
      t('Squat down at the tyre with your chest against it and fingers under the edge.', 'انزل بالسكوات أمام الإطار وصدرك ملاصق له وأصابعك تحت حافته.'),
      t('Drive up with your legs and hips, lifting the tyre as you stand.', 'ادفع بساقيك ووركك لرفع الإطار أثناء الوقوف.'),
      t('Step forward, bring a knee into it if needed, then push it over with both hands.', 'تقدّم خطوة، واستخدم ركبتك إن لزم، ثم ادفعه ليقلب بكلتا يديك.'),
    ],
    tips: [C.neutralBack, t('Do not lift it like a curl with your arms.', 'لا ترفعه بذراعيك كتمرين البايسبس.')],
  }),
  stone: () => ({
    steps: [
      t('Stand over the stone with feet wide and wrap your arms around it.', 'قف فوق الحجر والقدمان متباعدتان، ولفّ ذراعيك حوله.'),
      t('Lift it to your lap by extending your hips.', 'ارفعه إلى حضنك بمدّ الورك.'),
      t('Re-grip, then drive your hips forward to stand and bring it up to your chest or onto a platform.', 'غيّر الإمساك، ثم ادفع وركيك للأمام لتقف وترفعه إلى صدرك أو إلى منصة.'),
    ],
    tips: [t('Learn this with a light stone and good coaching.', 'تعلّمه بحجر خفيف وبتوجيه جيد.')],
  }),
  sledgehammer: () => ({
    steps: [
      t('Stand facing the tyre, feet shoulder-width, holding the hammer with one hand near the head and one at the end.', 'قف مقابل الإطار والقدمان بعرض الكتفين، ممسكًا المطرقة بيد قرب الرأس ويد في نهاية المقبض.'),
      t('Lift the hammer over your shoulder, sliding the top hand down the handle.', 'ارفع المطرقة فوق كتفك، مع إنزال اليد العليا على المقبض.'),
      t('Swing it down onto the tyre, bending your knees and hips as it strikes.', 'أنزلها بقوة على الإطار، مع ثني الركبتين والورك عند الضرب.'),
      t('Switch the lead hand every few strikes.', 'بدّل اليد الأمامية كل بضع ضربات.'),
    ],
    tips: [t('Make sure nobody is near you.', 'تأكد ألا يقف أحد بقربك.'), C.neutralBack],
  }),
  neckNod: (o) => ({
    steps: o.bridge ? [
      t('Lie on a soft mat with knees bent and feet flat.', 'استلقِ على حصيرة لينة والركبتان مثنيتان والقدمان على الأرض.'),
      t('Press the back of your head into the mat and lift your hips slightly.', 'اضغط مؤخرة رأسك على الحصيرة وارفع وركيك قليلًا.'),
      t('Gently rock a small distance forward and back on your head.', 'تأرجح بلطف مسافة صغيرة للأمام وللخلف على رأسك.'),
    ] : [
      t('Put on the neck harness with a light weight and hinge forward, hands on your thighs.', 'ارتدِ حزام الرقبة بوزن خفيف وانحنِ للأمام ويداك على فخذيك.'),
      t('Let your chin drop slowly toward your chest.', 'اترك ذقنك ينزل ببطء نحو صدرك.'),
      t('Lift your head until your neck is in line with your back; no further.', 'ارفع رأسك حتى تصبح رقبتك على خط ظهرك، ولا تتجاوز ذلك.'),
    ],
    tips: [t('Use very light weight and slow, small movements; stop if you feel pain.', 'استخدم وزنًا خفيفًا جدًا وحركات صغيرة وبطيئة، وتوقّف عند الشعور بألم.'), ...(o.bridge ? [t('Only do this if you have trained the neck before or with a coach.', 'لا تؤدِّه إلا إن سبق لك تدريب الرقبة أو مع مدرب.')] : [])],
  }),
  scapPushUp: () => ({
    steps: [
      t('Start in a high plank with straight arms.', 'ابدأ بوضعية البلانك العالي بذراعين مستقيمتين.'),
      t('Without bending your elbows, let your chest sink so your shoulder blades come together.', 'دون ثني المرفقين، اترك صدرك ينزل ليقترب لوحا الكتفين.'),
      t('Push the floor away so your upper back rounds slightly and the shoulder blades spread.', 'ادفع الأرض بعيدًا ليتقوّس أعلى ظهرك قليلًا ويتباعد لوحا الكتفين.'),
    ],
    tips: [t('Your arms stay straight; only the shoulder blades move.', 'ذراعاك تبقيان مستقيمتين؛ فقط لوحا الكتفين يتحركان.')],
  }),
  wallSlide: () => ({
    steps: [
      t('Stand with your back, head and arms against a wall, elbows bent at 90° like a goalpost.', 'قف وظهرك ورأسك وذراعاك على الجدار، والمرفقان مثنيان 90 درجة كقائم المرمى.'),
      t('Slide your arms up the wall as far as you can while keeping them touching it.', 'ازلق ذراعيك للأعلى على الجدار بقدر ما تستطيع مع إبقائهما ملامستين له.'),
      t('Slide them back down to the start.', 'أعدهما للأسفل إلى البداية.'),
    ],
    tips: [t('Keep your lower back flat against the wall.', 'أبقِ أسفل ظهرك ملاصقًا للجدار.'), C.shouldersDown],
  }),
  proneRaise: (o, e) => ({
    steps: [
      t(`Lie chest-down on an incline bench (or bend forward)${has(e) ? ` with light ${e.en}` : ''}, arms hanging down.`, `استلقِ على صدرك فوق مقعد مائل (أو انحنِ للأمام)${has(e) ? ` ممسكًا ${e.ar} خفيفة` : ''}، والذراعان متدليتان.`),
      t(o.t ? 'Raise your straight arms out to the sides into a T.' : 'Raise your arms up and forward into a Y, thumbs up.', o.t ? 'ارفع ذراعيك المستقيمتين للجانبين على شكل حرف T.' : 'ارفع ذراعيك للأعلى وللأمام على شكل حرف Y والإبهامان للأعلى.'),
      t('Squeeze your shoulder blades, then lower slowly.', 'اضمم لوحي كتفيك، ثم انزل ببطء.'),
    ],
    tips: [t('Use very light weight or none at all.', 'استخدم وزنًا خفيفًا جدًا أو بدون وزن.'), C.shouldersDown],
  }),
};
