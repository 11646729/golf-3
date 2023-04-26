import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawPlotTitle from "./DrawPlotTitle"
import DrawTopAxisTitle from "./DrawTopAxisTitle"
// import DrawRadialLines from "./DrawRadialLines"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
} from "../functionHandlers/CanvasDiagramFunctions"

const CanvasDiagram = () => {
  // -------------------------------------------------------
  // Prepare rectangles for titles, axes & legend
  // -------------------------------------------------------

  // Hook is initialised with width & height values
  const [screenRect, setScreenRect] = useState(computeScreenEdgeRect())
  const [insideMarginsRect, setInsideMarginsRect] = useState(
    computeInsideMarginsRect(screenRect)
  )

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenRect))
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenRect])

  return (
    <Stage width={screenRect.right} height={screenRect.bottom} margin={0}>
      <Layer>
        <DrawChartBox rect={screenRect} />
        <DrawPlotTitle rect={insideMarginsRect} />
        <DrawTopAxisTitle rect={insideMarginsRect} />
        {/* <DrawRadialLines rect={screenRect} /> */}
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
