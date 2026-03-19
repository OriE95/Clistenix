/* =============================================
   CALISTHENICS TRACKER — APP LOGIC
   ============================================= */

// ── Default Workout Plan (fallback) ──────────
const DEFAULT_PLANS = {
  A: {
    name: 'אימון A',
    exercises: [
      { name: 'מתח אוסטרלי',               sets: 4, target: '5–15', unit: 'חזרות', restSec: 150, type: 'reps'    },
      { name: 'שכיבות סמיכה על הברכיים',    sets: 4, target: '5–15', unit: 'חזרות', restSec: 150, type: 'reps'    },
      { name: 'תלייה מתה',                  sets: 2, target: '10–30', unit: 'שניות', restSec: 120, type: 'seconds' },
      { name: 'תמיכה על מקבילים',           sets: 3, target: '10–30', unit: 'שניות', restSec: 120, type: 'seconds' },
    ]
  },
  B: {
    name: 'אימון B',
    exercises: [
      { name: 'מתח אוסטרלי רחב',            sets: 3, target: '5–15', unit: 'חזרות', restSec: 150, type: 'reps'    },
      { name: 'שכיבות סמיכה רגילות',        sets: 3, target: '5–10', unit: 'חזרות', restSec: 180, type: 'reps'    },
      { name: 'תלייה מתה',                  sets: 1, target: '10–30', unit: 'שניות', restSec: 120, type: 'seconds' },
      { name: 'תמיכה על מקבילים',           sets: 3, target: '10–30', unit: 'שניות', restSec: 120, type: 'seconds' },
    ]
  },
  legs: {
    name: 'אימון רגליים',
    exercises: [
      { name: 'חצי סקוואט',                 sets: 3, target: 'עד 20', unit: 'חזרות',   restSec: 90, type: 'reps' },
      { name: 'סטפ אפ',                      sets: 3, target: '6–10',  unit: 'לכל רגל', restSec: 90, type: 'reps' },
      { name: 'פלור טאפס',                  sets: 3, target: 'עד 15', unit: 'חזרות',   restSec: 60, type: 'reps' },
      { name: 'הרחקות ירך בעמידה',          sets: 2, target: '6–10',  unit: 'לכל רגל', restSec: 60, type: 'reps' },
      { name: 'הרמות תאומים עם הקיר',       sets: 3, target: 'עד 20', unit: 'חזרות',   restSec: 60, type: 'reps' },
    ]
  }
};

// Default links matching the built-in plan (אורי אשלי — שלב הבסיס, רמה 0)
const DEFAULT_LINKS = {
  general: {
    explain:   'https://eliyabonen.com/explain/',
    nutrition: 'https://eliyabonen.com/nutrition/',
    equipment: 'https://theroadto.co.il/discount/bonentrt',
  },
  warmup: {
    upper: 'https://www.youtube.com/watch?v=El-gmBoU8dg',
    lower: 'https://www.youtube.com/watch?v=hMyYevAin0I',
  },
  exercises: {
    'מתח אוסטרלי':              'https://www.youtube.com/watch?v=kfZ1kS4IN-w&list=PL0mBYTE1vsebJ-HvXF_cBZRVVR4ENi_tF&index=1',
    'מתח אוסטרלי רחב':         'https://www.youtube.com/watch?v=IQWwkd6KXig&list=PL0mBYTE1vseY3YcLol8_5cajlYdgs6XmD&index=1',
    'שכיבות סמיכה על הברכיים': 'https://www.youtube.com/watch?v=GTaeCv21H84&list=PL0mBYTE1vsebJ-HvXF_cBZRVVR4ENi_tF&index=2',
    'שכיבות סמיכה רגילות':     'https://www.youtube.com/watch?v=ngk_b9hhXv4&list=PL0mBYTE1vseY3YcLol8_5cajlYdgs6XmD&index=2',
    'תלייה מתה':                'https://www.youtube.com/watch?v=mtVKbwCYXJ8&list=PL0mBYTE1vsebJ-HvXF_cBZRVVR4ENi_tF&index=3',
    'תליה מתה':                 'https://www.youtube.com/watch?v=mtVKbwCYXJ8&list=PL0mBYTE1vsebJ-HvXF_cBZRVVR4ENi_tF&index=3',
    'תמיכה על מקבילים':        'https://www.youtube.com/watch?v=E2D9qInlYXA&list=PL0mBYTE1vsebJ-HvXF_cBZRVVR4ENi_tF&index=4',
    'חצי סקוואט':              'https://www.youtube.com/watch?v=_aqbCBsP0dA&list=PL0mBYTE1vseb3aNRh3XRfMNre6ezzvGzV&index=1',
    'סטפ אפ':                  'https://www.youtube.com/watch?v=UHK6R_YQ7T4&list=PL0mBYTE1vseb3aNRh3XRfMNre6ezzvGzV&index=2',
    'פלור טאפס':               'https://www.youtube.com/watch?v=OQiAmalrPj8&list=PL0mBYTE1vseb3aNRh3XRfMNre6ezzvGzV&index=3',
    'הרחקות ירך בעמידה':      'https://www.youtube.com/watch?v=Ph608-d1fXo&list=PL0mBYTE1vseb3aNRh3XRfMNre6ezzvGzV&index=4',
    'הרמות תאומים':            'https://www.youtube.com/watch?v=9s23Ja-Jc9Y&list=PL0mBYTE1vseb3aNRh3XRfMNre6ezzvGzV&index=5',
  },
  challenge: 'https://www.youtube.com/watch?v=5VyccBg6VMk&list=PL0mBYTE1vseZpjcWk8SS3fAlgiW0VKfzK&index=1',
  referral:  'https://bit.ly/4euKJCl',
};

// Active plan — loaded from localStorage or set by PDF parser
let PLANS = DEFAULT_PLANS;
let LINKS = {};

const DAYS_SHORT = ['א','ב','ג','ד','ה','ו','ש'];
const DAYS_FULL  = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const MONTHS     = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

// ── Motivational Quotes (daily rotation) ────
const MOTIVATION_QUOTES = [
  '{name}, כל חזרה שאתה מסיים בונה את הגוף שאתה רוצה.',
  '{name}, כוח אמיתי נבנה יום אחד בכל פעם. היום הוא היום שלך.',
  '{name}, לא צריך להיות מושלם — צריך להיות עקבי.',
  '{name}, הגוף שלך מסוגל ליותר ממה שהראש שלך חושב.',
  '{name}, כל אימון שאתה מסיים הוא צעד קדימה שאף אחד לא יכול לקחת ממך.',
  '{name}, ההתחלה תמיד הכי קשה — אבל אתה כבר כאן.',
  '{name}, שריר לא נבנה בלילה אחד, אבל כן מתחיל לבנות מהיום הראשון.',
  '{name}, כל סט שמרגיש קשה הוא בדיוק הסט שעושה שינוי.',
  '{name}, המטרה לא מחכה — גם אתה לא צריך לחכות.',
  '{name}, עקביות היא הסוד. לא שלמות.',
  '{name}, כל אימון מקרב אותך לגירסה הטובה ביותר שלך.',
  '{name}, רגעי הספק הם בדיוק הרגעים שמפרידים בין מי שמצליח למי שלא.',
  '{name}, אתה לא מתאמן כדי להרשים אחרים — אתה מתאמן להפתיע את עצמך.',
  '{name}, כאב של אימון הוא זמני. הגאווה על התוצאה נמשכת.',
  '{name}, מי שלא מוותר — מנצח. פשוט וברור.',
  '{name}, הגוף שלך הוא הכלי החשוב ביותר שיש לך. תטפל בו.',
  '{name}, כל חזרה עם כוונה שווה יותר ממאה חזרות ממוכנות.',
  '{name}, פוטנציאל האדם מתגלה דווקא כשהוא רוצה להפסיק ולא מפסיק.',
  '{name}, האימון הכי חשוב הוא זה שאתה לא רוצה לבצע — ואתה בא בכל זאת.',
  '{name}, שינוי אמיתי מתחיל ברגע שאתה מחליט שהיום הוא היום.',
];

function getDailyQuote(name) {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const dayOfYear = Math.floor((new Date() - start) / 86400000);
  const quote = MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length];
  return quote.replace('{name}', name || 'מתאמן');
}

// ── Voice / TTS ──────────────────────────────
function speakHebrew(text) {
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'he-IL';
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  } catch (e) {}
}

// ── Parse target max seconds from strings like '10–30' ──
function parseTargetMax(target) {
  const nums = String(target).match(/\d+/g);
  if (!nums) return 30;
  return parseInt(nums[nums.length - 1]);
}

// ── State ───────────────────────────────────
const state = {
  tab:            'home',
  workouts:       [],   // saved workouts
  measurements:   [],   // saved measurements
  active:         null, // in-progress workout session
  timer:          null, // { interval, secs, onComplete }
  exTimer:        null, // { interval, secs, total, running } — exercise hold timer
  selType:        'A',  // selected workout type in selector
  charts:         {},   // Chart.js instances
  progressCharts: {},   // Chart.js instances for exercise progress
  meta:           { name: '', stage: '' }, // trainee info from PDF
  progressTab:    false, // true = show progress charts in history
  // ── Nutrition ──────────────────────────────
  nutritionTargets: null, // { cal, protein, carbs, fat }
  foods:            [],   // food product list
  foodLog:          [],   // all-time food log
  nutritionSubTab:  'today',
  showAddFood:      false,
  showAddProduct:   false,
  addFoodMode:      'product', // 'product' | 'manual'
};

