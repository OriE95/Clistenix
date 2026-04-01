// Quick test — runs pdf-parser logic in Node.js to verify current code
import { readFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// ── Inline the critical helpers from the CURRENT pdf-parser.js ─────────────
const EXERCISE_KEYWORDS = [
  'מתח אוסטרלי בסופינציה','מתח אוסטרלי רחב','מתח אוסטרלי',
  'מתח סופינציה','מתח פרונציה','מתח',
  'שכיבות סמיכה על הברכיים','שכיבות סמיכה רגילות','שכיבות סמיכה יהלום',
  'שכיבות סמיכה על ידיים','שכיבות סמיכה','שכיבות',
  'מקבילים עם עזרת רגליים','מקבילים שליליים','תמיכה על מקבילים','מקבילים',
  'תלייה מתה','תליה מתה','פלאנק גבוה','פלאנק',
  'חצי סקוואט','סקוואט',"לאנג' עם תמיכה","לאנג'",'סטפ אפ','פלור טאפס',
  'הרחקות ירך בעמידה','הרחקות ירך','הרמות תאומים בזווית','הרמות תאומים','דדליפט',
];
const SECTION_MARKERS = [
  { pattern: /^אימון\s+A\b/, key: 'A' },
  { pattern: /^אימון\s+B\b/, key: 'B' },
  { pattern: /^אימון\s+רגליים|^רגליים.*בונוס|^בונוס/, key: 'legs' },
];
const LEGS_ONLY = ['חצי סקוואט','סטפ אפ','פלור טאפס','הרחקות ירך','הרמות תאומים',"לאנג'"];
const DASH_RE = /[-–—־]/g;

function fixLine(l) {
  const parts = l.split(/\s+/);
  const m = [];
  for (let i=0;i<parts.length;i++) {
    const c=parts[i], n=parts[i+1];
    if (c.length<=2 && /^[\u0590-\u05FF]+$/.test(c) && n && /^[\u0590-\u05FF]/.test(n) &&
        !['לא','את','עם','של','כל','אל','על','גם','אם','כי','הם','הן','לו','לה'].includes(c))
      { m.push(c+n); i++; } else m.push(c);
  }
  return m.join(' ').replace(/([\u05DD\u05DF\u05E3\u05E5])(?=[\u0590-\u05FF])/g,'$1 ').replace(/\s+/g,' ').trim();
}

function parseSetLine(line) {
  const l = line.trim();
  const sm = l.match(/^(\d+)/); if (!sm) return null;
  const sets = parseInt(sm[1]); if (sets<1||sets>10) return null;

  const restSec = (() => {
    if (l.includes('דקה וחצי')||l.includes('וחצי')||l.includes('1.5')) return 90;
    if (/3\s*(?:דקות|דקה)/.test(l)) return 180;
    if (/2\s*(?:דקות|דקה)/.test(l)) return 120;
    if (l.includes('דקה')) return 60;
    return 120;
  })();

  let target = null;
  const timesM = l.match(/^\d+\s*[×xX]\s*(\d+[-–]\d+|\d+)/);
  if (timesM) target = timesM[1];

  if (!target) {
    const rm = l.match(/(\d+[-–]\d+)/);
    if (rm) {
      const nums = rm[1].split(/[-–]/).map(Number);
      target = nums[0]<=nums[1] ? rm[1] : `${nums[1]}-${nums[0]}`;
    }
  }
  if (!target) { const mm=l.match(/(?:מקסימום\s+)?עד\s+(\d+)/); if(mm) target=`עד ${mm[1]}`; }
  if (!target && l.includes('מקסימום')) target='מקסימום';
  if (!target) {
    const s=l.match(/^\d+\s+(\d+)\b/);
    if (s) { const a=l.slice(s[0].length).trimStart(); if(!a.startsWith('דקות')&&!a.startsWith('דקה')&&!a.startsWith('שניות')&&!a.startsWith('וחצי')) target=s[1]; }
  }
  if (!target) return null;

  let unit='חזרות';
  if (l.includes('שניות')||l.includes('החזקה')) unit='שניות';
  else if (l.includes('לכל רגל')) unit='לכל רגל';

  const rest=restSec===180?'3 דקות':restSec===90?'דקה וחצי':restSec===60?'דקה':'2 דקות';
  return { sets, target, unit, rest, restSec, type:unit==='שניות'?'seconds':'reps',
           isSuperset:l.includes('סופרסטים')||undefined };
}

function isExerciseName(line) {
  const l=line.trim();
  if (l.length<3||l.length>80||/^\d/.test(l)||!/[\u0590-\u05FF]/.test(l)) return false;
  if (l.includes('סטים')||l.includes('חזרות')||l.includes('מנוחה')||l.includes('חימום')||l.includes('לפני הכול')) return false;
  if (l.includes('אתגר')||l.includes('בונוס')||l.includes('לחץ')) return false;
  const c=l.replace(/\s+/g,'').replace(DASH_RE,'');
  if (EXERCISE_KEYWORDS.some(k=>c.includes(k.replace(/\s+/g,'').replace(DASH_RE,'')))) return true;
  const words=l.split(/\s+/).filter(w=>w.length>0);
  if (words.length>=3&&words.length<=5&&!/\d/.test(l)&&words.every(w=>/^[\u0590-\u05FF'"]+$/.test(w))) return true;
  return false;
}
function normName(raw) {
  let t=fixLine(raw.replace(/\s+/g,' ').trim());
  const c=t.replace(/\s+/g,'').replace(DASH_RE,'');
  for (const k of EXERCISE_KEYWORDS) {
    const kc=k.replace(/\s+/g,'').replace(DASH_RE,'');
    if (c.includes(kc)) return c!==kc?t:k;
  }
  return t;
}

// ── Extract text ────────────────────────────────────────────────────────────
const data = new Uint8Array(readFileSync('./אורי אשלי- שלב הבסיס, רמה 0.3, עיקרית.pdf'));
const pdf  = await getDocument({ data, useSystemFonts: true }).promise;
const allLines = [];

for (let p=1;p<=pdf.numPages;p++) {
  const page=await pdf.getPage(p);
  const tc=await page.getTextContent();
  const items=tc.items.filter(i=>i.str?.trim())
    .sort((a,b)=>{const d=b.transform[5]-a.transform[5];if(Math.abs(d)>12)return d;return b.transform[4]-a.transform[4];});
  let cur=[],lastY=null;
  const flush=()=>{if(cur.length){allLines.push(fixLine(cur.join(' ')));}};
  for(const it of items){const y=Math.round(it.transform[5]);if(lastY!==null&&Math.abs(y-lastY)>12){flush();cur=[];}cur.push(it.str);lastY=y;}
  flush();
}

const lines=allLines.map(l=>l.trim()).filter(l=>l.length>1);

// ── Boundaries ──────────────────────────────────────────────────────────────
const bounds=[];
for(let i=0;i<lines.length;i++){
  const l=lines[i];
  const sm=SECTION_MARKERS.find(m=>m.pattern.test(l));
  if(sm)bounds.push({idx:i,key:sm.key});
  const c=l.replace(/\s+/g,'').replace(DASH_RE,'');
  if(LEGS_ONLY.some(e=>c.includes(e.replace(/\s+/g,'').replace(DASH_RE,'')))&&!bounds.some(b=>b.key==='legs'&&b.idx<=i))
    bounds.push({idx:i,key:'legs'});
}
bounds.sort((a,b)=>a.idx-b.idx);
function getKey(idx){
  let bb=null,bd=Infinity,ab=null,ad=Infinity;
  for(const{idx:bi,key}of bounds){const d=idx-bi;if(d>=0&&d<bd){bd=d;bb=key;}if(d<0&&-d<ad){ad=-d;ab=key;}}
  if(bb)return bb;if(ab&&ad<=30)return ab;return null;
}

// ── Parse ───────────────────────────────────────────────────────────────────
const sections={};
let cur=null,lastSec=null,chain=[];
for(let i=0;i<lines.length;i++){
  const l=lines[i];
  const sk=getKey(i);
  const hasWord=/(?:^|\s)סטים(?:\s|$)/.test(l);
  if(l.includes('לפני הכול')||l.includes('חימום')||hasWord||l.includes('אתגר')||l.includes('לחץ')||SECTION_MARKERS.some(m=>m.pattern.test(l))||l.length<3){
    if(SECTION_MARKERS.some(m=>m.pattern.test(l))){cur=null;chain=[];}continue;}
  if(!sk)continue;
  if(!sections[sk])sections[sk]=[];
  if(sk!==lastSec){cur=null;lastSec=sk;chain=[];}
  if(/וישר\s*בלי\s*מנוחה|ישר\s*בלי\s*מנוחה/.test(l)){if(cur)chain.push(cur);continue;}
  if(isExerciseName(l)){
    cur={name:normName(l),sets:null,target:null,unit:'חזרות',rest:'2 דקות',restSec:120,type:'reps'};
    if(!sections[sk].some(e=>e.name===cur.name))sections[sk].push(cur);
    else cur=sections[sk].find(e=>e.name===cur.name);
    continue;
  }
  if(cur&&!cur.sets){
    const p=parseSetLine(l);
    if(p){
      if(['תלייה','תליה','תמיכה','פלאנק','החזקה'].some(k=>cur.name.includes(k))||l.includes('שניות')){p.unit='שניות';p.type='seconds';}
      Object.assign(cur,p);
      if(p.isSuperset&&chain.length>0){for(const c of chain){if(!c.sets){const cp={...p};if(['תלייה','תליה','תמיכה','פלאנק','החזקה'].some(k=>c.name.includes(k))||l.includes('שניות')){cp.unit='שניות';cp.type='seconds';}Object.assign(c,cp);}}}
      chain=[];
    }
  }
}

// SupersetId
let sc=0;
for(const k of Object.keys(sections)){let cid=null;for(const e of sections[k]){if(e.isSuperset){if(!cid){sc++;cid=`${k}_${sc}`;}e.supersetId=cid;}else cid=null;}}

// Print
const names={A:'אימון A',B:'אימון B',legs:'רגליים'};
for(const k of['A','B','legs']){
  if(!sections[k]?.length)continue;
  console.log(`\n══ ${names[k]} ══`);
  for(const e of sections[k]){
    const s=e.supersetId?` [סופרסט ${e.supersetId}]`:'';
    const sets=e.sets||3;const tgt=e.target||'5-10';const u=e.unit||'חזרות';
    console.log(`  ${sets} × ${tgt} ${u}  │  ${e.name}${s}`);
  }
}
EOF
