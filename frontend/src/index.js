import React from "react"
import { createRoot } from "react-dom/client"
import App from "./components/App"
// import SocketTest from "./components/SocketTest"

const container = document.getElementById("root")
const root = createRoot(container)
root.render(
  <App />
  // <SocketTest />
)
