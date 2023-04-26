import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawPlotTitle from "./DrawPlotTitle"
import DrawTopAxisTitle from "./DrawTopAxisTitle"
// import DrawRadialLines from "./DrawRadialLines"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
  computePlotTitlesRect,
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
  const [insidePlotTitleRect, setInsidePlotTitleRect] = useState(
    computePlotTitlesRect(insideMarginsRect)
  )

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenRect))
      setInsidePlotTitleRect(computePlotTitlesRect(insideMarginsRect))
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenRect, insideMarginsRect])

  return (
    <Stage width={screenRect.right} height={screenRect.bottom} margin={0}>
      <Layer>
        <DrawChartBox rect={insideMarginsRect} />
        <DrawPlotTitle rect={insidePlotTitleRect} />
        {/* <DrawTopAxisTitle rect={insideMarginsRect} /> */}
        {/* <DrawRadialLines rect={screenRect} /> */}
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
