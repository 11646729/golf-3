import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import DrawChartBox from "../components/DrawChartBox"
import DrawPlotTitle from "../components/DrawPlotTitle"
import DrawTopTitle from "../components/DrawTopTitle"
import DrawBottomTitle from "../components/DrawBottomTitle"
import DrawLeftTitle from "../components/DrawLeftTitle"
import DrawRightTitle from "../components/DrawRightTitle"
import DrawGraphPlotArea from "../components/DrawGraphPlotArea"
import DrawLegendArea from "../components/DrawLegendArea"
import DrawTopAxis from "../components/DrawTopAxis"
import DrawBottomAxis from "../components/DrawBottomAxis"
import DrawLeftAxis from "../components/DrawLeftAxis"
import DrawRightAxis from "../components/DrawRightAxis"
import DrawLegendTitle from "../components/DrawLegendTitle"
import DrawRadialLinesAndCircles from "../components/DrawRadialLinesAndCircles"
// import SeismicDesignDrawer from "../components/SeismicDesignDrawer"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
  computeGraphPlotAreaRect,
  computeInsidePlotTitlesRect,
  computeTopTitlesRect,
  computeBottomTitlesRect,
  computeLeftTitlesRect,
  computeRightTitlesRect,
  computeLegendAreaRect,
} from "../functionHandlers/seismicDisplayFunctions"

const Seismic3DRadialDisplay = () => {
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

  // TODO
  // Check DrawRadialLinesAndCircles exact position for Labels
  // Redo Axis & Title Widths to be a % of width & height
  // Redo Font sizes to be a % of width & height

  return (
    <div>
      {/* <SeismicDesignDrawer /> */}
      <Stage width={screenEdgeRect.right} height={screenEdgeRect.bottom}>
        <Layer>
          <DrawChartBox rect={insideMarginsRect} />
          <DrawPlotTitle
            rect={insidePlotTitleRect}
            titleDraw={
              import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWPLOTTITLE
            }
            titleText={
              import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALPLOTTITLETEXT
            }
          />
          <DrawGraphPlotArea
            rect={graphPlotAreaRect}
            boundaryDraw={
              import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWGRAPHAREABOUNDARY
            }
          />
          <DrawTopTitle
            rect={topTitleRect}
            titleDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWTOPTITLE}
            titleText={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALTOPTITLETEXT}
          />
          <DrawBottomTitle
            rect={bottomTitleRect}
            titleDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWTOPTITLE}
            titleText={
              import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALBOTTOMTITLETEXT
            }
          />
          <DrawLeftTitle
            rect={leftTitleRect}
            titleDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWTOPTITLE}
            titleText={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALTOPTITLETEXT}
          />
          <DrawRightTitle
            rect={rightTitleRect}
            titleDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWTOPTITLE}
            titleText={
              import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALRIGHTTITLETEXT
            }
          />
          <DrawTopAxis
            rect={graphPlotAreaRect}
            axisDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWTOPAXIS}
          />
          <DrawBottomAxis
            rect={graphPlotAreaRect}
            axisDraw={
              import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWBOTTOMAXIS
            }
          />
          <DrawLeftAxis
            rect={graphPlotAreaRect}
            axisDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWLEFTAXIS}
          />
          <DrawRightAxis
            rect={graphPlotAreaRect}
            axisDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWRIGHTAXIS}
          />
          <DrawLegendTitle
            rect={legendAreaRect}
            legendDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWLEGEND}
            legendTitle={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALLEGENDTEXT}
          />
          <DrawLegendArea
            rect={legendAreaRect}
            legendDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWLEGEND}
            legendText={
              import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALLEGENDVALUESTEXT
            }
          />
          <DrawRadialLinesAndCircles
            rect={graphPlotAreaRect}
            legendDraw={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWLEGEND}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default memo(Seismic3DRadialDisplay)
