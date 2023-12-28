export default defineConfig({
  plugins: [react()],
  server: {
    open: "http://localhost:5173/",
  },
})
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
