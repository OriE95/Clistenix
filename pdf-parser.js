/* =============================================
   PDF WORKOUT PARSER — v3
   Two-pass strategy: section boundaries are
   found first, then exercises are assigned to
   the nearest preceding section — fixing the
   case where exercises appear before their
   section header in the PDF text stream.
   ============================================= */

const PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ── Known exercise keywords ───────────────────
// Sorted longest-first so specific variants match before shorter roots.
const EXERCISE_KEYWORDS = [
  // Chin-up / pull-up variants
  'מתח אוסטרלי בסופינציה',
  'מתח אוסטרלי רחב',
  'מתח אוסטרלי',
  'מתח סופינציה',
  'מתח פרונציה',
  'מתח',
  // Push variants
  'שכיבות סמיכה על הברכיים',
  'שכיבות סמיכה רגילות',
  'שכיבות סמיכה יהלום',
  'שכיבות סמיכה על ידיים',
  'שכיבות סמיכה',
  'שכיבות',
  // Dips / parallel bars
  'מקבילים עם עזרת רגליים',
  'מקבילים שליליים',
  'תמיכה על מקבילים',
  'מקבילים',
  // Static holds / core
  'תלייה מתה',
  'תליה מתה',
  'פלאנק גבוה',
  'פלאנק',
  // Legs
  'חצי סקוואט',
  'סקוואט',
  "לאנג' עם תמיכה",
  "לאנג'",
  'סטפ אפ',
  'פלור טאפס',
  'הרחקות ירך בעמידה',
  'הרחקות ירך',
  'הרמות תאומים בזווית',
  'הרמות תאומים',
  // Misc
  'דדליפט',
];

// ── Section markers ───────────────────────────
// Uses \b so "אימון A - פלג עליון" also matches.
const SECTION_MARKERS = [
  { pattern: /^אימון\s+A\b/,                           key: 'A'    },
  { pattern: /^אימון\s+B\b/,                           key: 'B'    },
  { pattern: /^אימון\s+רגליים|^רגליים.*בונוס|^בונוס/, key: 'legs' },
];

// ── Exercises exclusive to legs (for auto-detect) ──
const LEGS_ONLY_EXERCISES = [
  'חצי סקוואט', 'סטפ אפ', 'פלור טאפס', 'הרחקות ירך', 'הרמות תאומים', "לאנג'",
];

// ── Any dash character → unified ─────────────
// U+002D hyphen, U+2013 en-dash, U+2014 em-dash, U+05BE Hebrew punctuation maqaf
const DASH_RE = /[-–—־]/g;

// ── Rest time → seconds ───────────────────────
function parseRestSeconds(line) {
  if (!line) return 120;
  if (line.includes('דקה וחצי') || line.includes('וחצי') || line.includes('1.5')) return 90;
  const m3 = line.match(/3\s*(?:דקות|דקה)/);
  if (m3) return 180;
  const m2 = line.match(/2\s*(?:דקות|דקה)/);
  if (m2) return 120;
  if (line.includes('דקה') || line.match(/1\s*דקה/)) return 60;
  return 120;
}

// ── Exercise type from name + context ────────
function detectExerciseType(name, contextLine) {
  const holdNames = ['תלייה', 'תליה', 'תמיכה', 'פלאנק', 'החזקה'];
  if (holdNames.some(k => name.includes(k))) return 'seconds';
  if (contextLine && contextLine.includes('שניות')) return 'seconds';
  return 'reps';
}