// ── Storage ─────────────────────────────────
function save() {
  localStorage.setItem('cali_workouts',      JSON.stringify(state.workouts));
  localStorage.setItem('cali_measurements',  JSON.stringify(state.measurements));
}

function load() {
  const w  = localStorage.getItem('cali_workouts');
  const m  = localStorage.getItem('cali_measurements');
  const p  = localStorage.getItem('cali_plan');
  const l  = localStorage.getItem('cali_links');
  const mt = localStorage.getItem('cali_meta');
  const nt = localStorage.getItem('cali_nutrition_targets');
  const nf = localStorage.getItem('cali_foods');
  const nl = localStorage.getItem('cali_food_log');
  state.workouts          = w  ? JSON.parse(w)  : [];
  state.measurements      = m  ? JSON.parse(m)  : [];
  state.nutritionTargets  = nt ? JSON.parse(nt) : null;
  state.foods             = nf ? JSON.parse(nf) : [];
  state.foodLog           = nl ? JSON.parse(nl) : [];
  if (p) PLANS = JSON.parse(p);
  LINKS = l ? JSON.parse(l) : {};
  if (mt) state.meta = JSON.parse(mt);
}

function saveNutrition() {
  localStorage.setItem('cali_nutrition_targets', JSON.stringify(state.nutritionTargets));
  localStorage.setItem('cali_foods',             JSON.stringify(state.foods));
  localStorage.setItem('cali_food_log',          JSON.stringify(state.foodLog));
}

function saveMeta(name, stage) {
  state.meta = { name: name || '', stage: stage || '' };
  localStorage.setItem('cali_meta', JSON.stringify(state.meta));
}

function savePlan(plan) {
  PLANS = plan;
  localStorage.setItem('cali_plan', JSON.stringify(plan));
}

function saveLinks(links) {
  LINKS = links || {};
  localStorage.setItem('cali_links', JSON.stringify(LINKS));
}

