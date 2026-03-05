# KHQR QR Card React Component

A responsive **KHQR (Cambodia QR Payment)** card component built with **React + TypeScript**.

This component renders a **KHQR payment card UI** similar to Cambodian banking apps.  
It supports multiple QR sources including **URL, Base64, local path, and generated QR strings**.

The component also automatically removes the **QR quiet-zone (white border)** so QR codes from different sources display consistently.

---

# ✨ Features

- KHQR styled payment card
- Portrait card layout
- Square QR layout
- Fully responsive
- Supports multiple QR sources
- Automatic QR quiet-zone cropping
- QR generation from string
- Amount and currency display
- KHQR center badge
- Written in **React + TypeScript**

---

# 📦 Installation

Install the QR generation library.

```bash
npm install qrcode
npm install -D @types/qrcode
```

---

# 📥 Import Component

```tsx
import { KhqrQrCard, KhqrQrSquare } from "./KhqrQrCard";
```

---

# 🚀 Usage Examples

## 1. Basic KHQR Card

```tsx
<KhqrQrCard
  receiverName="Wing Store"
  amount={10}
  currency="USD"
  qrSrc="/qr/sample.png"
/>
```

---

## 2. Using QR From URL

```tsx
<KhqrQrCard
  receiverName="Coffee Shop"
  amount={5000}
  currency="KHR"
  qrSrc="https://example.com/qr.png"
/>
```

---

## 3. Using Base64 QR

```tsx
<KhqrQrCard
  receiverName="Shop A"
  amount={25}
  currency="USD"
  qrSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
/>
```

---

## 4. Using Local Path QR

If your QR image is stored in the **public folder**:

```
public/
   qr/
      sample.png
```

Then use the path:

```tsx
<KhqrQrCard
  receiverName="Local Merchant"
  qrSrc="/qr/sample.png"
/>
```

---

## 5. Generate QR From String

You can generate a QR code dynamically using the **qrcode** library.

```tsx
import QRCode from "qrcode";

async function generateQR() {
  const qr = await QRCode.toDataURL("000201010212...");
  return qr;
}
```

Usage:

```tsx
const { dataUri } = useQrDataUri("000201010212...");

<KhqrQrCard
  receiverName="KHQR Merchant"
  qrSrc={dataUri ?? undefined}
  isGenerated={true}
/>
```

---

## 6. Square QR Card

You can also render a **square version** of the KHQR card.

```tsx
<KhqrQrSquare
  qrSrc="/qr/sample.png"
/>
```

---

# 🧩 Component Props

## KhqrQrCard

| Prop | Type | Description |
|-----|-----|-------------|
| receiverName | string | Merchant or receiver name |
| amount | number \| string | Payment amount |
| currency | `"KHR"` \| `"USD"` | Currency |
| showCurrencySymbol | boolean | Show currency symbol |
| qrSrc | string | QR image source |
| isGenerated | boolean | Skip QR cropping if generated |
| style | CSSProperties | Custom styles |

---

## KhqrQrSquare

| Prop | Type | Description |
|-----|-----|-------------|
| qrSrc | string | QR image source |
| isGenerated | boolean | Skip QR auto-crop |
| style | CSSProperties | Custom styles |

---

# 📷 Supported QR Sources

The component supports multiple QR source types.

| Source Type | Example |
|-------------|--------|
| URL | https://example.com/qr.png |
| Local Path | /qr/sample.png |
| Base64 | data:image/png;base64,... |
| Generated QR | QRCode.toDataURL() |

---

# 📁 Example Project Structure

```
project
 ├─ public
 │   └─ qr
 │       └─ sample.png
 │
 ├─ src
 │   └─ components
 │       └─ KhqrQrCard.tsx
 │
 ├─ README.md
 ├─ LICENSE
 └─ package.json
```

---

# 🛠 Development

Install dependencies.

```bash
npm install
```

Run development server.

```bash
npm run dev
```

---

# 📄 License

MIT License

Copyright (c) 2026 Lai

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files to deal in the Software  
without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

THE SOFTWARE IS PROVIDED **"AS IS"**, WITHOUT WARRANTY OF ANY KIND.