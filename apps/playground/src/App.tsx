import { useState, useRef, useEffect, CSSProperties, FC, RefObject } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Currency = "KHR" | "USD";

export interface KhqrQrCardProps {
  receiverName: string;
  amount?: number | string;
  currency?: Currency;
  showCurrencySymbol?: boolean;
  qrSrc?: string;
  style?: CSSProperties;
}

export interface KhqrQrSquareProps {
  qrSrc?: string;
  style?: CSSProperties;
}

interface KhqrLogoProps {
  px: number;
}

interface CentreBadgeProps {
  d: number;
}

// ─── ResizeObserver hook ───────────────────────────────────────────────────────

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
// Uses the official KHQR_Logo.png with CSS filter to render it white on red.
// Place KHQR_Logo.png in your public folder (e.g. /public/KHQR_Logo.png).

const KhqrLogo: FC<KhqrLogoProps> = ({ px }) => (
  <img
    src="/KHQR_Logo.png"
    alt="KHQR"
    draggable={false}
    style={{
      height:          px,
      width:           "auto",
      display:         "block",
      objectFit:       "contain",
      // Converts any colour to pure white:
      // brightness(0) → all black, invert(1) → all white
      filter:          "brightness(0) invert(1)",
      userSelect:      "none",
      pointerEvents:   "none",
    }}
  />
);

// ─── Placeholder QR ───────────────────────────────────────────────────────────

