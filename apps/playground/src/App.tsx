import {
  useState, useRef, useEffect, useCallback,
  CSSProperties, FC, RefObject, ChangeEvent,
} from "react";
import QRCode from "qrcode";

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
  /** Resolved image src (data URI, URL, or path). Pass `undefined` for placeholder. */
  qrSrc?: string;
  /** True when qrSrc was generated with margin:0 (e.g. from QR String mode) — skips auto-crop. */
  isGenerated?: boolean;
  style?: CSSProperties;
}

export interface KhqrQrSquareProps {
  qrSrc?: string;
  /** True when qrSrc was generated with margin:0 — skips auto-crop. */
  isGenerated?: boolean;
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

// ─── Canvas auto-crop: strips white quiet zone from external QR images ────────
// Draws the image onto a canvas, finds the tightest dark-pixel bounding box,
// and returns a cropped data-URI — so base64/url/path images look identical
// in size to QR String output (which is already generated with margin:0).

function useCroppedSrc(src: string | undefined): string | undefined {
  const [out, setOut] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!src) { setOut(undefined); return; }
    let alive = true;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onerror = () => { if (alive) setOut(src); };

    img.onload = () => {
      if (!alive) return;
      const W = img.naturalWidth  || img.width  || 512;
      const H = img.naturalHeight || img.height || 512;

      // Draw onto canvas so we can read pixels
      const cvs = document.createElement("canvas");
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext("2d");
      if (!ctx) { setOut(src); return; }
      ctx.drawImage(img, 0, 0);

      let px: ImageData;
      try { px = ctx.getImageData(0, 0, W, H); }
      catch (_e) { setOut(src); return; }   // tainted canvas (cross-origin) → fallback

      const d = px.data;
      // "dark" = not near-white (handles both black and dark-grey modules)
      const dark = (i: number) =>
        d[i+3] > 64 && (d[i] < 220 || d[i+1] < 220 || d[i+2] < 220);

      let x0 = W, x1 = 0, y0 = H, y1 = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (dark((y * W + x) * 4)) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }

      if (x0 >= x1 || y0 >= y1) { if (alive) setOut(src); return; } // nothing found

      // Add tiny padding so finder-pattern edges aren't clipped
      const pad = Math.max(2, Math.round(Math.min(W, H) * 0.004));
      const cx = Math.max(0, x0 - pad);
      const cy = Math.max(0, y0 - pad);
      const cw = Math.min(W, x1 + pad + 1) - cx;
      const ch = Math.min(H, y1 + pad + 1) - cy;

      const out2 = document.createElement("canvas");
      out2.width = cw; out2.height = ch;
      out2.getContext("2d")!.drawImage(cvs, cx, cy, cw, ch, 0, 0, cw, ch);

      if (alive) setOut(out2.toDataURL("image/png"));
    };

    img.src = src;
    return () => { alive = false; };
  }, [src]);

  return out;
}

// ─── QR image renderer ────────────────────────────────────────────────────────
// isGenerated=true  → QR String (margin:0), render as-is
// isGenerated=false → url / path / base64, auto-crop quiet zone via canvas

const QrImage: FC<{ src?: string; isGenerated?: boolean }> = ({ src, isGenerated = false }) => {
  const cropped = useCroppedSrc(!src || isGenerated ? undefined : src);
  const display = src ? (isGenerated ? src : (cropped ?? src)) : undefined;

  if (!display) return <PlaceholderQR />;
  return (
    <img
      src={display}
      alt="KHQR"
      draggable={false}
      style={{ width:"100%", height:"100%", objectFit:"fill", display:"block" }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KhqrQrCard  (portrait 20:29)
// ─────────────────────────────────────────────────────────────────────────────

export const KhqrQrCard: FC<KhqrQrCardProps> = ({
  receiverName, amount, currency = "KHR",
  showCurrencySymbol = false, qrSrc, isGenerated = false, style: extStyle = {},
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
            <QrImage src={qrSrc} isGenerated={isGenerated} />
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

export const KhqrQrSquare: FC<KhqrQrSquareProps> = ({ qrSrc, isGenerated = false, style: extStyle = {} }) => {
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
          <QrImage src={qrSrc} isGenerated={isGenerated} />
          <CentreBadge d={badgeD} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QR encoding — uses `qrcode` (static import, reliable in all bundlers)
// Install: npm install qrcode && npm install -D @types/qrcode
// ─────────────────────────────────────────────────────────────────────────────

function useQrDataUri(text: string): { dataUri: string | null; error: string | null } {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [error,   setError  ] = useState<string | null>(null);

  useEffect(() => {
    if (!text.trim()) { setDataUri(null); setError(null); return; }
    let cancelled = false;
    QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 0,
      width: 512,
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then((uri: string) => { if (!cancelled) { setDataUri(uri); setError(null); } })
      .catch((e: any) => { if (!cancelled) { setError(e?.message || "QR generation failed"); setDataUri(null); } });
    return () => { cancelled = true; };
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
      // Store the full data URI (including "data:image/xxx;base64," prefix)
      const result = ev.target?.result as string;
      onChange({ qrBase64: result, qrMode: "base64" });
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
            Paste raw base64 <em>or</em> a full <code style={{ color:YELLOW }}>data:image/...;base64,...</code> data URI
          </div>

          {/* Preview thumb */}
          {base64Raw.trim() && (
            <img
              src={base64Raw.trim().startsWith("data:") ? base64Raw.trim() : `data:image/png;base64,${base64Raw.trim()}`}
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
  const { resolvedQrSrc, isGenerated } = (() => {
    switch (state.qrMode) {
      case "url":
        return { resolvedQrSrc: state.qrUrl.trim() || undefined, isGenerated: false };
      case "path":
        return { resolvedQrSrc: state.qrPath.trim() || undefined, isGenerated: false };
      case "base64": {
        const b = state.qrBase64.trim();
        if (!b) return { resolvedQrSrc: undefined, isGenerated: false };
        const src = b.startsWith("data:") ? b : `data:image/png;base64,${b}`;
        return { resolvedQrSrc: src, isGenerated: false };
      }
      case "string":
        return {
          resolvedQrSrc: (state.qrString.trim() ? qrStringDataUri : undefined) || undefined,
          isGenerated: true,
        };
      default:
        return { resolvedQrSrc: undefined, isGenerated: false };
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
                ? <KhqrQrSquare qrSrc={resolvedQrSrc} isGenerated={isGenerated} />
                : <KhqrQrCard
                    receiverName={state.receiverName || " "}
                    amount={amount}
                    currency={state.currency}
                    showCurrencySymbol={state.showCurrencySymbol}
                    qrSrc={resolvedQrSrc}
                    isGenerated={isGenerated}
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