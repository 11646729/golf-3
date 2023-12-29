import { defineConfig } from "vite"
// import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 5173, // 3000,
  },
})

// export default defineConfig(({ command, mode }) => {
//   const env = loadEnv(mode, process.cwd(), "")
//   return {
//     define: {
//       "process.env.YOUR_STRING_VARIABLE": JSON.stringify(
//         env.YOUR_STRING_VARIABLE
//       ),
//       "process.env.YOUR_BOOLEAN_VARIABLE": env.YOUR_BOOLEAN_VARIABLE,
//       // If you want to exposes all env variables, which is not recommended
//       // 'process.env': env
//     },
//   }
// })
