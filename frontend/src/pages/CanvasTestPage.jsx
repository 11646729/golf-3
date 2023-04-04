import React, { memo } from "react"
import Canvas from "../components/Canvas.jsx"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
// const CanvasTestPage = () => <h3>Hello World!</h3>

const CanvasTestPage = () => {
  return <Canvas />
}

export default memo(CanvasTestPage)
