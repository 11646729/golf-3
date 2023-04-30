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
  computeInsideTitlesRect,
  computeTopTitlesRect,
  computeBottomTitlesRect,
  computeLeftTitlesRect,
} from "../functionHandlers/CanvasDiagramFunctions"
import DrawLeftTitle from "./DrawLeftTitle"

const CanvasDiagram = () => {
  // -------------------------------------------------------
  // Prepare rectangles for titles, axes & legend
  // -------------------------------------------------------

  // Hook is initialised with width & height values
  const [screenEdgeRect, setScreenRect] = useState(computeScreenEdgeRect())
  const [insideMarginsRect, setInsideMarginsRect] = useState(
    computeInsideMarginsRect(screenEdgeRect)
  )
  const [insidePlotTitleRect, setInsidePlotTitleRect] = useState(
    computeInsidePlotTitlesRect(insideMarginsRect)
  )
  const [insideTitlesRect, setInsideTitlesRect] = useState(
    computeInsidePlotTitlesRect(insidePlotTitleRect)
  )
  const [topTitleRect, setTopTitleRect] = useState(
    computeTopTitlesRect(insidePlotTitleRect, insideMarginsRect)
  )
  const [bottomTitleRect, setBottomTitleRect] = useState(
    computeBottomTitlesRect(insideMarginsRect)
  )
  const [leftTitleRect, setLeftTitleRect] = useState(
    computeLeftTitlesRect(insideMarginsRect)
  )

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenEdgeRect))
      setInsidePlotTitleRect(computeInsidePlotTitlesRect(insideMarginsRect))
      setInsideTitlesRect(computeInsideTitlesRect(insidePlotTitleRect))
      setTopTitleRect(
        computeTopTitlesRect(insidePlotTitleRect, insideMarginsRect)
      )
      setBottomTitleRect(computeBottomTitlesRect(insideMarginsRect))
      setLeftTitleRect(computeLeftTitlesRect(insideMarginsRect))
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenEdgeRect, insideMarginsRect, insidePlotTitleRect])

  // console.log(insideMarginsRect)

  return (
    <Stage width={screenEdgeRect.right} height={screenEdgeRect.bottom}>
      <Layer>
        <DrawChartBox rect={insideMarginsRect} />
        <DrawPlotTitle rect={insidePlotTitleRect} />
        <DrawTopTitle rect={topTitleRect} />
        <DrawBottomTitle rect={bottomTitleRect} />
        <DrawLeftTitle rect={leftTitleRect} />
        {/* <DrawRadialLines rect={screenRect} /> */}
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