const PlaceholderQR: FC = () => {
  const N    = 25;
  const cell = 200 / N;

  const on = new Set<string>([
    "0,7","0,8","0,11","0,13","0,17",
    "1,7","1,9","1,12","1,14","1,16",
    "2,8","2,10","2,13","2,15","2,18",
    "3,7","3,11","3,14","3,16",
    "4,8","4,9","4,12","4,17","4,18",
    "5,7","5,13","5,15",
    "6,8","6,10","6,12","6,16",
    "7,0","7,7","7,9","7,11","7,14","7,16","7,18","7,24",
    "8,1","8,8","8,12","8,15","8,17","8,23",
    "9,2","9,7","9,9","9,13","9,16","9,22",
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
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (on.has(`${r},${c}`)) cells.push([r, c]);

  const finders: [number, number][] = [[0, 0], [0, 18], [18, 0]];

  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="200" height="200" fill="white" />
      {cells.map(([r, c], i) => (
        <rect key={i} x={c * cell} y={r * cell} width={cell - 0.5} height={cell - 0.5} fill="#111" />
      ))}
      {finders.map(([fr, fc], i) => (
        <g key={i}>
          <rect x={fc * cell}           y={fr * cell}           width={7 * cell} height={7 * cell} rx={2.5} fill="#111" />
          <rect x={fc * cell + cell}    y={fr * cell + cell}    width={5 * cell} height={5 * cell} rx={1.5} fill="white" />
          <rect x={fc * cell + 2*cell}  y={fr * cell + 2*cell}  width={3 * cell} height={3 * cell} rx={1}   fill="#111" />
        </g>
      ))}
    </svg>
  );
};

// ─── Centre Badge ─────────────────────────────────────────────────────────────

const CentreBadge: FC<CentreBadgeProps> = ({ d }) => (
  <div
    style={{
      position:       "absolute",
      top:            "50%",
      left:           "50%",
      transform:      "translate(-50%,-50%)",
      width:          d,
      height:         d,
      borderRadius:   "50%",
      background:     "#000000",
      border:         "2.5px solid #FFFFFF",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      boxShadow:      "0 1px 6px rgba(0,0,0,0.28)",
      zIndex:         5,
      pointerEvents:  "none",
    }}
  >
    <span style={{ color: "#FFFFFF", fontSize: d * 0.50, fontWeight: 900, lineHeight: 1, fontFamily: "sans-serif" }}>
      &#x17DB;
    </span>
  </div>
);

// ─── Shared header ────────────────────────────────────────────────────────────

interface CardHeaderProps {
  logoH: number;
  fold:  number;
}

const CardHeader: FC<CardHeaderProps> = ({ logoH, fold }) => (
  <div
    style={{
      position:       "relative",
      height:         "12%",
      background:     "#E1232E",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      flexShrink:     0,
      overflow:       "hidden",
    }}
  >
    <KhqrLogo px={logoH} />
    {/* Page-fold triangle — bottom-right corner */}
    <div
      style={{
        position:    "absolute",
        bottom:      0,
        right:       0,
        width:       0,
        height:      0,
        borderLeft:  `${fold}px solid transparent`,
        borderBottom:`${fold}px solid #FFFFFF`,
        zIndex:      10,
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// KhqrQrCard  (portrait 20:29)
// Spec: header 12% h · padX=10%h · qrPadY=8%h · name 3% · amount 6.5% · curr 3%
// ─────────────────────────────────────────────────────────────────────────────

export const KhqrQrCard: FC<KhqrQrCardProps> = ({
  receiverName,
  amount,
  currency = "KHR",
  showCurrencySymbol = false,
  qrSrc,
  style: extStyle = {},
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawH    = useCardHeight(cardRef);
  const h       = rawH || (360 * 29) / 20;

  const padX   = h * 0.10;
  const padTop = h * 0.046;
  const qrPadY = h * 0.08;
  const fsName = h * 0.030;
  const fsAmt  = h * 0.065;
  const fsCurr = h * 0.030;
  const fold   = h * 0.058;
  const logoH  = h * 0.052;
  const badgeD = h * 0.080;
  const divMT  = h * 0.030;
  const gap    = h * 0.008;

  const fmt = (v: number | string | undefined): string | null => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n)) return String(v);
    return n.toLocaleString("en-US");
  };

  const fmtAmt = fmt(amount);
  const symbol = showCurrencySymbol ? (currency === "USD" ? "$" : "\u17DB") : "";

  return (
    <div
      ref={cardRef}
      style={{
        position:      "relative",
        width:         "100%",
        maxWidth:      360,
        aspectRatio:   "20 / 29",
        borderRadius:  16,
        background:    "#FFFFFF",
        boxShadow:     "0 0 16px rgba(0,0,0,0.10)",
        overflow:      "hidden",
        display:       "flex",
        flexDirection: "column",
        fontFamily:    "'Nunito Sans', sans-serif",
        ...extStyle,
      }}
    >
      <CardHeader logoH={logoH} fold={fold} />

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

        {/* Text section */}
        <div style={{ paddingLeft: padX, paddingRight: padX, paddingTop: padTop }}>

          {/* Receiver name */}
          <div
            style={{
              fontSize:     fsName,
              fontWeight:   600,
              color:        "rgba(17,17,17,0.90)",
              lineHeight:   1.35,
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
            }}
            title={receiverName}
          >
            {receiverName}
          </div>

          {/* Amount row */}
          <div style={{ display: "flex", alignItems: "baseline", gap: gap * 2.5, marginTop: gap }}>
            <div style={{ fontSize: fsAmt, fontWeight: 800, color: "#111111", lineHeight: 1 }}>
              {symbol && <span style={{ marginRight: gap * 1.5 }}>{symbol}</span>}
              {fmtAmt !== null
                ? fmtAmt
                : amount === 0
                  ? "0"
                  : null}
            </div>
            <div style={{ fontSize: fsCurr, fontWeight: 500, color: "rgba(17,17,17,0.80)", lineHeight: 1 }}>
              {currency}
            </div>
          </div>

          {/* Dashed divider */}
          <div style={{ marginTop: divMT, borderTop: "1.5px dashed rgba(0,0,0,0.22)" }} />
        </div>

        {/* QR section */}
        <div
          style={{
            flex:           1,
            minHeight:      0,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            paddingLeft:    padX,
            paddingRight:   padX,
            paddingTop:     qrPadY,
            paddingBottom:  qrPadY,
          }}
        >
          <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            {qrSrc
              ? <img src={qrSrc} alt="KHQR" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} draggable={false} />
              : <PlaceholderQR />
            }
            <CentreBadge d={badgeD} />
          </div>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KhqrQrSquare  (8:9 ratio) — no name, no amount
// Header (12% h) + QR only, QR width = card width * 0.9
// ─────────────────────────────────────────────────────────────────────────────

export const KhqrQrSquare: FC<KhqrQrSquareProps> = ({ qrSrc, style: extStyle = {} }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawH    = useCardHeight(cardRef);
  const h       = rawH || (400 * 9) / 8;

  const fold   = h * 0.058;
  const logoH  = h * 0.052;
  const badgeD = h * 0.080;

  return (
    <div
      ref={cardRef}
      style={{
        position:      "relative",
        width:         "100%",
        maxWidth:      400,
        aspectRatio:   "8 / 9",
        borderRadius:  16,
        background:    "#FFFFFF",
        boxShadow:     "0 0 16px rgba(0,0,0,0.10)",
        overflow:      "hidden",
        display:       "flex",
        flexDirection: "column",
        fontFamily:    "'Nunito Sans', sans-serif",
        ...extStyle,
      }}
    >
      <CardHeader logoH={logoH} fold={fold} />

      {/* Body — QR only, centred, width = 90% of card width */}
      <div
        style={{
          flex:           1,
          minHeight:      0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: "90%", aspectRatio: "1 / 1" }}>
          {qrSrc
            ? <img src={qrSrc} alt="KHQR" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} draggable={false} />
            : <PlaceholderQR />
          }
          <CentreBadge d={badgeD} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo variants type
// ─────────────────────────────────────────────────────────────────────────────

interface DemoVariant {
  label:  string;
  square: boolean;
  props:  Partial<KhqrQrCardProps>;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<number>(0);

  const variants: DemoVariant[] = [
    { label: "Standard",     square: false, props: { amount: 1300000, currency: "KHR" } },
    { label: "0 KHR",        square: false, props: { amount: 0,       currency: "KHR" } },
    { label: "No amount",    square: false, props: { amount: undefined, currency: "KHR" } },
    { label: "$ USD",        square: false, props: { amount: 1300000, currency: "USD", showCurrencySymbol: true } },
    { label: "\u17DB KHR",   square: false, props: { amount: 1300000, currency: "KHR", showCurrencySymbol: true } },
    { label: "Square (8:9)", square: true,  props: {} },
  ];

  const cur = variants[tab];

  const tabStyle = (active: boolean): CSSProperties => ({
    padding:       "7px 14px",
    borderRadius:  8,
    fontSize:      12,
    fontWeight:    active ? 800 : 500,
    background:    active ? "#E1232E" : "rgba(255,255,255,0.07)",
    color:         active ? "#fff"    : "rgba(255,255,255,0.45)",
    border:        "none",
    cursor:        "pointer",
    transition:    "all .15s",
    letterSpacing: 0.4,
    fontFamily:    "'Nunito Sans', sans-serif",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700;6..12,800;6..12,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #181818; }
      `}</style>

      <div
        style={{
          minHeight:     "100vh",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          padding:       "44px 20px 64px",
          background:    "#181818",
          fontFamily:    "'Nunito Sans', sans-serif",
        }}
      >
        <div style={{ color: "#E1232E", fontWeight: 900, fontSize: 18, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          KHQR Card
        </div>
        <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, letterSpacing: 1, marginBottom: 30 }}>
          OFFICIAL GUIDELINE IMPLEMENTATION
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
          {variants.map((v, i) => (
            <button key={i} onClick={() => setTab(i)} style={tabStyle(tab === i)}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{ width: "100%", maxWidth: cur.square ? 300 : 260 }}>
          {cur.square
            ? <KhqrQrSquare />
            : <KhqrQrCard receiverName="Devit Houtkeo" {...cur.props} />
          }
        </div>

        {cur.square && (
          <div style={{ marginTop: 14, color: "rgba(255,255,255,0.30)", fontSize: 11, letterSpacing: 0.5, textAlign: "center" }}>
            Ratio 8:9 &nbsp;·&nbsp; QR width = card width &times; 0.9 &nbsp;·&nbsp; No name / amount
          </div>
        )}
      </div>
    </>
  );
}