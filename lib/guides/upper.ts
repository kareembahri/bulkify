/** Guides: chest, back, shoulders, arms, grip. */
import { C, grip, has, t, type G } from './text';

export const UPPER: Record<string, G> = {
  // ===== CHEST =====
  benchPress: (o, e) => {
    const bench = o.angle > 0 ? t('an incline bench (about 30°)', 'مقعد مائل (حوالي 30 درجة)') : o.angle < 0 ? t('a decline bench, with your legs hooked under the pads', 'مقعد منحدر، مع تثبيت ساقيك تحت الوسائد') : t('a flat bench', 'مقعد مستوٍ');
    const db = e.kind === 'dumbbell';
    return {
      steps: [
        t(`Lie on ${bench[0]} with your eyes under where the ${db ? 'dumbbells' : 'bar'} will be and your feet flat on the floor.`, `استلقِ على ${bench[1]} بحيث تكون عيناك تحت مكان ${db ? 'الدمبلز' : 'البار'} وقدماك ثابتتان على الأرض.`),
        t('Pull your shoulder blades back and down into the bench and keep a small natural arch in your lower back.', 'اسحب لوحي كتفيك للخلف وللأسفل باتجاه المقعد، وحافظ على تقوّس طبيعي خفيف في أسفل ظهرك.'),
        ...(db ? [t('Sit with the dumbbells on your thighs, lie back and bring them up over your chest with straight arms.', 'اجلس والدمبلز على فخذيك، ثم استلقِ وارفعها فوق صدرك بذراعين مستقيمتين.')]
          : [t(`Grip ${e.en} ${o.close ? 'about shoulder-width apart' : 'a little wider than your shoulders'}, unrack it and hold it straight over your shoulders.`, `أمسك ${e.ar} ${o.close ? 'بعرض الكتفين تقريبًا' : 'أعرض قليلًا من كتفيك'}، وارفعه عن الحامل وثبّته فوق كتفيك مباشرة.`)]),
        t(`Lower ${db ? 'the dumbbells' : 'the bar'} slowly to your ${o.angle > 0 ? 'upper' : o.angle < 0 ? 'lower' : 'mid'} chest, elbows about 45° from your body, forearms vertical.`, `أنزل ${db ? 'الدمبلز' : 'البار'} ببطء إلى ${o.angle > 0 ? 'أعلى' : o.angle < 0 ? 'أسفل' : 'منتصف'} صدرك، والمرفقان بزاوية 45 درجة تقريبًا عن جسمك والساعدان عموديان.`),
        t('Touch lightly, then press back up until your arms are straight without locking hard.', 'المس صدرك بخفة، ثم ادفع للأعلى حتى تستقيم ذراعاك دون قفل المرفقين بقوة.'),
      ],
      tips: [t('Keep your hips and shoulder blades on the bench the whole time.', 'أبقِ وركيك ولوحي كتفيك على المقعد طوال الوقت.'), t('Do not bounce the weight off your chest.', 'لا ترتد بالوزن عن صدرك.'), C.breathePush,
        ...(e.kind === 'barbell' ? [t('Use a spotter or safety arms when you go heavy.', 'استعن بمساعد أو بأذرع الأمان عند استخدام وزن ثقيل.')] : [])],
    };
  },
  floorPress: (_o, e) => ({
    steps: [
      t('Lie on your back on the floor with knees bent and feet flat.', 'استلقِ على ظهرك على الأرض مع ثني الركبتين والقدمين ثابتتين.'),
      t(`Hold ${e.en} straight above your chest with straight arms.`, `أمسك ${e.ar} فوق صدرك مباشرة بذراعين مستقيمتين.`),
      t('Lower slowly until the backs of your upper arms touch the floor, elbows about 45° from your sides.', 'انزل ببطء حتى يلمس الجزء الخلفي من أعلى ذراعيك الأرض، والمرفقان بزاوية 45 درجة عن جانبيك.'),
      t('Pause for a moment, then press back up to straight arms.', 'توقّف لحظة، ثم ادفع للأعلى حتى تستقيم ذراعاك.'),
    ],
    tips: [t('Let your arms rest on the floor; do not bounce off it.', 'اترك ذراعيك تستقران على الأرض ولا ترتد عنها.'), C.breathePush],
  }),
  pullover: (_o, e) => ({
    steps: [
      t('Lie on a bench and plant your feet on the floor.', 'استلقِ على مقعد وثبّت قدميك على الأرض.'),
      t(`Hold ${e.kind === 'dumbbell' ? 'one dumbbell with both hands under the top plate' : e.en} above your chest with a slight bend in your elbows.`, `أمسك ${e.kind === 'dumbbell' ? 'دمبل واحدًا بكلتا يديك من تحت القرص العلوي' : e.ar} فوق صدرك مع ثني بسيط في المرفقين.`),
      t('Keeping that elbow bend fixed, lower the weight back over your head until you feel a stretch in your chest and lats.', 'مع إبقاء ثني المرفقين ثابتًا، أنزل الوزن للخلف فوق رأسك حتى تشعر بتمدد في صدرك وظهرك.'),
      t('Pull it back over your chest along the same arc.', 'أعِده فوق صدرك عبر نفس القوس.'),
    ],
    tips: [t('Only go as far back as your shoulders feel comfortable.', 'انزل للخلف فقط بالقدر المريح لكتفيك.'), t('Keep your ribs down; do not arch your lower back to get more range.', 'أبقِ أضلاعك للأسفل ولا تقوّس أسفل ظهرك لزيادة المدى.'), C.breathePull],
  }),
  flyTop: (o, e) => ({
    steps: [
      t(`Lie on ${o.angle > 0 ? 'an incline' : 'a flat'} bench with ${e.en} pressed above your chest, palms facing each other.`, `استلقِ على مقعد ${o.angle > 0 ? 'مائل' : 'مستوٍ'} مع رفع ${e.ar} فوق صدرك والكفّان متقابلان.`),
      t('Bend your elbows slightly and keep that bend the same for the whole rep.', 'اثنِ مرفقيك قليلًا وحافظ على هذا الثني ثابتًا طوال التكرار.'),
      t('Open your arms out to the sides in a wide arc until you feel a stretch across your chest.', 'افتح ذراعيك للجانبين بقوس واسع حتى تشعر بتمدد في صدرك.'),
      t('Bring them back together over your chest like hugging a big tree.', 'أعدهما فوق صدرك كأنك تعانق شجرة كبيرة.'),
    ],
    tips: [t('Stop the stretch at chest level; going lower strains the shoulders.', 'أوقف التمدد عند مستوى الصدر؛ النزول أكثر يجهد الكتفين.'), t('Use lighter weights than you press.', 'استخدم وزنًا أخف مما تدفعه في الضغط.'), C.breathePull],
  }),
  flyFront: (o, e) => ({
    steps: o.deck ? [
      t('Sit with your back flat against the pad and adjust the seat so the handles are at chest height.', 'اجلس وظهرك ملتصق بالوسادة، واضبط المقعد ليكون المقبضان بمستوى الصدر.'),
      t('Hold the handles (or place your forearms on the pads) with a slight bend in your elbows.', 'أمسك المقبضين (أو ضع ساعديك على الوسادتين) مع ثني بسيط في المرفقين.'),
      t('Squeeze your arms together in front of your chest.', 'اضمم ذراعيك معًا أمام صدرك.'),
      t('Let them open slowly back until you feel a stretch, without going behind your body.', 'افتحهما ببطء حتى تشعر بالتمدد دون أن تتجاوزا خط جسمك.'),
    ] : [
      ...grip(e, o.low ? t('to the lowest position on both sides', 'في أدنى وضعية على الجانبين') : o.high ? t('to the highest position on both sides', 'في أعلى وضعية على الجانبين') : t('to shoulder height on both sides', 'بمستوى الكتف على الجانبين')),
      t('Step forward into a staggered stance, lean slightly forward, arms out to the sides with a soft bend in the elbows.', 'تقدّم خطوة بوقفة متباعدة، وامِل للأمام قليلًا، وذراعاك للجانبين مع ثني خفيف في المرفقين.'),
      t(o.low ? 'Sweep your hands up and together in front of your upper chest.' : o.high ? 'Sweep your hands down and together in front of your hips.' : 'Bring your hands together in front of your chest in a wide hugging arc.', o.low ? 'اسحب يديك للأعلى لتلتقيا أمام أعلى صدرك.' : o.high ? 'اسحب يديك للأسفل لتلتقيا أمام وركيك.' : 'اجمع يديك أمام صدرك بقوس واسع كأنك تعانق.'),
      t('Return slowly until your arms are back out wide and you feel a chest stretch.', 'ارجع ببطء حتى تعود ذراعاك للجانبين وتشعر بتمدد في الصدر.'),
    ],
    tips: [t('Keep the elbow bend fixed; this is a hug, not a press.', 'حافظ على ثني المرفقين ثابتًا؛ هذه حركة عناق لا ضغط.'), C.squeeze, C.breathePull],
  }),
  seatedPress: (o) => ({
    steps: [
      t('Adjust the seat so the handles line up with your mid chest, then sit with your back against the pad.', 'اضبط المقعد ليكون المقبضان بمحاذاة منتصف صدرك، واجلس وظهرك على الوسادة.'),
      t('Grip the handles, keep your shoulder blades back and your feet flat.', 'أمسك المقبضين، وأبقِ لوحي كتفيك للخلف وقدميك ثابتتين.'),
      t(`Press the handles ${o.dir === 'up' ? 'forward and upward' : o.dir === 'down' ? 'forward and slightly down' : 'straight forward'} until your arms are almost straight.`, `ادفع المقبضين ${o.dir === 'up' ? 'للأمام وللأعلى' : o.dir === 'down' ? 'للأمام وللأسفل قليلًا' : 'للأمام مباشرة'} حتى تكاد ذراعاك تستقيمان.`),
      t('Bring them back slowly until your hands are beside your chest.', 'أعدهما ببطء حتى تصبح يداك بجانب صدرك.'),
    ],
    tips: [t('Do not let your shoulders roll forward at the end of the press.', 'لا تدع كتفيك تندفعان للأمام في نهاية الدفع.'), C.slowDown, C.breathePush],
  }),
  standingPress: (_o, e) => ({
    steps: [
      ...grip(e, t('at chest height behind you', 'بمستوى الصدر خلفك')),
      t('Face away from the anchor and stand in a split stance, one foot in front.', 'أعطِ ظهرك لنقطة التثبيت وقف بوقفة متباعدة، قدم أمام الأخرى.'),
      t('Start with your hands beside your chest and elbows behind you.', 'ابدأ ويداك بجانب صدرك والمرفقان للخلف.'),
      t('Press your hands forward until your arms are straight in front of your chest.', 'ادفع يديك للأمام حتى تستقيم ذراعاك أمام صدرك.'),
      t('Return slowly under control.', 'ارجع ببطء وتحكّم.'),
    ],
    tips: [C.brace, t('Do not let the cable pull you backward; stay tall.', 'لا تدع الكابل يسحبك للخلف؛ ابقَ مستقيمًا.'), C.breathePush],
  }),
  pushUp: (o, e) => ({
    steps: [
      o.knees ? t('Kneel on the floor and walk your hands forward until your body is in a straight line from knees to head.', 'اركع على الأرض وتقدّم بيديك حتى يصبح جسمك خطًا مستقيمًا من الركبتين إلى الرأس.')
        : o.incline ? t('Place your hands on a bench or box and walk your feet back until your body is straight.', 'ضع يديك على مقعد أو صندوق وارجع بقدميك حتى يستقيم جسمك.')
          : o.decline ? t('Put your feet on a bench and your hands on the floor, body straight from heels to head.', 'ضع قدميك على مقعد ويديك على الأرض، وجسمك مستقيم من الكعبين إلى الرأس.')
            : t('Start in a high plank: hands under your shoulders, body straight from heels to head.', 'ابدأ بوضعية البلانك العالي: اليدان تحت الكتفين والجسم مستقيم من الكعبين إلى الرأس.'),
      ...(e.kind === 'band' ? [t('Loop the band across your upper back and hold one end under each hand.', 'مرّر الحبل المطاطي على أعلى ظهرك وأمسك طرفيه تحت كل يد.')] : []),
      t('Squeeze your glutes and stomach so your hips do not sag or lift.', 'شدّ عضلات المؤخرة والبطن حتى لا يهبط الورك أو يرتفع.'),
      t('Lower your chest toward the floor with elbows about 45° from your body.', 'أنزل صدرك نحو الأرض والمرفقان بزاوية 45 درجة تقريبًا عن جسمك.'),
      t('Push the floor away until your arms are straight again.', 'ادفع الأرض بعيدًا حتى تستقيم ذراعاك من جديد.'),
    ],
    tips: [t('Your chest and hips move together as one piece.', 'صدرك ووركاك يتحركان معًا كقطعة واحدة.'), t('Too hard? Do them with your hands on a bench. Too easy? Slow down the lowering.', 'صعبة؟ ضع يديك على مقعد. سهلة؟ أبطئ النزول.'), C.breathePush],
  }),
  pikePushUp: (o) => ({
    steps: [
      t(o.elevated ? 'Put your feet on a box and walk your hands back until your hips are high above your shoulders.' : 'Start in a push-up position, then walk your feet in and lift your hips high so your body forms an upside-down V.', o.elevated ? 'ضع قدميك على صندوق وارجع بيديك حتى يرتفع وركاك عاليًا فوق كتفيك.' : 'ابدأ بوضعية الضغط، ثم قرّب قدميك وارفع وركيك عاليًا ليشكّل جسمك حرف V مقلوبًا.'),
      t('Bend your elbows and lower the top of your head toward the floor between your hands.', 'اثنِ مرفقيك وأنزل أعلى رأسك نحو الأرض بين يديك.'),
      t('Press back up until your arms are straight.', 'ادفع للأعلى حتى تستقيم ذراعاك.'),
    ],
    tips: [t('Keep your hips high the whole time; this is a shoulder press, not a push-up.', 'أبقِ وركيك عاليين طوال الوقت؛ هذه حركة ضغط للكتفين لا تمرين ضغط عادي.'), C.breathePush],
  }),
  handstandPushUp: () => ({
    steps: [
      t('Face a wall, place your hands a little wider than your shoulders about a hand-length from it, and kick up into a handstand with your heels on the wall.', 'قف مقابل الجدار، وضع يديك أعرض قليلًا من كتفيك وعلى بُعد شبر منه، ثم اقفز إلى وضعية الوقوف على اليدين مع إسناد كعبيك على الجدار.'),
      t('Brace your stomach and squeeze your legs together.', 'شدّ بطنك واضمم ساقيك معًا.'),
      t('Lower slowly until your head lightly touches the floor or a cushion.', 'انزل ببطء حتى يلمس رأسك الأرض أو وسادة بخفة.'),
      t('Press back up to straight arms.', 'ادفع للأعلى حتى تستقيم ذراعاك.'),
    ],
    tips: [t('Learn it first with pike push-ups; only try this when those are easy.', 'تعلّم أولًا تمرين البايك؛ ولا تجرّب هذا إلا عندما يصبح سهلًا.'), t('Put a folded mat under your head.', 'ضع حصيرة مطوية تحت رأسك.')],
  }),
  dip: (o, e) => ({
    steps: [
      e.kind === 'machine' ? t('Set the machine (or the assistance) and grip the handles beside your hips.', 'اضبط الجهاز (أو مستوى المساعدة) وأمسك المقبضين بجانب وركيك.') : t('Grip the parallel bars and jump up so your arms are straight and your body is supported above them.', 'أمسك القضيبين المتوازيين واقفز لتصبح ذراعاك مستقيمتين وجسمك مرفوعًا فوقهما.'),
      t(o.lean > 20 ? 'Lean your chest forward a little and bend your knees.' : 'Keep your body fairly upright and bend your knees.', o.lean > 20 ? 'امِل بصدرك للأمام قليلًا واثنِ ركبتيك.' : 'حافظ على جسمك شبه مستقيم واثنِ ركبتيك.'),
      t('Bend your elbows and lower until your upper arms are about parallel to the floor.', 'اثنِ مرفقيك وانزل حتى يصبح أعلى ذراعيك موازيًا للأرض تقريبًا.'),
      t('Push back up to straight arms.', 'ادفع للأعلى حتى تستقيم ذراعاك.'),
    ],
    tips: [C.shouldersDown, t('Stop higher if you feel pain at the front of your shoulders.', 'توقّف أعلى إن شعرت بألم في مقدمة الكتف.'), C.breathePush],
  }),
  benchDip: () => ({
    steps: [
      t('Sit on the edge of a bench, hands beside your hips gripping the edge, fingers forward.', 'اجلس على حافة مقعد، ويداك بجانب وركيك ممسكتان بالحافة والأصابع للأمام.'),
      t('Slide your hips off the bench; keep knees bent (easier) or legs straight (harder).', 'أنزل وركيك عن المقعد، مع ثني الركبتين (أسهل) أو مدّ الساقين (أصعب).'),
      t('Bend your elbows straight back and lower your hips until your elbows reach about 90°.', 'اثنِ مرفقيك للخلف مباشرة وأنزل وركيك حتى يصل المرفقان إلى 90 درجة تقريبًا.'),
      t('Press through your palms back up.', 'ادفع بكفيك للعودة للأعلى.'),
    ],
    tips: [t('Keep your back close to the bench.', 'أبقِ ظهرك قريبًا من المقعد.'), t('Do not go lower than 90° at the elbow.', 'لا تنزل أكثر من 90 درجة في المرفق.')],
  }),

  // ===== BACK =====
  bentRow: (o, e) => ({
    steps: [
      ...grip(e, t('under your feet', 'تحت قدميك')),
      t(`Stand with feet hip-width, bend your knees slightly and hinge at the hips until your chest leans ${o.torso && o.torso < 50 ? 'forward about 30°' : 'forward about 45°'}.`, `قف وقدماك بعرض الورك، واثنِ ركبتيك قليلًا وانحنِ من الورك حتى يميل صدرك ${o.torso && o.torso < 50 ? 'للأمام 30 درجة تقريبًا' : 'للأمام 45 درجة تقريبًا'}.`),
      ...(o.tbar ? [t('Hold the end of the bar (landmine) close to your body.', 'أمسك طرف البار (لاندماين) قريبًا من جسمك.')] : []),
      t('Let your arms hang straight down.', 'اترك ذراعيك تتدليان للأسفل مستقيمتين.'),
      t(`Pull your elbows back past your body, bringing the weight to your ${o.high ? 'lower chest with elbows flared out' : 'belly button'}.`, `اسحب مرفقيك للخلف متجاوزًا جسمك، وقرّب الوزن إلى ${o.high ? 'أسفل صدرك مع فتح المرفقين للخارج' : 'السرّة'}.`),
      t('Lower it slowly until your arms are straight again.', 'أنزله ببطء حتى تستقيم ذراعاك من جديد.'),
    ],
    tips: [C.neutralBack, t('Your back angle stays the same; do not stand up to move the weight.', 'زاوية ظهرك تبقى ثابتة؛ لا تقف لتحريك الوزن.'), t('Think of pulling with your elbows, not your hands.', 'فكّر بالسحب بمرفقيك لا بيديك.'), C.breathePull],
  }),
  oneArmRow: (_o, e) => ({
    steps: [
      t('Put one knee and the same-side hand on a flat bench; the other foot stays on the floor.', 'ضع ركبة واليد من نفس الجهة على مقعد مستوٍ، والقدم الأخرى على الأرض.'),
      t('Keep your back flat and parallel to the floor.', 'حافظ على ظهرك مستقيمًا وموازيًا للأرض.'),
      t(`Hold ${e.en} in your free hand with your arm hanging straight down.`, `أمسك ${e.ar} باليد الحرة والذراع متدلية للأسفل.`),
      t('Pull your elbow up and back toward your hip until the weight touches your side.', 'اسحب مرفقك للأعلى وللخلف باتجاه وركك حتى يلامس الوزن جانبك.'),
      t('Lower it slowly to a full stretch.', 'أنزله ببطء حتى التمدد الكامل.'),
    ],
    tips: [t('Do not twist your chest open to lift higher.', 'لا تدوّر صدرك لترفع أعلى.'), C.sides, C.breathePull],
  }),
  chestSupportedRow: (o, e) => ({
    steps: [
      t(o.flat ? 'Lie face down on a high flat bench so your arms can hang straight down.' : 'Set a bench to about 30–45° and lie face down with your chest on the pad.', o.flat ? 'استلقِ على بطنك فوق مقعد مستوٍ مرتفع بحيث تتدلى ذراعاك للأسفل.' : 'اضبط المقعد على 30 إلى 45 درجة واستلقِ على بطنك وصدرك على الوسادة.'),
      ...(has(e) && e.kind !== 'machine' ? [t(`Hold ${e.en} with your arms hanging straight down.`, `أمسك ${e.ar} وذراعاك متدليتان للأسفل.`)] : grip(e)),
      t('Pull your elbows back and up, squeezing your shoulder blades together.', 'اسحب مرفقيك للخلف وللأعلى، مع ضمّ لوحي كتفيك معًا.'),
      t('Lower slowly to a full stretch.', 'انزل ببطء حتى التمدد الكامل.'),
    ],
    tips: [t('Keep your chest on the pad the whole time.', 'أبقِ صدرك على الوسادة طوال الوقت.'), C.squeeze, C.breathePull],
  }),
  seatedRow: (o, e) => ({
    steps: [
      o.chestPad ? t('Adjust the seat so the handles are at chest height and rest your chest against the pad.', 'اضبط المقعد ليكون المقبضان بمستوى الصدر واسند صدرك على الوسادة.') : t('Sit with your feet on the platform and knees slightly bent.', 'اجلس وقدماك على المنصة والركبتان مثنيتان قليلًا.'),
      ...(e.kind === 'band' ? grip(e, t('at chest height in front of you', 'بمستوى الصدر أمامك')) : e.kind === 'cable' ? [t('Hold the handle with straight arms, sitting tall.', 'أمسك المقبض بذراعين مستقيمتين واجلس معتدلًا.')] : [t('Grip the handles with straight arms.', 'أمسك المقبضين بذراعين مستقيمتين.')]),
      t('Pull the handle to your belly, driving your elbows back and squeezing your shoulder blades together.', 'اسحب المقبض نحو بطنك، مع دفع المرفقين للخلف وضمّ لوحي الكتفين.'),
      t('Let your arms straighten slowly and let your shoulders reach forward a little.', 'اترك ذراعيك تستقيمان ببطء ودع كتفيك يمتدان للأمام قليلًا.'),
    ],
    tips: [t('Do not rock your body back and forth; your torso stays almost still.', 'لا تهزّ جسمك للأمام والخلف؛ الجذع يبقى شبه ثابت.'), C.squeeze, C.breathePull],
  }),
  pulldown: (o, e) => ({
    steps: [
      o.kneel ? t('Kneel facing the high cable and hold the handle with one arm straight up.', 'اركع مقابل الكابل العلوي وأمسك المقبض بذراع واحدة مرفوعة.') : e.kind === 'band' ? t('Anchor the band high above you and kneel or sit underneath it, arms reaching up.', 'ثبّت الحبل المطاطي عاليًا فوقك واركع أو اجلس تحته وذراعاك ممدودتان للأعلى.')
        : t('Adjust the knee pad so your thighs are locked in, then grip the bar a little wider than your shoulders.', 'اضبط وسادة الركبتين لتثبيت فخذيك، ثم أمسك البار أعرض قليلًا من كتفيك.'),
      t('Lean back slightly and lift your chest.', 'امِل للخلف قليلًا وارفع صدرك.'),
      t('Pull the bar down to your upper chest by driving your elbows down toward your ribs.', 'اسحب البار إلى أعلى صدرك بدفع مرفقيك للأسفل نحو أضلاعك.'),
      t('Let it rise slowly until your arms are straight and you feel a stretch under your arms.', 'اتركه يصعد ببطء حتى تستقيم ذراعاك وتشعر بتمدد تحت إبطيك.'),
    ],
    tips: [t('Do not pull behind your neck.', 'لا تسحب البار خلف رقبتك.'), C.shouldersDown, C.breathePull],
  }),
  pullUp: (o) => ({
    steps: [
      o.assist ? t('Choose the assistance weight, kneel on the pad and grip the handles above you.', 'اختر وزن المساعدة، واركع على الوسادة وأمسك المقابض فوقك.') : t('Hang from the bar with your hands a little wider than your shoulders and arms straight.', 'تعلّق بالبار ويداك أعرض قليلًا من كتفيك وذراعاك مستقيمتان.'),
      t('Pull your shoulders down first, then brace your stomach and keep your legs quiet.', 'اخفض كتفيك أولًا، ثم شدّ بطنك وأبقِ ساقيك ثابتتين.'),
      t('Pull yourself up by driving your elbows down until your chin is over the bar.', 'اسحب جسمك للأعلى بدفع المرفقين للأسفل حتى يتجاوز ذقنك البار.'),
      t('Lower yourself slowly all the way to straight arms.', 'انزل ببطء حتى تستقيم ذراعاك تمامًا.'),
    ],
    tips: [C.noSwing, t('Cannot do one yet? Use a band or the assisted machine, or just do slow lowering.', 'لا تستطيع واحدة بعد؟ استخدم حبلًا مطاطيًا أو جهاز المساعدة، أو تدرّب على النزول البطيء فقط.'), C.breathePull],
  }),
  scapPull: () => ({
    steps: [
      t('Hang from a pull-up bar with straight arms.', 'تعلّق ببار العقلة بذراعين مستقيمتين.'),
      t('Without bending your elbows, pull your shoulder blades down and together so your body rises a few centimetres.', 'دون ثني المرفقين، اسحب لوحي كتفيك للأسفل ومعًا ليرتفع جسمك بضعة سنتيمترات.'),
      t('Hold for a second, then relax back into the hang.', 'اثبت ثانية، ثم استرخِ وعد للتعلّق.'),
    ],
    tips: [t('Your arms stay straight the whole time.', 'ذراعاك تبقيان مستقيمتين طوال الوقت.'), C.shouldersDown],
  }),
  invertedRow: () => ({
    steps: [
      t('Set a bar at about waist height, lie under it and grip it a little wider than your shoulders.', 'اضبط بارًا بارتفاع الخصر تقريبًا، واستلقِ تحته وأمسكه أعرض قليلًا من كتفيك.'),
      t('Straighten your body from heels to head, heels on the floor.', 'اجعل جسمك مستقيمًا من الكعبين إلى الرأس والكعبان على الأرض.'),
      t('Pull your chest up to the bar, squeezing your shoulder blades together.', 'اسحب صدرك نحو البار، مع ضمّ لوحي كتفيك.'),
      t('Lower slowly to straight arms.', 'انزل ببطء حتى تستقيم ذراعاك.'),
    ],
    tips: [t('Keep your hips up; do not let them sag.', 'أبقِ وركيك مرفوعين ولا تدعهما يهبطان.'), t('Bend your knees to make it easier.', 'اثنِ ركبتيك لتسهيل التمرين.'), C.breathePull],
  }),
  straightArmPulldown: (o, e) => ({
    steps: [
      o.seated ? t('Sit in the machine and place your arms against the pads above your head.', 'اجلس في الجهاز وضع ذراعيك على الوسائد فوق رأسك.') : (grip(e, t('high above you', 'في أعلى نقطة'))[0] ?? t('Hold the bar from the high pulley.', 'أمسك البار من البكرة العليا.')),
      ...(o.seated ? [] : [t('Step back, hinge forward slightly and reach up with straight arms.', 'تراجع خطوة، وانحنِ للأمام قليلًا ومدّ ذراعيك للأعلى مستقيمتين.')]),
      t('Keeping your elbows almost straight, sweep your arms down until your hands reach your thighs.', 'مع إبقاء مرفقيك شبه مستقيمين، اسحب ذراعيك للأسفل حتى تصل يداك إلى فخذيك.'),
      t('Return slowly to the stretch overhead.', 'ارجع ببطء إلى التمدد فوق رأسك.'),
    ],
    tips: [t('Feel it under your arms (lats), not in your triceps.', 'يجب أن تشعر بها تحت الإبط (عضلة الظهر العريضة) لا في الترايسبس.'), C.breathePull],
  }),
  facePull: (_o, e) => ({
    steps: [
      ...(e.kind === 'cable' ? [t('Attach a rope to the cable at face height and hold the ends with thumbs pointing back.', 'ثبّت حبلًا في الكابل بمستوى الوجه وأمسك طرفيه والإبهامان للخلف.')] : grip(e, t('at face height', 'بمستوى الوجه'))),
      t('Step back until your arms are straight and stand tall.', 'تراجع حتى تستقيم ذراعاك وقف مستقيمًا.'),
      t('Pull the rope toward your face, spreading the ends apart and lifting your elbows high and out.', 'اسحب الحبل نحو وجهك، مع فتح طرفيه ورفع المرفقين عاليًا للخارج.'),
      t('Finish with your hands beside your ears, then return slowly.', 'أنهِ ويداك بجانب أذنيك، ثم ارجع ببطء.'),
    ],
    tips: [t('Use a light weight; this is for the rear shoulders and upper back.', 'استخدم وزنًا خفيفًا؛ هذا التمرين لخلفية الكتف وأعلى الظهر.'), C.squeeze],
  }),
  pullApart: (o) => ({
    steps: [
      t('Hold the band in front of your chest with straight arms, hands shoulder-width apart.', 'أمسك الحبل المطاطي أمام صدرك بذراعين مستقيمتين، واليدان بعرض الكتفين.'),
      t('Pull the band apart by moving your hands out to the sides until it touches your chest.', 'افتح الحبل بتحريك يديك للجانبين حتى يلامس صدرك.'),
      t('Squeeze your shoulder blades together, then return slowly.', 'اضمم لوحي كتفيك معًا، ثم ارجع ببطء.'),
    ],
    tips: [t('Keep your arms straight and your shoulders down.', 'أبقِ ذراعيك مستقيمتين وكتفيك منخفضين.'), ...(o.bend ? [] : [C.squeeze])],
  }),
  renegadeRow: (_o, e) => ({
    steps: [
      t(`Start in a high plank holding ${e.en} on the floor, feet a little wider than hip-width.`, `ابدأ بوضعية البلانك العالي ممسكًا ${e.ar} على الأرض، والقدمان أعرض قليلًا من الورك.`),
      t('Brace your stomach and glutes so your hips stay square to the floor.', 'شدّ بطنك ومؤخرتك ليبقى وركاك متوازيين مع الأرض.'),
      t('Row one dumbbell up to your ribs, then put it down with control.', 'اسحب دمبلًا واحدًا إلى أضلاعك، ثم أنزله بتحكّم.'),
      t('Repeat with the other arm.', 'كرّر بالذراع الأخرى.'),
    ],
    tips: [t('Do not twist your hips as you lift.', 'لا تدوّر وركيك أثناء الرفع.'), C.alternate],
  }),
  deadlift: (o, e) => ({
    steps: [
      o.trap ? t('Stand inside the trap bar with feet hip-width apart.', 'قف داخل بار الترَب والقدمان بعرض الورك.') : t(`Stand with your mid-foot under the bar${o.sumo ? ', feet wide and toes pointing out' : ', feet hip-width apart'}.`, `قف بحيث يكون منتصف قدمك تحت البار${o.sumo ? '، والقدمان متباعدتان والأصابع للخارج' : '، والقدمان بعرض الورك'}.`),
      ...(o.deficit ? [t('Stand on a low plate or platform so you start a little deeper.', 'قف على قرص أو منصة منخفضة لتبدأ من نقطة أعمق قليلًا.')] : []),
      ...(o.rack ? [t('Set the bar in the rack just below your knees.', 'ضع البار على الحامل أسفل ركبتيك مباشرة.')] : []),
      t(`Hinge at your hips and bend your knees to grip ${has(e) ? e.en : 'the weight'} ${o.sumo ? 'inside your knees' : 'just outside your legs'}.`, `انحنِ من الورك واثنِ ركبتيك لتمسك ${has(e) ? e.ar : 'الوزن'} ${o.sumo ? 'بين ركبتيك' : 'خارج ساقيك مباشرة'}.`),
      t('Lift your chest, flatten your back and pull the slack out of the bar.', 'ارفع صدرك وافرد ظهرك وشدّ البار قليلًا قبل الرفع.'),
      t('Push the floor away with your legs and stand up tall, keeping the weight close to your legs.', 'ادفع الأرض بساقيك وقف مستقيمًا، مع إبقاء الوزن قريبًا من ساقيك.'),
      t('Reverse it: hips back first, then bend your knees once it passes them.', 'اعكس الحركة: الورك للخلف أولًا، ثم اثنِ ركبتيك بعد أن يتجاوزهما الوزن.'),
    ],
    tips: [C.neutralBack, C.brace, t('Finish standing straight; do not lean back at the top.', 'أنهِ واقفًا باستقامة، ولا تمِل للخلف في الأعلى.'), C.startLight],
  }),
  hinge: (o, e) => ({
    steps: [
      ...(o.back ? (has(e) && e.kind !== 'band' ? [t(`Rest ${e.en} across your upper back (or hold one weight at your chest).`, `ضع ${e.ar} على أعلى ظهرك (أو أمسك وزنًا واحدًا عند صدرك).`)] : [t('Cross your hands on your chest or place them behind your head.', 'ضع يديك متقاطعتين على صدرك أو خلف رأسك.')])
        : [t(`Stand tall holding ${has(e) ? e.en : 'the weight'} in front of your thighs, feet hip-width apart.`, `قف مستقيمًا ممسكًا ${has(e) ? e.ar : 'الوزن'} أمام فخذيك، والقدمان بعرض الورك.`)]),
      t('Unlock your knees slightly and keep that small bend.', 'اثنِ ركبتيك قليلًا وحافظ على هذا الثني البسيط.'),
      t(`Push your hips straight back and lower your chest${o.back ? '' : ', sliding the weight down your legs'} until you feel a strong stretch in your hamstrings.`, `ادفع وركيك للخلف مباشرة وأنزل صدرك${o.back ? '' : '، مع تمرير الوزن على ساقيك'} حتى تشعر بتمدد قوي في أوتار الركبة.`),
      t('Drive your hips forward to stand tall again.', 'ادفع وركيك للأمام لتعود واقفًا.'),
    ],
    tips: [C.neutralBack, t('Your hips move back and forward; your knees barely move.', 'الحركة من الورك للخلف والأمام، والركبتان بالكاد تتحركان.'), C.breatheLift],
  }),
  singleLegRdl: (_o, e) => ({
    steps: [
      t(`Stand on one leg${has(e) ? ` holding ${e.en} in the opposite hand` : ''}, knee slightly bent.`, `قف على ساق واحدة${has(e) ? ` ممسكًا ${e.ar} باليد المعاكسة` : ''} مع ثني بسيط في الركبة.`),
      t('Hinge forward at the hip while your free leg reaches straight back, until your body is nearly parallel to the floor.', 'انحنِ للأمام من الورك بينما تمتد الساق الحرة للخلف مستقيمة، حتى يصبح جسمك موازيًا للأرض تقريبًا.'),
      t('Keep your hips level; do not let the free hip open up.', 'أبقِ وركيك متوازيين؛ لا تدع الورك الحر ينفتح للأعلى.'),
      t('Squeeze the standing glute to come back up.', 'شدّ مؤخرة الساق الواقفة للعودة للأعلى.'),
    ],
    tips: [t('Hold a wall with your free hand if you lose balance.', 'استند إلى جدار بيدك الحرة إن فقدت توازنك.'), C.sides],
  }),
  pullThrough: () => ({
    steps: [
      t('Attach a rope to a low cable, face away and hold the rope between your legs.', 'ثبّت حبلًا في الكابل السفلي، وأعطِ ظهرك للجهاز وأمسك الحبل بين ساقيك.'),
      t('Walk forward a few steps, feet a little wider than hips.', 'تقدّم بضع خطوات، والقدمان أعرض قليلًا من الورك.'),
      t('Push your hips back and let the rope pull your hands between your legs.', 'ادفع وركيك للخلف ودع الحبل يسحب يديك بين ساقيك.'),
      t('Drive your hips forward and squeeze your glutes to stand tall.', 'ادفع وركيك للأمام واعصر المؤخرة لتقف مستقيمًا.'),
    ],
    tips: [t('Your arms just hold the rope; the hips do the work.', 'ذراعاك تمسكان الحبل فقط؛ الورك يقوم بالعمل.'), C.neutralBack],
  }),
  swing: () => ({
    steps: [
      t('Stand with feet a little wider than hips, kettlebell on the floor in front of you.', 'قف والقدمان أعرض قليلًا من الورك، والكيتل بيل على الأرض أمامك.'),
      t('Hinge, grip the handle and hike the bell back between your legs.', 'انحنِ وأمسك المقبض، ثم أرجح الكيتل بيل للخلف بين ساقيك.'),
      t('Snap your hips forward hard to swing it up to chest height with straight arms.', 'ادفع وركيك للأمام بقوة لتؤرجحه حتى مستوى الصدر بذراعين مستقيمتين.'),
      t('Let it fall back and hinge again as it passes between your legs.', 'اتركه يعود وانحنِ مجددًا عند مروره بين ساقيك.'),
    ],
    tips: [t('It is a hip snap, not a squat and not an arm raise.', 'هي دفعة من الورك، ليست سكوات ولا رفعًا بالذراعين.'), C.neutralBack, t('Breathe out sharply at the top.', 'أخرج النفس بقوة في الأعلى.')],
  }),
  backExtension: (_o, e) => ({
    steps: [
      t('Set the pad just below your hip bones and hook your heels under the rollers.', 'اضبط الوسادة أسفل عظام الورك مباشرة وثبّت كعبيك تحت الأسطوانات.'),
      t(`Cross your arms on your chest${has(e) && e.kind !== 'machine' ? ` holding ${e.en}` : ''}.`, `ضع ذراعيك متقاطعتين على صدرك${has(e) && e.kind !== 'machine' ? ` ممسكًا ${e.ar}` : ''}.`),
      t('Lower your upper body slowly by bending at the hips.', 'أنزل جذعك ببطء بالانحناء من الورك.'),
      t('Raise back up until your body is in a straight line with your legs; no higher.', 'ارتفع حتى يصبح جسمك على خط مستقيم مع ساقيك؛ ولا تتجاوز ذلك.'),
    ],
    tips: [t('Do not over-arch at the top.', 'لا تقوّس ظهرك أكثر من اللازم في الأعلى.'), C.squeeze],
  }),
  superman: () => ({
    steps: [
      t('Lie face down with your arms stretched forward and legs straight.', 'استلقِ على بطنك وذراعاك ممدودتان للأمام وساقاك مستقيمتان.'),
      t('Lift your arms, chest and legs a few centimetres off the floor at the same time.', 'ارفع ذراعيك وصدرك وساقيك عن الأرض بضعة سنتيمترات في الوقت نفسه.'),
      t('Hold for 2 seconds, then lower slowly.', 'اثبت ثانيتين، ثم انزل ببطء.'),
    ],
    tips: [t('Look at the floor to keep your neck relaxed.', 'انظر إلى الأرض لتبقى رقبتك مسترخية.'), t('Small and controlled beats high and jerky.', 'الحركة الصغيرة المتحكم بها أفضل من الرفع العالي المتقطع.')],
  }),
  reverseHyper: () => ({
    steps: [
      t('Lie face down on the machine (or a high bench) with your hips at the edge and hold the handles.', 'استلقِ على بطنك فوق الجهاز (أو مقعد مرتفع) والوركان عند الحافة، وأمسك المقابض.'),
      t('Let your legs hang down.', 'اترك ساقيك تتدليان للأسفل.'),
      t('Squeeze your glutes to lift your straight legs until they are in line with your body.', 'اعصر المؤخرة لترفع ساقيك المستقيمتين حتى تصبحا على خط واحد مع جسمك.'),
      t('Lower them slowly.', 'أنزلهما ببطء.'),
    ],
    tips: [t('Do not swing the legs up with momentum.', 'لا ترفع الساقين بالأرجحة.'), C.squeeze],
  }),
  gluteHam: (o) => ({
    steps: [
      o.nordic ? t('Kneel on a mat and have a partner hold your ankles, or hook them under something solid.', 'اركع على حصيرة واطلب من شخص تثبيت كاحليك، أو ثبّتهما تحت شيء ثابت.') : t('Set your knees on the pad and lock your feet under the rollers of the glute-ham bench.', 'ضع ركبتيك على الوسادة وثبّت قدميك تحت أسطوانات جهاز الـGHR.'),
      t('Keep your body straight from knees to head.', 'اجعل جسمك مستقيمًا من الركبتين إلى الرأس.'),
      t('Lower your body forward as slowly as you can, using your hamstrings to brake.', 'أنزل جسمك للأمام بأبطأ ما يمكن، مستخدمًا أوتار الركبة للكبح.'),
      t(o.nordic ? 'Catch yourself with your hands, then push off lightly and pull yourself back up with your hamstrings.' : 'Pull yourself back up by curling with your hamstrings.', o.nordic ? 'التقط نفسك بيديك، ثم ادفع بخفة واسحب جسمك للأعلى بأوتار الركبة.' : 'اسحب جسمك للأعلى بثني ساقيك بعضلات أوتار الركبة.'),
    ],
    tips: [t('Keep your hips straight; do not bend at the waist.', 'أبقِ وركيك مستقيمين ولا تنحنِ من الخصر.'), t('This is very hard; start with a few slow reps.', 'التمرين صعب جدًا؛ ابدأ بتكرارات قليلة وبطيئة.')],
  }),
  backExtMachine: () => ({
    steps: [
      t('Sit in the machine with the pad across your upper back and your feet on the platform.', 'اجلس في الجهاز والوسادة على أعلى ظهرك وقدماك على المنصة.'),
      t('Start leaning slightly forward with your back straight.', 'ابدأ مائلًا للأمام قليلًا وظهرك مستقيم.'),
      t('Push back against the pad until your body is upright or slightly behind.', 'ادفع للخلف ضد الوسادة حتى يصبح جسمك معتدلًا أو مائلًا للخلف قليلًا.'),
      t('Return slowly.', 'ارجع ببطء.'),
    ],
    tips: [C.startLight, C.slowDown],
  }),

  // ===== SHOULDERS =====
  overheadPress: (o, e) => ({
    steps: [
      o.seated ? t('Sit on a bench with the back pad upright and your back against it.', 'اجلس على مقعد بظهر عمودي واسند ظهرك عليه.') : o.floor ? t('Sit on the floor with your legs straight out in front of you.', 'اجلس على الأرض وساقاك ممدودتان أمامك.') : t('Stand with feet hip-width apart and squeeze your glutes.', 'قف والقدمان بعرض الورك واعصر المؤخرة.'),
      ...(e.kind === 'machine' ? [t('Grip the handles at shoulder height.', 'أمسك المقبضين بمستوى الكتفين.')] : e.kind === 'band' ? [t('Stand on the band and hold the ends at your shoulders.', 'قف على الحبل المطاطي وأمسك طرفيه عند كتفيك.')]
        : [t(`Hold ${e.en} ${o.behind ? 'on your upper back, behind your head' : 'at your collarbones'}, hands just outside your shoulders, elbows slightly in front of the bar.`, `أمسك ${e.ar} ${o.behind ? 'على أعلى ظهرك خلف رأسك' : 'عند عظمة الترقوة'}، واليدان خارج الكتفين مباشرة، والمرفقان أمام البار قليلًا.`)]),
      t('Press straight up, moving your head slightly back out of the way, then forward under the weight at the top.', 'ادفع للأعلى مباشرة، مع إبعاد رأسك للخلف قليلًا، ثم أعده للأمام تحت الوزن في الأعلى.'),
      t('Lock your arms overhead, then lower slowly back to the start.', 'افرد ذراعيك فوق رأسك، ثم انزل ببطء إلى البداية.'),
    ],
    tips: [C.brace, t('Do not lean back to push the weight up.', 'لا تمِل للخلف لدفع الوزن.'), ...(o.behind ? [t('Only press behind the neck if your shoulders move freely there; use a light weight.', 'لا تدفع خلف الرقبة إلا إن كانت كتفاك مرنتين، واستخدم وزنًا خفيفًا.')] : []), C.breathePush],
  }),
  pushPress: (_o, e) => ({
    steps: [
      t(`Stand with ${e.en} on your collarbones, hands just outside your shoulders.`, `قف و${e.ar} على عظمة الترقوة، واليدان خارج الكتفين مباشرة.`),
      t('Dip a few centimetres by bending your knees, keeping your chest up.', 'انزل بضعة سنتيمترات بثني ركبتيك، مع إبقاء صدرك مرفوعًا.'),
      t('Drive up hard with your legs and use that push to press the weight overhead.', 'ادفع بقوة بساقيك واستغل هذه الدفعة لرفع الوزن فوق رأسك.'),
      t('Lock out overhead, then lower it back to your shoulders.', 'افرد ذراعيك فوق رأسك، ثم أنزله إلى كتفيك.'),
    ],
    tips: [t('The dip is short and straight down, not a squat.', 'النزول قصير ومستقيم للأسفل، وليس سكوات.'), C.brace],
  }),
  frontRaise: (_o, e) => ({
    steps: [
      ...grip(e, t('at the bottom', 'في الأسفل')),
      t('Stand tall with the weight in front of your thighs and a soft bend in your elbows.', 'قف مستقيمًا والوزن أمام فخذيك مع ثني خفيف في المرفقين.'),
      t('Raise your arms straight in front of you up to shoulder height.', 'ارفع ذراعيك أمامك حتى مستوى الكتفين.'),
      t('Lower slowly back down.', 'أنزلهما ببطء.'),
    ],
    tips: [C.noSwing, t('Stop at shoulder height.', 'توقّف عند مستوى الكتف.'), C.breatheLift],
  }),
  lateralRaise: (o, e) => ({
    steps: [
      ...(e.kind === 'machine' ? [t('Sit in the machine with the pads against the outside of your upper arms.', 'اجلس في الجهاز والوسائد على الجهة الخارجية لأعلى ذراعيك.')] : grip(e, t('at the bottom, on the opposite side', 'في الأسفل على الجهة المقابلة'))),
      t(e.one ? 'Stand side-on with the weight in your outer hand, elbow slightly bent.' : 'Stand tall with the weights at your sides, elbows slightly bent.', e.one ? 'قف جانبيًا والوزن في اليد البعيدة، مع ثني بسيط في المرفق.' : 'قف مستقيمًا والأوزان بجانبيك، مع ثني بسيط في المرفقين.'),
      ...(e.one ? [
        t('Raise your arm out to the side until it reaches shoulder height, leading with your elbow.', 'ارفع ذراعك للجانب حتى مستوى الكتف، والمرفق يقود الحركة.'),
        t('Lower it slowly to your side.', 'أنزلها ببطء إلى جانبك.'),
      ] : [
        t(o.y ? 'Raise your arms up and slightly forward into a Y shape, thumbs up.' : o.lu ? 'Raise your arms out to the sides and keep going all the way overhead.' : 'Raise your arms out to the sides until they reach shoulder height, leading with your elbows.',
          o.y ? 'ارفع ذراعيك للأعلى وللأمام قليلًا على شكل حرف Y والإبهامان للأعلى.' : o.lu ? 'ارفع ذراعيك للجانبين واستمر حتى فوق رأسك.' : 'ارفع ذراعيك للجانبين حتى مستوى الكتفين، والمرفقان يقودان الحركة.'),
        t('Lower slowly to your sides.', 'أنزلهما ببطء إلى جانبيك.'),
      ]),
    ],
    tips: [t('Use a light weight; this muscle is small.', 'استخدم وزنًا خفيفًا؛ هذه العضلة صغيرة.'), C.shouldersDown, C.noSwing, ...(e.one ? [C.sides] : [])],
  }),
  reverseFly: (o, e) => ({
    steps: [
      o.upright ? (e.kind === 'machine' ? t('Sit facing the pad, chest against it, and grip the handles in front of you with straight arms.', 'اجلس مقابل الوسادة وصدرك ملتصق بها، وأمسك المقبضين أمامك بذراعين مستقيمتين.') : t('Set two cables at shoulder height, cross them and hold the opposite handle in each hand.', 'اضبط كابلين بمستوى الكتف، وقاطعهما وأمسك المقبض المعاكس بكل يد.'))
        : t(`Hinge forward until your chest is almost parallel to the floor (or lie chest-down on an incline bench), holding ${e.en} under your chest.`, `انحنِ للأمام حتى يصبح صدرك شبه موازٍ للأرض (أو استلقِ على صدرك فوق مقعد مائل)، ممسكًا ${e.ar} تحت صدرك.`),
      t('With a soft bend in your elbows, move your arms out to the sides in a wide arc.', 'مع ثني خفيف في المرفقين، حرّك ذراعيك للجانبين بقوس واسع.'),
      t('Stop when your arms are in line with your body and squeeze the backs of your shoulders.', 'توقّف عندما تصبح ذراعاك على خط جسمك واعصر خلفية الكتفين.'),
      t('Return slowly.', 'ارجع ببطء.'),
    ],
    tips: [t('Use light weights; feel it at the back of the shoulders.', 'استخدم أوزانًا خفيفة؛ يجب أن تشعر بها في خلفية الكتف.'), C.noSwing],
  }),
  uprightRow: (_o, e) => ({
    steps: [
      ...grip(e, t('at the bottom', 'في الأسفل')),
      t(`Stand tall holding ${has(e) ? e.en : 'the weight'} in front of your thighs, hands about shoulder-width apart.`, `قف مستقيمًا ممسكًا ${has(e) ? e.ar : 'الوزن'} أمام فخذيك، واليدان بعرض الكتفين تقريبًا.`),
      t('Lift by raising your elbows out and up until your upper arms are about level with your shoulders.', 'ارفع بتحريك مرفقيك للخارج وللأعلى حتى يصبح أعلى ذراعيك بمستوى كتفيك تقريبًا.'),
      t('Lower slowly.', 'انزل ببطء.'),
    ],
    tips: [t('Do not lift your elbows higher than your shoulders.', 'لا ترفع مرفقيك أعلى من كتفيك.'), t('A wider grip is kinder to your shoulders.', 'القبضة الأعرض ألطف على الكتفين.')],
  }),
  shrug: (o, e) => ({
    steps: [
      ...(o.incline ? [t('Lie chest-down on an incline bench with the weights hanging under you.', 'استلقِ على صدرك فوق مقعد مائل والأوزان متدلية تحتك.')] : e.kind === 'machine' ? [t('Stand under the pads and grip the handles at your sides.', 'قف تحت الوسائد وأمسك المقبضين بجانبيك.')] : grip(e, t('at the bottom', 'في الأسفل'))),
      t('Stand tall with your arms straight and the weight hanging.', 'قف مستقيمًا وذراعاك مستقيمتان والوزن متدلٍّ.'),
      t('Lift your shoulders straight up toward your ears.', 'ارفع كتفيك مباشرة للأعلى نحو أذنيك.'),
      t('Hold for a second, then lower all the way down.', 'اثبت ثانية، ثم أنزلهما للأسفل تمامًا.'),
    ],
    tips: [t('Do not roll your shoulders; straight up and down.', 'لا تدوّر كتفيك؛ للأعلى وللأسفل فقط.'), t('Keep your arms straight; do not bend the elbows.', 'أبقِ ذراعيك مستقيمتين ولا تثنِ المرفقين.')],
  }),
  arnoldPress: () => ({
    steps: [
      t('Sit or stand holding dumbbells in front of your shoulders, palms facing you.', 'اجلس أو قف ممسكًا الدمبلز أمام كتفيك والكفان باتجاهك.'),
      t('As you press up, rotate your palms so they face forward at the top.', 'أثناء الدفع للأعلى، دوّر كفيك ليواجها الأمام في الأعلى.'),
      t('Straighten your arms overhead.', 'افرد ذراعيك فوق رأسك.'),
      t('Reverse the rotation as you lower back to the start.', 'اعكس الدوران أثناء النزول إلى البداية.'),
    ],
    tips: [t('Move smoothly; the twist and the press happen together.', 'تحرك بسلاسة؛ الدوران والدفع يحدثان معًا.'), C.brace],
  }),
  overheadFront: (o, e) => ({
    steps: [
      t(o.seated ? 'Sit on a bench with the back pad upright.' : 'Stand with feet hip-width apart.', o.seated ? 'اجلس على مقعد بظهر عمودي.' : 'قف والقدمان بعرض الورك.'),
      t(`Hold ${e.en} at shoulder height, palms forward, elbows under your wrists.`, `أمسك ${e.ar} بمستوى الكتفين، والكفان للأمام، والمرفقان تحت المعصمين.`),
      t('Press straight up until your arms are straight overhead.', 'ادفع للأعلى مباشرة حتى تستقيم ذراعاك فوق رأسك.'),
      t('Lower slowly back to shoulder height.', 'انزل ببطء إلى مستوى الكتفين.'),
    ],
    tips: [C.brace, t('Do not arch your lower back.', 'لا تقوّس أسفل ظهرك.'), ...(e.one ? [C.sides] : []), C.breathePush],
  }),
  halo: () => ({
    steps: [
      t('Hold the kettlebell upside down by the horns in front of your chest.', 'أمسك الكيتل بيل مقلوبًا من قرنيه أمام صدرك.'),
      t('Circle it around your head: past one ear, behind your head, past the other ear.', 'دوّره حول رأسك: بجانب أذن، ثم خلف رأسك، ثم بجانب الأذن الأخرى.'),
      t('Bring it back to the front and change direction after each set of circles.', 'أعده إلى الأمام وغيّر الاتجاه بعد كل مجموعة دوائر.'),
    ],
    tips: [C.brace, t('Keep the bell close to your head; move only your arms.', 'أبقِ الكيتل بيل قريبًا من رأسك وحرّك ذراعيك فقط.')],
  }),
  windmill: () => ({
    steps: [
      t('Press the kettlebell overhead with one arm; feet wider than hips, toes turned away from that arm.', 'ارفع الكيتل بيل فوق رأسك بذراع واحدة، والقدمان أعرض من الورك والأصابع بعيدة عن تلك الذراع.'),
      t('Keep your eyes on the bell and push your hip out to the side of the raised arm.', 'أبقِ نظرك على الكيتل بيل وادفع وركك للجهة نفسها للذراع المرفوعة.'),
      t('Slide your free hand down the inside of your opposite leg toward your foot.', 'أنزل يدك الحرة على الجهة الداخلية للساق المقابلة باتجاه القدم.'),
      t('Come back up to standing, keeping the top arm vertical.', 'عد للوقوف مع إبقاء الذراع العليا عمودية.'),
    ],
    tips: [t('Learn it without a weight first.', 'تعلّمه دون وزن أولًا.'), C.sides],
  }),

  // ===== ARMS =====
  curl: (o, e) => ({
    steps: [
      ...grip(e, t('at the lowest position', 'في أدنى وضعية')),
      t(`Stand tall with ${has(e) ? e.en : 'the weight'} at arm's length, elbows by your sides.`, `قف مستقيمًا و${has(e) ? e.ar : 'الوزن'} في يديك وذراعاك ممدودتان، والمرفقان بجانبيك.`),
      t(o.drag ? 'Curl the weight up while dragging it along your body and pulling your elbows back.' : 'Curl the weight up toward your shoulders by bending only at the elbows.', o.drag ? 'ارفع الوزن مع سحبه ملاصقًا لجسمك وإرجاع مرفقيك للخلف.' : 'ارفع الوزن نحو كتفيك بثني المرفقين فقط.'),
      t('Squeeze at the top, then lower slowly until your arms are straight.', 'اعصر في الأعلى، ثم انزل ببطء حتى تستقيم ذراعاك.'),
    ],
    tips: [o.drag ? t('Your elbows move back on purpose in this one.', 'في هذا التمرين يتحرك المرفقان للخلف عن قصد.') : C.elbowsStill, C.noSwing, ...(e.one ? [C.alternate] : []), C.breatheLift],
  }),
  preacher: (_o, e) => ({
    steps: [
      t('Sit at the preacher bench with the backs of your upper arms flat on the pad.', 'اجلس على مقعد البريتشر والجزء الخلفي من أعلى ذراعيك ملاصق للوسادة.'),
      t(`Hold ${has(e) ? e.en : 'the handle'} with your palms up.`, `أمسك ${has(e) ? e.ar : 'المقبض'} والكفان للأعلى.`),
      t('Curl the weight up until your forearms are almost vertical.', 'ارفع الوزن حتى يصبح الساعدان شبه عموديين.'),
      t('Lower slowly until your arms are nearly straight, without slamming to lockout.', 'انزل ببطء حتى تكاد ذراعاك تستقيمان دون أن تفردهما بعنف.'),
    ],
    tips: [t('Keep your armpits snug on top of the pad.', 'أبقِ إبطيك ملتصقين بأعلى الوسادة.'), C.slowDown],
  }),
  inclineCurl: () => ({
    steps: [
      t('Set a bench to about 45–60° and sit back with a dumbbell in each hand, arms hanging straight down.', 'اضبط المقعد على 45 إلى 60 درجة واجلس مستندًا ممسكًا دمبلًا بكل يد، والذراعان متدليتان للأسفل.'),
      t('Keep your elbows pointing down and slightly behind your body.', 'أبقِ مرفقيك متجهين للأسفل وخلف جسمك قليلًا.'),
      t('Curl the dumbbells up without moving your elbows forward.', 'ارفع الدمبلز دون تحريك المرفقين للأمام.'),
      t('Lower all the way to a full stretch.', 'انزل تمامًا حتى التمدد الكامل.'),
    ],
    tips: [C.elbowsStill, t('Use lighter weights than standing curls.', 'استخدم أوزانًا أخف من تمرين الوقوف.')],
  }),
  concentration: () => ({
    steps: [
      t('Sit on a bench, feet wide, and lean forward slightly.', 'اجلس على مقعد والقدمان متباعدتان، وامِل للأمام قليلًا.'),
      t('Rest the back of your upper arm against the inside of your thigh, dumbbell hanging down.', 'اسند الجزء الخلفي من أعلى ذراعك على الجهة الداخلية لفخذك، والدمبل متدلٍّ للأسفل.'),
      t('Curl the dumbbell up toward your shoulder.', 'ارفع الدمبل نحو كتفك.'),
      t('Lower slowly to a straight arm.', 'انزل ببطء حتى تستقيم الذراع.'),
    ],
    tips: [C.elbowsStill, C.squeeze, C.sides],
  }),
  spiderCurl: (_o, e) => ({
    steps: [
      t('Lie chest-down on an incline bench so your arms hang straight down in front of it.', 'استلقِ على صدرك فوق مقعد مائل بحيث تتدلى ذراعاك أمامه للأسفل.'),
      t(`Hold ${e.en} with palms facing forward.`, `أمسك ${e.ar} والكفان للأمام.`),
      t('Curl the weight up without letting your elbows swing forward.', 'ارفع الوزن دون أن يتأرجح المرفقان للأمام.'),
      t('Lower slowly to straight arms.', 'انزل ببطء حتى تستقيم ذراعاك.'),
    ],
    tips: [C.squeeze, C.elbowsStill],
  }),
  bayesian: () => ({
    steps: [
      t('Set the cable low, take the handle in one hand and face away from the machine.', 'اضبط الكابل في الأسفل، وأمسك المقبض بيد واحدة وأعطِ ظهرك للجهاز.'),
      t('Step forward so your arm is pulled slightly behind your body.', 'تقدّم خطوة بحيث تُسحب ذراعك خلف جسمك قليلًا.'),
      t('Curl the handle up without letting your elbow drift forward.', 'ارفع المقبض دون أن يتقدّم المرفق للأمام.'),
      t('Lower slowly to a full stretch.', 'انزل ببطء حتى التمدد الكامل.'),
    ],
    tips: [C.elbowsStill, C.sides],
  }),
  cableCurlHigh: () => ({
    steps: [
      t('Set two cables at head height (or one with a bar) and stand between them.', 'اضبط كابلين بمستوى الرأس (أو كابلًا واحدًا مع بار) وقف بينهما.'),
      t('Hold the handles with arms straight out to the sides at shoulder height, palms up.', 'أمسك المقبضين والذراعان ممدودتان للجانبين بمستوى الكتفين، والكفان للأعلى.'),
      t('Curl the handles toward your ears, keeping your upper arms level.', 'اسحب المقبضين نحو أذنيك، مع إبقاء أعلى ذراعيك بنفس المستوى.'),
      t('Straighten your arms slowly.', 'افرد ذراعيك ببطء.'),
    ],
    tips: [C.elbowsStill, C.squeeze],
  }),
  wristCurl: (o, e) => ({
    steps: [
      t('Sit and rest your forearms on your thighs (or a bench) with your hands just past your knees.', 'اجلس واسند ساعديك على فخذيك (أو مقعد) ويداك بعد ركبتيك مباشرة.'),
      t(`Hold ${has(e) ? e.en : 'the weight'} with palms ${o.reverse ? 'facing down' : 'facing up'}.`, `أمسك ${has(e) ? e.ar : 'الوزن'} والكفان ${o.reverse ? 'للأسفل' : 'للأعلى'}.`),
      t('Let your wrists bend down slowly.', 'اترك معصميك ينثنيان للأسفل ببطء.'),
      t('Curl your wrists up as far as you can; only the hands move.', 'ارفع معصميك لأقصى حد ممكن؛ فقط اليدان تتحركان.'),
    ],
    tips: [t('Keep your forearms on your thighs the whole time.', 'أبقِ ساعديك على فخذيك طوال الوقت.'), t('Use a light weight and high reps.', 'استخدم وزنًا خفيفًا وتكرارات كثيرة.')],
  }),
  wristTwist: (o) => ({
    steps: [
      t('Stand or sit holding a dumbbell by one end, elbow bent at 90° and tucked by your side.', 'قف أو اجلس ممسكًا دمبلًا من أحد طرفيه، والمرفق مثني 90 درجة وملاصق لجانبك.'),
      t(o.side ? 'Tilt the dumbbell up and down by bending your wrist toward your thumb and then toward your little finger.' : 'Slowly rotate your forearm so your palm turns up, then down.', o.side ? 'أمِل الدمبل للأعلى وللأسفل بثني معصمك نحو الإبهام ثم نحو الخنصر.' : 'دوّر ساعدك ببطء ليصبح كفك للأعلى ثم للأسفل.'),
      t('Move slowly through the whole range.', 'تحرّك ببطء عبر المدى الكامل.'),
    ],
    tips: [t('Your elbow stays still; only the wrist moves.', 'المرفق ثابت؛ فقط المعصم يتحرك.'), t('Hold closer to the weighted end to make it easier.', 'أمسك أقرب للطرف الثقيل لتسهيله.')],
  }),
  wristRoller: () => ({
    steps: [
      t('Hold the wrist roller with both hands, arms straight in front of you at shoulder height.', 'أمسك أداة لف المعصم بكلتا يديك والذراعان ممدودتان أمامك بمستوى الكتفين.'),
      t('Roll the handle with your wrists, one hand after the other, to wind the weight up.', 'لفّ المقبض بمعصميك، يدًا بعد يد، لتلفّ الحبل ويرتفع الوزن.'),
      t('When it reaches the top, unwind it slowly to lower it.', 'عندما يصل للأعلى، فكّ اللف ببطء لإنزاله.'),
    ],
    tips: [t('Keep your arms up and still; only the wrists work.', 'أبقِ ذراعيك مرفوعتين وثابتتين؛ فقط المعصمان يعملان.')],
  }),
  skullCrusher: (o, e) => ({
    steps: [
      t(`Lie on a flat bench holding ${e.en} straight above your chest.`, `استلقِ على مقعد مستوٍ ممسكًا ${e.ar} فوق صدرك مباشرة.`),
      t('Tilt your upper arms back slightly toward your head and keep them there.', 'أمِل أعلى ذراعيك للخلف قليلًا باتجاه رأسك وثبّتهما.'),
      t(o.jm ? 'Bend your elbows and bring the bar down toward your chin while letting your elbows move forward a little.' : 'Bend only at the elbows to lower the weight to just behind your head.', o.jm ? 'اثنِ مرفقيك وأنزل البار نحو ذقنك مع ترك المرفقين يتقدمان قليلًا.' : 'اثنِ المرفقين فقط لإنزال الوزن خلف رأسك مباشرة.'),
      t('Straighten your arms back to the start.', 'افرد ذراعيك للعودة إلى البداية.'),
    ],
    tips: [o.jm ? t('Keep it light while you learn it.', 'استخدم وزنًا خفيفًا أثناء التعلّم.') : C.elbowsStill, t('Keep your elbows pointing up, not flaring out.', 'أبقِ مرفقيك متجهين للأعلى ولا تفتحهما للخارج.'), C.slowDown],
  }),
  overheadExt: (o, e) => ({
    steps: [
      ...(e.kind === 'cable' ? [t('Attach a rope to a low cable, face away and hold it behind your head.', 'ثبّت حبلًا في الكابل السفلي، وأعطِ ظهرك للجهاز وأمسكه خلف رأسك.')] : e.kind === 'band' ? [t('Stand on one end of the band and hold the other end behind your head.', 'قف على طرف الحبل المطاطي وأمسك الطرف الآخر خلف رأسك.')]
        : [t(`${o.seated ? 'Sit tall' : 'Stand tall'} holding ${e.kind === 'dumbbell' && !e.one ? 'one dumbbell with both hands' : e.en} straight overhead.`, `${o.seated ? 'اجلس معتدلًا' : 'قف مستقيمًا'} ممسكًا ${e.kind === 'dumbbell' && !e.one ? 'دمبلًا واحدًا بكلتا يديك' : e.ar} فوق رأسك مباشرة.`)]),
      t('Keep your elbows pointing up and close to your head.', 'أبقِ مرفقيك متجهين للأعلى وقريبين من رأسك.'),
      t('Bend your elbows to lower the weight behind your head until you feel a stretch.', 'اثنِ مرفقيك لإنزال الوزن خلف رأسك حتى تشعر بالتمدد.'),
      t('Straighten your arms back up.', 'افرد ذراعيك للأعلى من جديد.'),
    ],
    tips: [C.elbowsStill, C.brace, ...(e.one ? [C.sides] : [])],
  }),
  triKickback: (_o, e) => ({
    steps: [
      ...(e.kind === 'cable' ? [t('Set the cable low, hold the end (no handle) and step back.', 'اضبط الكابل في الأسفل، وأمسك طرفه (دون مقبض) وتراجع خطوة.')] : grip(e, t('low in front of you', 'في الأسفل أمامك'))),
      t('Hinge forward until your chest is nearly parallel to the floor.', 'انحنِ للأمام حتى يصبح صدرك شبه موازٍ للأرض.'),
      t('Pull your upper arm up so it is level with your back, elbow bent at 90°.', 'ارفع أعلى ذراعك ليصبح بمستوى ظهرك، والمرفق مثني 90 درجة.'),
      t('Straighten your arm behind you, then bend it back to 90°.', 'افرد ذراعك للخلف، ثم أعد ثنيها إلى 90 درجة.'),
    ],
    tips: [C.elbowsStill, C.squeeze, C.sides],
  }),
  pushdown: (o, e) => ({
    steps: [
      o.band ? t('Anchor the band high and hold the ends.', 'ثبّت الحبل المطاطي عاليًا وأمسك طرفيه.') : t(`Attach a ${o.rope ? 'rope' : 'bar'} to the high pulley and hold it${e.one ? ' with one hand' : ''}.`, `ثبّت ${o.rope ? 'حبلًا' : 'بارًا'} في البكرة العليا وأمسكه${e.one ? ' بيد واحدة' : ''}.`),
      t('Stand tall, lean forward very slightly and pin your elbows to your sides.', 'قف مستقيمًا، وامِل للأمام قليلًا جدًا، وثبّت مرفقيك بجانبيك.'),
      t(`Push down until your arms are straight${o.rope ? ', spreading the rope ends apart at the bottom' : ''}.`, `ادفع للأسفل حتى تستقيم ذراعاك${o.rope ? '، مع فتح طرفي الحبل في الأسفل' : ''}.`),
      t('Let your forearms come back up to about chest height.', 'اترك ساعديك يعودان للأعلى حتى مستوى الصدر تقريبًا.'),
    ],
    tips: [C.elbowsStill, t('Do not lean over the weight to push it down.', 'لا تنحنِ فوق الوزن لدفعه.'), C.breathePush],
  }),
  machineTriExt: () => ({
    steps: [
      t('Adjust the seat so your elbows sit on the pad in line with the machine pivot.', 'اضبط المقعد ليكون مرفقاك على الوسادة بمحاذاة محور الجهاز.'),
      t('Grip the handles with your elbows bent.', 'أمسك المقبضين والمرفقان مثنيان.'),
      t('Straighten your arms fully.', 'افرد ذراعيك تمامًا.'),
      t('Return slowly.', 'ارجع ببطء.'),
    ],
    tips: [C.elbowsStill, C.slowDown],
  }),
  tatePress: () => ({
    steps: [
      t('Lie on a flat bench with dumbbells above your chest, palms facing your feet.', 'استلقِ على مقعد مستوٍ والدمبلز فوق صدرك، والكفان باتجاه قدميك.'),
      t('Keep your upper arms still and bend your elbows out to the sides so the dumbbells come down to touch your chest.', 'أبقِ أعلى ذراعيك ثابتًا واثنِ مرفقيك للجانبين لتنزل الدمبلز وتلمس صدرك.'),
      t('Press back up by straightening your elbows.', 'ادفع للأعلى بفرد المرفقين.'),
    ],
    tips: [t('Use light dumbbells.', 'استخدم دمبلز خفيفة.'), C.elbowsStill],
  }),

  // ===== GRIP =====
  hang: (o) => ({
    steps: [
      t(o.towel ? 'Hang two towels over a pull-up bar and grip one in each hand.' : 'Grab a pull-up bar with both hands, shoulder-width apart.', o.towel ? 'علّق منشفتين على بار العقلة وأمسك كل واحدة بيد.' : 'أمسك بار العقلة بكلتا يديك بعرض الكتفين.'),
      t('Lift your feet and hang with straight arms.', 'ارفع قدميك وتعلّق بذراعين مستقيمتين.'),
      t('Keep your shoulders slightly pulled down, not shrugged to your ears.', 'أبقِ كتفيك منخفضين قليلًا، لا مرفوعين نحو أذنيك.'),
      t('Hold for time, then step down.', 'اثبت لفترة زمنية، ثم انزل.'),
    ],
    tips: [t('Build up the time slowly, 10 seconds at a time.', 'زِد المدة تدريجيًا، 10 ثوانٍ في كل مرة.'), C.hold],
  }),
  carry: (o, e) => ({
    steps: [
      t(`Pick up ${has(e) ? e.en : 'the weights'}${o.one ? ' in one hand only' : ', one in each hand'} using a proper deadlift.`, `ارفع ${has(e) ? e.ar : 'الأوزان'}${o.one ? ' بيد واحدة فقط' : '، واحدًا بكل يد'} بطريقة الرفعة المميتة الصحيحة.`),
      t('Stand tall, shoulders back, stomach braced.', 'قف مستقيمًا، والكتفان للخلف، والبطن مشدود.'),
      t('Walk with short, controlled steps for the set distance or time.', 'امشِ بخطوات قصيرة ومتحكم بها للمسافة أو المدة المحددة.'),
      t('Put the weights down the same way you picked them up.', 'أنزل الأوزان بنفس الطريقة التي رفعتها بها.'),
    ],
    tips: [o.one ? t('Do not lean toward the weight; stay perfectly upright.', 'لا تمِل باتجاه الوزن؛ ابقَ معتدلًا تمامًا.') : C.shouldersDown, C.brace],
  }),
  staticHold: (o, e) => ({
    steps: o.gripper ? [
      t(e.kind === 'band' ? 'Place the band around your fingertips and thumb.' : 'Hold the gripper in one hand with the handles in your palm and fingers.', e.kind === 'band' ? 'ضع الحبل المطاطي حول أطراف أصابعك والإبهام.' : 'أمسك أداة تقوية القبضة بيد واحدة والمقبضان في كفك وأصابعك.'),
      t(e.kind === 'band' ? 'Spread your fingers open against the band as wide as you can.' : 'Squeeze the handles together as hard as you can.', e.kind === 'band' ? 'افتح أصابعك ضد الحبل لأقصى حد.' : 'اضغط المقبضين معًا بأقصى قوتك.'),
      t('Hold for a second, then release slowly.', 'اثبت ثانية، ثم أرخِ ببطء.'),
    ] : [
      t(`Hold ${has(e) ? e.en : 'the weight'}${o.forward ? ' in front of you with your elbow bent at 90°' : ' at your side with a straight arm'}.`, `أمسك ${has(e) ? e.ar : 'الوزن'}${o.forward ? ' أمامك والمرفق مثني 90 درجة' : ' بجانبك والذراع مستقيمة'}.`),
      t(e.kind === 'plate' ? 'Pinch the plates together between your fingers and thumb.' : 'Keep your wrist straight and grip hard.', e.kind === 'plate' ? 'اضغط الأقراص معًا بين أصابعك وإبهامك.' : 'أبقِ معصمك مستقيمًا وأمسك بقوة.'),
      t('Hold for time, then put it down with control.', 'اثبت لفترة زمنية، ثم أنزله بتحكّم.'),
    ],
    tips: [C.hold, C.sides],
  }),
};

