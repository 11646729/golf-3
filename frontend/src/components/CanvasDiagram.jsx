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
import DrawTopAxis from "./DrawTopAxis"
import DrawBottomAxis from "./DrawBottomAxis"

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
  const [graphPlotAreaRect, setGraphPlotAreaRect] = useState(
    computeGraphPlotAreaRect(insideMarginsRect)
  )
  const [topTitleRect, setTopTitleRect] = useState(
    computeTopTitlesRect(graphPlotAreaRect)
  )
  const [bottomTitleRect, setBottomTitleRect] = useState(
    computeBottomTitlesRect(graphPlotAreaRect)
  )
  const [leftTitleRect, setLeftTitleRect] = useState(
    computeLeftTitlesRect(graphPlotAreaRect)
  )
  const [rightTitleRect, setRightTitleRect] = useState(
    computeRightTitlesRect(graphPlotAreaRect)
  )
  const [legendAreaRect, setLegendAreaRect] = useState(
    computeLegendAreaRect(insideMarginsRect, rightTitleRect)
  )

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenEdgeRect))
      setGraphPlotAreaRect(computeGraphPlotAreaRect(insideMarginsRect))
      setInsidePlotTitleRect(
        computeInsidePlotTitlesRect(insideMarginsRect, graphPlotAreaRect)
      )
      setTopTitleRect(computeTopTitlesRect(graphPlotAreaRect))
      setBottomTitleRect(computeBottomTitlesRect(graphPlotAreaRect))
      setLeftTitleRect(computeLeftTitlesRect(graphPlotAreaRect))
      setRightTitleRect(computeRightTitlesRect(graphPlotAreaRect))
      setLegendAreaRect(
        computeLegendAreaRect(insideMarginsRect, rightTitleRect)
      )
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenEdgeRect, insideMarginsRect, graphPlotAreaRect, rightTitleRect])

  return (
    <Stage width={screenEdgeRect.right} height={screenEdgeRect.bottom}>
      <Layer>
        <DrawChartBox rect={insideMarginsRect} />
        <DrawPlotTitle rect={insidePlotTitleRect} />
        <DrawGraphPlotArea rect={graphPlotAreaRect} />
        <DrawTopTitle rect={topTitleRect} />
        <DrawBottomTitle rect={bottomTitleRect} />
        <DrawLeftTitle rect={leftTitleRect} />
        <DrawRightTitle rect={rightTitleRect} />
        <DrawTopAxis rect={graphPlotAreaRect} />
        <DrawBottomAxis rect={graphPlotAreaRect} />
        <DrawLegendArea rect={legendAreaRect} />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
