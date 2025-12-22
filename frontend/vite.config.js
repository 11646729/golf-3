import { defineConfig } from "vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "baseline-browser-mapping": resolve(
        __dirname,
        "src/shims/baseline-browser-mapping.js"
      ),
    },
  },
  define: {
    "process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA": "true",
    "process.env.BROWSERSLIST_IGNORE_OLD_DATA": "true",
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000,
  },
})
