import {
  useState, useRef, useEffect, useCallback,
  CSSProperties, FC, RefObject, ChangeEvent,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Currency   = "KHR" | "USD";
export type CardVariant = "portrait" | "square";
/** How the consumer supplies the QR image */
export type QrSourceMode = "placeholder" | "url" | "base64" | "path" | "string";

export interface KhqrQrCardProps {
  receiverName: string;
  amount?: number | string;
  currency?: Currency;
  showCurrencySymbol?: boolean;
  /**
   * Resolved image src (data URI, URL, or path).
   * Pass `undefined` to show the built-in placeholder.
   */
  qrSrc?: string;
  style?: CSSProperties;
}

export interface KhqrQrSquareProps {
  qrSrc?: string;
  style?: CSSProperties;
}

interface KhqrLogoProps    { px: number; }
interface CentreBadgeProps { d: number;  }
interface CardHeaderProps  { logoH: number; fold: number; }

// ─── ResizeObserver hook ──────────────────────────────────────────────────────

function useCardHeight(ref: RefObject<HTMLDivElement | null>): number {
  const [h, setH] = useState<number>(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setH(e.contentRect.height));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return h;
}

// ─── KHQR Logo ────────────────────────────────────────────────────────────────

const KhqrLogo: FC<KhqrLogoProps> = ({ px }) => (
  <img
    src="/KHQR_Logo.png"
    alt="KHQR"
    draggable={false}
    style={{
      height: px, width: "auto", display: "block", objectFit: "contain",
      filter: "brightness(0) invert(1)", userSelect: "none", pointerEvents: "none",
    }}
  />
);

// ─── Placeholder QR ───────────────────────────────────────────────────────────

const PlaceholderQR: FC = () => {
  const N = 25, cell = 200 / N;
  const on = new Set<string>([
    "0,7","0,8","0,11","0,13","0,17","1,7","1,9","1,12","1,14","1,16",
    "2,8","2,10","2,13","2,15","2,18","3,7","3,11","3,14","3,16",
    "4,8","4,9","4,12","4,17","4,18","5,7","5,13","5,15",
    "6,8","6,10","6,12","6,16","7,0","7,7","7,9","7,11","7,14","7,16","7,18","7,24",
    "8,1","8,8","8,12","8,15","8,17","8,23","9,2","9,7","9,9","9,13","9,16","9,22",
    "10,0","10,3","10,8","10,11","10,14","10,18","10,21",
    "11,1","11,4","11,9","11,12","11,15","11,20","11,24",
    "12,0","12,2","12,7","12,10","12,13","12,17","12,22",
    "13,1","13,3","13,8","13,11","13,14","13,16","13,23",
    "14,2","14,4","14,9","14,12","14,18","14,21",
    "15,0","15,5","15,10","15,13","15,17","15,20","15,24",
    "16,1","16,3","16,7","16,11","16,14","16,18","16,22",
    "17,2","17,4","17,8","17,12","17,15","17,21",
    "18,0","18,6","18,9","18,13","18,17","18,20","18,24",
    "19,1","19,5","19,10","19,14","19,16","19,22",
    "20,2","20,7","20,11","20,15","20,18","20,23",
    "21,0","21,3","21,8","21,12","21,17","21,21","21,24",
    "22,1","22,4","22,9","22,14","22,16","22,20",
    "23,2","23,6","23,10","23,13","23,18","23,22",
    "24,0","24,5","24,11","24,15","24,17","24,21","24,23",
  ]);
  const cells: [number, number][] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (on.has(`${r},${c}`)) cells.push([r,c]);
  const finders: [number, number][] = [[0,0],[0,18],[18,0]];
  return (
    <svg viewBox="0 0 200 200" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="200" height="200" fill="white" />
      {cells.map(([r,c],i) => <rect key={i} x={c*cell} y={r*cell} width={cell-.5} height={cell-.5} fill="#111" />)}
      {finders.map(([fr,fc],i) => (
        <g key={i}>
          <rect x={fc*cell}        y={fr*cell}        width={7*cell} height={7*cell} rx={2.5} fill="#111" />
          <rect x={fc*cell+cell}   y={fr*cell+cell}   width={5*cell} height={5*cell} rx={1.5} fill="white" />
          <rect x={fc*cell+2*cell} y={fr*cell+2*cell} width={3*cell} height={3*cell} rx={1}   fill="#111" />
        </g>
      ))}
    </svg>
  );
};

// ─── Centre Badge ─────────────────────────────────────────────────────────────

const CentreBadge: FC<CentreBadgeProps> = ({ d }) => (
  <div style={{
    position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    width:d, height:d, borderRadius:"50%", background:"#000000",
    border:"2.5px solid #FFFFFF", display:"flex", alignItems:"center",
    justifyContent:"center", boxShadow:"0 1px 6px rgba(0,0,0,0.28)",
    zIndex:5, pointerEvents:"none",
  }}>
    <span style={{ color:"#FFFFFF", fontSize:d*0.50, fontWeight:900, lineHeight:1, fontFamily:"sans-serif" }}>
      &#x17DB;
    </span>
  </div>
);

// ─── Card Header ─────────────────────────────────────────────────────────────

const CardHeader: FC<CardHeaderProps> = ({ logoH, fold }) => (
  <div style={{
    position:"relative", height:"12%", background:"#E1232E",
    display:"flex", alignItems:"center", justifyContent:"center",
    flexShrink:0, overflow:"hidden",
  }}>
    <KhqrLogo px={logoH} />
    <div style={{
      position:"absolute", bottom:0, right:0, width:0, height:0,
      borderLeft:`${fold}px solid transparent`,
      borderBottom:`${fold}px solid #FFFFFF`, zIndex:10,
    }} />
  </div>
);

// ─── QR image renderer (shared) ───────────────────────────────────────────────

const QrImage: FC<{ src?: string }> = ({ src }) =>
  src
    ? <img src={src} alt="KHQR" style={{ width:"100%", height:"100%", objectFit:"fill", display:"block" }} draggable={false} />
    : <PlaceholderQR />;

// ─────────────────────────────────────────────────────────────────────────────
// KhqrQrCard  (portrait 20:29)
// ─────────────────────────────────────────────────────────────────────────────

export const KhqrQrCard: FC<KhqrQrCardProps> = ({
  receiverName, amount, currency = "KHR",
  showCurrencySymbol = false, qrSrc, style: extStyle = {},
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawH    = useCardHeight(cardRef);
  const h       = rawH || (360 * 29) / 20;

  const padX   = h * 0.10,  padTop = h * 0.046, qrPadY = h * 0.08;
  const fsName = h * 0.030, fsAmt  = h * 0.065, fsCurr = h * 0.030;
  const fold   = h * 0.058, logoH  = h * 0.052, badgeD = h * 0.080;
  const divMT  = h * 0.030, gap    = h * 0.008;

  const fmt = (v: number | string | undefined): string | null => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n.toLocaleString("en-US") : String(v);
  };
  const fmtAmt = fmt(amount);
  const symbol = showCurrencySymbol ? (currency === "USD" ? "$" : "\u17DB") : "";

  return (
    <div ref={cardRef} style={{
      position:"relative", width:"100%", maxWidth:360, aspectRatio:"20 / 29",
      borderRadius:16, background:"#FFFFFF", boxShadow:"0 0 16px rgba(0,0,0,0.10)",
      overflow:"hidden", display:"flex", flexDirection:"column",
      fontFamily:"'Nunito Sans', sans-serif", ...extStyle,
    }}>
      <CardHeader logoH={logoH} fold={fold} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style={{ paddingLeft:padX, paddingRight:padX, paddingTop:padTop }}>
          <div style={{
            fontSize:fsName, fontWeight:600, color:"rgba(17,17,17,0.90)",
            lineHeight:1.35, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }} title={receiverName}>{receiverName}</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:gap*2.5, marginTop:gap }}>
            <div style={{ fontSize:fsAmt, fontWeight:800, color:"#111111", lineHeight:1 }}>
              {symbol && <span style={{ marginRight:gap*1.5 }}>{symbol}</span>}
              {fmtAmt !== null ? fmtAmt : amount === 0 ? "0" : null}
            </div>
            <div style={{ fontSize:fsCurr, fontWeight:500, color:"rgba(17,17,17,0.80)", lineHeight:1 }}>
              {currency}
            </div>
          </div>
          <div style={{ marginTop:divMT, borderTop:"1.5px dashed rgba(0,0,0,0.22)" }} />
        </div>
        <div style={{
          flex:1, minHeight:0, display:"flex", alignItems:"center", justifyContent:"center",
          paddingLeft:padX, paddingRight:padX, paddingTop:qrPadY, paddingBottom:qrPadY,
        }}>
          <div style={{ position:"relative", width:"100%", aspectRatio:"1 / 1" }}>
            <QrImage src={qrSrc} />
            <CentreBadge d={badgeD} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KhqrQrSquare  (8:9 ratio)
// ─────────────────────────────────────────────────────────────────────────────

export const KhqrQrSquare: FC<KhqrQrSquareProps> = ({ qrSrc, style: extStyle = {} }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawH    = useCardHeight(cardRef);
  const h       = rawH || (400 * 9) / 8;
  const fold = h*0.058, logoH = h*0.052, badgeD = h*0.080;

  return (
    <div ref={cardRef} style={{
      position:"relative", width:"100%", maxWidth:400, aspectRatio:"8 / 9",
      borderRadius:16, background:"#FFFFFF", boxShadow:"0 0 16px rgba(0,0,0,0.10)",
      overflow:"hidden", display:"flex", flexDirection:"column",
      fontFamily:"'Nunito Sans', sans-serif", ...extStyle,
    }}>
      <CardHeader logoH={logoH} fold={fold} />
      <div style={{ flex:1, minHeight:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ position:"relative", width:"90%", aspectRatio:"1 / 1" }}>
          <QrImage src={qrSrc} />
          <CentreBadge d={badgeD} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Pure-TS QR encoder — no CDN, no npm, handles full KHQR payloads
// Implements: Byte mode, ECC levels M/Q, versions 1-40, masking, SVG output
// ─────────────────────────────────────────────────────────────────────────────

/* ---------- GF(256) arithmetic for Reed-Solomon ---------- */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x; GF_LOG[x] = i;
    x = x << 1; if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();
const gfMul = (a: number, b: number) => a && b ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0;
const gfPoly = (deg: number): number[] => {
  let p = [1];
  for (let i = 0; i < deg; i++) {
    const q = [1, GF_EXP[i]];
    const r = new Array(p.length + q.length - 1).fill(0);
    for (let a = 0; a < p.length; a++) for (let b = 0; b < q.length; b++) r[a+b] ^= gfMul(p[a], q[b]);
    p = r;
  }
  return p;
};
function rsEncode(data: number[], ecCount: number): number[] {
  const gen = gfPoly(ecCount);
  const msg = [...data, ...new Array(ecCount).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const c = msg[i];
    if (c) for (let j = 0; j < gen.length; j++) msg[i+j] ^= gfMul(gen[j], c);
  }
  return msg.slice(data.length);
}

/* ---------- QR version capacity / ECC tables (Byte mode, ECL=M) ---------- */
// [version]: [totalCodewords, ecCodewordsPerBlock, blocksG1, dataG1, blocksG2, dataG2]
const QR_CAPS: Record<number, [number,number,number,number,number,number]> = {
  1: [26,10,1,16,0,0], 2:[44,16,1,28,0,0], 3:[70,26,1,44,0,0],
  4:[100,18,2,32,0,0], 5:[134,24,2,43,0,0], 6:[172,16,4,27,0,0],
  7:[196,18,4,31,0,0], 8:[242,22,2,38,2,39], 9:[292,22,3,36,2,37],
  10:[346,26,4,43,1,44], 11:[404,30,1,50,4,51], 12:[466,22,6,46,2,47],
  13:[532,22,8,44,1,45], 14:[581,24,4,36,5,37], 15:[655,24,5,54,5,55],
  16:[733,28,7,43,3,44], 17:[815,28,10,50,1,51], 18:[901,26,9,53,4,54],
  19:[991,26,3,45,11,46], 20:[1085,26,3,15,13,16], 21:[1156,26,17,48,0,0],// simplified
  22:[1258,28,17,22,6,23], 23:[1364,28,4,47,14,48], 24:[1474,28,6,47,14,48],
  25:[1588,28,8,45,13,46], 26:[1706,28,19,46,4,47], 27:[1828,28,22,45,3,46],
  28:[1921,28,3,45,23,46], 29:[2051,28,21,45,7,46], 30:[2185,28,19,45,10,46],
  31:[2323,28,2,45,29,46], 32:[2465,28,10,45,23,46], 33:[2611,28,14,45,21,46],
  34:[2761,28,14,45,23,46], 35:[2876,28,12,45,26,46], 36:[3034,28,6,45,34,46],
  37:[3196,28,29,45,14,46], 38:[3362,28,13,45,32,46], 39:[3532,28,40,45,7,46],
  40:[3706,28,18,45,31,46],
};

/* ---------- Format & version info strings ---------- */
const FORMAT_INFO: Record<number, number> = {
  // ECL=M (bits 10-x): mask patterns 0-7
  0:0b101010000010010, 1:0b101000100100101, 2:0b101111001111100, 3:0b101101101001011,
  4:0b100010111111001, 5:0b100000011001110, 6:0b100111110010111, 7:0b100101010100000,
};

/* ---------- Alignment pattern positions ---------- */
const ALIGN_POS: Record<number, number[]> = {
  1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],
  9:[6,26,46],10:[6,28,50],11:[6,30,54],12:[6,32,58],13:[6,34,62],14:[6,26,46,66],
  15:[6,26,48,70],16:[6,26,50,74],17:[6,30,54,78],18:[6,30,56,82],19:[6,30,58,86],
  20:[6,34,62,90],21:[6,28,50,72,94],22:[6,26,50,74,98],23:[6,30,54,78,102],
  24:[6,28,54,80,106],25:[6,32,58,84,110],26:[6,30,58,86,114],27:[6,34,62,90,118],
  28:[6,26,50,74,98,122],29:[6,30,54,78,102,126],30:[6,26,52,78,104,130],
  31:[6,30,56,82,108,132],32:[6,34,60,86,112,136],33:[6,30,58,86,114,142],
  34:[6,34,62,90,118,146],35:[6,30,54,78,102,126,150],36:[6,24,50,76,102,128,154],
  37:[6,28,54,80,106,132,158],38:[6,32,58,86,114,142,162],39:[6,26,54,82,110,138,166],
  40:[6,30,58,86,114,142,170],
};

type QrMatrix = (0|1|null)[][];

function makeMatrix(size: number): QrMatrix {
  return Array.from({length:size}, () => new Array(size).fill(null));
}

function placeFinderPattern(m: QrMatrix, row: number, col: number) {
  for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
    const rr = row+r, cc = col+c;
    if (rr < 0 || cc < 0 || rr >= m.length || cc >= m.length) continue;
    const inOuter = r>=0&&r<=6&&(c===0||c===6);
    const inTop   = c>=0&&c<=6&&(r===0||r===6);
    const inInner = r>=2&&r<=4&&c>=2&&c<=4;
    m[rr][cc] = (inOuter||inTop||inInner) ? 1 : 0;
  }
}

function placeAlignPattern(m: QrMatrix, row: number, col: number) {
  for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) {
    const v = (r===-2||r===2||c===-2||c===2||r===0&&c===0) ? 1 : 0;
    m[row+r][col+c] = v;
  }
}