// ── Parse a "sets / reps / rest" line ────────
// Handles all formats seen in אורי אשלי PDFs:
//   "4 8-5 2 דקות"
//   "3 × 5-15 2 דקות"
//   "3 סופרסטים 16-8 כל תרגיל דקה וחצי"
//   "2 מקסימום עד 25 דקה וחצי"
//   "1 מקסימום החזקה 3 דקות"
//   "2 מקסימום החזקה עד 90 שניות 2 דקות"
//   "2 60-40 שניות החזקה דקה"
//   "3 6-10 לכל רגל דקה וחצי בין רגל לרגל"
function parseSetLine(line) {
  const l = line.trim();

  const setsMatch = l.match(/^(\d+)/);
  if (!setsMatch) return null;
  const setsNum = parseInt(setsMatch[1]);
  if (setsNum < 1 || setsNum > 10) return null;

  // ── Rest time ──────────────────────────────
  let restSec = parseRestSeconds(l);
  let rest    = restSec === 180 ? '3 דקות' : restSec === 90 ? 'דקה וחצי' :
                restSec === 60  ? 'דקה'    : '2 דקות';

  // ── Target ────────────────────────────────
  let target = null;

  // "3 × 5-15" or "3x5"
  const timesMatch = l.match(/^\d+\s*[×xX]\s*(\d+[-–]\d+|\d+)/);
  if (timesMatch) target = timesMatch[1];

  if (!target) {
    const rangeMatch = l.match(/(\d+[-–]\d+)/);
    if (rangeMatch) {
      // Normalize to ascending order (PDFs sometimes write max–min)
      const nums = rangeMatch[1].split(/[-–]/).map(Number);
      target = nums[0] <= nums[1] ? rangeMatch[1] : `${nums[1]}-${nums[0]}`;
    }
  }

  if (!target) {
    const maxMatch = l.match(/(?:מקסימום\s+)?עד\s+(\d+)/);
    if (maxMatch) target = `עד ${maxMatch[1]}`;
  }

  if (!target && l.includes('מקסימום')) {
    target = 'מקסימום';
  }

  if (!target) {
    const sm = l.match(/^\d+\s+(\d+)\b/);
    if (sm) {
      // Don't capture if the number is actually the rest-time value ("3 2 דקות")
      const after = l.slice(sm[0].length).trimStart();
      if (!after.startsWith('דקות') && !after.startsWith('דקה') && !after.startsWith('שניות') && !after.startsWith('וחצי')) {
        target = sm[1];
      }
    }
  }

  if (!target) return null;

  // ── Unit ──────────────────────────────────
  let unit = 'חזרות';
  if (l.includes('שניות') || l.includes('החזקה')) unit = 'שניות';
  else if (l.includes('לכל רגל'))                  unit = 'לכל רגל';

  const isSuperset = l.includes('סופרסטים') || l.includes('סופרסט');

  return {
    sets:       setsNum,
    target:     target,
    unit:       unit,
    rest:       rest,
    restSec:    restSec,
    type:       unit === 'שניות' ? 'seconds' : 'reps',
    isSuperset: isSuperset || undefined,
  };
}

// ── Normalize text (fix PDF reversal quirks) ──
function normalizeText(text) {
  if (text.includes('ןומיא')) {
    text = text.split('\n').map(line =>
      line.split(' ').map(word => {
        if (/[\u0590-\u05FF]/.test(word) && !isProperHebrew(word)) {
          return word.split('').reverse().join('');
        }
        return word;
      }).join(' ')
    ).join('\n');
  }
  return text;
}

function isProperHebrew(word) {
  if (!word.length) return true;
  return 'אבגדהוזחטיכלמנסעפצקרשת'.includes(word[0]);
}

