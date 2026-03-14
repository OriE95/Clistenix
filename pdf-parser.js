/* =============================================
   PDF WORKOUT PARSER
   Designed for "אורי אשלי" style workout PDFs.
   Uses PDF.js for text extraction + heuristic
   parsing for Hebrew workout structure.
   ============================================= */

const PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ── Known exercise keywords (for detection) ──
const EXERCISE_KEYWORDS = [
  'מתח אוסטרלי רחב',
  'מתח אוסטרלי',
  'שכיבות סמיכה על הברכיים',
  'שכיבות סמיכה רגילות',
  'שכיבות סמיכה',
  'תלייה מתה',
  'תליה מתה',
  'תמיכה על מקבילים',
  'חצי סקוואט',
  'סטפ אפ',
  'פלור טאפס',
  'הרחקות ירך בעמידה',
  'הרמות תאומים',
  'סקוואט',
  'לאנג\'',
  'דדליפט',
  'מתח',
  'שכיבות',
];

// ── Workout section markers ──
// Note: must match at START of line to avoid false positives like
// "(לא באותו יום עם אימון A)" triggering section A reset.
// Legs exercises appear BEFORE the marker in the PDF, so we also
// detect the first legs-only exercise as the section boundary.
const SECTION_MARKERS = [
  { pattern: /^אימון\s+A\s*$/,                           key: 'A'    },
  { pattern: /^אימון\s+B\s*(\(|$)/,                      key: 'B'    },
  { pattern: /^אימון\s+רגליים|^רגליים.*בונוס|^בונוס/,   key: 'legs' },
];

// First exercise that appears exclusively in the legs workout —
// used to auto-detect the legs section before its header appears.
const LEGS_FIRST_EXERCISE = 'חצי סקוואט';

// ── Rest time → seconds ──
function parseRestSeconds(restStr) {
  if (!restStr) return 120;
  if (restStr.includes('3')) return 180;
  if (restStr.includes('1.5') || restStr.includes('וחצי')) return 90;
  if (restStr.includes('שניות') && !restStr.includes('דקות')) return 60;
  if (restStr.includes('2')) return 120;
  if (restStr.includes('1') && restStr.includes('דקה')) return 60;
  return 120;
}

// ── Detect exercise unit from name/context ──
function detectUnit(name, contextStr) {
  const secondsNames = ['תלייה', 'תליה', 'תמיכה'];
  if (secondsNames.some(k => name.includes(k))) return 'seconds';
  if (contextStr && contextStr.includes('שניות')) return 'seconds';
  return 'reps';
}

// ── Parse a "sets line": e.g. "4 5-15 2-3 דקות" ──
function parseSetLine(line) {
  // Normalize
  const l = line.trim();

  // Pattern: <number> <reps-or-seconds> [unit] <rest>
  // Examples:
  //   "4 5-15 2-3 דקות"
  //   "2 10-30 שניות 2 דקות"
  //   "3 מקסימום עד 20 דקה וחצי"
  //   "3 6-10 לכל רגל דקה וחצי"

  const sets = l.match(/^(\d+)/);
  if (!sets) return null;
  const setsNum = parseInt(sets[1]);

  // Range like "5-15" or "10-30"
  const rangeMatch = l.match(/(\d+[-–]\d+)/);
  // Max like "עד 20" or "מקסימום עד 15"
  const maxMatch   = l.match(/(?:מקסימום\s+)?עד\s+(\d+)/);
  // Single number (after sets, for seconds)
  const singleMatch = l.match(/^\d+\s+(\d+)\s/);

  let target = null;
  if (rangeMatch)       target = rangeMatch[1];
  else if (maxMatch)    target = `עד ${maxMatch[1]}`;
  else if (singleMatch) target = singleMatch[1];
  else return null;

  // Unit detection
  let unit = 'חזרות';
  if (l.includes('שניות'))   unit = 'שניות';
  if (l.includes('לכל רגל')) unit = 'לכל רגל';

  // Rest time extraction
  let rest = '2 דקות';
  if (l.includes('דקה וחצי') || l.includes('וחצי')) rest = '1.5 דקות';
  else {
    const rm = l.match(/(\d+[-–]?\d*)\s*דקות?/);
    if (rm) rest = rm[0];
  }

  return {
    sets:   setsNum,
    target: target,
    unit:   unit,
    rest:   rest,
    restSec: parseRestSeconds(rest),
    type:   unit === 'שניות' ? 'seconds' : 'reps',
  };
}

// ── Normalize Hebrew text (handle common PDF quirks) ──
function normalizeText(text) {
  // Sometimes PDF.js reverses Hebrew strings within a word
  // Detect by checking if common words appear reversed
  // "אימון" reversed = "ןומיא"
  if (text.includes('ןומיא')) {
    text = text.split('\n').map(line =>
      line.split(' ').map(word => {
        // Only reverse if the word contains Hebrew chars and looks reversed
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
  // Check if word starts with a "normal" Hebrew first letter for common words
  const goodStarts = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'];
  if (!word.length) return true;
  const first = word[0];
  return goodStarts.includes(first);
}

// ── Words/phrases that indicate body text, NOT exercise names ──
const TEXT_BLACKLIST = [
  // Sentence-starting verbs / connectors
  'יהיה','להיות','לבצע','לדחוק','לנוח','לישון','לאכול','חשוב','רצוי','ואנחנו',
  'שהוא','שהיא','שאתה','שצריך','רק','ככה','כדי','כדאי','אנחנו','תזכור',
  // Section headings that aren't exercise names
  'הסבר','מאגר','תנאים','האתגר','הסרטון','סרטון','לחץ','להזמנת','קוד','קופון',
  'שים לב','ברוך','חובה','ורק אז','מפת','מפה','שלב','רמה',
  // Legal / admin
  'אין להעביר','מתוקף','יעמוד לדין',
];

// ── Normalize a candidate exercise name (fix split characters) ──
// PDF.js sometimes inserts spaces in the middle of Hebrew words.
// Strategy: remove spaces inside what should be single words by
// comparing compressed form against known exercise keywords.
function normalizeExerciseName(raw) {
  const compressed = raw.replace(/\s+/g, '');
  for (const kw of EXERCISE_KEYWORDS) {
    const kwCompressed = kw.replace(/\s+/g, '');
    if (compressed.includes(kwCompressed)) {
      // Re-insert the correct spacing from the canonical keyword
      return raw.replace(new RegExp(
        kw.split('').map(c => c + '\\s*').join('').slice(0, -3),
        'g'
      ), kw) || kw;
    }
  }
  // Fallback: collapse suspicious single-char "words" into their neighbors
  return raw.split(' ').reduce((acc, word) => {
    if (acc.length && word.length <= 2 && /^[\u0590-\u05FF]+$/.test(word)) {
      // Short isolated Hebrew fragment — likely a split char, merge left
      return acc.slice(0, -1).concat(acc[acc.length - 1] + word);
    }
    return acc.concat(word);
  }, []).join(' ').trim();
}

// ── Check if a line is an exercise name ──
function isExerciseName(line) {
  const l = line.trim();

  // Hard length limits
  if (l.length < 3 || l.length > 50) return false;

  // Lines starting with numbers are data lines
  if (/^\d/.test(l)) return false;

  // Must contain Hebrew
  if (!/[\u0590-\u05FF]/.test(l)) return false;

  // Reject known table headers / non-exercise content
  if (l.includes('סטים') || l.includes('חזרות') || l.includes('מנוחה')) return false;
  if (l.includes('חימום') || l.includes('לפני הכול')) return false;
  if (l.includes('אתגר') || l.includes('מפת') || l.includes('עליך לזכור')) return false;
  if (l.includes('לא באותו') || l.includes('בונוס')) return false;

  // Reject if any blacklisted word appears in the line
  if (TEXT_BLACKLIST.some(w => l.includes(w))) return false;

  // Reject sentences: lines ending with a period or containing typical sentence words
  if (l.endsWith('.') || l.endsWith(',') || l.includes('–') || l.includes('-ו')) return false;

  // ✓ Positive: matches a known exercise keyword (even with split spaces)
  const compressed = l.replace(/\s+/g, '');
  if (EXERCISE_KEYWORDS.some(k => compressed.includes(k.replace(/\s+/g, '')))) return true;

  // Heuristic for unknown exercises: short (2-4 "real" words), no numbers, all Hebrew
  const words = l.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 2 && words.length <= 5) {
    const hasNumbers = /\d/.test(l);
    const allHebrew  = words.every(w => /^[\u0590-\u05FF]+$/.test(w));
    if (!hasNumbers && allHebrew) return true;
  }

  return false;
}

// ── Main extraction: get all text + link annotations from PDF ──
async function extractPDFText(file) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js לא נטען');
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true }).promise;

  const allPages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Sort items by vertical position (top → bottom), then horizontal (right → left for Hebrew)
    const items = textContent.items
      .filter(item => item.str && item.str.trim())
      .sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5]; // higher y = higher on page
        if (Math.abs(yDiff) > 5) return yDiff;
        return b.transform[4] - a.transform[4]; // rightmost first (Hebrew RTL)
      });

    // Group into lines by Y position, tracking Y for spatial link matching
    const lines    = [];
    const lineData = []; // [{ text, y }]
    let currentLine = [];
    let lastY = null;

    for (const item of items) {
      const y = Math.round(item.transform[5]);
      if (lastY === null || Math.abs(y - lastY) > 4) {
        if (currentLine.length) {
          const text = currentLine.join(' ');
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
      const text = currentLine.join(' ');
      lines.push(text);
      lineData.push({ text, y: lastY });
    }

    // Collect hyperlink annotations
    const annotations = await page.getAnnotations();
    const linkAnns = annotations
      .filter(a => a.subtype === 'Link' && a.url)
      .map(a => ({ url: a.url, midY: (a.rect[1] + a.rect[3]) / 2 }));

    allPages.push({ pageNum, lines, lineData, linkAnns });
  }

  return allPages;
}