// Safe URL opener — only allows http/https
function openLink(url) {
  if (!url || !/^https?:\/\//i.test(url)) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Lookup an exercise video URL, tolerating minor spelling variants
function getExLink(name) {
  if (!LINKS.exercises) return null;
  if (LINKS.exercises[name]) return LINKS.exercises[name];
  const norm = name.replace(/\s+/g, '');
  for (const [k, v] of Object.entries(LINKS.exercises)) {
    if (k.replace(/\s+/g, '') === norm) return v;
  }
  return null;
}

function hasSavedPlan() {
  return !!localStorage.getItem('cali_plan');
}

// ── Date Helpers ─────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

function fmtDate(ds) {
  const d = new Date(ds);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Business Logic ───────────────────────────
function nextType() {
  const main = state.workouts.filter(w => w.type === 'A' || w.type === 'B');
  if (!main.length) return 'A';
  return main[main.length - 1].type === 'A' ? 'B' : 'A';
}

function weekWorkouts() {
  const now = new Date();
  const sun = new Date(now);
  sun.setDate(now.getDate() - now.getDay());
  sun.setHours(0, 0, 0, 0);
  const sat = new Date(sun); sat.setDate(sun.getDate() + 7);
  return state.workouts.filter(w => {
    const d = new Date(w.date);
    return d >= sun && d < sat;
  });
}

function streak() {
  if (!state.workouts.length) return 0;
  const dates = new Set(state.workouts.map(w => w.date));
  const today = new Date(); today.setHours(0,0,0,0);
  const yd = new Date(today); yd.setDate(today.getDate() - 1);
  if (!dates.has(dateStr(today)) && !dates.has(dateStr(yd))) return 0;
  let s = 0, cur = new Date(today);
  while (dates.has(dateStr(cur))) {
    s++;
    cur.setDate(cur.getDate() - 1);
  }
  return s;
}

// ── Router ───────────────────────────────────
function goTo(tab) {
  state.tab = tab;
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));
  render(tab);
}

function render(tab) {
  const main = document.getElementById('main-content');
  stopTimer();
  // Stop countdown if navigating away from workout
  if (tab !== 'workout' && state.active && state.active.countdownInterval) {
    clearInterval(state.active.countdownInterval);
    state.active.countdownInterval = null;
  }
  // Reset transient nutrition UI when leaving the tab
  if (tab !== 'nutrition') {
    state.showAddFood    = false;
    state.showAddProduct = false;
  }
  switch (tab) {
    case 'home':         main.innerHTML = viewHome();         break;
    case 'workout':      main.innerHTML = viewWorkout();      bindWorkout(); break;
    case 'measurements': main.innerHTML = viewMeasurements(); bindMeasurements(); renderCharts(); break;
    case 'history':
      main.innerHTML = viewHistory();
      if (state.progressTab) renderProgressCharts();
      break;
    case 'nutrition':    main.innerHTML = viewNutrition();    bindNutrition(); break;
  }
  main.scrollTop = 0;
}

// ══════════════════════════════════════════════
//  HOME VIEW
// ══════════════════════════════════════════════
function viewHome() {
  const ww     = weekWorkouts();
  const total  = state.workouts.length;
  const str    = streak();
  const nt     = nextType();
  const today  = new Date();
  const tdStr  = todayStr();
  const tdWkt  = state.workouts.find(w => w.date === tdStr);

  // Hero
  let heroHTML;
  if (tdWkt) {
    heroHTML = `
      <div class="hero-eyebrow">אימון של היום</div>
      <div class="hero-title">${tdWkt.type === 'legs' ? 'רגליים' : 'אימון ' + tdWkt.type}</div>
      <div class="hero-sub">הושלם היום — מצוין!</div>
      <span class="hero-tag done">✓ הושלם</span>`;
  } else if (ww.filter(w => w.type === 'A' || w.type === 'B').length >= 3) {
    heroHTML = `
      <div class="hero-eyebrow">שלב הבסיס | רמה 0</div>
      <div class="hero-title">מנוחה</div>
      <div class="hero-sub">3 אימונים הושלמו השבוע. תנוח.</div>
      <span class="hero-tag rest">😴 יום מנוחה</span>`;
  } else {
    heroHTML = `
      <div class="hero-eyebrow">האימון הבא</div>
      <div class="hero-title">אימון ${nt}</div>
      <div class="hero-sub">${nt === 'A' ? 'מתח אוסטרלי · שכיבות · תלייה · מקבילים' : 'מתח רחב · שכיבות · תלייה · מקבילים'}</div>
      <button class="hero-btn" onclick="goToWorkoutTab('${nt}')">התחל עכשיו →</button>`;
  }

  // Weekly grid
  const sun = new Date(today);
  sun.setDate(today.getDate() - today.getDay());
  const cols = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun); d.setDate(sun.getDate() + i);
    const ds  = dateStr(d);
    const wkt = state.workouts.find(w => w.date === ds);
    const isT = ds === tdStr;
    let cls = 'week-dot';
    let content = '';
    if (wkt) {
      cls += ` done-${wkt.type.toLowerCase()}`;
      content = wkt.type === 'legs' ? 'ר' : wkt.type;
    } else if (isT) cls += ' today';
    return `<div class="week-col">
      <span class="week-lbl">${DAYS_SHORT[i]}</span>
      <div class="${cls}">${content}</div>
    </div>`;
  }).join('');

  // Last measurements
  let measHTML = '';
  if (state.measurements.length > 0) {
    const lm = state.measurements[state.measurements.length - 1];
    const items = [
      { key: 'weight', lbl: 'משקל', unit: 'ק"ג' },
      { key: 'belly',  lbl: 'בטן',  unit: 'ס"מ' },
      { key: 'arm',    lbl: 'זרוע', unit: 'ס"מ' },
      { key: 'thigh',  lbl: 'ירך',  unit: 'ס"מ' },
    ].filter(x => lm[x.key]).map(x => `
      <div class="stat-card">
        <div class="stat-val" style="font-size:22px">${lm[x.key]}</div>
        <div class="stat-lbl">${x.lbl}</div>
      </div>`).join('');
    measHTML = `
      <div class="sec-label">מדידה אחרונה — ${fmtDate(lm.date)}</div>
      <div class="meas-row">${items}</div>`;
  }

  // General links section (shown when links are available)
  const gl = LINKS.general || {};
  const linksHTML = (gl.explain || gl.nutrition || gl.equipment || LINKS.challenge) ? `
    <div class="sec-label">מאגר חובה</div>
    <div class="home-links">
      ${gl.explain   ? `<button class="home-link-btn" onclick="openLink('${gl.explain}')">📺 הסבר על שלב הבסיס</button>` : ''}
      ${gl.nutrition ? `<button class="home-link-btn" onclick="openLink('${gl.nutrition}')">🥗 הסבר על תזונה</button>` : ''}
      ${gl.equipment ? `<button class="home-link-btn" onclick="openLink('${gl.equipment}')">🛒 ציוד קליסטניקס</button>` : ''}
      ${LINKS.challenge ? `<button class="home-link-btn" onclick="openLink('${LINKS.challenge}')">⚔ סרטון אתגר מעבר #0</button>` : ''}
    </div>` : '';

  // Stage name + daily quote banner
  const metaBanner = (state.meta.stage || state.meta.name) ? `
    <div class="plan-banner">
      ${state.meta.stage ? `<div class="plan-stage">${state.meta.stage}</div>` : ''}
      ${state.meta.name  ? `<div class="plan-quote">${getDailyQuote(state.meta.name)}</div>` : ''}
    </div>` : '';

  return `<div class="view">
    <div class="hero">${heroHTML}</div>
    ${metaBanner}
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-val">${total}</div>
        <div class="stat-lbl">אימונים</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${str}</div>
        <div class="stat-lbl">רצף ימים</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${ww.length}</div>
        <div class="stat-lbl">השבוע</div>
      </div>
    </div>
    <div class="sec-label">השבוע הנוכחי</div>
    <div class="week-grid">${cols}</div>
    ${linksHTML}
    ${measHTML}
    ${(state.workouts.length || state.measurements.length) ? `
    <button class="export-btn" onclick="exportToCSV()">
      📊 ייצוא נתונים לאקסל
    </button>` : ''}
  </div>`;
}

function goToWorkoutTab(type) {
  state.selType = type;
  goTo('workout');
}

// ══════════════════════════════════════════════
//  WORKOUT VIEW
// ══════════════════════════════════════════════
function viewWorkout() {
  if (state.active) return viewActiveWorkout();
  return viewWorkoutSelector();
}

function viewWorkoutSelector() {
  const tdWkt = state.workouts.find(w => w.date === todayStr());
  const nt    = nextType();

  const typeBtns = ['A', 'B', 'legs'].map(t => {
    const icons = { A: '↑', B: '⊕', legs: '↓' };
    const names = { A: 'אימון A', B: 'אימון B', legs: 'רגליים' };
    const descs = { A: 'פלג עליון', B: 'פלג עליון', legs: 'בונוס' };
    const rec   = t === nt ? '⭐ מומלץ' : descs[t];
    return `<button class="type-btn ${state.selType === t ? 'active' : ''}" onclick="selType('${t}')">
      <span class="type-icon">${icons[t]}</span>
      <span class="type-name">${names[t]}</span>
      <span class="type-desc">${rec}</span>
    </button>`;
  }).join('');

  const notice = tdWkt ? `<div class="notice">
    ✓ כבר אימנת היום — <strong>${tdWkt.type === 'legs' ? 'רגליים' : 'אימון ' + tdWkt.type}</strong>
  </div>` : '';

  const preview = PLANS[state.selType].exercises.map(ex => {
    const vUrl = getExLink(ex.name);
    return `<div class="ex-card" style="opacity:.75">
      <div class="ex-head">
        <div>
          <div class="ex-name">${ex.name}${vUrl ? `<button class="ex-link-btn" onclick="openLink('${vUrl}')">▶</button>` : ''}</div>
          <div class="ex-meta">${ex.sets} סטים × ${ex.target} ${ex.unit}</div>
        </div>
        <div class="ex-badge">${ex.sets}×</div>
      </div>
    </div>`;
  }).join('');

  return `<div class="view">
    <div class="sec-label">בחר אימון</div>
    <div class="type-selector">${typeBtns}</div>
    ${notice}
    <div id="ex-preview">${preview}</div>
    <button class="big-btn big-btn-gold" onclick="startWorkout()">
      התחל ${state.selType === 'legs' ? 'אימון רגליים' : 'אימון ' + state.selType}
    </button>
  </div>`;
}

function selType(t) {
  state.selType = t;
  document.querySelectorAll('.type-btn').forEach((b, i) =>
    b.classList.toggle('active', ['A','B','legs'][i] === t));
  document.getElementById('ex-preview').innerHTML =
    PLANS[t].exercises.map(ex => {
      const vUrl = getExLink(ex.name);
      return `<div class="ex-card" style="opacity:.75">
        <div class="ex-head">
          <div>
            <div class="ex-name">${ex.name}${vUrl ? `<button class="ex-link-btn" onclick="openLink('${vUrl}')">▶</button>` : ''}</div>
            <div class="ex-meta">${ex.sets} סטים × ${ex.target} ${ex.unit}</div>
          </div>
          <div class="ex-badge">${ex.sets}×</div>
        </div>
      </div>`;
    }).join('');
  document.querySelector('.big-btn-gold').textContent =
    `התחל ${t === 'legs' ? 'אימון רגליים' : 'אימון ' + t}`;
}

function startWorkout() {
  const plan = PLANS[state.selType];
  state.active = {
    type:                     state.selType,
    startTime:                Date.now(),
    exercises:                plan.exercises.map(ex => ({
      name:   ex.name,
      unit:   ex.unit,
      type:   ex.type,
      rest:   ex.restSec || ex.rest || 120,
      target: ex.target,
      sets:   Array.from({ length: ex.sets }, () => ({ value: '', done: false }))
    })),
    exIdx:                    0,
    phase:                    'countdown',
    countdownSecs:            20,
    countdownInterval:        null,
    resting:                  false,   // rest between sets
    restingBetweenExercises:  false,   // rest between exercises
    lastSetAnimation:         false,
  };
  render('workout');
}

function viewActiveWorkout() {
  if (state.active.phase === 'countdown') return viewCountdownScreen();
  return viewCurrentExercise();
}

function viewCountdownScreen() {
  const plan    = PLANS[state.active.type];
  const firstEx = state.active.exercises[0];
  const wType   = state.active.type;
  const warmupUrl = wType === 'legs'
    ? (LINKS.warmup?.lower || (DEFAULT_LINKS.warmup && DEFAULT_LINKS.warmup.lower))
    : (LINKS.warmup?.upper || (DEFAULT_LINKS.warmup && DEFAULT_LINKS.warmup.upper));
  const warmupBtn = warmupUrl
    ? `<button class="warmup-btn" onclick="openLink('${warmupUrl}')">🔥 סרטון חימום לפני האימון</button>`
    : '';
  return `<div class="view countdown-view">
    <button class="back-to-sel-btn" onclick="backToSelector()">← חזור לבחירה</button>
    ${warmupBtn}
    <div class="countdown-content">
      <div class="countdown-plan">${plan.name}</div>
      <div class="countdown-title">מתחיל בעוד</div>
      <div class="countdown-number" id="countdown-num">${state.active.countdownSecs}</div>
      <div class="countdown-first-ex">${firstEx.name}</div>
      <button class="timer-btn skip" style="margin-top:24px" onclick="skipCountdown()">דלג ←</button>
    </div>
  </div>`;
}

// Build the SVG arm progress ring
function buildArmIcon(doneSets, totalSets, flexAnim) {
  const r = 27;
  const circ = +(2 * Math.PI * r).toFixed(1); // ~169.6
  const offset = +(circ * (1 - doneSets / totalSets)).toFixed(1);
  return `<div class="arm-progress">
    <svg class="arm-ring" viewBox="0 0 64 64" style="transform:rotate(-90deg)">
      <circle class="arm-ring-bg" cx="32" cy="32" r="${r}"/>
      <circle class="arm-ring-fill" cx="32" cy="32" r="${r}"
        style="stroke-dasharray:${circ};stroke-dashoffset:${offset}"/>
    </svg>
    <div class="arm-emoji${flexAnim ? ' arm-flex' : ''}">💪</div>
  </div>`;
}

function viewCurrentExercise() {
  const exs     = state.active.exercises;
  const exIdx   = state.active.exIdx;
  const ex      = exs[exIdx];
  const totalSets  = ex.sets.length;
  const doneSets   = ex.sets.filter(s => s.done).length;
  const isLastEx   = exIdx === exs.length - 1;
  const armHTML    = buildArmIcon(doneSets, totalSets, state.active.lastSetAnimation);
  const vUrl       = getExLink(ex.name);

  const navBar = `<div class="ex-nav">
    <button class="back-to-sel-btn" onclick="backToSelector()">← חזור</button>
    <span class="ex-progress-lbl">${exIdx + 1} / ${exs.length}</span>
    ${armHTML}
  </div>`;

  // ── Phase: rest between SETS ──
  if (state.active.resting) {
    return `<div class="view exercise-view">
      ${navBar}
      <div class="ex-focused-card" style="opacity:.6">
        <div class="ex-focused-name">${ex.name}</div>
        <div class="ex-focused-meta">${totalSets} סטים × ${ex.target} ${ex.unit}</div>
      </div>
      <div class="rest-focused">
        <div class="timer-lbl">מנוחה</div>
        <div class="timer-val" id="timer-val">
          ${state.timer ? fmtSecs(state.timer.secs) : '00:00'}
        </div>
        <div class="rest-next-lbl">הכן עצמך לסט ${doneSets + 1} מתוך ${totalSets}</div>
        <div class="timer-btns">
          <button class="timer-btn" onclick="addTime(30)">+30 שניות</button>
          <button class="timer-btn skip" onclick="skipTimerToSet()">דלג ←</button>
        </div>
      </div>
    </div>`;
  }

  // ── Phase: rest between EXERCISES (last set done, not last exercise) ──
  if (state.active.restingBetweenExercises && !isLastEx) {
    const nextEx = exs[exIdx + 1];
    return `<div class="view exercise-view">
      ${navBar}
      <div class="ex-focused-card done-card">
        <div class="ex-focused-name">${ex.name}</div>
        <div class="ex-focused-done-label">✓ הושלם!</div>
      </div>
      <div class="rest-focused">
        <div class="timer-lbl">מנוחה · הכן עצמך ל:</div>
        <div class="rest-next-lbl" style="font-size:16px;font-weight:700;color:var(--t);margin-bottom:4px">${nextEx.name}</div>
        <div class="timer-val" id="timer-val">
          ${state.timer ? fmtSecs(state.timer.secs) : '00:00'}
        </div>
        <div class="timer-btns">
          <button class="timer-btn" onclick="addTime(30)">+30 שניות</button>
          <button class="timer-btn skip" onclick="skipToNextExercise()">התרגיל הבא ←</button>
        </div>
      </div>
    </div>`;
  }

  // ── Phase: last exercise all sets done → finish ──
  if (doneSets === totalSets && isLastEx) {
    return `<div class="view exercise-view">
      ${navBar}
      <div class="ex-focused-card done-card">
        <div class="ex-focused-name">${ex.name}</div>
        <div class="ex-focused-done-label">✓ הושלם!</div>
      </div>
      <button class="big-btn big-btn-green" onclick="completeWorkout()" style="margin-top:auto">✓ סיום אימון</button>
    </div>`;
  }

  // ── Phase: active set input ──
  const setNum = doneSets + 1;
  const currentSetObj = ex.sets[doneSets];

  // Exercise hold-timer (for seconds-type exercises)
  let exTimerHTML = '';
  if (ex.type === 'seconds') {
    const targetSecs  = parseTargetMax(ex.target);
    const dispSecs    = state.exTimer ? state.exTimer.secs : targetSecs;
    const isRunning   = state.exTimer?.running;
    const isUrgent    = isRunning && dispSecs > 0 && dispSecs <= 5;
    exTimerHTML = `<div class="ex-timer-box">
      <div class="ex-timer-label">טיימר תרגיל · יעד: ${ex.target} ${ex.unit}</div>
      <div class="ex-timer-val${isUrgent ? ' ex-timer-urgent' : ''}" id="ex-timer-val">${fmtSecs(dispSecs)}</div>
      <div class="timer-btns" style="margin-top:8px">
        ${!isRunning
          ? `<button class="timer-btn skip" onclick="startExerciseTimer(${targetSecs})">▶ הפעל</button>`
          : `<button class="timer-btn" onclick="stopExerciseTimer()">⏸ עצור</button>`}
        <button class="timer-btn" onclick="resetExerciseTimer()">↺ אפס</button>
      </div>
    </div>`;
  }

  return `<div class="view exercise-view">
    ${navBar}
    <div class="ex-focused-card">
      <div class="ex-focused-name">${ex.name}${vUrl ? `<button class="ex-link-btn" onclick="openLink('${vUrl}')">▶</button>` : ''}</div>
      <div class="ex-focused-meta">${totalSets} סטים × ${ex.target} ${ex.unit}</div>
    </div>
    ${exTimerHTML}
    <div class="set-focus">
      <div class="set-focus-label">סט ${setNum} מתוך ${totalSets}</div>
      <div class="set-focus-row">
        <input class="set-focus-input" type="number" inputmode="numeric"
          id="set-input-focused"
          placeholder="${ex.type === 'seconds' ? 'שניות' : 'חזרות'}"
          value="${currentSetObj.value || ''}">
        <span class="set-focus-unit">${ex.unit}</span>
      </div>
    </div>
    <button class="big-btn set-complete-btn" onclick="completeCurrentSet()">
      סיום סט ${setNum}
    </button>
  </div>`;
}

function bindWorkout() {
  if (!state.active) return;
  if (state.active.phase === 'countdown' && !state.active.countdownInterval) {
    startCountdownTimer();
  }
  if (state.timer) {
    updateTimerDisplay();
  }
}

function setVal(ei, si, v) {
  state.active.exercises[ei].sets[si].value = v;
}

function toggleSet(ei, si) {
  const set = state.active.exercises[ei].sets[si];
  set.done = !set.done;
  if (set.done) {
    const restSec = state.active.exercises[ei].rest;
    render('workout');
    startTimer(restSec);
  } else {
    render('workout');
  }
}

// ── New focused-workout helpers ──────────────

function startCountdownTimer() {
  if (state.active.countdownInterval) clearInterval(state.active.countdownInterval);
  state.active.countdownInterval = setInterval(() => {
    state.active.countdownSecs--;
    const el = document.getElementById('countdown-num');
    if (el) el.textContent = Math.max(0, state.active.countdownSecs);
    if (state.active.countdownSecs <= 0) {
      clearInterval(state.active.countdownInterval);
      state.active.countdownInterval = null;
      state.active.phase = 'workout';
      state.active.resting = false;
      render('workout');
    }
  }, 1000);
}

function skipCountdown() {
  if (state.active.countdownInterval) {
    clearInterval(state.active.countdownInterval);
    state.active.countdownInterval = null;
  }
  state.active.phase = 'workout';
  state.active.resting = false;
  render('workout');
}

function backToSelector() {
  const hasProgress = state.active && state.active.exercises &&
    state.active.exercises.some(ex => ex.sets.some(s => s.done));
  if (hasProgress && !confirm('לחזור לבחירת האימון? ההתקדמות תאבד.')) return;
  if (state.active && state.active.countdownInterval) {
    clearInterval(state.active.countdownInterval);
  }
  state.active = null;
  stopTimer();
  render('workout');
}

function completeCurrentSet() {
  const ex = state.active.exercises[state.active.exIdx];
  const doneSets = ex.sets.filter(s => s.done).length;
  if (doneSets >= ex.sets.length) return;

  const inputEl = document.getElementById('set-input-focused');
  const value = inputEl ? inputEl.value.trim() : '';

  ex.sets[doneSets].value = value;
  ex.sets[doneSets].done  = true;

  // Stop exercise hold-timer
  stopExerciseTimer();

  const newDone  = ex.sets.filter(s => s.done).length;
  const isLastSet = newDone === ex.sets.length;
  const isLastEx  = state.active.exIdx === state.active.exercises.length - 1;

  if (isLastSet) {
    state.active.lastSetAnimation = true;
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);
    setTimeout(() => { if (state.active) state.active.lastSetAnimation = false; }, 2000);

    if (isLastEx) {
      // Last set of last exercise → show finish button, no timer
      state.active.resting = false;
      state.active.restingBetweenExercises = false;
      render('workout');
    } else {
      // Last set of exercise, but more exercises remain → rest between exercises
      state.active.resting = false;
      state.active.restingBetweenExercises = true;
      render('workout');
      startTimer(ex.rest, skipToNextExercise);
    }
  } else {
    // More sets in this exercise → rest between sets
    state.active.resting = true;
    state.active.restingBetweenExercises = false;
    render('workout');
    startTimer(ex.rest, skipTimerToSet);
    if (navigator.vibrate) navigator.vibrate([100]);
  }
}

function skipTimerToSet() {
  stopTimer();
  state.active.resting = false;
  state.active.restingBetweenExercises = false;
  stopExerciseTimer();
  render('workout');
}

function skipToNextExercise() {
  stopTimer();
  state.active.restingBetweenExercises = false;
  state.active.resting = false;
  state.active.exIdx++;
  state.active.lastSetAnimation = false;
  stopExerciseTimer();
  render('workout');
}

function goNextExercise() {
  state.active.exIdx++;
  state.active.resting = false;
  state.active.restingBetweenExercises = false;
  state.active.lastSetAnimation = false;
  stopExerciseTimer();
  render('workout');
}

function startTimer(secs, onComplete) {
  stopTimer();
  state.timer = { secs, onComplete: onComplete || null };
  updateTimerDisplay();

  state.timer.interval = setInterval(() => {
    state.timer.secs--;
    updateTimerDisplay();

    // Voice announcements
    if (state.timer.secs === 30) speakHebrew('שלושים שניות נותרו');
    if (state.timer.secs >= 1 && state.timer.secs <= 5) speakHebrew(String(state.timer.secs));

    if (state.timer.secs <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      const cb = state.timer.onComplete;
      stopTimer();
      if (cb) cb();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-val');
  if (!el || !state.timer) return;
  el.textContent = fmtSecs(state.timer.secs);
  el.classList.toggle('done', state.timer.secs <= 0);
}

function fmtSecs(s) {
  const abs = Math.abs(s);
  const m = Math.floor(abs / 60);
  const sec = abs % 60;
  return (s < 0 ? '+' : '') + `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function addTime(s) {
  if (!state.timer) return;
  state.timer.secs += s;
  updateTimerDisplay();
}