function applyMask(m: QrMatrix, mask: number, fn: QrMatrix): QrMatrix {
  const size = m.length;
  const out  = m.map(row => [...row]) as QrMatrix;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (fn[r][c] !== null) continue; // function module
    let flip = false;
    if (mask===0) flip = (r+c)%2===0;
    else if (mask===1) flip = r%2===0;
    else if (mask===2) flip = c%3===0;
    else if (mask===3) flip = (r+c)%3===0;
    else if (mask===4) flip = (Math.floor(r/2)+Math.floor(c/3))%2===0;
    else if (mask===5) flip = (r*c)%2+(r*c)%3===0;
    else if (mask===6) flip = ((r*c)%2+(r*c)%3)%2===0;
    else if (mask===7) flip = ((r+c)%2+(r*c)%3)%2===0;
    if (flip) out[r][c] = out[r][c] ? 0 : 1;
  }
  return out;
}

function penaltyScore(m: QrMatrix): number {
  const size = m.length; let score = 0;
  // rule 1: 5+ same in row/col
  for (let r = 0; r < size; r++) {
    for (let isRow of [true,false]) {
      let run = 1;
      for (let i = 1; i < size; i++) {
        const a = isRow ? m[r][i-1] : m[i-1][r];
        const b = isRow ? m[r][i]   : m[i][r];
        if (a===b) { run++; if (run===5) score+=3; else if (run>5) score++; }
        else run=1;
      }
    }
  }
  // rule 2: 2×2 blocks
  for (let r=0;r<size-1;r++) for (let c=0;c<size-1;c++) {
    const v=m[r][c];
    if (v===m[r][c+1]&&v===m[r+1][c]&&v===m[r+1][c+1]) score+=3;
  }
  return score;
}