// ── Fix common PDF text-extraction issues ────
// 1. Missing spaces: "מקבילים שלילייםעם" → "מקבילים שליליים עם"
// 2. Split chars:    "פ לאנק" → "פלאנק"
// 3. Extra spaces inside words
function fixExtractedLine(line) {
  // Re-join isolated single Hebrew characters (PDF.js sometimes splits glyphs)
  // e.g. "פ לאנק גבוה" → "פלאנק גבוה"
  line = line.replace(/(?<=[^\s])\s(?=[^\s])(?<=[\u0590-\u05FF]\s[\u0590-\u05FF])/g, '');

  // Simpler version: if a Hebrew "word" is only 1-2 chars AND the next word starts
  // with a Hebrew char, merge them — but only if it doesn't create a blacklisted word.
  const parts = line.split(/\s+/);
  const merged = [];
  for (let i = 0; i < parts.length; i++) {
    const cur  = parts[i];
    const next = parts[i + 1];
    if (
      cur.length <= 2 &&
      /^[\u0590-\u05FF]+$/.test(cur) &&
      next && /^[\u0590-\u05FF]/.test(next) &&
      // Don't merge if current word looks like a word on its own
      !['לא','את','עם','של','כל','אל','על','גם','אם','כי','הם','הן','לו','לה'].includes(cur)
    ) {
      // merge cur + next
      merged.push(cur + next);
      i++; // skip next
    } else {
      merged.push(cur);
    }
  }
  line = merged.join(' ');

  // Add space between two Hebrew words that were merged (e.g. "שלילייםעם" → "שליליים עם")
  // Heuristic: if a known suffix/prefix appears without space, insert one.
  line = line.replace(/([^\s\u0590-\u05FF])(\u05DD|\u05DF|\u05E3|\u05E5|\u05F0)(?=[\u0590-\u05FF])/g, '$1$2 ');
  // Final mem ם, final nun ן, final pe ף, final tsade ץ — if followed by Hebrew, add space
  line = line.replace(/([\u05DD\u05DF\u05E3\u05E5])(?=[\u0590-\u05FF])/g, '$1 ');

  return line.replace(/\s+/g, ' ').trim();
}

// ── Body-text disqualifiers ───────────────────
const TEXT_BLACKLIST = [
  'יהיה','להיות','לבצע','לדחוק','לנוח','לישון','לאכול','חשוב','רצוי','ואנחנו',
  'שהוא','שהיא','שאתה','שצריך','רק','ככה','כדי','כדאי','אנחנו','תזכור',
  'הסבר','מאגר','תנאים','האתגר','הסרטון','סרטון','לחץ','להזמנת','קוד','קופון',
  'שים לב','ברוך','חובה','ורק אז','מפת','מפה','שלב','רמה',
  'אין להעביר','מתוקף','יעמוד לדין','לבניית',
  'הגדרות','התוכנית','אימון בונוס',
];

const HEBREW_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

// ── Normalize exercise name ───────────────────
// Preserves the full name including "– variant" suffixes.
function normalizeExerciseName(raw) {
  // Apply text fixes first
  let trimmed = fixExtractedLine(raw.replace(/\s+/g, ' ').trim());

  const compressedRaw = trimmed.replace(/\s+/g, '').replace(DASH_RE, '');
  for (const kw of EXERCISE_KEYWORDS) {
    const kwC = kw.replace(/\s+/g, '').replace(DASH_RE, '');
    if (compressedRaw.includes(kwC)) {
      // If the raw is longer than the keyword (has a "– variant"), keep the full name.
      if (compressedRaw !== kwC) return trimmed;
      return kw;
    }
  }
  return trimmed;
}