function skipTimer() {
  stopTimer();
  const timerEl = document.getElementById('rest-timer');
  if (timerEl) timerEl.classList.remove('active');
}

function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer.interval);
    state.timer = null;
  }
}

// ── Exercise hold-timer (for seconds-type exercises) ──
function startExerciseTimer(totalSecs) {
  stopExerciseTimer();
  state.exTimer = { secs: totalSecs, total: totalSecs, running: true, interval: null };
  updateExTimerDisplay();

  state.exTimer.interval = setInterval(() => {
    if (!state.exTimer) return;
    state.exTimer.secs--;
    updateExTimerDisplay();

    if (state.exTimer.secs >= 1 && state.exTimer.secs <= 5) {
      speakHebrew(String(state.exTimer.secs));
      if (navigator.vibrate) navigator.vibrate([60]);
    }

    if (state.exTimer.secs <= 0) {
      clearInterval(state.exTimer.interval);
      state.exTimer.running = false;
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
      updateExTimerDisplay();
      // Re-render to update button state (not auto-advance)
      render('workout');
    }
  }, 1000);
}

function stopExerciseTimer() {
  if (state.exTimer) {
    clearInterval(state.exTimer.interval);
    state.exTimer = null;
  }
}

function resetExerciseTimer() {
  stopExerciseTimer();
  render('workout'); // show fresh timer
}