// ── Build structured links object from page data ──
function buildLinks(pages) {
  const links = { general: {}, warmup: {}, exercises: {} };

  for (const { pageNum, lineData, linkAnns } of pages) {
    const seenUrls = new Set();

    for (const ann of linkAnns) {
      if (seenUrls.has(ann.url)) continue; // deduplicate within page
      seenUrls.add(ann.url);

      // Find the line of text closest in Y to this annotation
      const closest = lineData
        .map(ld => ({ ...ld, dist: Math.abs(ld.y - ann.midY) }))
        .sort((a, b) => a.dist - b.dist)[0];

      _classifyLink(links, pageNum, ann.url, closest ? closest.text : '');
    }
  }

  return links;
}

function _classifyLink(links, pageNum, url, label) {
  // URL-pattern matching (most reliable — doesn't depend on text extraction quality)
  if (url.includes('/explain'))                             { links.general.explain   = url; return; }
  if (url.includes('/nutrition'))                           { links.general.nutrition = url; return; }
  if (url.includes('theroadto') || url.includes('discount')){ links.general.equipment = url; return; }
  if (url.includes('bit.ly'))                               { links.referral          = url; return; }

  if (!url.includes('youtube')) return;

  // Challenge demo video is the only YouTube link on page 4
  if (pageNum === 4) { links.challenge = url; return; }

  // Warmup buttons contain the word "חימום"
  if (label.includes('חימום')) {
    if (pageNum <= 3) links.warmup.upper = url;
    else              links.warmup.lower = url;
    return;
  }

  // Exercise video links — match label against known exercise keywords
  const norm = label.replace(/\s+/g, '');
  for (const kw of EXERCISE_KEYWORDS) {
    if (norm.includes(kw.replace(/\s+/g, ''))) {
      if (!links.exercises[kw]) links.exercises[kw] = url; // first match wins
      return;
    }
  }
}