// ── Check if a line looks like an exercise name ──
function isExerciseName(line) {
  const l = line.trim();

  if (l.length < 3 || l.length > 80) return false;
  if (/^\d/.test(l)) return false;
  if (!/[\u0590-\u05FF]/.test(l)) return false;

  // Structural line rejections
  if (l.includes('סטים')    || l.includes('חזרות') || l.includes('מנוחה')) return false;
  if (l.includes('חימום')   || l.includes('לפני הכול')) return false;
  if (l.includes('אתגר')    || l.includes('מפת')   || l.includes('עליך לזכור')) return false;
  if (l.includes('לא באותו')|| l.includes('בונוס')) return false;
  if (l.includes('לחץ')     || l.includes('להזמנת')) return false;

  // ✓ Positive: matches a known keyword (dash-agnostic, space-agnostic)
  const compressed = l.replace(/\s+/g, '').replace(DASH_RE, '');
  if (EXERCISE_KEYWORDS.some(k => compressed.includes(k.replace(/\s+/g, '').replace(DASH_RE, '')))) {
    return true;
  }

  // Only apply stricter filters to unknown exercises
  if (TEXT_BLACKLIST.some(w => l.includes(w))) return false;
  if (l.endsWith('.') || l.endsWith(',')) return false;
  // En-dash in unknown line → likely a sentence, not an exercise
  if (/[–—]/.test(l)) return false;
  // Days-of-week line (e.g. "ראשון שני שלישי רביעי חמישי שישי שבת")
  if (HEBREW_DAYS.filter(d => l.includes(d)).length >= 2) return false;

  // Heuristic: 2–5 Hebrew words, no digits, apostrophes allowed (לאנג')
  // Max 5 words — unknown exercises beyond 5 words are unlikely; long known exercises
  // are caught by the keyword check above.
  const words = l.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 3 && words.length <= 5) {
    const hasNumbers = /\d/.test(l);
    const allHebrew  = words.every(w => /^[\u0590-\u05FF'"]+$/.test(w));
    if (!hasNumbers && allHebrew) return true;
  }

  return false;
}

// ── Legs-only exercise detector ───────────────
function isLegsOnlyExercise(line) {
  const c = line.replace(/\s+/g, '').replace(DASH_RE, '');
  return LEGS_ONLY_EXERCISES.some(ex => c.includes(ex.replace(/\s+/g, '').replace(DASH_RE, '')));
}

// ── Extract all text + link annotations from PDF ──
async function extractPDFText(file) {
  if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js לא נטען');
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true }).promise;

  const allPages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page        = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Sort items: top → bottom (descending Y), then right → left (descending X for Hebrew RTL)
    // 12px tolerance handles table cells whose Y positions differ slightly across columns
    const Y_TOL = 12;
    const items = textContent.items
      .filter(item => item.str && item.str.trim())
      .sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > Y_TOL) return yDiff;
        return b.transform[4] - a.transform[4];       // rightmost first (RTL)
      });

    // Group into lines by Y position
    const lines    = [];
    const lineData = [];
    let currentLine = [];
    let lastY = null;

    for (const item of items) {
      const y = Math.round(item.transform[5]);
      if (lastY === null || Math.abs(y - lastY) > Y_TOL) {
        if (currentLine.length) {
          const text = fixExtractedLine(currentLine.join(' '));
          lines.push(text);
          lineData.push({ text, y: lastY });
        }
        currentLine = [item.str];
        lastY = y;
      } else {
        currentLine.push(item.str);
      }
    }
    if (currentLine.length) {
      const text = fixExtractedLine(currentLine.join(' '));
      lines.push(text);
      lineData.push({ text, y: lastY });
    }

    const annotations = await page.getAnnotations();
    const linkAnns = annotations
      .filter(a => a.subtype === 'Link' && a.url)
      .map(a => ({ url: a.url, midY: (a.rect[1] + a.rect[3]) / 2 }));

    // DEBUG: log all extracted lines so we can verify browser extraction
    if (pageNum <= 3) {
      console.groupCollapsed(`[PDF parser] עמוד ${pageNum} — ${lines.length} שורות`);
      lines.forEach((l, i) => console.log(`  [${i}] ${l}`));
      console.groupEnd();
    }

    allPages.push({ pageNum, lines, lineData, linkAnns });
  }

  return allPages;
}

// ── Build links object ────────────────────────
function buildLinks(pages) {
  const links = { general: {}, warmup: {}, exercises: {} };
  for (const { pageNum, lineData, linkAnns } of pages) {
    const seenUrls = new Set();
    for (const ann of linkAnns) {
      if (seenUrls.has(ann.url)) continue;
      seenUrls.add(ann.url);
      const closest = lineData
        .map(ld => ({ ...ld, dist: Math.abs(ld.y - ann.midY) }))
        .sort((a, b) => a.dist - b.dist)[0];
      _classifyLink(links, pageNum, ann.url, closest ? closest.text : '');
    }
  }
  return links;
}