function updateExTimerDisplay() {
  const el = document.getElementById('ex-timer-val');
  if (!el || !state.exTimer) return;
  el.textContent = fmtSecs(state.exTimer.secs);
  const isUrgent = state.exTimer.running && state.exTimer.secs > 0 && state.exTimer.secs <= 5;
  el.classList.toggle('ex-timer-urgent', isUrgent);
}

function cancelWorkout() {
  if (!confirm('לבטל את האימון הנוכחי?')) return;
  if (state.active && state.active.countdownInterval) {
    clearInterval(state.active.countdownInterval);
  }
  state.active = null;
  stopTimer();
  render('workout');
}

function completeWorkout() {
  const wkt = {
    id:       Date.now(),
    date:     todayStr(),
    type:     state.active.type,
    duration: Math.floor((Date.now() - state.active.startTime) / 1000),
    exercises: state.active.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.filter(s => s.done).map(s => ({ value: s.value, unit: ex.unit }))
    }))
  };

  state.workouts.push(wkt);
  save();
  state.active = null;
  stopTimer();
  goTo('home');
  toast('אימון הושלם! 💪');
}

// ══════════════════════════════════════════════
//  MEASUREMENTS VIEW
// ══════════════════════════════════════════════
const MEAS_CONF = [
  { key: 'weight', lbl: 'משקל',       unit: 'ק"ג', color: '#c8a84b' },
  { key: 'belly',  lbl: 'היקף בטן',   unit: 'ס"מ', color: '#e87070' },
  { key: 'arm',    lbl: 'היקף זרוע',  unit: 'ס"מ', color: '#56883a' },
  { key: 'thigh',  lbl: 'היקף ירך',   unit: 'ס"מ', color: '#8a5ac8' },
];

function viewMeasurements() {
  const charts = MEAS_CONF.map(c => {
    const pts = state.measurements.filter(m => m[c.key]);
    const latest = pts.length ? pts[pts.length - 1][c.key] : null;
    const prev   = pts.length > 1 ? pts[pts.length - 2][c.key] : null;

    let deltaHTML = '';
    if (latest !== null && prev !== null) {
      const diff = +(latest - prev).toFixed(1);
      const cls  = diff > 0 ? 'delta-up' : diff < 0 ? 'delta-down' : 'delta-even';
      const sign = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
      deltaHTML = `<span class="chart-delta ${cls}">${sign} ${Math.abs(diff)}</span>`;
    }

    return `<div class="chart-card">
      <div class="chart-title">${c.lbl}</div>
      <div class="chart-current">
        ${latest !== null
          ? `${deltaHTML}${latest} <span class="unit">${c.unit}</span>`
          : `<span class="unit" style="font-size:14px">אין נתונים</span>`}
      </div>
      ${pts.length > 1
        ? `<div class="chart-wrap"><canvas id="chart-${c.key}"></canvas></div>`
        : `<div class="chart-empty">נדרשות לפחות 2 מדידות לגרף</div>`}
    </div>`;
  }).join('');

  return `<div class="view">
    <div class="meas-form">
      <div class="form-title">מדידה חדשה</div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-lbl">משקל (ק"ג)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="inp-weight" placeholder="75.5">
        </div>
        <div class="form-field">
          <label class="form-lbl">היקף בטן (ס"מ)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="inp-belly" placeholder="85">
        </div>
        <div class="form-field">
          <label class="form-lbl">היקף זרוע (ס"מ)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="inp-arm" placeholder="35">
        </div>
        <div class="form-field">
          <label class="form-lbl">היקף ירך (ס"מ)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="inp-thigh" placeholder="55">
        </div>
      </div>
      <button class="form-submit" id="save-meas-btn">שמור מדידה</button>
    </div>
    ${charts}
  </div>`;
}

function bindMeasurements() {
  document.getElementById('save-meas-btn').addEventListener('click', saveMeasurement);
}

function saveMeasurement() {
  const weight = parseFloat(document.getElementById('inp-weight').value) || null;
  const belly  = parseFloat(document.getElementById('inp-belly').value)  || null;
  const arm    = parseFloat(document.getElementById('inp-arm').value)    || null;
  const thigh  = parseFloat(document.getElementById('inp-thigh').value)  || null;

  if (!weight && !belly && !arm && !thigh) { toast('הזן לפחות ערך אחד'); return; }

  state.measurements.push({ id: Date.now(), date: todayStr(), weight, belly, arm, thigh });
  save();
  render('measurements');
  toast('מדידה נשמרה!');
}

function renderCharts() {
  // Destroy old charts
  Object.values(state.charts).forEach(c => c.destroy());
  state.charts = {};

  MEAS_CONF.forEach(c => {
    const pts = state.measurements.filter(m => m[c.key]);
    if (pts.length < 2) return;
    const canvas = document.getElementById(`chart-${c.key}`);
    if (!canvas) return;

    state.charts[c.key] = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: pts.map(p => {
          const d = new Date(p.date);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        }),
        datasets: [{
          data:               pts.map(p => p[c.key]),
          borderColor:        c.color,
          backgroundColor:    c.color + '18',
          borderWidth:        2,
          pointBackgroundColor: c.color,
          pointRadius:        4,
          pointHoverRadius:   6,
          fill:               true,
          tension:            0.35,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            borderColor:     c.color,
            borderWidth:     1,
            titleColor:      '#6b7280',
            bodyColor:       c.color,
            titleFont:       { family: 'Heebo', size: 10 },
            bodyFont:        { family: 'Heebo', size: 14, weight: '700' },
          }
        },
        scales: {
          x: {
            grid:   { color: 'rgba(0,0,0,0.06)' },
            ticks:  { color: '#9ca3af', font: { size: 10, family: 'Heebo' } },
            border: { color: 'rgba(0,0,0,0.10)' }
          },
          y: {
            grid:   { color: 'rgba(0,0,0,0.06)' },
            ticks:  { color: '#9ca3af', font: { size: 10, family: 'Heebo' } },
            border: { color: 'rgba(0,0,0,0.10)' }
          }
        }
      }
    });
  });
}

// ══════════════════════════════════════════════
//  HISTORY VIEW
// ══════════════════════════════════════════════
function viewHistory() {
  const tabToggle = `<div class="hist-tab-row">
    <button class="hist-tab-btn${!state.progressTab ? ' active' : ''}" onclick="state.progressTab=false;render('history')">היסטוריה</button>
    <button class="hist-tab-btn${state.progressTab ? ' active' : ''}" onclick="state.progressTab=true;render('history')">📊 התקדמות</button>
  </div>`;

  if (state.progressTab) return viewProgressCharts(tabToggle);

  if (!state.workouts.length) {
    return `<div class="view">
      ${tabToggle}
      <div class="empty">
        <div class="empty-icon">⚔</div>
        <div class="empty-text">עדיין אין אימונים.<br>לחץ על "אימון" כדי להתחיל!</div>
      </div>
    </div>`;
  }

  const items = [...state.workouts].reverse().map(w => {
    const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
    const dur = w.duration ? `${Math.floor(w.duration / 60)} דק'` : '';

    const exHTML = w.exercises.map(ex => {
      const chips = ex.sets.map(s =>
        `<span class="hist-chip">${s.value} ${s.unit}</span>`).join('');
      return `<div class="hist-ex">
        <div class="hist-ex-name">${ex.name}</div>
        <div class="hist-chips">${chips}</div>
      </div>`;
    }).join('');

    const bclass = w.type === 'legs' ? 'hbadge-legs' : `hbadge-${w.type.toLowerCase()}`;
    const blabel = w.type === 'legs' ? 'ר' : w.type;

    return `<div class="hist-item" id="hi-${w.id}">
      <div class="hist-hdr" onclick="toggleHist('${w.id}')">
        <div class="hist-badge ${bclass}">${blabel}</div>
        <div class="hist-info">
          <div class="hist-date">${fmtDate(w.date)}</div>
          <div class="hist-meta">${totalSets} סטים${dur ? ' · ' + dur : ''}</div>
        </div>
        <span class="hist-chevron">›</span>
      </div>
      <div class="hist-body">
        <div class="hist-inner">
          ${exHTML}
          <button class="hist-del" onclick="deleteWorkout('${w.id}')">מחק אימון</button>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="view">
    ${tabToggle}
    <div class="sec-label">${state.workouts.length} אימונים בסה"כ</div>
    ${items}
  </div>`;
}

// ── Exercise Progress Data ─────────────────────
function getExerciseProgressData() {
  const exercises = {};
  state.workouts.forEach(w => {
    w.exercises.forEach(ex => {
      if (!exercises[ex.name]) exercises[ex.name] = { pts: [], unit: '' };
      const vals = ex.sets.map(s => parseFloat(s.value)).filter(v => !isNaN(v) && v > 0);
      if (vals.length) {
        exercises[ex.name].pts.push({
          date:  w.date,
          max:   Math.max(...vals),
          total: vals.reduce((a, b) => a + b, 0),
          count: vals.length,
        });
        if (ex.sets[0]?.unit) exercises[ex.name].unit = ex.sets[0].unit;
      }
    });
  });
  return exercises;
}

function viewProgressCharts(tabToggle = '') {
  const exercises = getExerciseProgressData();
  const names = Object.keys(exercises);

  if (!names.length) {
    return `<div class="view">
      ${tabToggle}
      <div class="empty">
        <div class="empty-icon">📊</div>
        <div class="empty-text">אין עדיין נתונים לגרפים.<br>השלם אימון כדי לראות התקדמות!</div>
      </div>
    </div>`;
  }

  const cards = names.map((name, i) => {
    const { pts, unit } = exercises[name];
    const sorted = [...pts].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    return `<div class="chart-card">
      <div class="chart-title">${name}</div>
      <div class="chart-current">
        ${latest ? `${latest.max} <span class="unit">${unit}</span>` : ''}
        <span style="font-size:11px;color:var(--t-dim);margin-right:6px">(מקסימום לאימון)</span>
      </div>
      ${sorted.length > 1
        ? `<div class="chart-wrap"><canvas id="prog-${i}"></canvas></div>`
        : `<div class="chart-empty">נדרשים לפחות 2 אימונים לגרף</div>`}
    </div>`;
  }).join('');

  return `<div class="view">
    ${tabToggle}
    <div class="sec-label">התקדמות לפי תרגיל</div>
    ${cards}
  </div>`;
}

function renderProgressCharts() {
  Object.values(state.progressCharts).forEach(c => c.destroy());
  state.progressCharts = {};

  const exercises = getExerciseProgressData();
  const names = Object.keys(exercises);

  names.forEach((name, i) => {
    const { pts, unit } = exercises[name];
    const sorted = [...pts].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) return;
    const canvas = document.getElementById(`prog-${i}`);
    if (!canvas) return;

    state.progressCharts[name] = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: sorted.map(p => { const d = new Date(p.date); return `${d.getDate()}/${d.getMonth()+1}`; }),
        datasets: [{
          data:                sorted.map(p => p.max),
          label:               unit,
          borderColor:         '#0ca678',
          backgroundColor:     'rgba(12,166,120,0.10)',
          borderWidth:         2,
          pointBackgroundColor:'#0ca678',
          pointRadius:         4,
          pointHoverRadius:    6,
          fill:                true,
          tension:             0.35,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            borderColor:     '#0ca678',
            borderWidth:     1,
            titleColor:      '#6b7280',
            bodyColor:       '#0ca678',
            titleFont:       { family: 'Rubik', size: 10 },
            bodyFont:        { family: 'Rubik', size: 14, weight: '700' },
          }
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#9ca3af', font: { size: 10 } }, border: { color: 'rgba(0,0,0,0.10)' } },
          y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#9ca3af', font: { size: 10 } }, border: { color: 'rgba(0,0,0,0.10)' } }
        }
      }
    });
  });
}

