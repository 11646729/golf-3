import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawPlotTitle from "./DrawPlotTitle"
import DrawTopTitle from "./DrawTopTitle"
import DrawBottomTitle from "./DrawBottomTitle"
import DrawLeftTitle from "./DrawLeftTitle"
import DrawRightTitle from "./DrawRightTitle"
import DrawGraphPlotArea from "./DrawGraphPlotArea"
import DrawLegendArea from "./DrawLegendArea"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
  computeInsidePlotTitlesRect,
  computeTopTitlesRect,
  computeBottomTitlesRect,
  computeLeftTitlesRect,
  computeRightTitlesRect,
  computeGraphPlotAreaRect,
  computeLegendAreaRect,
  computeTempHeight,
} from "../functionHandlers/CanvasDiagramFunctions"

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
  const [topTitleRect, setTopTitleRect] = useState(
    computeTopTitlesRect(insidePlotTitleRect, insideMarginsRect)
  )
  const [bottomTitleRect, setBottomTitleRect] = useState(
    computeBottomTitlesRect(insideMarginsRect)
  )
  const [leftTitleRect, setLeftTitleRect] = useState(
    computeLeftTitlesRect(insidePlotTitleRect, insideMarginsRect)
  )
  const [rightTitleRect, setRightTitleRect] = useState(
    computeRightTitlesRect(insidePlotTitleRect, insideMarginsRect)
  )
  const [graphPlotAreaRect, setGraphPlotAreaRect] = useState(
    computeGraphPlotAreaRect(insidePlotTitleRect, insideMarginsRect)
  )
  const [legendAreaRect, setLegendAreaRect] = useState(
    computeLegendAreaRect(insidePlotTitleRect, insideMarginsRect)
  )

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenEdgeRect))
      setInsidePlotTitleRect(computeInsidePlotTitlesRect(insideMarginsRect))
      setTopTitleRect(
        computeTopTitlesRect(insidePlotTitleRect, insideMarginsRect)
      )
      setBottomTitleRect(
        computeBottomTitlesRect(insidePlotTitleRect, insideMarginsRect)
      )
      setLeftTitleRect(
        computeLeftTitlesRect(insidePlotTitleRect, insideMarginsRect)
      )
      setRightTitleRect(
        computeRightTitlesRect(insidePlotTitleRect, insideMarginsRect)
      )
      setGraphPlotAreaRect(
        computeGraphPlotAreaRect(insidePlotTitleRect, insideMarginsRect)
      )
      setLegendAreaRect(
        computeLegendAreaRect(insidePlotTitleRect, insideMarginsRect)
      )
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenEdgeRect, insideMarginsRect, insidePlotTitleRect])

  return (
    <Stage width={screenEdgeRect.right} height={screenEdgeRect.bottom}>
      <Layer>
        <DrawChartBox rect={insideMarginsRect} />
        <DrawPlotTitle rect={insidePlotTitleRect} />
        <DrawTopTitle rect={topTitleRect} />
        <DrawBottomTitle rect={bottomTitleRect} />
        <DrawLeftTitle rect={leftTitleRect} />
        <DrawRightTitle rect={rightTitleRect} />
        <DrawGraphPlotArea rect={graphPlotAreaRect} />
        <DrawLegendArea rect={legendAreaRect} />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