function _classifyLink(links, pageNum, url, label) {
  if (url.includes('/explain'))                               { links.general.explain   = url; return; }
  if (url.includes('/nutrition'))                             { links.general.nutrition = url; return; }
  if (url.includes('theroadto') || url.includes('discount'))  { links.general.equipment = url; return; }
  if (url.includes('bit.ly'))                                 { links.referral          = url; return; }
  if (!url.includes('youtube')) return;
  if (pageNum === 4) { links.challenge = url; return; }
  if (label.includes('חימום')) {
    if (pageNum <= 3) links.warmup.upper = url;
    else              links.warmup.lower = url;
    return;
  }
  const norm = label.replace(/\s+/g, '').replace(DASH_RE, '');
  for (const kw of EXERCISE_KEYWORDS) {
    if (norm.includes(kw.replace(/\s+/g, '').replace(DASH_RE, ''))) {
      if (!links.exercises[kw]) links.exercises[kw] = url;
      return;
    }
  }
}

// ══════════════════════════════════════════════
//  TWO-PASS MAIN PARSER
//  Pass 1: record section-boundary line indices
//  Pass 2: assign each exercise to the nearest
//          preceding boundary (or nearest overall
//          if it appears before the first boundary)
// ══════════════════════════════════════════════
async function parsePDFWorkoutPlan(file) {
  const pages = await extractPDFText(file);

  // Flatten all lines with page context
  const allLines = pages.flatMap(p => p.lines.map(l => l.trim()).filter(l => l.length > 1));
  const normalized = allLines.map(normalizeText);

  // ── Pass 1: find section boundaries ──────────
  const boundaries = []; // { idx, key }
  for (let i = 0; i < normalized.length; i++) {
    const line = normalized[i];
    const sm = SECTION_MARKERS.find(m => m.pattern.test(line));
    if (sm) {
      boundaries.push({ idx: i, key: sm.key });
    }
    // Auto-detect legs section from exclusive exercises
    if (isLegsOnlyExercise(line)) {
      if (!boundaries.some(b => b.key === 'legs' && b.idx <= i)) {
        boundaries.push({ idx: i, key: 'legs' });
      }
    }
  }

  // Sort boundaries by line index
  boundaries.sort((a, b) => a.idx - b.idx);

  // Helper: given a line index, return the best section key.
  // Prefers the nearest boundary BEFORE the line.
  // Falls back to the nearest boundary AFTER if the line is before all boundaries.
  function getSectionKey(lineIdx) {
    let bestBefore = null, bestBeforeDist = Infinity;
    let bestAfter  = null, bestAfterDist  = Infinity;
    for (const { idx, key } of boundaries) {
      const d = lineIdx - idx;
      if (d >= 0 && d < bestBeforeDist) { bestBeforeDist = d; bestBefore = key; }
      if (d < 0 && -d < bestAfterDist)  { bestAfterDist  = -d; bestAfter  = key; }
    }
    if (bestBefore !== null) return bestBefore;
    // No boundary before this line — use the next one if it's within 30 lines
    if (bestAfter !== null && bestAfterDist <= 30) return bestAfter;
    return null;
  }

  // ── Pass 2: extract exercises ─────────────────
  const sections = {};
  let currentExercise = null;
  let lastSection     = null;
  let programName     = null;
  let supersetChain   = []; // exercises waiting for a "סופרסטים" sets line

  for (let i = 0; i < normalized.length; i++) {
    const line = normalized[i];

    // Program name (first substantial Hebrew non-section line)
    if (!programName && line.length > 5 && /[\u0590-\u05FF]/.test(line) &&
        !SECTION_MARKERS.some(m => m.pattern.test(line))) {
      programName = line;
    }

    // Determine which section this line belongs to
    const sectionKey = getSectionKey(i);

    // Skip structural lines
    // Note: use word-boundary check for "סטים" so "סופרסטים" is NOT skipped
    const hasSetsWord = /(?:^|\s)סטים(?:\s|$)/.test(line);
    if (line.includes('לפני הכול') || line.includes('חימום') ||
        hasSetsWord                 || line.includes('אתגר')   ||
        line.includes('לחץ')       || line.includes('להזמנת') ||
        SECTION_MARKERS.some(m => m.pattern.test(line)) ||
        line.length < 3) {
      if (SECTION_MARKERS.some(m => m.pattern.test(line))) { currentExercise = null; supersetChain = []; }
      continue;
    }

    if (!sectionKey) continue;

    // Start new section if needed
    if (!sections[sectionKey]) sections[sectionKey] = [];
    if (sectionKey !== lastSection) {
      currentExercise = null;
      lastSection = sectionKey;
      supersetChain = [];
    }

    // Superset connector: "וישר בלי מנוחה" — the exercise above and below form a superset
    if (/וישר\s*בלי\s*מנוחה|ישר\s*בלי\s*מנוחה/.test(line)) {
      if (currentExercise) supersetChain.push(currentExercise);
      continue;
    }

    // Exercise name?
    if (isExerciseName(line)) {
      currentExercise = {
        name:    normalizeExerciseName(line.replace(/\s+/g, ' ').trim()),
        sets:    null,
        target:  null,
        unit:    'חזרות',
        rest:    '2 דקות',
        restSec: 120,
        type:    'reps',
      };
      // Avoid duplicates (same exercise added twice due to nearby section boundaries)
      if (!sections[sectionKey].some(e => e.name === currentExercise.name)) {
        sections[sectionKey].push(currentExercise);
      } else {
        currentExercise = sections[sectionKey].find(e => e.name === currentExercise.name);
      }
      continue;
    }

    // Sets / reps / rest line
    if (currentExercise && !currentExercise.sets) {
      const parsed = parseSetLine(line);
      if (parsed) {
        if (detectExerciseType(currentExercise.name, line) === 'seconds') {
          parsed.unit = 'שניות';
          parsed.type = 'seconds';
        }
        Object.assign(currentExercise, parsed);

        // If this is a superset sets line, back-fill all chained exercises
        if (parsed.isSuperset && supersetChain.length > 0) {
          for (const chainEx of supersetChain) {
            if (!chainEx.sets) {
              const cp = { ...parsed };
              if (detectExerciseType(chainEx.name, line) === 'seconds') {
                cp.unit = 'שניות'; cp.type = 'seconds';
              }
              Object.assign(chainEx, cp);
            }
          }
        }
        supersetChain = [];
      }
    }
  }

  // ── Assign supersetId to consecutive isSuperset exercises ──
  let supersetCounter = 0;
  for (const key of Object.keys(sections)) {
    let currentSupersetId = null;
    for (const ex of sections[key]) {
      if (ex.isSuperset) {
        if (!currentSupersetId) {
          supersetCounter++;
          currentSupersetId = `${key}_${supersetCounter}`;
        }
        ex.supersetId = currentSupersetId;
      } else {
        currentSupersetId = null;
      }
    }
  }

  // ── Validate ──────────────────────────────────
  const hasA = sections.A    && sections.A.length    > 0;
  const hasB = sections.B    && sections.B.length    > 0;
  const hasL = sections.legs && sections.legs.length > 0;

  if (!hasA && !hasB) {
    throw new Error('לא נמצאו אימונים בקובץ. ודא שה-PDF מכיל "אימון A" ו-"אימון B".');
  }

  const fillDefaults = exercises => exercises.map(ex => ({
    ...ex,
    sets:    ex.sets    || 3,
    target:  ex.target  || '5-10',
    unit:    ex.unit    || 'חזרות',
    rest:    ex.rest    || '2 דקות',
    restSec: ex.restSec || 120,
    type:    ex.type    || 'reps',
  }));

  const result = {
    programName: programName || 'תוכנית אימון',
    source:      'pdf',
    links:       buildLinks(pages),
    // Raw text for debugging (visible in preview)
    _rawLines:   normalized.filter(l => l.length > 1),
  };

  if (hasA) result.A    = { name: 'אימון A',      exercises: fillDefaults(sections.A)    };
  if (hasB) result.B    = { name: 'אימון B',      exercises: fillDefaults(sections.B)    };
  if (hasL) result.legs = { name: 'אימון רגליים', exercises: fillDefaults(sections.legs) };

  return result;
}

window.parsePDFWorkoutPlan = parsePDFWorkoutPlan;
