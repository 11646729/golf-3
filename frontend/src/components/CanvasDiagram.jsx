import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawPlotTitle from "./DrawPlotTitle"
import DrawTopTitle from "./DrawTopTitle"
import DrawBottomTitle from "./DrawBottomTitle"
// import DrawRadialLines from "./DrawRadialLines"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
  computeInsidePlotTitlesRect,
  // computeInsideTitlesRect,
  computeTopTitlesRect,
  computeBottomTitlesRect,
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
    computeInsidePlotTitlesRect(insideMarginsRect)
  )
  // const [insideTitlesRect, setInsideTitlesRect] = useState(
  //   computeInsidePlotTitlesRect(insidePlotTitleRect)
  // )
  const [topTitleRect, setTopTitleRect] = useState(
    computeTopTitlesRect(insidePlotTitleRect, insideMarginsRect)
  )
  const [bottomTitleRect, setBottomTitleRect] = useState(
    computeBottomTitlesRect(insideMarginsRect)
  )

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenRect))
      setInsidePlotTitleRect(computeInsidePlotTitlesRect(insideMarginsRect))
      // setInsideTitlesRect(computeInsideTitlesRect(insidePlotTitleRect))
      setTopTitleRect(
        computeTopTitlesRect(insidePlotTitleRect, insideMarginsRect)
      )
      setBottomTitleRect(computeBottomTitlesRect(insideMarginsRect))
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenRect, insideMarginsRect, insidePlotTitleRect])

  return (
    <Stage width={screenRect.right} height={screenRect.bottom} margin={0}>
      <Layer>
        <DrawChartBox rect={insideMarginsRect} />
        <DrawPlotTitle rect={insidePlotTitleRect} />
        <DrawTopTitle rect={topTitleRect} />
        <DrawBottomTitle rect={bottomTitleRect} />
        {/* <DrawRadialLines rect={screenRect} /> */}
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
