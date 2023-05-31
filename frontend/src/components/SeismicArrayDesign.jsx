import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import SeismicDesignDrawer from "./SeismicDesignDrawer"
import DrawChartBox from "./DrawChartBox"
import DrawPlotTitle from "./DrawPlotTitle"
import DrawTopTitle from "./DrawTopTitle"
import DrawBottomTitle from "./DrawBottomTitle"
import DrawLeftTitle from "./DrawLeftTitle"
import DrawRightTitle from "./DrawRightTitle"
import DrawGraphPlotArea from "./DrawGraphPlotArea"
import DrawGridLines from "./DrawGridLines"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
  computeGraphPlotAreaRect,
  computeInsidePlotTitlesRect,
  computeTopTitlesRect,
  computeBottomTitlesRect,
  computeLeftTitlesRect,
  computeRightTitlesRect,
} from "../functionHandlers/seismicDesignFunctions"

const SeismicArrayDesign = () => {
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
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenEdgeRect, insideMarginsRect, graphPlotAreaRect, rightTitleRect])

  return (
    <div>
      <SeismicDesignDrawer />
      <Stage width={screenEdgeRect.right} height={screenEdgeRect.bottom}>
        <Layer>
          <DrawChartBox rect={insideMarginsRect} />
          <DrawPlotTitle
            rect={insidePlotTitleRect}
            titleDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWPLOTTITLE
            }
            titleText={process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNPLOTTITLE}
          />
          <DrawGraphPlotArea
            rect={graphPlotAreaRect}
            boundaryDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWBOUNDARY
            }
          />
          <DrawTopTitle
            rect={topTitleRect}
            titleDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWTOPTITLE
            }
            titleText={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNTOPTITLETEXT
            }
          />
          <DrawBottomTitle
            rect={bottomTitleRect}
            titleDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWTOPTITLE
            }
            titleText={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNBOTTOMTITLETEXT
            }
          />
          <DrawLeftTitle
            rect={leftTitleRect}
            titleDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWTOPTITLE
            }
            titleText={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNTOPTITLETEXT
            }
          />
          <DrawRightTitle
            rect={rightTitleRect}
            titleDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWTOPTITLE
            }
            titleText={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNRIGHTTITLETEXT
            }
          />
          <DrawGridLines rect={graphPlotAreaRect} />
        </Layer>
      </Stage>
    </div>
  )
}

export default memo(SeismicArrayDesign)
