
export type KhqrQrCardProps = {
  receiverName: string;
  amount?: number | string; // can be empty
  currency?: "KHR" | "USD";
  showCurrencySymbol?: boolean; // true => "$" or "៛" instead of code
  qrSrc: string; // URL / base64 image
  className?: string;
};

/**
 * KHQR QR Card
 * - Aspect ratio: 20:29
 * - Header height: 12% of card height
 * - Left/Right padding: ~10% of card height (per guideline)
 * - Top/Bottom padding for QR section: ~8% of card height
 * - Shadow: x0 y0 blur16 black 10%
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
        // ratio 20:29 => height = width * 29/20
        "relative w-full max-w-90 aspect-20/29 rounded-2xl bg-white overflow-hidden",
        // shadow: 0 0 16px rgba(0,0,0,0.10)
        "shadow-[0_0_16px_rgba(0,0,0,0.10)]",
        className,
      ].join(" ")}
    >
      {/* HEADER (12% height) */}
      <div
        className="relative w-full"
        style={{ height: "12%" }}
      >
        <div className="absolute inset-0 bg-[#E1232E]" />
        {/* Brand text centered */}
        <div className="relative flex items-center justify-center h-full">
          <span className="text-lg font-extrabold tracking-widest text-white">
            <img 
              src="/KHQR_Logo.png" 
              alt="KHQR Logo"
              className="w-16 sm:w-32 md:w-40 lg:w-48 brightness-0 invert"
            />
          </span>
          {/* Folded corner (top-bottom) */}
          <div
            className="absolute right-0 bg-[#E1232E] top-[55.6px]"
            style={{
              transform: "rotate(180deg)",
              width: "0",
              height: "0",
              borderLeft: "28px solid transparent",
              borderTop: "28px solid rgba(255,255,255,0.98)",
            }}
          />
        </div>
      </div>

      {/* BODY */}
      <div className="h-[88%] flex flex-col">
        {/* Text area + divider */}
        <div
          className="w-full"
          style={{
            paddingLeft: "10%",
            paddingRight: "10%",
            paddingTop: "6%",
          }}
        >
          {/* Receiver name (≈3% of card height) */}
          <div
            className="text-[#111] opacity-90 font-medium leading-tight"
            style={{ fontSize: "clamp(10px, 3vh, 14px)" }}
          >
            {receiverName}
          </div>

          {/* Amount row */}
          <div className="flex items-baseline gap-2 mt-1">
            <div
              className="text-[#111] font-extrabold leading-none"
              style={{ fontSize: "clamp(18px, 6.5vh, 28px)" }}
            >
              {showAmountNumber ? (
                <>
                  {symbol ? <span className="mr-1">{symbol}</span> : null}
                  {amountText}
                </>
              ) : (
                // Empty amount guideline
                <>
                  {symbol ? <span className="mr-1">{symbol}</span> : null}
                  {amount === 0 ? "0" : ""}
                </>
              )}
            </div>

            {/* Currency (≈3% of card height) */}
            <div
              className="text-[#111] opacity-80 font-medium"
              style={{ fontSize: "clamp(10px, 3vh, 14px)" }}
            >
              {showCurrencySymbol ? currency : currency}
            </div>
          </div>

          {/* Dashed divider */}
          <div className="mt-4 border-t border-dashed border-black/30" />
        </div>

        {/* QR area (Top/Bottom margin ≈8% of card height; LR margin ≈10% already) */}
        <div
          className="flex items-center justify-center flex-1"
          style={{
            paddingLeft: "10%",
            paddingRight: "10%",
            paddingTop: "8%",
            paddingBottom: "8%",
          }}
        >
          <div className="relative flex items-center justify-center w-full h-full">
            {/* QR image */}
            <img
              src={qrSrc}
              alt="KHQR"
              className="object-contain w-full h-auto max-h-full"
              draggable={false}
            />

            {/* Optional center badge (approx) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center justify-center w-8 h-8 bg-black border-2 border-white rounded-full shadow-sm">
                <span className="text-lg font-black text-white">៛</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom padding space is handled by QR area padding */}
      </div>
    </div>
  );
}