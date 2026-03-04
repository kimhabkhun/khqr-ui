export type KhqrQrCardProps = {
  receiverName: string;
  amount?: number | string; // can be empty
  currency?: "KHR" | "USD";
  showCurrencySymbol?: boolean; // true => "$" or "៛" instead of code
  qrSrc: string; // URL / base64 image
  className?: string;
};

/**
 * KHQR QR Card (Responsive + consistent)
 * - Aspect ratio: 20:29
 * - Header height: 12% of card height
 * - Folded corner: always bottom-right of header (no fixed px)
 */
export function KhqrQrCard({
  receiverName,
  amount,
  currency = "KHR",
  showCurrencySymbol = false,
  qrSrc,
  className = "",
}: KhqrQrCardProps) {
  const formatAmount = (v: number | string | undefined) => {
    if (v === undefined || v === null || v === "") return "";
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n)) return String(v);
    return n.toLocaleString("en-US");
  };

  const symbol = (() => {
    if (!showCurrencySymbol) return "";
    if (currency === "USD") return "$";
    if (currency === "KHR") return "៛";
    return "";
  })();

  const amountText = formatAmount(amount);
  const showAmountNumber = amountText !== "";

  return (
    <div
      className={[
        "relative w-full max-w-[360px] aspect-[20/29] rounded-2xl bg-white overflow-hidden",
        "shadow-[0_0_16px_rgba(0,0,0,0.10)]",
        className,
      ].join(" ")}
      style={
        {
          // scale tokens based on card width (responsive & stable)
          // fold size and paddings will remain consistent across breakpoints
          ["--fold" as any]: "clamp(18px, 6vw, 30px)",
          ["--padX" as any]: "clamp(16px, 4.2vw, 28px)",
          ["--padTop" as any]: "clamp(14px, 3.8vw, 22px)",
          ["--qrPadY" as any]: "clamp(16px, 5vw, 28px)",
        } as React.CSSProperties
      }
    >
      {/* HEADER (12% height) */}
<div className="relative w-full" style={{ height: "12%" }}>
  <div className="absolute inset-0 bg-[#E1232E] z-0" />

  <div className="relative z-10 flex items-center justify-center h-full">
    <img
      src="/KHQR_Logo.png"
      alt="KHQR Logo"
      className="h-[60%] w-auto object-contain brightness-0 invert select-none"
      draggable={false}
    />

    {/* Folded corner (top-bottom) */}
    <div
      className="absolute bottom-0 right-0 z-20 pointer-events-none"
      style={{
        width: 0,
        height: 0,
        borderLeft: "var(--fold) solid transparent",
        borderTop: "var(--fold) solid rgba(255,255,255,0.98)",
        transform: "rotate(180deg)",
        transformOrigin: "bottom right",
      }}
    />
  </div>
</div>

      {/* BODY (88%) */}
      <div className="h-[88%] flex flex-col min-h-0">
        {/* Text area */}
        <div
          className="w-full"
          style={{
            paddingLeft: "var(--padX)",
            paddingRight: "var(--padX)",
            paddingTop: "var(--padTop)",
          }}
        >
          {/* Receiver name */}
          <div
            className="text-[#111] opacity-90 font-medium leading-tight truncate"
            style={{
              fontSize: "clamp(11px, 2.4vw, 14px)",
            }}
            title={receiverName}
          >
            {receiverName}
          </div>

          {/* Amount row */}
          <div className="flex items-baseline gap-2 mt-1">
            <div
              className="text-[#111] font-extrabold leading-none"
              style={{
                fontSize: "clamp(20px, 5.2vw, 30px)",
              }}
            >
              {showAmountNumber ? (
                <>
                  {symbol ? <span className="mr-1">{symbol}</span> : null}
                  {amountText}
                </>
              ) : (
                <>
                  {symbol ? <span className="mr-1">{symbol}</span> : null}
                  {amount === 0 ? "0" : ""}
                </>
              )}
            </div>

            {/* Currency */}
            <div
              className="text-[#111] opacity-80 font-medium"
              style={{
                fontSize: "clamp(11px, 2.4vw, 14px)",
              }}
            >
              {currency}
            </div>
          </div>

          {/* Dashed divider */}
          <div className="mt-4 border-t border-dashed border-black/30" />
        </div>

        {/* QR area */}
        <div
          className="flex items-center justify-center flex-1 min-h-0"
          style={{
            paddingLeft: "var(--padX)",
            paddingRight: "var(--padX)",
            paddingTop: "var(--qrPadY)",
            paddingBottom: "var(--qrPadY)",
          }}
        >
          {/* Keep QR always square and centered */}
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
            <img
              src={qrSrc}
              alt="KHQR"
              className="object-contain w-full h-full select-none"
              draggable={false}
            />

            {/* Center badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center justify-center w-[12%] min-w-8 aspect-square bg-black border-2 border-white rounded-full shadow-sm">
                <span className="text-base font-black text-white">៛</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}