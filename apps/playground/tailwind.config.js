export default {
  content: [
    "./index.html",
    "./src/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}" // 👈 IMPORTANT (scan your library)
  ],
  theme: { extend: {} },
  plugins: [],
};