// ── Main parser ──────────────────────────────
async function parsePDFWorkoutPlan(file) {
  const pages = await extractPDFText(file);

  // Flatten all lines with page context
  const allLines = pages.flatMap(p => p.lines.map(line => line.trim()).filter(l => l.length > 1));

  // Normalize Hebrew
  const normalized = allLines.map(normalizeText);

  // Detect sections and exercises
  const sections = {};
  let currentSection = null;
  let currentExercise = null;
  let programName = null;

  for (let i = 0; i < normalized.length; i++) {
    const line = normalized[i];

    // Program name — first substantial Hebrew line
    if (!programName && line.length > 5 && /[\u0590-\u05FF]/.test(line) && !line.includes('אימון')) {
      programName = line;
    }

    // Section detection — check against strict start-of-line patterns
    const sectionMatch = SECTION_MARKERS.find(m => m.pattern.test(line));
    if (sectionMatch) {
      currentSection = sectionMatch.key;
      if (!sections[currentSection]) sections[currentSection] = [];
      currentExercise = null;
      continue;
    }

    // Auto-detect legs section: חצי סקוואט only appears in the legs workout.
    // The PDF places exercises BEFORE the "אימון רגליים (בונוס)" header, so we
    // switch to legs as soon as we see this exercise regardless of current section.
    if (line.includes(LEGS_FIRST_EXERCISE) && currentSection !== 'legs') {
      currentSection = 'legs';
      if (!sections.legs) sections.legs = [];
      currentExercise = null;
    }

    if (!currentSection) continue;

    // Skip known non-exercise lines
    if (line.includes('לפני הכול') || line.includes('חימום') ||
        line.includes('סטים') || line.includes('אתגר') ||
        line.includes('לחץ') || line.includes('להזמנת') ||
        line.length < 3) continue;

    // Exercise name detection
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
      sections[currentSection].push(currentExercise);
      continue;
    }

    // Sets/reps/rest line
    if (currentExercise && !currentExercise.sets) {
      const parsed = parseSetLine(line);
      if (parsed) {
        // Inherit unit from exercise name if seconds type
        if (detectUnit(currentExercise.name, line) === 'seconds') {
          parsed.unit = 'שניות';
          parsed.type = 'seconds';
        }
        Object.assign(currentExercise, parsed);
      }
    }
  }

  // Validate: must have at least workout A or B
  const hasA = sections.A    && sections.A.length    > 0;
  const hasB = sections.B    && sections.B.length    > 0;
  const hasL = sections.legs && sections.legs.length > 0;

  if (!hasA && !hasB) {
    throw new Error('לא נמצאו אימונים בקובץ. ודא שה-PDF מכיל "אימון A" ו-"אימון B".');
  }

  // Fill missing sets with defaults
  const fillDefaults = (exercises) => exercises.map(ex => ({
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
    source: 'pdf',
    links: buildLinks(pages),
  };

  if (hasA) result.A    = { name: 'אימון A',        exercises: fillDefaults(sections.A)    };
  if (hasB) result.B    = { name: 'אימון B',        exercises: fillDefaults(sections.B)    };
  if (hasL) result.legs = { name: 'אימון רגליים',   exercises: fillDefaults(sections.legs) };

  return result;
}

// ── Export ───────────────────────────────────
window.parsePDFWorkoutPlan = parsePDFWorkoutPlan;