function toggleHist(id) {
  const el = document.getElementById(`hi-${id}`);
  if (el) el.classList.toggle('open');
}

function deleteWorkout(id) {
  if (!confirm('למחוק אימון זה?')) return;
  state.workouts = state.workouts.filter(w => String(w.id) !== String(id));
  save();
  render('history');
}

// ── Export to CSV (Excel-compatible) ─────────
function exportToCSV() {
  const BOM = '\uFEFF'; // UTF-8 BOM so Excel reads Hebrew correctly

  function escCell(val) {
    const s = String(val ?? '');
    return (s.includes(',') || s.includes('"') || s.includes('\n'))
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  }

  const rows = [];

  // ── Workouts ──
  rows.push(['היסטוריית אימונים', '', '', '', '', '', '']);
  rows.push(['תאריך', 'יום', 'סוג אימון', 'תרגיל', 'סט', 'ערך', 'יחידה', 'משך (דקות)']);

  state.workouts.forEach(w => {
    const d       = new Date(w.date);
    const dayName = DAYS_FULL[d.getDay()];
    const type    = w.type === 'legs' ? 'רגליים' : 'אימון ' + w.type;
    const dur     = w.duration ? Math.floor(w.duration / 60) : '';
    let firstRow  = true;

    w.exercises.forEach(ex => {
      ex.sets.forEach((s, si) => {
        rows.push([
          w.date,
          dayName,
          type,
          ex.name,
          si + 1,
          s.value,
          s.unit,
          firstRow ? dur : '',
        ]);
        firstRow = false;
      });
    });
  });

  // ── Measurements ──
  if (state.measurements.length) {
    rows.push([]);
    rows.push(['מדידות', '', '', '', '', '', '']);
    rows.push(['תאריך', 'יום', 'משקל (ק"ג)', 'היקף בטן (ס"מ)', 'היקף זרוע (ס"מ)', 'היקף ירך (ס"מ)', '', '']);
    state.measurements.forEach(m => {
      const d = new Date(m.date);
      rows.push([m.date, DAYS_FULL[d.getDay()], m.weight || '', m.belly || '', m.arm || '', m.thigh || '']);
    });
  }

  const csv = BOM + rows.map(r => r.map(escCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `קליסטניקס_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('הקובץ הורד בהצלחה!');
}

// ── Toast ────────────────────────────────────
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

// ══════════════════════════════════════════════
//  SETUP / ONBOARDING SCREEN
// ══════════════════════════════════════════════

function showSetup() {
  const hasExisting = hasSavedPlan();
  document.getElementById('bottom-nav').style.display = 'none';
  document.getElementById('main-content').innerHTML = viewSetup(hasExisting);
}

function viewSetup(showBack = false) {
  const backBtn = showBack
    ? `<button class="setup-back-btn" onclick="finishSetup()">← חזור</button>`
    : '';
  return `<div class="view setup-view">
    ${backBtn}
    <div class="setup-logo">⚔</div>
    <div class="setup-title">${showBack ? 'עדכן תוכנית' : 'ברוך הבא!'}</div>
    <div class="setup-sub">העלה את קובץ ה-PDF של תוכנית האימון שלך<br>והאפליקציה תבנה את עצמה אוטומטית</div>

    <label class="pdf-upload-box" id="pdf-upload-box">
      <input type="file" accept=".pdf" id="pdf-file-input" style="display:none" onchange="handlePDFUpload(this)">
      <span class="upload-icon">📄</span>
      <span class="upload-title">בחר קובץ PDF</span>
      <span class="upload-hint">לחץ כאן להעלאה</span>
    </label>

    <div id="pdf-status" class="pdf-status hidden"></div>
    <div id="pdf-preview" class="pdf-preview hidden"></div>

    <div class="setup-divider">
      <span>או</span>
    </div>

    <button class="big-btn big-btn-ghost" onclick="useDefaultPlan()">
      השתמש בתוכנית ברירת המחדל
    </button>
    <div class="setup-note">שלב הבסיס | רמה 0 של אורי אשלי</div>
  </div>`;
}

async function handlePDFUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const box    = document.getElementById('pdf-upload-box');
  const status = document.getElementById('pdf-status');
  const preview = document.getElementById('pdf-preview');

  box.classList.add('loading');
  status.className = 'pdf-status';
  status.textContent = '⏳ מחלץ נתונים מה-PDF...';
  preview.className = 'pdf-preview hidden';

  try {
    const plan = await parsePDFWorkoutPlan(file);
    box.classList.remove('loading');
    box.classList.add('success');
    status.textContent = '✓ הקובץ נקרא בהצלחה!';

    // Show preview
    const types = Object.keys(plan).filter(k => k !== 'programName' && k !== 'source' && k !== 'links');
    const previewHTML = types.map(t => `
      <div class="preview-workout">
        <div class="preview-wname">${plan[t].name}</div>
        ${plan[t].exercises.map(ex => `
          <div class="preview-ex">
            <span class="preview-ex-name">${ex.name}</span>
            <span class="preview-ex-meta">${ex.sets} × ${ex.target} ${ex.unit}</span>
          </div>
        `).join('')}
      </div>
    `).join('');

    preview.innerHTML = `
      <div class="preview-title">📋 ${plan.programName || 'תוכנית האימון שלך'}</div>
      ${previewHTML}
      <button class="big-btn big-btn-green" style="margin-top:16px" onclick="confirmPlan()">
        אשר ושמור תוכנית ←
      </button>
    `;
    preview.className = 'pdf-preview';

    // Store temporarily for confirmation
    window._pendingPlan = plan;

  } catch (err) {
    box.classList.remove('loading');
    box.classList.add('error');
    status.className = 'pdf-status error';
    status.textContent = `⚠ ${err.message || 'שגיאה בקריאת הקובץ'}`;
    preview.innerHTML = `
      <div style="font-size:13px;color:var(--t-sub);text-align:center;padding:12px 0">
        אפשר לנסות שוב או לבחור בתוכנית ברירת המחדל
      </div>`;
    preview.className = 'pdf-preview';
  }
}

function confirmPlan() {
  if (!window._pendingPlan) return;
  const plan = window._pendingPlan;
  savePlan(plan);
  if (plan.links) saveLinks(plan.links);
  // Extract trainee name and stage from programName (e.g. "אורי אשלי- שלב הבסיס, רמה 0")
  const pn = plan.programName || '';
  const match = pn.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (match) {
    saveMeta(match[1].trim(), match[2].trim());
  } else if (pn) {
    saveMeta('', pn.trim());
  }
  delete window._pendingPlan;
  finishSetup();
}

function useDefaultPlan() {
  savePlan(DEFAULT_PLANS);
  saveLinks(DEFAULT_LINKS);
  finishSetup();
}

function finishSetup() {
  document.getElementById('bottom-nav').style.display = '';
  const now = new Date();
  document.getElementById('header-date').textContent =
    `${DAYS_FULL[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  render('home');
  toast('התוכנית נטענה! 💪');
}

// ══════════════════════════════════════════════
//  NUTRITION VIEW
// ══════════════════════════════════════════════

// ── Helpers ───────────────────────────────────
function todayFoodLog() {
  return state.foodLog.filter(e => e.date === todayStr());
}

function productUnitLabel(unit) {
  if (unit === 'ml')   return 'מ"ל';
  if (unit === 'unit') return 'יחידות';
  return 'גרמים';
}

function productPer100Label(unit) {
  if (unit === 'ml')   return 'ל-100מ"ל';
  if (unit === 'unit') return 'ליחידה';
  return 'ל-100g';
}

function computeEntry(entry) {
  if (entry.macros) return entry.macros; // manual quick entry
  const food = state.foods.find(f => f.id === entry.foodId);
  if (!food) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const k = (food.unit === 'unit') ? entry.grams : entry.grams / 100;
  return {
    cal:     +(food.per100.cal     * k).toFixed(0),
    protein: +(food.per100.protein * k).toFixed(1),
    carbs:   +(food.per100.carbs   * k).toFixed(1),
    fat:     +(food.per100.fat     * k).toFixed(1),
  };
}

function todayTotals() {
  const t = { cal: 0, protein: 0, carbs: 0, fat: 0 };
  todayFoodLog().forEach(e => {
    const c = computeEntry(e);
    t.cal     += c.cal;
    t.protein += +c.protein;
    t.carbs   += +c.carbs;
    t.fat     += +c.fat;
  });
  return {
    cal:     Math.round(t.cal),
    protein: +t.protein.toFixed(1),
    carbs:   +t.carbs.toFixed(1),
    fat:     +t.fat.toFixed(1),
  };
}

function macroBar(label, val, target, color) {
  const pct = target > 0 ? Math.min(100, Math.round(val / target * 100)) : 0;
  const rem = +(Math.max(0, target - val)).toFixed(1);
  const over = val > target;
  return `<div class="macro-bar-wrap">
    <div class="macro-bar-top">
      <span class="macro-bar-label">${label}</span>
      <span class="macro-bar-nums${over ? ' macro-over' : ''}">${val} / ${target}</span>
    </div>
    <div class="macro-bar-track">
      <div class="macro-bar-fill" style="width:${pct}%;background:${color}"></div>
    </div>
    <div class="macro-bar-rem">${over ? `חרגת ב-${+(val - target).toFixed(1)}` : `נשאר: ${rem}`}</div>
  </div>`;
}

function nutritionSubNav() {
  return `<div class="hist-tab-row">
    <button class="hist-tab-btn${state.nutritionSubTab === 'today' ? ' active' : ''}"
      onclick="state.nutritionSubTab='today';render('nutrition')">היום</button>
    <button class="hist-tab-btn${state.nutritionSubTab === 'products' ? ' active' : ''}"
      onclick="state.nutritionSubTab='products';render('nutrition')">רשימת מוצרים</button>
  </div>`;
}

// ── Router ────────────────────────────────────
function viewNutrition() {
  if (!state.nutritionTargets) return viewNutritionSetup();
  if (state.nutritionSubTab === 'products') return viewNutritionProducts();
  return viewNutritionToday();
}

// ── Setup (first time / edit targets) ─────────
function viewNutritionSetup() {
  const t = state.nutritionTargets || {};
  return `<div class="view">
    <div class="meas-form">
      <div class="form-title">יעדים תזונתיים יומיים</div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-lbl">קלוריות יומיות</label>
          <input class="form-inp" type="number" inputmode="decimal" id="target-cal" placeholder="2000" value="${t.cal || ''}">
        </div>
        <div class="form-field">
          <label class="form-lbl">חלבון (גרם)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="target-protein" placeholder="150" value="${t.protein || ''}">
        </div>
        <div class="form-field">
          <label class="form-lbl">פחמימות (גרם)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="target-carbs" placeholder="200" value="${t.carbs || ''}">
        </div>
        <div class="form-field">
          <label class="form-lbl">שומן (גרם)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="target-fat" placeholder="70" value="${t.fat || ''}">
        </div>
      </div>
      <button class="form-submit" id="save-targets-btn">שמור יעדים</button>
    </div>
  </div>`;
}

// ── Today's log view ──────────────────────────
function viewNutritionToday() {
  const t       = state.nutritionTargets;
  const totals  = todayTotals();
  const entries = todayFoodLog();

  const macros = `<div class="nutrition-macros">
    ${macroBar('קלוריות', totals.cal, t.cal, 'var(--gold)')}
    ${macroBar('חלבון', totals.protein, t.protein, 'var(--p)')}
    ${macroBar('פחמימות', totals.carbs, t.carbs, '#3b82f6')}
    ${macroBar('שומן', totals.fat, t.fat, 'var(--a)')}
  </div>`;

  const noProducts = state.foods.length === 0;

  const isManual = state.addFoodMode === 'manual';
  const addForm = state.showAddFood
    ? `<div class="add-food-form">
        <div class="form-title" style="font-size:15px;margin-bottom:10px">הוסף אכילה</div>
        <div class="unit-toggle-row" style="margin-bottom:12px">
          <button type="button" class="unit-toggle-btn${!isManual ? ' active' : ''}"
            onclick="state.addFoodMode='product';render('nutrition')">מרשימת מוצרים</button>
          <button type="button" class="unit-toggle-btn${isManual ? ' active' : ''}"
            onclick="state.addFoodMode='manual';render('nutrition')">הזנה ידנית</button>
        </div>
        ${isManual ? `
        <div class="form-field">
          <label class="form-lbl">תיאור</label>
          <input class="form-inp" type="text" id="manual-name" placeholder="לדוגמה: עוגת שוקולד" style="text-align:right">
        </div>
        <div class="form-grid" style="margin-top:10px">
          <div class="form-field">
            <label class="form-lbl">קלוריות</label>
            <input class="form-inp" type="number" inputmode="decimal" id="manual-cal" placeholder="200">
          </div>
          <div class="form-field">
            <label class="form-lbl">חלבון (g)</label>
            <input class="form-inp" type="number" inputmode="decimal" id="manual-protein" placeholder="0">
          </div>
          <div class="form-field">
            <label class="form-lbl">פחמימות (g)</label>
            <input class="form-inp" type="number" inputmode="decimal" id="manual-carbs" placeholder="0">
          </div>
          <div class="form-field">
            <label class="form-lbl">שומן (g)</label>
            <input class="form-inp" type="number" inputmode="decimal" id="manual-fat" placeholder="0">
          </div>
        </div>` : `
        ${noProducts ? `<div class="notice">💡 הוסף מוצרים ברשימת המוצרים תחילה</div>` : ''}
        <div class="form-field">
          <label class="form-lbl">חיפוש מוצר</label>
          <input class="form-inp" type="text" id="food-search"
            placeholder="הקלד שם מוצר..."
            oninput="filterFoodList(this.value)"
            onfocus="filterFoodList(this.value)"
            autocomplete="off" style="text-align:right">
          <input type="hidden" id="food-select">
          <div id="food-search-results" class="food-search-results"></div>
        </div>
        <div class="form-field" style="margin-top:10px">
          <label class="form-lbl" id="food-grams-label">כמות (גרמים)</label>
          <input class="form-inp" type="number" inputmode="decimal" id="food-grams" placeholder="100">
        </div>`}
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="form-submit" style="flex:1" onclick="addFoodEntry()">הוסף</button>
          <button class="ghost-btn" onclick="state.showAddFood=false;render('nutrition')">ביטול</button>
        </div>
      </div>`
    : `<button class="big-btn big-btn-green" onclick="state.showAddFood=true;render('nutrition')" style="margin-top:4px">+ הוסף אכילה</button>`;

  const logItems = entries.length
    ? [...entries].reverse().map(entry => {
        const c = computeEntry(entry);
        let displayName, displayQty;
        if (entry.macros) {
          displayName = entry.name || 'הזנה ידנית';
          displayQty  = '';
        } else {
          const food = state.foods.find(f => f.id === entry.foodId);
          const qUnit = food ? (food.unit === 'unit' ? ' יח׳' : food.unit === 'ml' ? 'מ"ל' : 'g') : 'g';
          displayName = food ? food.name : 'מוצר לא ידוע';
          displayQty  = `<span class="food-log-grams">${entry.grams}${qUnit}</span>`;
        }
        return `<div class="food-log-item">
          <div class="food-log-main">
            <span class="food-log-name">${displayName}</span>
            ${displayQty}
            <button class="food-log-del" onclick="deleteLogEntry('${entry.id}')">✕</button>
          </div>
          <div class="food-log-macros">${c.cal} קל · ${c.protein}g חלבון · ${c.carbs}g פחמ' · ${c.fat}g שומן</div>
        </div>`;
      }).join('')
    : `<div class="chart-empty">טרם הוזן מזון להיום</div>`;

  return `<div class="view">
    ${nutritionSubNav()}
    <div class="sec-label">סיכום יומי</div>
    ${macros}
    <div class="sec-label" style="margin-top:14px">מה אכלתי היום</div>
    ${addForm}
    <div class="food-log-list" style="margin-top:8px">${logItems}</div>
    <button class="ghost-btn" style="width:100%;margin-top:10px;font-size:12px"
      onclick="state.nutritionTargets=null;saveNutrition();render('nutrition')">⚙ שנה יעדים יומיים</button>
  </div>`;
}

// ── Products list view ────────────────────────
function viewNutritionProducts() {
  const productItems = state.foods.map(f => `
    <div class="food-product-item">
      <div class="food-log-main">
        <span class="food-log-name">${f.name}</span>
        <span class="food-log-unit-badge">${productUnitLabel(f.unit || 'g')}</span>
        <button class="food-log-del" onclick="deleteFood('${f.id}')">✕</button>
      </div>
      <div class="food-log-macros">${productPer100Label(f.unit || 'g')}: ${f.per100.cal} קל · ${f.per100.protein}g חלבון · ${f.per100.carbs}g פחמ' · ${f.per100.fat}g שומן</div>
    </div>`).join('');

  const addProductForm = state.showAddProduct
    ? `<div class="add-food-form">
        <div class="form-title" style="font-size:15px;margin-bottom:12px">מוצר חדש</div>
        <div class="form-field">
          <label class="form-lbl">שם המוצר</label>
          <input class="form-inp" type="text" id="prod-name" placeholder="חזה עוף" style="text-align:right">
        </div>
        <div class="form-field" style="margin-top:10px">
          <label class="form-lbl">יחידת מידה</label>
          <div class="unit-toggle-row">
            <button type="button" class="unit-toggle-btn active" id="unit-btn-g"
              onclick="setProdUnit('g')">גרמים</button>
            <button type="button" class="unit-toggle-btn" id="unit-btn-ml"
              onclick="setProdUnit('ml')">מ"ל</button>
            <button type="button" class="unit-toggle-btn" id="unit-btn-unit"
              onclick="setProdUnit('unit')">יחידות</button>
          </div>
          <input type="hidden" id="prod-unit" value="g">
        </div>
        <div class="form-grid" style="margin-top:10px">
          <div class="form-field">
            <label class="form-lbl" id="prod-cal-lbl">קלוריות (ל-100g)</label>
            <input class="form-inp" type="number" inputmode="decimal" id="prod-cal" placeholder="165">
          </div>
          <div class="form-field">
            <label class="form-lbl" id="prod-protein-lbl">חלבון (g)</label>
            <input class="form-inp" type="number" inputmode="decimal" id="prod-protein" placeholder="31">
          </div>
          <div class="form-field">
            <label class="form-lbl" id="prod-carbs-lbl">פחמימות (g)</label>
            <input class="form-inp" type="number" inputmode="decimal" id="prod-carbs" placeholder="0">
          </div>
          <div class="form-field">
            <label class="form-lbl" id="prod-fat-lbl">שומן (g)</label>
            <input class="form-inp" type="number" inputmode="decimal" id="prod-fat" placeholder="3.6">
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="form-submit" style="flex:1" onclick="addFoodProduct()">שמור מוצר</button>
          <button class="ghost-btn" onclick="state.showAddProduct=false;render('nutrition')">ביטול</button>
        </div>
      </div>`
    : `<button class="big-btn big-btn-gold" onclick="state.showAddProduct=true;render('nutrition')" style="margin-top:4px">+ הוסף מוצר</button>`;

  return `<div class="view">
    ${nutritionSubNav()}
    ${addProductForm}
    ${state.foods.length
      ? `<div class="sec-label" style="margin-top:14px">${state.foods.length} מוצרים ברשימה</div>
         <div class="food-products-list">${productItems}</div>`
      : `<div class="chart-empty" style="margin-top:10px">אין מוצרים עדיין — הוסף מוצרים ותוכל לעקוב אחר התזונה</div>`}
  </div>`;
}

// ── Bind & Actions ────────────────────────────
function bindNutrition() {
  const btn = document.getElementById('save-targets-btn');
  if (btn) btn.addEventListener('click', saveNutritionTargets);
}

function saveNutritionTargets() {
  const cal     = parseFloat(document.getElementById('target-cal')?.value)     || 0;
  const protein = parseFloat(document.getElementById('target-protein')?.value) || 0;
  const carbs   = parseFloat(document.getElementById('target-carbs')?.value)   || 0;
  const fat     = parseFloat(document.getElementById('target-fat')?.value)     || 0;
  if (!cal && !protein && !carbs && !fat) { toast('הזן לפחות יעד אחד'); return; }
  state.nutritionTargets = { cal, protein, carbs, fat };
  saveNutrition();
  render('nutrition');
  toast('יעדים נשמרו! 🥗');
}

function setProdUnit(unit) {
  const hidden = document.getElementById('prod-unit');
  if (hidden) hidden.value = unit;
  ['g', 'ml', 'unit'].forEach(u => {
    const btn = document.getElementById('unit-btn-' + u);
    if (btn) btn.classList.toggle('active', u === unit);
  });
  const perLbl = unit === 'unit' ? 'ליחידה' : unit === 'ml' ? 'ל-100מ"ל' : 'ל-100g';
  const gLbl   = unit === 'unit' ? '' : ' (g)';
  const lblMap = {
    'prod-cal-lbl':     `קלוריות (${perLbl})`,
    'prod-protein-lbl': `חלבון${gLbl}`,
    'prod-carbs-lbl':   `פחמימות${gLbl}`,
    'prod-fat-lbl':     `שומן${gLbl}`,
  };
  Object.entries(lblMap).forEach(([id, txt]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  });
}

function addFoodProduct() {
  const name    = document.getElementById('prod-name')?.value.trim();
  const unit    = document.getElementById('prod-unit')?.value || 'g';
  const cal     = parseFloat(document.getElementById('prod-cal')?.value)     || 0;
  const protein = parseFloat(document.getElementById('prod-protein')?.value) || 0;
  const carbs   = parseFloat(document.getElementById('prod-carbs')?.value)   || 0;
  const fat     = parseFloat(document.getElementById('prod-fat')?.value)     || 0;
  if (!name) { toast('הזן שם מוצר'); return; }
  state.foods.push({ id: Date.now(), name, unit, per100: { cal, protein, carbs, fat } });
  state.showAddProduct = false;
  saveNutrition();
  render('nutrition');
  toast(`${name} נוסף!`);
}

function deleteFood(id) {
  if (!confirm('למחוק מוצר זה?')) return;
  state.foods = state.foods.filter(f => String(f.id) !== String(id));
  saveNutrition();
  render('nutrition');
}

function filterFoodList(query) {
  const results = document.getElementById('food-search-results');
  if (!results) return;
  const q = (query || '').trim().toLowerCase();
  const matches = state.foods.filter(f => !q || f.name.toLowerCase().includes(q));
  if (!matches.length) {
    results.innerHTML = `<div class="food-search-empty">לא נמצאו תוצאות</div>`;
  } else {
    results.innerHTML = matches.map(f => {
      const perLbl = f.unit === 'unit' ? 'ליח׳' : f.unit === 'ml' ? '/100מ"ל' : '/100g';
      return `<div class="food-search-item" onclick="selectFood(${f.id},'${f.name.replace(/'/g,"\\'")}','${f.unit || 'g'}')">
        <span class="food-search-item-name">${f.name}</span>
        <span class="food-search-item-cal">${f.per100.cal} קל${perLbl}</span>
      </div>`;
    }).join('');
  }
  results.style.display = 'block';
}

function selectFood(id, name, unit) {
  const hidden = document.getElementById('food-select');
  if (hidden) hidden.value = id;
  const searchInput = document.getElementById('food-search');
  if (searchInput) searchInput.value = name;
  const results = document.getElementById('food-search-results');
  if (results) results.style.display = 'none';
  const lbl = document.getElementById('food-grams-label');
  if (lbl) {
    if (unit === 'unit') lbl.textContent = 'כמות (יחידות)';
    else if (unit === 'ml') lbl.textContent = 'כמות (מ"ל)';
    else lbl.textContent = 'כמות (גרמים)';
  }
}

function addFoodEntry() {
  if (state.addFoodMode === 'manual') {
    const name    = document.getElementById('manual-name')?.value.trim() || 'הזנה ידנית';
    const cal     = parseFloat(document.getElementById('manual-cal')?.value)     || 0;
    const protein = parseFloat(document.getElementById('manual-protein')?.value) || 0;
    const carbs   = parseFloat(document.getElementById('manual-carbs')?.value)   || 0;
    const fat     = parseFloat(document.getElementById('manual-fat')?.value)     || 0;
    if (!cal && !protein && !carbs && !fat) { toast('הזן לפחות ערך תזונתי אחד'); return; }
    state.foodLog.push({ id: Date.now(), date: todayStr(), name, macros: { cal, protein, carbs, fat } });
  } else {
    const foodId = parseInt(document.getElementById('food-select')?.value);
    const grams  = parseFloat(document.getElementById('food-grams')?.value) || 0;
    if (!foodId) { toast('בחר מוצר מהרשימה'); return; }
    if (!grams)  {
      const food = state.foods.find(f => f.id === foodId);
      const u = food?.unit;
      toast(u === 'unit' ? 'הזן כמות יחידות' : u === 'ml' ? 'הזן כמות במ"ל' : 'הזן כמות בגרמים');
      return;
    }
    state.foodLog.push({ id: Date.now(), date: todayStr(), foodId, grams });
  }
  state.showAddFood = false;
  saveNutrition();
  render('nutrition');
}

function deleteLogEntry(id) {
  state.foodLog = state.foodLog.filter(e => String(e.id) !== String(id));
  saveNutrition();
  render('nutrition');
}

// ── Init ─────────────────────────────────────
function init() {
  load();

  // Header date
  const now = new Date();
  document.getElementById('header-date').textContent =
    `${DAYS_FULL[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  // Nav
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.addEventListener('click', () => goTo(b.dataset.tab)));

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Show setup if no plan saved yet, otherwise go home
  if (!hasSavedPlan()) {
    showSetup();
  } else {
    render('home');
  }
}

document.addEventListener('DOMContentLoaded', init);