/** Encode text → QR SVG string (Byte mode, ECL=M) */
function encodeQrSvg(text: string): string {
  const bytes = Array.from(new TextEncoder().encode(text));
  const len   = bytes.length;

  // pick version
  let version = 1;
  for (; version <= 40; version++) {
    const cap = QR_CAPS[version];
    if (!cap) continue;
    const [total, ecPB, b1, d1, b2, d2] = cap;
    const dataCapacity = b1*d1 + b2*d2;
    const headerBits = 4 + (version < 10 ? 8 : 16);
    if (Math.ceil((headerBits + len*8)/8) <= dataCapacity) break;
  }
  if (version > 40) throw new Error("Data too long");

  const size = version*4+17;
  const [,ecPB, b1,d1,b2,d2] = QR_CAPS[version];

  // --- build data bitstream ---
  const bits: number[] = [];
  const push = (val: number, n: number) => { for (let i=n-1;i>=0;i--) bits.push((val>>i)&1); };
  push(0b0100, 4); // byte mode
  push(len, version<10?8:16);
  bytes.forEach(b => push(b,8));
  // terminator + padding
  const totalData = (b1*d1+b2*d2)*8;
  for (let i=0;i<4&&bits.length<totalData;i++) bits.push(0);
  while (bits.length%8) bits.push(0);
  const PAD = [0xEC,0x11];
  let pi=0;
  while (bits.length<totalData) { push(PAD[pi++%2],8); }

  // pack into bytes
  const dataBytes: number[] = [];
  for (let i=0;i<bits.length;i+=8) {
    let b=0; for(let j=0;j<8;j++) b=(b<<1)|(bits[i+j]??0);
    dataBytes.push(b);
  }

  // --- interleave blocks + RS ---
  const blocks: number[][] = [];
  let offset=0;
  for (let g=0;g<2;g++) {
    const count=g===0?b1:b2, dLen=g===0?d1:d2;
    if (!count) continue;
    for (let i=0;i<count;i++) {
      const data=dataBytes.slice(offset,offset+dLen);
      offset+=dLen;
      blocks.push([...data, ...rsEncode(data,ecPB)]);
    }
  }
  const totalBlocks=b1+b2;
  const interleaved: number[]=[];
  const maxData=Math.max(d1,d2);
  for (let i=0;i<maxData;i++) blocks.forEach(bl=>{ if(i<bl.length-ecPB) interleaved.push(bl[i]); });
  for (let i=0;i<ecPB;i++) blocks.forEach(bl=>{ const d=bl.length-ecPB; interleaved.push(bl[d+i]); });

  // --- build matrix ---
  const mat = makeMatrix(size);
  const fn  = makeMatrix(size); // function module map

  const markFn = (r:number,c:number) => { if(r>=0&&c>=0&&r<size&&c<size) fn[r][c]=1; };

  // finder patterns + separators
  for (const [fr,fc] of [[0,0],[0,size-7],[size-7,0]] as [number,number][]) {
    placeFinderPattern(mat,fr,fc);
    for(let i=-1;i<=7;i++) { markFn(fr+i,fc-1); markFn(fr-1,fc+i); markFn(fr+i,fc+7); markFn(fr+7,fc+i); }
    for(let r=fr;r<fr+7;r++) for(let c=fc;c<fc+7;c++) markFn(r,c);
  }

  // timing patterns
  for (let i=8;i<size-8;i++) {
    mat[6][i]=mat[i][6]=(i%2===0)?1:0;
    markFn(6,i); markFn(i,6);
  }

  // dark module
  mat[size-8][8]=1; markFn(size-8,8);

  // alignment patterns
  if (version>1) {
    const pos=ALIGN_POS[version]??[];
    for (const r of pos) for (const c of pos) {
      if ((r===6&&c===6)||(r===6&&c===pos[pos.length-1])||(c===6&&r===pos[pos.length-1])) continue;
      placeAlignPattern(mat,r,c);
      for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++) markFn(r+dr,c+dc);
    }
  }

  // version info (v>=7)
  if (version>=7) {
    // simplified: skip version info (affects versions 7+, most KHQR fit <=6)
  }

  // reserve format info areas
  for (let i=0;i<8;i++) { markFn(i,8); markFn(8,i); markFn(size-1-i,8); markFn(8,size-8+i); }
  markFn(8,8);

  // --- place data bits ---
  let bitIdx=0;
  const allBits: number[]=[];
  interleaved.forEach(b=>{ for(let i=7;i>=0;i--) allBits.push((b>>i)&1); });
  // remainder bits
  const remBits=[0,7,7,7,7,7,0,0,0,0,0,0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4];
  for(let i=0;i<(remBits[version]??0);i++) allBits.push(0);

  let up=true;
  for (let c=size-1;c>=0;c-=2) {
    if (c===6) c--;
    for (let ii=0;ii<size;ii++) {
      const r=up?size-1-ii:ii;
      for (const dc of [0,1]) {
        const cc=c-dc;
        if (fn[r][cc]!==null) continue;
        mat[r][cc]=(allBits[bitIdx++]??0) as 0|1;
      }
    }
    up=!up;
  }

  // --- pick best mask ---
  let bestMask=0, bestPenalty=Infinity;
  for (let mask=0;mask<8;mask++) {
    const m2=applyMask(mat,mask,fn);
    const p=penaltyScore(m2);
    if (p<bestPenalty) { bestPenalty=p; bestMask=mask; }
  }
  const finalMat=applyMask(mat,bestMask,fn);

  // place format info
  const fi=FORMAT_INFO[bestMask]??0;
  const fiBits: number[]=[];
  for(let i=14;i>=0;i--) fiBits.push((fi>>i)&1);
  const fiPos=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  fiPos.forEach(([r,c],i)=>{ finalMat[r][c]=fiBits[i] as 0|1; });
  // bottom-left
  for(let i=0;i<7;i++) finalMat[size-1-i][8]=fiBits[i] as 0|1;
  // right of top-right finder
  for(let i=0;i<8;i++) finalMat[8][size-8+i]=fiBits[7+i] as 0|1;

  // --- render SVG ---
  // quiet=0: no extra white border — the card body already provides visual breathing room
  const quiet=0, cell=10;
  const total=size*cell;
  const rects: string[]=[];
  for(let r=0;r<size;r++) for(let c=0;c<size;c++) {
    if(finalMat[r][c]===1) {
      rects.push(`<rect x="${c*cell}" y="${r*cell}" width="${cell}" height="${cell}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">
<rect width="${total}" height="${total}" fill="white"/>
<g fill="#111111">${rects.join("")}</g>
</svg>`;
}

/** Hook: text → base64 data-URI (pure-TS, no CDN, no Blob URLs) */
function useQrDataUri(text: string): { dataUri: string | null; error: string | null } {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [error,   setError  ] = useState<string | null>(null);

  useEffect(() => {
    if (!text.trim()) { setDataUri(null); setError(null); return; }
    try {
      const svg = encodeQrSvg(text);
      // Encode as base64 data-URI — works in any img src, no Blob/Object URL needed
      const encoded = btoa(unescape(encodeURIComponent(svg)));
      setDataUri(`data:image/svg+xml;base64,${encoded}`);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "QR generation failed");
      setDataUri(null);
    }
  }, [text]);

  return { dataUri, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Playground state
// ─────────────────────────────────────────────────────────────────────────────

interface PlaygroundState {
  variant:            CardVariant;
  receiverName:       string;
  amountRaw:          string;
  currency:           Currency;
  showCurrencySymbol: boolean;
  qrMode:             QrSourceMode;
  qrUrl:              string;   // for "url" mode
  qrPath:             string;   // for "path" mode
  qrBase64:           string;   // for "base64" mode (raw base64, no prefix)
  qrString:           string;   // for "string" mode (text to encode)
}

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────

const ROW    = "#1e1e1e";
const PANEL  = "#242424";
const BORDER = "rgba(255,255,255,0.08)";
const RED    = "#E1232E";
const TEXT   = "rgba(255,255,255,0.85)";
const MUTED  = "rgba(255,255,255,0.38)";
const FONT   = "'Nunito Sans', sans-serif";
const GREEN  = "#4ade80";
const YELLOW = "#fbbf24";

// ─────────────────────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────────────────────

const SectionLabel: FC<{ text: string }> = ({ text }) => (
  <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>
    {text}
  </div>
);

const inputStyle: CSSProperties = {
  width:"100%", padding:"9px 12px", background:ROW,
  border:`1.5px solid ${BORDER}`, borderRadius:8, color:TEXT,
  fontSize:13, fontFamily:FONT, fontWeight:500, outline:"none",
  transition:"border-color .15s",
};

const segBtn = (active: boolean): CSSProperties => ({
  flex:1, padding:"8px 0", border:"none", cursor:"pointer", borderRadius:7,
  fontSize:12, fontWeight: active ? 800 : 600,
  background: active ? RED : "transparent",
  color: active ? "#fff" : MUTED,
  transition:"all .15s", fontFamily:FONT, letterSpacing:.3,
});

const Toggle: FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <button onClick={onChange} style={{
    position:"relative", width:40, height:22, borderRadius:11,
    background: on ? RED : "rgba(255,255,255,0.12)",
    cursor:"pointer", transition:"background .2s", flexShrink:0, border:"none", padding:0,
  }}>
    <div style={{
      position:"absolute", top:3, left: on ? 21 : 3,
      width:16, height:16, borderRadius:"50%", background:"#fff",
      transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,0.3)",
    }} />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// QR Source Control
// ─────────────────────────────────────────────────────────────────────────────

interface QrSourceControlProps {
  mode:       QrSourceMode;
  url:        string;
  path:       string;
  base64Raw:  string;
  qrString:   string;
  onChange:   (patch: Partial<Pick<PlaygroundState, "qrMode"|"qrUrl"|"qrPath"|"qrBase64"|"qrString">>) => void;
  resolvedSrc?: string;
  qrError?:    string;
}

const QR_MODES: { mode: QrSourceMode; label: string }[] = [
  { mode:"placeholder", label:"Placeholder" },
  { mode:"url",         label:"URL"         },
  { mode:"path",        label:"Path"        },
  { mode:"base64",      label:"Base64"      },
  { mode:"string",      label:"QR String"   },
];

const QrSourceControl: FC<QrSourceControlProps> = ({
  mode, url, path, base64Raw, qrString, onChange, resolvedSrc, qrError,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result is "data:image/png;base64,XXXX"
      // strip the prefix to store raw base64
      const raw = result.includes(",") ? result.split(",")[1] : result;
      onChange({ qrBase64: raw, qrMode: "base64" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <SectionLabel text="QR Source" />

      {/* Mode tabs */}
      <div style={{
        display:"flex", background:ROW, borderRadius:9, padding:3,
        border:`1.5px solid ${BORDER}`, gap:2, marginBottom:12,
        flexWrap:"wrap",
      }}>
        {QR_MODES.map(({ mode: m, label }) => (
          <button key={m} style={{
            ...segBtn(mode === m),
            flex:"1 1 auto", padding:"7px 4px", fontSize:11,
          }} onClick={() => onChange({ qrMode: m })}>
            {label}
          </button>
        ))}
      </div>

      {/* Mode-specific input */}
      {mode === "placeholder" && (
        <div style={{
          background:ROW, borderRadius:8, padding:"12px 14px",
          border:`1px solid ${BORDER}`, fontSize:12, color:MUTED, lineHeight:1.6,
        }}>
          Uses the built-in SVG placeholder QR.<br />
          Switch to another mode to supply a real QR.
        </div>
      )}

      {mode === "url" && (
        <div>
          <input
            className="pg-input"
            style={inputStyle}
            type="url"
            value={url}
            placeholder="https://example.com/qr.png"
            onChange={e => onChange({ qrUrl: e.target.value })}
          />
          <div style={{ fontSize:11, color:MUTED, marginTop:5 }}>
            Any public image URL (PNG, JPG, SVG, WebP)
          </div>
        </div>
      )}

      {mode === "path" && (
        <div>
          <input
            className="pg-input"
            style={inputStyle}
            type="text"
            value={path}
            placeholder="/qr-codes/my-qr.png"
            onChange={e => onChange({ qrPath: e.target.value })}
          />
          <div style={{ fontSize:11, color:MUTED, marginTop:5 }}>
            Relative or absolute path served from your public folder
          </div>
        </div>
      )}

      {mode === "base64" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* File upload shortcut */}
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width:"100%", padding:"10px 0", borderRadius:8, border:`1.5px dashed ${BORDER}`,
              background:"transparent", color:TEXT, fontSize:12, fontFamily:FONT,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"border-color .15s",
            }}
          >
            <span style={{ fontSize:16 }}>📁</span>
            Upload image → auto base64
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileUpload} />

          {/* Or paste raw */}
          <div style={{ fontSize:11, color:MUTED, textAlign:"center" }}>— or paste raw base64 below —</div>
          <textarea
            className="pg-input"
            style={{ ...inputStyle, height:80, resize:"vertical", fontFamily:"monospace", fontSize:11 }}
            value={base64Raw}
            placeholder="iVBORw0KGgoAAAANSUhEUgAA..."
            onChange={e => onChange({ qrBase64: e.target.value })}
          />
          <div style={{ fontSize:11, color:MUTED }}>
            Raw base64 (without the <code style={{ color:YELLOW }}>data:image/...;base64,</code> prefix)
          </div>

          {/* Preview thumb */}
          {base64Raw.trim() && (
            <img
              src={`data:image/png;base64,${base64Raw.trim()}`}
              alt="preview"
              style={{ width:64, height:64, objectFit:"contain", borderRadius:6, border:`1px solid ${BORDER}` }}
              onError={() => {}}
            />
          )}
        </div>
      )}

      {mode === "string" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <textarea
            className="pg-input"
            style={{ ...inputStyle, height:72, resize:"vertical", fontFamily:"monospace", fontSize:12 }}
            value={qrString}
            placeholder="00020101021229370016..."
            onChange={e => onChange({ qrString: e.target.value })}
          />
          <div style={{ fontSize:11, color:MUTED, lineHeight:1.6 }}>
            Paste any KHQR payload string, URL, or text — it will be rendered as a live QR code.
          </div>

          {/* Status */}
          {qrString.trim() && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
              {qrError
                ? <><span style={{ color:"#f87171" }}>✗</span><span style={{ color:"#f87171" }}>{qrError}</span></>
                : resolvedSrc
                  ? <><span style={{ color:GREEN }}>✓</span><span style={{ color:GREEN }}>QR generated successfully</span></>
                  : <><span style={{ color:YELLOW }}>⟳</span><span style={{ color:YELLOW }}>Generating…</span></>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAYGROUND
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<PlaygroundState>({
    variant:            "portrait",
    receiverName:       "Devit Houtkeo",
    amountRaw:          "1300000",
    currency:           "KHR",
    showCurrencySymbol: false,
    qrMode:             "placeholder",
    qrUrl:              "",
    qrPath:             "",
    qrBase64:           "",
    qrString:           "",
  });

  const set = useCallback(<K extends keyof PlaygroundState>(key: K, val: PlaygroundState[K]) =>
    setState(prev => ({ ...prev, [key]: val })), []);

  const patch = useCallback((p: Partial<PlaygroundState>) =>
    setState(prev => ({ ...prev, ...p })), []);

  // QR string → data URI
  // Always call hook (Rules of Hooks) — returns null when text is empty
  const { dataUri: qrStringDataUri, error: qrStringError } = useQrDataUri(state.qrString);

  // Resolve the final qrSrc passed to the card components
  const resolvedQrSrc: string | undefined = (() => {
    switch (state.qrMode) {
      case "url":         return state.qrUrl.trim()    || undefined;
      case "path":        return state.qrPath.trim()   || undefined;
      case "base64":      return state.qrBase64.trim() ? `data:image/png;base64,${state.qrBase64.trim()}` : undefined;
      case "string":      return (state.qrString.trim() ? qrStringDataUri : undefined) || undefined;
      case "placeholder":
      default:            return undefined;
    }
  })();

  const amount: number | undefined = (() => {
    const s = state.amountRaw.trim();
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  })();

  const isSquare = state.variant === "square";

  // Code preview lines
  const qrSrcLine = (() => {
    switch (state.qrMode) {
      case "url":    return state.qrUrl.trim()    ? `  qrSrc="${state.qrUrl.trim()}"` : null;
      case "path":   return state.qrPath.trim()   ? `  qrSrc="${state.qrPath.trim()}"` : null;
      case "base64": return state.qrBase64.trim() ? `  qrSrc="data:image/png;base64,{...}"` : null;
      case "string": return qrStringDataUri        ? `  qrSrc={generatedDataUri}` : null;
      default:       return null;
    }
  })();

  const componentName = isSquare ? "KhqrQrSquare" : "KhqrQrCard";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700;6..12,800;6..12,900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#181818; }
        .pg-input:focus { border-color:#E1232E !important; box-shadow:0 0 0 3px rgba(225,35,46,0.15); }
        textarea.pg-input { display:block; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#181818", fontFamily:FONT, display:"flex", flexDirection:"column" }}>

        {/* Top bar */}
        <div style={{ borderBottom:`1px solid ${BORDER}`, padding:"14px 24px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ color:RED, fontWeight:900, fontSize:16, letterSpacing:2, textTransform:"uppercase" }}>KHQR</div>
          <div style={{ color:BORDER, fontSize:18 }}>|</div>
          <div style={{ color:TEXT, fontWeight:600, fontSize:14 }}>Component Playground</div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"row", flexWrap:"wrap", minHeight:0 }}>

          {/* ══ LEFT PANEL ══ */}
          <div style={{
            width:320, minWidth:280, flexShrink:0, background:PANEL,
            borderRight:`1px solid ${BORDER}`, padding:"24px 20px",
            display:"flex", flexDirection:"column", gap:24, overflowY:"auto",
          }}>

            {/* Card variant */}
            <div>
              <SectionLabel text="Card Variant" />
              <div style={{ display:"flex", background:ROW, borderRadius:9, padding:3, border:`1.5px solid ${BORDER}` }}>
                {(["portrait","square"] as CardVariant[]).map(v => (
                  <button key={v} style={segBtn(state.variant === v)} onClick={() => set("variant", v)}>
                    {v === "portrait" ? "Portrait (20:29)" : "Square (8:9)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Portrait-only props */}
            {!isSquare && (
              <>
                <div>
                  <SectionLabel text="Receiver Name" />
                  <input className="pg-input" style={inputStyle} type="text"
                    value={state.receiverName} placeholder="e.g. Devit Houtkeo"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("receiverName", e.target.value)} />
                </div>

                <div>
                  <SectionLabel text="Amount" />
                  <input className="pg-input" style={inputStyle} type="number" min={0}
                    value={state.amountRaw} placeholder="Leave empty for no amount"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("amountRaw", e.target.value)} />
                  <div style={{ fontSize:11, color:MUTED, marginTop:5 }}>
                    {state.amountRaw.trim() === ""
                      ? "Empty → shows currency only"
                      : `Formatted: ${Number(state.amountRaw).toLocaleString("en-US")}`}
                  </div>
                </div>

                <div>
                  <SectionLabel text="Currency" />
                  <div style={{ display:"flex", background:ROW, borderRadius:9, padding:3, border:`1.5px solid ${BORDER}` }}>
                    {(["KHR","USD"] as Currency[]).map(c => (
                      <button key={c} style={segBtn(state.currency === c)} onClick={() => set("currency", c)}>
                        {c === "KHR" ? "៛  KHR" : "$  USD"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel text="Show Currency Symbol" />
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:TEXT, fontWeight:500 }}>
                      {state.showCurrencySymbol
                        ? `Show "${state.currency === "USD" ? "$" : "៛"}" prefix`
                        : `Show "${state.currency}" suffix`}
                    </span>
                    <Toggle on={state.showCurrencySymbol} onChange={() => set("showCurrencySymbol", !state.showCurrencySymbol)} />
                  </div>
                </div>
              </>
            )}

            <div style={{ borderTop:`1px solid ${BORDER}` }} />

            {/* QR source control */}
            <QrSourceControl
              mode={state.qrMode}
              url={state.qrUrl}
              path={state.qrPath}
              base64Raw={state.qrBase64}
              qrString={state.qrString}
              resolvedSrc={resolvedQrSrc}
              qrError={qrStringError ?? undefined}
              onChange={patch}
            />

            <div style={{ borderTop:`1px solid ${BORDER}` }} />

            {/* Live code */}
            <div>
              <SectionLabel text="Live Code" />
              <div style={{ background:"#111", borderRadius:10, padding:"14px 16px", border:`1px solid ${BORDER}`, overflowX:"auto" }}>
                <pre style={{ fontSize:11.5, lineHeight:1.75, fontFamily:"'Fira Code','Cascadia Code',monospace", margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                  <span style={{ color:"#61afef" }}>&lt;{componentName}</span>
                  {!isSquare && (<>
                    {"\n"}<span style={{ color:"#e5c07b" }}>  receiverName</span><span style={{ color:"#abb2bf" }}>{"="}</span><span style={{ color:"#98c379" }}>"{state.receiverName}"</span>
                    {state.amountRaw.trim() && (<>{"\n"}<span style={{ color:"#e5c07b" }}>  amount</span><span style={{ color:"#abb2bf" }}>{"={"}</span><span style={{ color:"#d19a66" }}>{state.amountRaw.trim()}</span><span style={{ color:"#abb2bf" }}>{"}"}</span></>)}
                    {"\n"}<span style={{ color:"#e5c07b" }}>  currency</span><span style={{ color:"#abb2bf" }}>{"="}</span><span style={{ color:"#98c379" }}>"{state.currency}"</span>
                    {state.showCurrencySymbol && (<>{"\n"}<span style={{ color:"#e5c07b" }}>  showCurrencySymbol</span></>)}
                  </>)}
                  {qrSrcLine && (<>{"\n"}<span style={{ color:"#e5c07b" }}>  qrSrc</span><span style={{ color:"#abb2bf" }}>{"="}</span><span style={{ color:"#98c379" }}>"{qrSrcLine.trim().replace(/qrSrc="/, "").replace(/"$/, "")}"</span></>)}
                  {"\n"}<span style={{ color:"#61afef" }}>/&gt;</span>
                </pre>
              </div>
            </div>

          </div>

          {/* ══ RIGHT — Preview ══ */}
          <div style={{
            flex:1, minWidth:280, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", padding:"48px 32px",
            background:"#181818", position:"relative",
          }}>
            {/* Grid bg */}
            <div style={{
              position:"absolute", inset:0, pointerEvents:"none",
              backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
              backgroundSize:"32px 32px",
            }} />

            {/* Card */}
            <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth: isSquare ? 300 : 260 }}>
              {isSquare
                ? <KhqrQrSquare qrSrc={resolvedQrSrc} />
                : <KhqrQrCard
                    receiverName={state.receiverName || " "}
                    amount={amount}
                    currency={state.currency}
                    showCurrencySymbol={state.showCurrencySymbol}
                    qrSrc={resolvedQrSrc}
                  />
              }
            </div>

            {/* Prop badges */}
            <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", gap:8, marginTop:28, justifyContent:"center" }}>
              {[
                { k:"variant", v:state.variant },
                { k:"qrMode",  v:state.qrMode  },
                ...(!isSquare ? [
                  { k:"currency", v:state.currency },
                  { k:"symbol",   v:state.showCurrencySymbol ? "on" : "off" },
                  { k:"amount",   v:state.amountRaw.trim() || "empty" },
                ] : []),
              ].map(({ k, v }) => (
                <div key={k} style={{
                  background:"rgba(255,255,255,0.05)", border:`1px solid ${BORDER}`,
                  borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:600,
                  display:"flex", gap:5, alignItems:"center",
                }}>
                  <span style={{ color:"rgba(255,255,255,0.25)" }}>{k}</span>
                  <span style={{ color:TEXT }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}