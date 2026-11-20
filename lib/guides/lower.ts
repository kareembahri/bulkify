/** Guides: legs, glutes, calves, core. */
import { C, grip, has, t, type G } from './text';

export const LOWER: Record<string, G> = {
  // ===== LEGS =====
  squat: (o, e) => {
    const hold = o.hold ?? 'back';
    const setup =
      e.kind === 'machine' ? t('Strap the belt around your hips and stand on the platform.', 'ثبّت الحزام حول وركيك وقف على المنصة.')
        : e.kind === 'band' ? t('Stand on the band and hold the ends at your shoulders.', 'قف على الحبل المطاطي وأمسك طرفيه عند كتفيك.')
          : e.kind === 'cable' ? t('Hold the cable handle at your chest from a low pulley in front of you.', 'أمسك مقبض الكابل عند صدرك من بكرة سفلية أمامك.')
            : hold === 'back' ? t(`Set ${e.en} on your upper back (not your neck), grip it firmly and step back from the rack.`, `ضع ${e.ar} على أعلى ظهرك (لا على رقبتك)، وأمسكه بثبات وتراجع عن الحامل.`)
              : hold === 'front' ? t(`Rest ${e.en} on the front of your shoulders with your elbows high.`, `ضع ${e.ar} على مقدمة كتفيك والمرفقان مرتفعان.`)
                : hold === 'chest' ? t(`Hold ${e.kind === 'dumbbell' ? 'one dumbbell vertically' : e.en} against your chest with both hands.`, `أمسك ${e.kind === 'dumbbell' ? 'دمبلًا واحدًا عموديًا' : e.ar} على صدرك بكلتا يديك.`)
                  : hold === 'overhead' ? t('Hold the bar overhead with a wide grip and locked arms.', 'أمسك البار فوق رأسك بقبضة واسعة وذراعين مفرودتين.')
                    : hold === 'zercher' ? t('Hold the bar in the crook of your elbows, hands together in front of your chest.', 'أمسك البار في ثنية مرفقيك، واليدان معًا أمام صدرك.')
                      : has(e) ? t(`Hold ${e.en} at your sides with straight arms.`, `أمسك ${e.ar} بجانبيك بذراعين مستقيمتين.`) : t('Hold your arms out in front of you for balance.', 'مدّ ذراعيك أمامك للتوازن.');
    return {
      steps: [
        setup,
        t(`Stand with feet ${o.sumo ? 'wide and toes turned out' : 'about shoulder-width apart, toes turned out slightly'}.`, `قف والقدمان ${o.sumo ? 'متباعدتان والأصابع للخارج' : 'بعرض الكتفين تقريبًا والأصابع للخارج قليلًا'}.`),
        t('Take a big breath and brace your stomach.', 'خذ نفسًا عميقًا وشدّ بطنك.'),
        t(`Sit down and back between your heels${o.box ? ' until you lightly touch the box' : ' until your thighs are at least parallel to the floor, if you can keep good form'}.`, `اجلس للأسفل وللخلف بين كعبيك${o.box ? ' حتى تلمس الصندوق بخفة' : ' حتى يصبح فخذاك موازيين للأرض على الأقل إن استطعت الحفاظ على الوضعية'}.`),
        t('Drive through your whole foot to stand back up.', 'ادفع بقدمك كاملة لتعود واقفًا.'),
      ],
      tips: [C.kneesToes, C.heelsDown, t('Keep your chest up and your back straight.', 'أبقِ صدرك مرفوعًا وظهرك مستقيمًا.'), ...(e.kind === 'barbell' && hold === 'back' ? [t('Squat inside a rack with the safety bars set just below your lowest point.', 'نفّذ السكوات داخل الحامل مع ضبط أذرع الأمان أسفل أدنى نقطة تصل إليها.')] : [])],
    };
  },
  hackSquat: () => ({
    steps: [
      t('Stand on the platform with your back and shoulders against the pads, feet shoulder-width.', 'قف على المنصة وظهرك وكتفاك على الوسائد، والقدمان بعرض الكتفين.'),
      t('Release the safety handles.', 'حرّر مقابض الأمان.'),
      t('Bend your knees and lower until your thighs are about parallel to the platform.', 'اثنِ ركبتيك وانزل حتى يصبح فخذاك موازيين للمنصة تقريبًا.'),
      t('Push through your whole foot to straighten your legs, without locking your knees hard.', 'ادفع بقدمك كاملة لفرد ساقيك دون قفل الركبتين بقوة.'),
    ],
    tips: [t('Keep your back flat against the pad.', 'أبقِ ظهرك ملتصقًا بالوسادة.'), C.kneesToes, t('Lock the safety handles back before you step off.', 'أعد قفل مقابض الأمان قبل النزول.')],
  }),
  legPress: (o) => ({
    steps: [
      t('Sit in the leg press with your back and hips flat on the pad.', 'اجلس في جهاز ضغط الأرجل وظهرك ووركاك ملتصقان بالوسادة.'),
      t(`Place ${o.single ? 'one foot' : 'your feet'} ${o.calf ? 'on the bottom edge of the platform so your heels hang off' : 'on the platform about shoulder-width apart'}.`, `ضع ${o.single ? 'قدمًا واحدة' : 'قدميك'} ${o.calf ? 'على الحافة السفلية للمنصة بحيث يتدلى الكعبان' : 'على المنصة بعرض الكتفين تقريبًا'}.`),
      t('Push the platform up and release the safety handles.', 'ادفع المنصة للأعلى وحرّر مقابض الأمان.'),
      ...(o.calf ? [
        t('With your knees almost straight, push through the balls of your feet to point your toes.', 'والركبتان شبه مستقيمتين، ادفع بمقدمة قدميك لتمدّ أصابعك.'),
        t('Let your heels come back slowly for a stretch.', 'اترك كعبيك يعودان ببطء للتمدد.'),
      ] : [
        t('Bend your knees and lower the platform until your knees come close to your chest.', 'اثنِ ركبتيك وأنزل المنصة حتى تقترب ركبتاك من صدرك.'),
        t('Push it back up through your heels without locking your knees.', 'ادفعها للأعلى من كعبيك دون قفل الركبتين.'),
      ]),
    ],
    tips: [t('Do not let your lower back lift off the pad at the bottom.', 'لا تدع أسفل ظهرك يرتفع عن الوسادة في الأسفل.'), C.kneesToes, ...(o.single ? [C.sides] : [])],
  }),
  verticalLegPress: () => ({
    steps: [
      t('Lie on your back under the platform with your hips under it and feet shoulder-width.', 'استلقِ على ظهرك تحت المنصة ووركاك تحتها والقدمان بعرض الكتفين.'),
      t('Press the platform up and release the safety catch.', 'ادفع المنصة للأعلى وحرّر مسكة الأمان.'),
      t('Lower it by bending your knees toward your chest.', 'أنزلها بثني ركبتيك نحو صدرك.'),
      t('Press it back up without locking your knees.', 'ادفعها للأعلى دون قفل الركبتين.'),
    ],
    tips: [t('Always re-engage the safety catch before getting out.', 'أعد تشغيل مسكة الأمان دائمًا قبل الخروج.'), C.startLight],
  }),
  sissySquat: (_o, e) => ({
    steps: [
      e.kind === 'machine' ? t('Lock your ankles under the pads of the sissy squat bench.', 'ثبّت كاحليك تحت وسائد جهاز السيسي سكوات.') : t('Hold onto something sturdy with one hand and rise onto your toes.', 'أمسك شيئًا ثابتًا بيد واحدة وارتفع على أصابع قدميك.'),
      t('Push your knees forward while leaning your body back in a straight line from knees to head.', 'ادفع ركبتيك للأمام بينما تميل بجسمك للخلف بخط مستقيم من الركبتين إلى الرأس.'),
      t('Lower as far as you can control.', 'انزل بالقدر الذي تتحكم به.'),
      t('Push back up using your thighs.', 'ارجع للأعلى باستخدام عضلات الفخذ.'),
    ],
    tips: [t('Keep your hips straight; do not sit back.', 'أبقِ وركيك مستقيمين ولا تجلس للخلف.'), t('Go slowly; this is hard on the knees at first.', 'تحرّك ببطء؛ هذا التمرين صعب على الركبتين في البداية.')],
  }),
  wallSit: () => ({
    steps: [
      t('Stand with your back flat against a wall and feet about 50 cm in front of it.', 'قف وظهرك ملتصق بالجدار والقدمان على بُعد 50 سم تقريبًا أمامه.'),
      t('Slide down until your knees are bent at about 90° and directly above your ankles.', 'انزلق للأسفل حتى تنثني ركبتاك بزاوية 90 درجة تقريبًا فوق كاحليك مباشرة.'),
      t('Hold the position for the set time.', 'اثبت في الوضعية للمدة المحددة.'),
      t('Slide back up to stand.', 'انزلق للأعلى لتقف.'),
    ],
    tips: [t('Keep your back and head on the wall.', 'أبقِ ظهرك ورأسك على الجدار.'), C.hold],
  }),
  pistol: () => ({
    steps: [
      t('Stand on one leg with the other leg held straight out in front.', 'قف على ساق واحدة والساق الأخرى ممدودة أمامك.'),
      t('Reach your arms forward for balance.', 'مدّ ذراعيك للأمام للتوازن.'),
      t('Squat down on the standing leg as low as you can control, keeping the heel down.', 'انزل بالسكوات على الساق الواقفة بالقدر الذي تتحكم به، مع إبقاء الكعب على الأرض.'),
      t('Drive back up to standing.', 'ادفع للأعلى لتعود واقفًا.'),
    ],
    tips: [t('Hold a doorframe or squat to a bench while you learn.', 'استند إلى إطار باب أو انزل إلى مقعد أثناء التعلّم.'), C.kneesToes, C.sides],
  }),
  jumpSquat: () => ({
    steps: [
      t('Stand with feet shoulder-width apart.', 'قف والقدمان بعرض الكتفين.'),
      t('Squat down to about half depth, swinging your arms back.', 'انزل بالسكوات إلى منتصف العمق تقريبًا، مع أرجحة ذراعيك للخلف.'),
      t('Jump up explosively, swinging your arms up.', 'اقفز للأعلى بقوة، مع أرجحة ذراعيك للأعلى.'),
      t('Land softly and go straight into the next squat.', 'اهبط بنعومة وانتقل مباشرة إلى السكوات التالي.'),
    ],
    tips: [C.land, C.kneesToes],
  }),
  boxJump: () => ({
    steps: [
      t('Stand about a foot-length from a sturdy box.', 'قف على بُعد طول قدم تقريبًا من صندوق ثابت.'),
      t('Dip into a quarter squat and swing your arms back.', 'انزل في ربع سكوات وأرجح ذراعيك للخلف.'),
      t('Jump up and land softly on the box with both feet, knees bent.', 'اقفز واهبط بنعومة على الصندوق بكلتا قدميك والركبتان مثنيتان.'),
      t('Stand up fully, then step down; do not jump down.', 'قف تمامًا، ثم انزل خطوة خطوة؛ لا تقفز للأسفل.'),
    ],
    tips: [t('Start with a low box.', 'ابدأ بصندوق منخفض.'), C.land],
  }),
  cossack: (_o, e) => ({
    steps: [
      t(`Stand with your feet very wide${has(e) ? `, holding ${e.en} at your chest` : ''}.`, `قف والقدمان متباعدتان كثيرًا${has(e) ? `، ممسكًا ${e.ar} عند صدرك` : ''}.`),
      t('Shift your weight to one side and bend that knee, sitting your hips down and back.', 'انقل وزنك إلى جهة واحدة واثنِ تلك الركبة، مع إنزال الورك للأسفل وللخلف.'),
      t('Keep the other leg straight with toes pointing up or forward.', 'أبقِ الساق الأخرى مستقيمة والأصابع للأعلى أو للأمام.'),
      t('Push back to the middle and repeat on the other side.', 'ادفع للعودة إلى المنتصف وكرّر على الجهة الأخرى.'),
    ],
    tips: [t('Keep the heel of the bent leg on the floor.', 'أبقِ كعب الساق المثنية على الأرض.'), C.alternate],
  }),
  curtsy: (_o, e) => ({
    steps: [
      t(`Stand tall${has(e) ? ` holding ${e.en}` : ''} with feet hip-width apart.`, `قف مستقيمًا${has(e) ? ` ممسكًا ${e.ar}` : ''} والقدمان بعرض الورك.`),
      t('Step one leg back and across behind the other, like a curtsy.', 'أرجع ساقًا للخلف وعبر الساق الأخرى، كأنك تؤدي التحية.'),
      t('Bend both knees and lower until your front thigh is about parallel to the floor.', 'اثنِ الركبتين وانزل حتى يصبح الفخذ الأمامي موازيًا للأرض تقريبًا.'),
      t('Push through the front heel to return to standing.', 'ادفع بكعب القدم الأمامية للعودة للوقوف.'),
    ],
    tips: [t('Keep your hips and chest facing forward.', 'أبقِ وركيك وصدرك متجهين للأمام.'), C.alternate],
  }),
  lunge: (o, e) => ({
    steps: [
      o.hold === 'back' ? t(`Set ${e.en} on your upper back.`, `ضع ${e.ar} على أعلى ظهرك.`) : has(e) ? t(`Hold ${e.en} at your sides.`, `أمسك ${e.ar} بجانبيك.`) : t('Stand tall with hands on your hips.', 'قف مستقيمًا ويداك على وركيك.'),
      t(o.split ? 'Take a long split stance, one foot forward and the back heel lifted.' : 'Step one foot forward (or back, for a reverse lunge) into a long stride.', o.split ? 'قف بوقفة متباعدة طويلة، قدم للأمام والكعب الخلفي مرفوع.' : 'خذ خطوة طويلة للأمام بقدم واحدة (أو للخلف في الطعن العكسي).'),
      t('Lower straight down until your back knee almost touches the floor and your front thigh is parallel to it.', 'انزل مباشرة للأسفل حتى تكاد ركبتك الخلفية تلمس الأرض ويصبح الفخذ الأمامي موازيًا لها.'),
      t(o.split ? 'Drive up through your front heel and repeat.' : 'Push through your front heel to stand and bring your feet together (or step into the next lunge if walking).', o.split ? 'ادفع بكعب القدم الأمامية للأعلى وكرّر.' : 'ادفع بكعب القدم الأمامية للوقوف وضمّ قدميك (أو تقدّم للطعنة التالية إن كنت تمشي).'),
    ],
    tips: [t('Keep your front knee over your middle toes.', 'أبقِ ركبتك الأمامية فوق منتصف أصابع القدم.'), t('Keep your chest up and your body upright.', 'أبقِ صدرك مرفوعًا وجسمك معتدلًا.'), o.split ? C.sides : C.alternate],
  }),
  bulgarian: (_o, e) => ({
    steps: [
      t(`Stand about two steps in front of a bench${has(e) ? `, holding ${e.en}` : ''}.`, `قف على بُعد خطوتين تقريبًا أمام مقعد${has(e) ? `، ممسكًا ${e.ar}` : ''}.`),
      t('Place the top of your back foot on the bench behind you.', 'ضع ظهر قدمك الخلفية على المقعد خلفك.'),
      t('Lower straight down until your front thigh is about parallel to the floor.', 'انزل مباشرة للأسفل حتى يصبح فخذك الأمامي موازيًا للأرض تقريبًا.'),
      t('Drive up through your front heel.', 'ادفع للأعلى بكعب القدم الأمامية.'),
    ],
    tips: [t('Most of your weight stays on the front leg.', 'معظم وزنك يبقى على الساق الأمامية.'), t('Adjust your distance so your front knee does not shoot far past your toes.', 'اضبط المسافة حتى لا تتجاوز ركبتك الأمامية أصابع قدمك كثيرًا.'), C.sides],
  }),
  stepUp: (o, e) => ({
    steps: [
      t(`Stand facing a sturdy box or bench${o.hold === 'back' ? `, with ${e.en} on your upper back` : has(e) ? `, holding ${e.en} at your sides` : ''}.`, `قف مقابل صندوق أو مقعد ثابت${o.hold === 'back' ? `، و${e.ar} على أعلى ظهرك` : has(e) ? `، ممسكًا ${e.ar} بجانبيك` : ''}.`),
      t('Place one whole foot on the box.', 'ضع قدمًا كاملة على الصندوق.'),
      t('Push through that heel to step up until you stand tall on the box.', 'ادفع بكعب تلك القدم لتصعد حتى تقف مستقيمًا على الصندوق.'),
      t('Step down slowly with the other leg first.', 'انزل ببطء بالساق الأخرى أولًا.'),
    ],
    tips: [t('Do not push off with the back foot; the top leg does the work.', 'لا تدفع بالقدم الخلفية؛ الساق العليا هي التي تعمل.'), C.sides],
  }),
  plyoLunge: () => ({
    steps: [
      t('Start in a lunge, one foot forward.', 'ابدأ بوضعية الطعن، قدم للأمام.'),
      t('Jump straight up explosively.', 'اقفز للأعلى مباشرة بقوة.'),
      t('Switch legs in the air and land softly in a lunge with the other foot forward.', 'بدّل ساقيك في الهواء واهبط بنعومة في وضعية الطعن والقدم الأخرى للأمام.'),
      t('Go straight into the next jump.', 'انتقل مباشرة إلى القفزة التالية.'),
    ],
    tips: [C.land, t('Keep your chest up.', 'أبقِ صدرك مرفوعًا.')],
  }),
  legCurl: (o, e) => ({
    steps: o.seated ? [
      t('Sit in the machine with the back of your lower legs on the roller and the thigh pad snug on your knees.', 'اجلس في الجهاز والجزء الخلفي من ساقيك على الأسطوانة ووسادة الفخذ مثبتة فوق ركبتيك.'),
      t('Curl your legs down and back as far as you can.', 'اثنِ ساقيك للأسفل وللخلف لأقصى حد.'),
      t('Squeeze, then let them come back slowly.', 'اعصر، ثم اتركهما تعودان ببطء.'),
    ] : o.standing ? [
      ...(e.kind === 'cable' ? [t('Attach an ankle strap to a low cable and face the machine.', 'ثبّت حزام كاحل في الكابل السفلي وقف مقابل الجهاز.')] : [t('Stand in the machine with the roller behind your ankle.', 'قف في الجهاز والأسطوانة خلف كاحلك.')]),
      t('Hold on for balance and curl your heel up toward your glutes.', 'استند للتوازن واثنِ ساقك لرفع كعبك نحو مؤخرتك.'),
      t('Lower slowly.', 'انزل ببطء.'),
    ] : [
      t(e.kind === 'band' ? 'Lie face down with the band looped around your ankles and anchored behind you.' : e.kind === 'dumbbell' ? 'Lie face down on a bench and hold a dumbbell between your feet.' : 'Lie face down on the machine with the roller just above your heels.', e.kind === 'band' ? 'استلقِ على بطنك والحبل المطاطي حول كاحليك ومثبت خلفك.' : e.kind === 'dumbbell' ? 'استلقِ على بطنك فوق مقعد وأمسك دمبلًا بين قدميك.' : 'استلقِ على بطنك في الجهاز والأسطوانة فوق كعبيك مباشرة.'),
      t('Curl your heels up toward your glutes as far as you can.', 'اثنِ ساقيك لرفع كعبيك نحو مؤخرتك لأقصى حد.'),
      t('Lower slowly until your legs are almost straight.', 'انزل ببطء حتى تكاد ساقاك تستقيمان.'),
    ],
    tips: [t('Keep your hips pressed down; do not lift them to cheat.', 'أبقِ وركيك مضغوطين للأسفل؛ لا ترفعهما للغش.'), C.slowDown, ...(o.standing ? [C.sides] : [])],
  }),
  sliderCurl: () => ({
    steps: [
      t('Lie on your back with your heels on sliders (or towels on a smooth floor), knees bent.', 'استلقِ على ظهرك وكعباك على أقراص انزلاق (أو مناشف على أرض ملساء)، والركبتان مثنيتان.'),
      t('Lift your hips into a bridge.', 'ارفع وركيك إلى وضعية الجسر.'),
      t('Keeping your hips up, slide your heels out until your legs are almost straight.', 'مع إبقاء الورك مرفوعًا، ازلق كعبيك للأمام حتى تكاد ساقاك تستقيمان.'),
      t('Pull your heels back in under your knees.', 'اسحب كعبيك للعودة تحت ركبتيك.'),
    ],
    tips: [t('Do not let your hips drop as your legs straighten.', 'لا تدع وركيك يهبطان عند فرد ساقيك.')],
  }),
  legExtension: (_o, e) => ({
    steps: [
      e.kind === 'machine' ? t('Sit in the machine with your knees in line with the pivot and the roller on the front of your ankles.', 'اجلس في الجهاز وركبتاك بمحاذاة المحور والأسطوانة على مقدمة كاحليك.') : (grip(e, t('around your ankle', 'حول كاحلك'))[0] ?? t('Sit tall on a bench.', 'اجلس معتدلًا على مقعد.')),
      t('Hold the handles and sit tall.', 'أمسك المقابض واجلس معتدلًا.'),
      t('Straighten your legs until your knees are fully extended.', 'افرد ساقيك حتى تستقيم ركبتاك تمامًا.'),
      t('Squeeze your thighs, then lower slowly.', 'اعصر عضلات الفخذ، ثم انزل ببطء.'),
    ],
    tips: [C.squeeze, C.slowDown],
  }),

  // ===== GLUTES =====
  hipThrust: (o, e) => ({
    steps: [
      e.kind === 'machine' ? t('Sit in the machine with your upper back on the pad and the hip pad across your hips.', 'اجلس في الجهاز وأعلى ظهرك على الوسادة ووسادة الورك فوق وركيك.') : t('Sit on the floor with your upper back against a bench.', 'اجلس على الأرض وأعلى ظهرك مستند إلى مقعد.'),
      ...(has(e) && e.kind !== 'machine' ? [t(`Place ${e.en} across your hips${e.kind === 'barbell' ? ' (use a pad)' : ''}.`, `ضع ${e.ar} فوق وركيك${e.kind === 'barbell' ? ' (استخدم وسادة)' : ''}.`)] : []),
      t('Plant your feet flat, about hip-width apart, so your shins are vertical at the top.', 'ثبّت قدميك على الأرض بعرض الورك تقريبًا، بحيث تصبح ساقاك عموديتين في الأعلى.'),
      t('Tuck your chin and push through your heels to lift your hips until your body is straight from shoulders to knees.', 'اخفض ذقنك قليلًا وادفع بكعبيك لرفع وركيك حتى يصبح جسمك مستقيمًا من الكتفين إلى الركبتين.'),
      t('Squeeze your glutes hard, then lower slowly.', 'اعصر المؤخرة بقوة، ثم انزل ببطء.'),
    ],
    tips: [t('Do not over-arch your lower back at the top; the hips stop when the body is straight.', 'لا تقوّس أسفل ظهرك في الأعلى؛ يتوقف الورك عندما يستقيم الجسم.'), C.squeeze],
  }),
  gluteBridge: (o, e) => ({
    steps: [
      t('Lie on your back with knees bent and feet flat, close to your glutes.', 'استلقِ على ظهرك والركبتان مثنيتان والقدمان على الأرض قريبتان من المؤخرة.'),
      ...(has(e) ? [t(e.kind === 'band' ? 'Loop the band just above your knees.' : `Rest ${e.en} on your hips.`, e.kind === 'band' ? 'ضع الحبل المطاطي فوق ركبتيك مباشرة.' : `ضع ${e.ar} على وركيك.`)] : []),
      ...(o.single ? [t('Lift one leg off the floor.', 'ارفع ساقًا واحدة عن الأرض.')] : []),
      t('Push through your heels and lift your hips until your body is straight from shoulders to knees.', 'ادفع بكعبيك وارفع وركيك حتى يستقيم جسمك من الكتفين إلى الركبتين.'),
      t('Squeeze your glutes for a second, then lower slowly.', 'اعصر المؤخرة ثانية، ثم انزل ببطء.'),
    ],
    tips: [C.squeeze, ...(o.single ? [C.sides] : []), ...(e.kind === 'band' ? [t('Push your knees out against the band.', 'ادفع ركبتيك للخارج ضد الحبل.')] : [])],
  }),
  kickback: (o, e) => ({
    steps: o.standing ? [
      e.kind === 'machine' ? t('Set the machine so the pad sits behind your knee or foot, and hold the handles.', 'اضبط الجهاز لتكون الوسادة خلف ركبتك أو قدمك، وأمسك المقابض.') : t(e.kind === 'band' ? 'Loop the band around your ankle and anchor it in front of you.' : 'Attach an ankle strap to a low cable and face the machine.', e.kind === 'band' ? 'ضع الحبل المطاطي حول كاحلك وثبّته أمامك.' : 'ثبّت حزام كاحل في الكابل السفلي وقف مقابل الجهاز.'),
      t('Lean forward slightly and hold on for balance.', 'امِل للأمام قليلًا واستند للتوازن.'),
      t('Kick your leg straight back, squeezing your glute.', 'ادفع ساقك للخلف مستقيمة، مع عصر المؤخرة.'),
      t('Return slowly without touching the weight down.', 'ارجع ببطء دون إنزال الوزن تمامًا.'),
    ] : [
      t(`Get on your hands and knees${e.kind === 'dumbbell' ? ', with a light dumbbell held behind one knee' : ''}.`, `اتخذ وضعية الركوع على اليدين والركبتين${e.kind === 'dumbbell' ? '، مع دمبل خفيف خلف إحدى الركبتين' : ''}.`),
      t(o.donkey ? 'Keeping the knee bent at 90°, lift one foot up toward the ceiling.' : 'Kick one leg straight back and up until it is in line with your body.', o.donkey ? 'مع إبقاء الركبة مثنية 90 درجة، ارفع قدمًا واحدة نحو السقف.' : 'ادفع ساقًا للخلف وللأعلى حتى تصبح على خط جسمك.'),
      t('Squeeze your glute at the top, then lower slowly.', 'اعصر المؤخرة في الأعلى، ثم انزل ببطء.'),
    ],
    tips: [t('Do not arch your lower back to lift the leg higher.', 'لا تقوّس أسفل ظهرك لرفع الساق أعلى.'), C.sides],
  }),
  hydrant: () => ({
    steps: [
      t('Get on your hands and knees, hands under shoulders, knees under hips.', 'اتخذ وضعية الركوع على اليدين والركبتين، اليدان تحت الكتفين والركبتان تحت الورك.'),
      t('Keeping the knee bent, lift one leg out to the side until your thigh is about level with your hip.', 'مع إبقاء الركبة مثنية، ارفع ساقًا للجانب حتى يصبح الفخذ بمستوى الورك تقريبًا.'),
      t('Lower slowly.', 'انزل ببطء.'),
    ],
    tips: [t('Keep your hips level; do not lean away.', 'أبقِ وركيك متوازيين ولا تمِل للجهة الأخرى.'), C.sides],
  }),
  abduction: (o, e) => ({
    steps: o.seated ? [
      t(`Sit in the machine with the pads on the ${o.in ? 'inside' : 'outside'} of your knees.`, `اجلس في الجهاز والوسائد على الجهة ${o.in ? 'الداخلية' : 'الخارجية'} لركبتيك.`),
      t(o.in ? 'Squeeze your knees together.' : 'Push your knees apart as far as you can.', o.in ? 'اضمم ركبتيك معًا.' : 'افتح ركبتيك لأقصى حد.'),
      t('Return slowly.', 'ارجع ببطء.'),
    ] : [
      t(e.kind === 'band' ? 'Loop the band around both ankles.' : `Attach an ankle strap to a low cable and stand side-on with the ${o.in ? 'near' : 'far'} leg attached.`, e.kind === 'band' ? 'ضع الحبل المطاطي حول الكاحلين.' : `ثبّت حزام كاحل في الكابل السفلي وقف جانبيًا مع ربط الساق ${o.in ? 'القريبة' : 'البعيدة'}.`),
      t('Hold on for balance and stand tall.', 'استند للتوازن وقف مستقيمًا.'),
      t(o.in ? 'Sweep the working leg in across the front of your body.' : 'Lift the working leg out to the side.', o.in ? 'حرّك الساق العاملة للداخل أمام جسمك.' : 'ارفع الساق العاملة للجانب.'),
      t('Return slowly.', 'ارجع ببطء.'),
    ],
    tips: [t('Keep your body upright; do not lean.', 'أبقِ جسمك معتدلًا ولا تمِل.'), ...(o.seated ? [C.squeeze] : [C.sides])],
  }),
  sideLying: (o, e) => ({
    steps: [
      t(`Lie on your side with your head resting on your arm${o.clam ? ' and your knees bent' : ' and legs straight'}.`, `استلقِ على جانبك ورأسك على ذراعك${o.clam ? ' والركبتان مثنيتان' : ' والساقان مستقيمتان'}.`),
      ...(e.kind === 'band' ? [t('Loop the band just above your knees.', 'ضع الحبل المطاطي فوق ركبتيك مباشرة.')] : []),
      t(o.clam ? 'Keep your feet together and open your top knee like a clamshell.' : 'Lift your top leg up, keeping it straight and slightly behind you.', o.clam ? 'أبقِ قدميك معًا وافتح الركبة العليا كالصدفة.' : 'ارفع الساق العليا مستقيمة وخلفك قليلًا.'),
      t('Lower slowly.', 'انزل ببطء.'),
    ],
    tips: [t('Do not roll your hips backward.', 'لا تدوّر وركيك للخلف.'), C.sides],
  }),
  bandWalk: (_o, e) => ({
    steps: [
      t(e.kind === 'cable' ? 'Attach an ankle strap to a low cable beside you.' : 'Loop the band around your legs just above the knees or ankles.', e.kind === 'cable' ? 'ثبّت حزام كاحل في كابل سفلي بجانبك.' : 'ضع الحبل المطاطي حول ساقيك فوق الركبتين أو الكاحلين.'),
      t('Bend your knees slightly into a quarter squat.', 'اثنِ ركبتيك قليلًا في ربع سكوات.'),
      t('Step sideways with one foot, then follow with the other, keeping tension on the band.', 'تحرّك جانبيًا بقدم، ثم اتبعها بالأخرى، مع الإبقاء على شدّ الحبل.'),
      t('Take the set number of steps, then go back the other way.', 'خذ عدد الخطوات المحدد، ثم ارجع في الاتجاه الآخر.'),
    ],
    tips: [t('Do not let your feet come all the way together.', 'لا تجعل قدميك تلتقيان تمامًا.'), t('Stay low the whole time.', 'ابقَ منخفضًا طوال الوقت.')],
  }),
  hipExtension: () => ({
    steps: [
      t('Attach an ankle strap to a low cable and face the machine.', 'ثبّت حزام كاحل في الكابل السفلي وقف مقابل الجهاز.'),
      t('Hold on and lean forward slightly.', 'استند وامِل للأمام قليلًا.'),
      t('Push your straight leg back behind you, squeezing your glute.', 'ادفع ساقك المستقيمة للخلف، مع عصر المؤخرة.'),
      t('Return slowly.', 'ارجع ببطء.'),
    ],
    tips: [t('Do not arch your lower back.', 'لا تقوّس أسفل ظهرك.'), C.sides],
  }),

  // ===== CALVES =====
  calfRaise: (o, e) => ({
    steps: [
      o.seated ? t(e.kind === 'machine' ? 'Sit in the machine with the pad on your lower thighs and the balls of your feet on the step.' : `Sit on a bench with the balls of your feet on a step and ${e.en} resting on your knees.`, e.kind === 'machine' ? 'اجلس في الجهاز والوسادة فوق أسفل فخذيك ومقدمة قدميك على الدرجة.' : `اجلس على مقعد ومقدمة قدميك على درجة و${e.ar} على ركبتيك.`)
        : o.donkey ? t('Bend forward at the hips, hold a support, and put the balls of your feet on a step.', 'انحنِ للأمام من الورك، واستند إلى دعامة، وضع مقدمة قدميك على درجة.')
          : t(`Stand with the balls of your ${o.single ? 'foot' : 'feet'} on a step and your heels hanging off${o.hold === 'back' ? `, with ${e.en} on your upper back` : e.kind === 'machine' ? ', shoulders under the pads' : has(e) ? `, holding ${e.en}` : ''}.`, `قف ومقدمة ${o.single ? 'قدمك' : 'قدميك'} على درجة والكعبان متدليان${o.hold === 'back' ? `، و${e.ar} على أعلى ظهرك` : e.kind === 'machine' ? '، والكتفان تحت الوسائد' : has(e) ? `، ممسكًا ${e.ar}` : ''}.`),
      ...(o.single ? [t('Lift the other foot off the step.', 'ارفع القدم الأخرى عن الدرجة.')] : []),
      t('Lower your heels slowly for a deep stretch.', 'أنزل كعبيك ببطء لتمدد عميق.'),
      t('Push up onto your toes as high as you can.', 'ارتفع على أصابع قدميك لأعلى ما يمكن.'),
      t('Hold the top for a second, then lower slowly.', 'اثبت في الأعلى ثانية، ثم انزل ببطء.'),
    ],
    tips: [t('Do not bounce; slow and full range works best for calves.', 'لا ترتد؛ الحركة البطيئة والمدى الكامل هما الأفضل لعضلة السمانة.'), ...(o.seated ? [] : [t('Keep your knees straight but not locked.', 'أبقِ ركبتيك مستقيمتين دون قفلهما.')]), ...(o.single ? [C.sides] : [])],
  }),
  tibialis: () => ({
    steps: [
      t('Lean your back against a wall with your heels about 30 cm in front of it.', 'اسند ظهرك إلى الجدار وكعباك على بُعد 30 سم تقريبًا أمامه.'),
      t('Keeping your legs straight, lift your toes and the front of your feet as high as you can.', 'مع إبقاء ساقيك مستقيمتين، ارفع أصابعك ومقدمة قدميك لأعلى ما يمكن.'),
      t('Lower them slowly.', 'أنزلها ببطء.'),
    ],
    tips: [t('Move further from the wall to make it harder.', 'ابتعد أكثر عن الجدار لزيادة الصعوبة.')],
  }),
  dorsiflexion: () => ({
    steps: [
      t('Sit with your legs straight and loop the band over the top of one foot, anchored in front of you.', 'اجلس وساقاك ممدودتان، وضع الحبل المطاطي فوق ظهر إحدى قدميك وثبّته أمامك.'),
      t('Pull your toes back toward your shin against the band.', 'اسحب أصابع قدمك للخلف نحو ساقك ضد الحبل.'),
      t('Let them return slowly.', 'اتركها تعود ببطء.'),
    ],
    tips: [C.sides],
  }),
  hop: (o) => ({
    steps: o.rope ? [
      t('Hold the rope handles at hip height with the rope behind your heels.', 'أمسك مقبضي الحبل بمستوى الورك والحبل خلف كعبيك.'),
      t('Turn the rope with small circles of your wrists, not your whole arms.', 'دوّر الحبل بدوائر صغيرة من معصميك، لا بذراعيك كاملتين.'),
      t('Jump just high enough for the rope to pass, landing softly on the balls of your feet.', 'اقفز بالارتفاع الكافي لمرور الحبل فقط، واهبط بنعومة على مقدمة قدميك.'),
      t('Keep a steady rhythm.', 'حافظ على إيقاع ثابت.'),
    ] : [
      t('Stand tall and bounce lightly on the balls of your feet.', 'قف مستقيمًا واقفز بخفة على مقدمة قدميك.'),
      t('Keep the jumps small and quick.', 'اجعل القفزات صغيرة وسريعة.'),
    ],
    tips: [t('Keep your elbows close to your sides.', 'أبقِ مرفقيك قريبين من جانبيك.'), C.land],
  }),

  // ===== CORE =====
  crunch: (o, e) => ({
    steps: [
      t('Lie on your back with knees bent and feet flat on the floor.', 'استلقِ على ظهرك والركبتان مثنيتان والقدمان على الأرض.'),
      t(has(e) ? `Hold ${e.en} against your chest.` : 'Place your fingertips lightly behind your ears, or cross your arms on your chest.', has(e) ? `أمسك ${e.ar} على صدرك.` : 'ضع أطراف أصابعك بخفة خلف أذنيك، أو ضع ذراعيك متقاطعتين على صدرك.'),
      t(o.sit ? 'Curl your upper body all the way up until you are sitting upright.' : 'Curl your shoulders off the floor by squeezing your stomach, lower back stays down.', o.sit ? 'ارفع جذعك بالكامل حتى تصبح جالسًا معتدلًا.' : 'ارفع كتفيك عن الأرض بعصر بطنك، وأسفل ظهرك يبقى على الأرض.'),
      t('Lower back down slowly.', 'انزل ببطء.'),
    ],
    tips: [t('Do not pull on your head or neck.', 'لا تسحب رأسك أو رقبتك.'), t('Breathe out as you curl up.', 'أخرج النفس أثناء الصعود.')],
  }),
  benchSitUp: (o) => ({
    steps: [
      t(o.roman ? 'Sit on the Roman chair with your feet locked in and your hips on the pad.' : 'Lie on a decline bench with your feet hooked under the rollers.', o.roman ? 'اجلس على الكرسي الروماني وقدماك مثبتتان ووركاك على الوسادة.' : 'استلقِ على مقعد منحدر وقدماك مثبتتان تحت الأسطوانات.'),
      t('Cross your arms on your chest.', 'ضع ذراعيك متقاطعتين على صدرك.'),
      t('Lower your upper body back under control.', 'أنزل جذعك للخلف بتحكّم.'),
      t('Curl back up until you are sitting upright.', 'ارجع للأعلى حتى تجلس معتدلًا.'),
    ],
    tips: [t('Move smoothly; do not throw yourself up.', 'تحرّك بسلاسة ولا تقذف جسمك للأعلى.')],
  }),
  reverseCrunch: () => ({
    steps: [
      t('Lie on your back with your hands by your sides and your knees bent up over your hips.', 'استلقِ على ظهرك ويداك بجانبيك وركبتاك مرفوعتان فوق وركيك.'),
      t('Squeeze your stomach to curl your hips off the floor, bringing your knees toward your chest.', 'اعصر بطنك لرفع وركيك عن الأرض، مقرّبًا ركبتيك نحو صدرك.'),
      t('Lower your hips back down slowly.', 'أنزل وركيك ببطء.'),
    ],
    tips: [C.noSwing],
  }),
  legRaise: (o) => ({
    steps: o.hang ? [
      t(o.chair ? 'Rest your forearms on the pads of the captain\'s chair and your back against the backrest.' : 'Hang from a pull-up bar with straight arms.', o.chair ? 'اسند ساعديك على وسائد كرسي القبطان وظهرك على المسند.' : 'تعلّق ببار العقلة بذراعين مستقيمتين.'),
      t(o.knees ? 'Bring your knees up toward your chest.' : o.toes ? 'Lift your straight legs all the way up until your toes touch the bar.' : 'Raise your straight legs until they are level with your hips.', o.knees ? 'ارفع ركبتيك نحو صدرك.' : o.toes ? 'ارفع ساقيك المستقيمتين حتى تلمس أصابعك البار.' : 'ارفع ساقيك المستقيمتين حتى تصبحا بمستوى الورك.'),
      t('Lower slowly without swinging.', 'انزل ببطء دون أرجحة.'),
    ] : o.kicks ? [
      t('Lie on your back with your legs straight and hands under your hips.', 'استلقِ على ظهرك والساقان مستقيمتان واليدان تحت وركيك.'),
      t('Lift your feet a little off the floor and press your lower back down.', 'ارفع قدميك عن الأرض قليلًا واضغط أسفل ظهرك للأسفل.'),
      t('Kick your legs up and down (or cross them) in small, quick movements.', 'حرّك ساقيك للأعلى وللأسفل (أو قاطعهما) بحركات صغيرة وسريعة.'),
    ] : [
      t('Lie on your back with your legs straight and hands under your hips.', 'استلقِ على ظهرك والساقان مستقيمتان واليدان تحت وركيك.'),
      t('Raise your straight legs until they point at the ceiling.', 'ارفع ساقيك المستقيمتين حتى تتجها نحو السقف.'),
      t('Lower them slowly until they hover just above the floor.', 'أنزلهما ببطء حتى تقتربا من الأرض دون لمسها.'),
    ],
    tips: [t('Keep your lower back pressed down (or still, when hanging).', 'أبقِ أسفل ظهرك مضغوطًا للأسفل (أو ثابتًا عند التعلّق).'), C.noSwing],
  }),
  vUp: () => ({
    steps: [
      t('Lie flat on your back with arms stretched overhead and legs straight.', 'استلقِ على ظهرك والذراعان ممدودتان فوق رأسك والساقان مستقيمتان.'),
      t('Lift your arms and legs at the same time to meet above your hips, making a V.', 'ارفع ذراعيك وساقيك في الوقت نفسه لتلتقي فوق وركيك على شكل حرف V.'),
      t('Lower back down slowly.', 'انزل ببطء.'),
    ],
    tips: [t('Bend your knees slightly if your back lifts too much.', 'اثنِ ركبتيك قليلًا إن ارتفع ظهرك كثيرًا.')],
  }),
  hollow: () => ({
    steps: [
      t('Lie on your back and press your lower back into the floor.', 'استلقِ على ظهرك واضغط أسفل ظهرك على الأرض.'),
      t('Lift your shoulders, arms and straight legs a little off the floor so your body forms a shallow banana shape.', 'ارفع كتفيك وذراعيك وساقيك المستقيمتين عن الأرض قليلًا ليأخذ جسمك شكل الموزة.'),
      t('Hold for the set time.', 'اثبت للمدة المحددة.'),
    ],
    tips: [t('If your back lifts, bend your knees or raise your legs higher.', 'إن ارتفع ظهرك، اثنِ ركبتيك أو ارفع ساقيك أعلى.'), C.hold],
  }),
  plank: () => ({
    steps: [
      t('Rest on your forearms with elbows under your shoulders.', 'استند إلى ساعديك والمرفقان تحت كتفيك.'),
      t('Step your feet back so your body is straight from heels to head.', 'أرجع قدميك ليصبح جسمك مستقيمًا من الكعبين إلى الرأس.'),
      t('Squeeze your glutes and stomach and hold.', 'اعصر المؤخرة والبطن واثبت.'),
    ],
    tips: [t('Do not let your hips sag or lift high.', 'لا تدع وركيك يهبطان أو يرتفعان.'), C.hold],
  }),
  sidePlank: () => ({
    steps: [
      t('Lie on your side, propped on one forearm with the elbow under your shoulder.', 'استلقِ على جانبك مستندًا إلى ساعد واحد والمرفق تحت الكتف.'),
      t('Stack your feet and lift your hips until your body is straight.', 'ضع قدميك فوق بعضهما وارفع وركيك حتى يستقيم جسمك.'),
      t('Hold, then switch sides.', 'اثبت، ثم بدّل الجهة.'),
    ],
    tips: [t('Bend your knees to make it easier.', 'اثنِ ركبتيك لتسهيله.'), C.hold],
  }),
  mountainClimber: () => ({
    steps: [
      t('Start in a high plank with hands under your shoulders.', 'ابدأ بوضعية البلانك العالي واليدان تحت الكتفين.'),
      t('Drive one knee toward your chest.', 'اسحب ركبة نحو صدرك.'),
      t('Switch legs quickly, like running in place.', 'بدّل الساقين بسرعة كأنك تركض في مكانك.'),
    ],
    tips: [t('Keep your hips low and your shoulders over your hands.', 'أبقِ وركيك منخفضين وكتفيك فوق يديك.'), C.steadyPace],
  }),
  deadBug: (_o, e) => ({
    steps: [
      t(`Lie on your back with your arms pointing at the ceiling${e.kind === 'band' ? ' holding the band anchored behind you' : ''} and your knees bent at 90° above your hips.`, `استلقِ على ظهرك وذراعاك نحو السقف${e.kind === 'band' ? ' ممسكًا الحبل المثبت خلفك' : ''} وركبتاك مثنيتان 90 درجة فوق وركيك.`),
      t('Press your lower back into the floor.', 'اضغط أسفل ظهرك على الأرض.'),
      t('Slowly lower one arm behind your head and the opposite leg toward the floor.', 'أنزل ببطء ذراعًا خلف رأسك والساق المعاكسة نحو الأرض.'),
      t('Bring them back and repeat on the other side.', 'أعدهما وكرّر على الجهة الأخرى.'),
    ],
    tips: [t('Your lower back must stay on the floor the whole time.', 'يجب أن يبقى أسفل ظهرك على الأرض طوال الوقت.'), C.alternate],
  }),
  birdDog: () => ({
    steps: [
      t('Get on your hands and knees with a flat back.', 'اتخذ وضعية الركوع على اليدين والركبتين وظهرك مستقيم.'),
      t('Reach one arm forward and the opposite leg back until both are level with your body.', 'مدّ ذراعًا للأمام والساق المعاكسة للخلف حتى تصبحا بمستوى جسمك.'),
      t('Hold for 2 seconds, then return and switch sides.', 'اثبت ثانيتين، ثم ارجع وبدّل الجهة.'),
    ],
    tips: [t('Keep your hips level, as if balancing a glass on your back.', 'أبقِ وركيك متوازيين، كأنك توازن كوبًا على ظهرك.'), C.alternate],
  }),
  rollout: (o, e) => ({
    steps: [
      t(`Kneel on a mat and hold ${o.ball ? 'your forearms on a stability ball' : e.kind === 'barbell' ? 'a loaded barbell' : 'the ab wheel'} in front of your knees.`, `اركع على حصيرة وضع ${o.ball ? 'ساعديك على كرة التوازن' : e.kind === 'barbell' ? 'يديك على بار محمّل' : 'يديك على عجلة البطن'} أمام ركبتيك.`),
      t('Brace your stomach and squeeze your glutes.', 'شدّ بطنك واعصر المؤخرة.'),
      t('Roll forward slowly, letting your arms reach out in front of you, as far as you can keep your back flat.', 'تدحرج للأمام ببطء ودع ذراعيك تمتدان أمامك، بالقدر الذي تحافظ فيه على استقامة ظهرك.'),
      t('Pull back in using your stomach.', 'ارجع للخلف باستخدام عضلات بطنك.'),
    ],
    tips: [t('Stop before your lower back sags.', 'توقّف قبل أن يهبط أسفل ظهرك.'), C.startLight],
  }),
  plankUpDown: () => ({
    steps: [
      t('Start in a forearm plank.', 'ابدأ بوضعية البلانك على الساعدين.'),
      t('Place one hand on the floor, then the other, pushing up into a high plank.', 'ضع يدًا على الأرض، ثم الأخرى، وادفع إلى البلانك العالي.'),
      t('Lower back down to your forearms one arm at a time.', 'انزل إلى ساعديك ذراعًا تلو الأخرى.'),
      t('Switch the leading arm each rep.', 'بدّل الذراع القائدة في كل تكرار.'),
    ],
    tips: [t('Keep your hips still; avoid rocking side to side.', 'أبقِ وركيك ثابتين وتجنّب التمايل.')],
  }),
  shoulderTap: (_o, e) => ({
    steps: [
      t('Start in a high plank, feet a little wider than hips.', 'ابدأ بوضعية البلانك العالي والقدمان أعرض قليلًا من الورك.'),
      t(e.kind === 'dumbbell' ? 'Reach under your body with one hand and drag the dumbbell to the other side.' : 'Lift one hand and tap the opposite shoulder.', e.kind === 'dumbbell' ? 'مدّ يدًا تحت جسمك واسحب الدمبل إلى الجهة الأخرى.' : 'ارفع يدًا والمس الكتف المقابل.'),
      t('Put it down and switch hands.', 'أنزلها وبدّل اليد.'),
    ],
    tips: [t('Keep your hips still.', 'أبقِ وركيك ثابتين.'), C.alternate],
  }),
  twist: (o, e) => ({
    steps: o.landmine ? [
      t('Hold the end of a landmine bar with both hands at arm\'s length in front of your chest.', 'أمسك طرف بار اللاندماين بكلتا يديك أمام صدرك والذراعان ممدودتان.'),
      t('Stand with feet shoulder-width and knees soft.', 'قف والقدمان بعرض الكتفين والركبتان مرنتان.'),
      t('Rotate the bar down to one hip, turning your shoulders, then swing it over to the other hip.', 'دوّر البار للأسفل نحو أحد الوركين بلفّ كتفيك، ثم انقله إلى الورك الآخر.'),
    ] : [
      t(`Sit on the floor with knees bent and lean back a little${has(e) ? `, holding ${e.en} at your chest` : ''}.`, `اجلس على الأرض والركبتان مثنيتان وامِل للخلف قليلًا${has(e) ? `، ممسكًا ${e.ar} عند صدرك` : ''}.`),
      t('Lift your feet off the floor if you can.', 'ارفع قدميك عن الأرض إن استطعت.'),
      t('Rotate your shoulders to one side, then the other.', 'دوّر كتفيك إلى جهة، ثم إلى الأخرى.'),
    ],
    tips: [t('Turn from your torso, not just your arms.', 'الدوران من الجذع لا من الذراعين فقط.'), C.neutralBack],
  }),
  bicycle: () => ({
    steps: [
      t('Lie on your back with fingertips behind your ears and knees up.', 'استلقِ على ظهرك وأطراف أصابعك خلف أذنيك والركبتان مرفوعتان.'),
      t('Bring one knee in while turning the opposite elbow toward it, straightening the other leg.', 'قرّب ركبة بينما تدير المرفق المعاكس نحوها، وافرد الساق الأخرى.'),
      t('Switch sides in a smooth pedalling motion.', 'بدّل الجهة بحركة دوّاسة سلسة.'),
    ],
    tips: [t('Go slowly; rushing turns it into neck pulling.', 'تحرّك ببطء؛ السرعة تحوّلها إلى سحب للرقبة.')],
  }),
  lSit: () => ({
    steps: [
      t('Sit on the floor (or between parallettes) with your hands beside your hips.', 'اجلس على الأرض (أو بين قضيبين صغيرين) ويداك بجانب وركيك.'),
      t('Press down through straight arms to lift your hips off the floor.', 'ادفع للأسفل بذراعين مستقيمتين لرفع وركيك عن الأرض.'),
      t('Hold your legs straight out in front of you.', 'أبقِ ساقيك ممدودتين أمامك.'),
    ],
    tips: [t('Bend your knees (tuck) to make it easier.', 'اثنِ ركبتيك لتسهيله.'), C.hold],
  }),
  dragonFlag: () => ({
    steps: [
      t('Lie on a bench and grip it behind your head.', 'استلقِ على مقعد وأمسكه خلف رأسك.'),
      t('Lift your whole body up so only your upper back stays on the bench, body straight.', 'ارفع جسمك كاملًا بحيث يبقى أعلى ظهرك فقط على المقعد، والجسم مستقيم.'),
      t('Lower your straight body slowly toward the bench.', 'أنزل جسمك المستقيم ببطء نحو المقعد.'),
    ],
    tips: [t('Advanced: master leg raises first.', 'تمرين متقدم: أتقن رفع الساقين أولًا.'), t('Bend your knees to make it easier.', 'اثنِ ركبتيك لتسهيله.')],
  }),
  wiper: () => ({
    steps: [
      t('Lie on your back with arms out to the sides and legs pointing straight up.', 'استلقِ على ظهرك والذراعان ممدودتان للجانبين والساقان للأعلى.'),
      t('Lower your legs together to one side, as far as you can control.', 'أنزل ساقيك معًا إلى جهة، بالقدر الذي تتحكم به.'),
      t('Bring them back up and over to the other side.', 'أعدهما للأعلى ثم إلى الجهة الأخرى.'),
    ],
    tips: [t('Keep both shoulders on the floor.', 'أبقِ كتفيك على الأرض.'), t('Bend your knees to make it easier.', 'اثنِ ركبتيك لتسهيله.')],
  }),
  cableCrunch: (_o, e) => ({
    steps: [
      t(e.kind === 'band' ? 'Anchor the band high and kneel facing it, holding the ends beside your head.' : 'Attach a rope to the high pulley, kneel facing it and hold the rope beside your head.', e.kind === 'band' ? 'ثبّت الحبل المطاطي عاليًا واركع مقابلًا له، ممسكًا طرفيه بجانب رأسك.' : 'ثبّت حبلًا في البكرة العليا، واركع مقابلًا لها وأمسك الحبل بجانب رأسك.'),
      t('Curl your chest down toward your knees by squeezing your stomach.', 'اثنِ صدرك للأسفل نحو ركبتيك بعصر بطنك.'),
      t('Return slowly to upright.', 'ارجع ببطء إلى الوضع المعتدل.'),
    ],
    tips: [t('Your hips stay still; do not sit back to move the weight.', 'الورك ثابت؛ لا تجلس للخلف لتحريك الوزن.')],
  }),
  machineCrunch: () => ({
    steps: [
      t('Sit in the machine and hold the handles or rest your arms on the pads.', 'اجلس في الجهاز وأمسك المقابض أو اسند ذراعيك على الوسائد.'),
      t('Curl your chest down toward your hips.', 'اثنِ صدرك للأسفل نحو وركيك.'),
      t('Return slowly.', 'ارجع ببطء.'),
    ],
    tips: [C.slowDown],
  }),
  rotary: () => ({
    steps: [
      t('Sit in the machine with your chest against the pad and lock your legs in.', 'اجلس في الجهاز وصدرك على الوسادة وثبّت ساقيك.'),
      t('Rotate your upper body to one side under control.', 'دوّر جذعك إلى جهة بتحكّم.'),
      t('Return to the middle slowly, then change the setting for the other side.', 'ارجع ببطء إلى المنتصف، ثم غيّر الضبط للجهة الأخرى.'),
    ],
    tips: [C.startLight, C.sides],
  }),
  sideBend: (_o, e) => ({
    steps: [
      t(`Stand tall holding ${e.en} in one hand at your side.`, `قف مستقيمًا ممسكًا ${e.ar} بيد واحدة بجانبك.`),
      t('Bend sideways toward the weight, sliding it down your leg.', 'انحنِ جانبيًا نحو الوزن، مع إنزاله على ساقك.'),
      t('Use the opposite side of your waist to pull yourself back upright.', 'استخدم الجهة المقابلة من خصرك لسحب جسمك إلى الوضع المعتدل.'),
    ],
    tips: [t('Bend only sideways; do not lean forward or back.', 'انحنِ جانبيًا فقط ولا تمِل للأمام أو للخلف.'), C.sides],
  }),
  woodchop: (_o, e) => ({
    steps: [
      ...(e.kind === 'cable' ? [t('Set the cable high, stand side-on and hold the handle with both hands.', 'اضبط الكابل عاليًا، وقف جانبيًا وأمسك المقبض بكلتا يديك.')] : grip(e, t('high to one side', 'عاليًا على جهة واحدة'))),
      t('Start with your hands high on one side.', 'ابدأ ويداك عاليتان على جهة.'),
      t('Pull diagonally down across your body to the opposite hip, turning your shoulders and pivoting your back foot.', 'اسحب قطريًا للأسفل عبر جسمك نحو الورك المقابل، مع لفّ كتفيك وتدوير القدم الخلفية.'),
      t('Return slowly to the start.', 'ارجع ببطء إلى البداية.'),
    ],
    tips: [t('Keep your arms nearly straight; the turn comes from your trunk.', 'أبقِ ذراعيك شبه مستقيمتين؛ الدوران يأتي من الجذع.'), C.sides],
  }),
  pallof: (_o, e) => ({
    steps: [
      t(`Set the ${e.kind === 'band' ? 'band' : 'cable'} at chest height and stand side-on to it, holding the handle at your chest.`, `اضبط ${e.kind === 'band' ? 'الحبل المطاطي' : 'الكابل'} بمستوى الصدر وقف جانبيًا له، ممسكًا المقبض عند صدرك.`),
      t('Step away until you feel it pulling you sideways.', 'ابتعد حتى تشعر بأنه يسحبك جانبيًا.'),
      t('Press your hands straight out in front of your chest and hold for 2 seconds.', 'ادفع يديك مباشرة أمام صدرك واثبت ثانيتين.'),
      t('Bring them back to your chest without letting your body twist.', 'أعدهما إلى صدرك دون أن يلتف جسمك.'),
    ],
    tips: [t('The goal is to resist the turn, not to move.', 'الهدف مقاومة الدوران لا الحركة.'), C.sides],
  }),
  getUp: (_o, e) => ({
    steps: [
      t(`Lie on your back holding ${has(e) ? e.en : 'your fist'} straight up in one hand, same-side knee bent.`, `استلقِ على ظهرك ممسكًا ${has(e) ? e.ar : 'قبضتك'} للأعلى بيد واحدة، والركبة من نفس الجهة مثنية.`),
      t('Roll onto the opposite elbow, then push up onto that hand.', 'تدحرج على المرفق المقابل، ثم ادفع لتستند إلى تلك اليد.'),
      t('Lift your hips and sweep your straight leg back under you to kneel.', 'ارفع وركيك ومرّر الساق المستقيمة للخلف تحتك لتركع.'),
      t('Stand up from the kneel, keeping the weight overhead the whole time.', 'قف من وضعية الركوع مع إبقاء الوزن فوق رأسك طوال الوقت.'),
      t('Reverse every step to lie back down.', 'اعكس كل خطوة للعودة إلى الاستلقاء.'),
    ],
    tips: [t('Keep your eyes on the weight and your arm locked.', 'أبقِ نظرك على الوزن وذراعك مفرودة.'), t('Learn it with no weight (or a shoe balanced on your fist) first.', 'تعلّمه أولًا دون وزن (أو بحذاء متوازن على قبضتك).'), C.sides],
  }),
  stabilityCrunch: () => ({
    steps: [
      t('Sit on a stability ball and walk your feet out until the ball supports your lower back.', 'اجلس على كرة التوازن وتقدّم بقدميك حتى تسند الكرة أسفل ظهرك.'),
      t('Let your upper back curve back over the ball.', 'اترك أعلى ظهرك ينحني للخلف فوق الكرة.'),
      t('Curl your chest up by squeezing your stomach.', 'ارفع صدرك بعصر بطنك.'),
      t('Lower back over the ball slowly.', 'انزل للخلف فوق الكرة ببطء.'),
    ],
    tips: [t('Keep your feet wide for balance.', 'باعد بين قدميك للتوازن.')],
  }),
};
