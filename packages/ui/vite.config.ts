import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "KHQRUI",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`
    },
    cssCodeSplit: false, // 🔥 Important for library CSS
    rollupOptions: {
      external: ["react", "react-dom"]
    }
  }
})
