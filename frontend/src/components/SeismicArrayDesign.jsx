import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawPlotTitle from "./DrawPlotTitle"
import DrawTopTitle from "./DrawTopTitle"
import DrawBottomTitle from "./DrawBottomTitle"
import DrawLeftTitle from "./DrawLeftTitle"
import DrawRightTitle from "./DrawRightTitle"
// import DrawGraphPlotArea from "./DrawGraphPlotArea"
import ArrayDesignDrawGridLines from "./ArrayDesignDrawGridLines"
import ArrayDesignDrawTopAxis from "./ArrayDesignDrawTopAxis"
import ArrayDesignDrawBottomAxis from "./ArrayDesignDrawBottomAxis"
import ArrayDesignDrawLeftAxis from "./ArrayDesignDrawLeftAxis"
import ArrayDesignDrawRightAxis from "./ArrayDesignDrawRightAxis"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
  computeGraphPlotAreaRect,
  computeInsidePlotTitlesRect,
  computeTopTitlesRect,
  computeBottomTitlesRect,
  computeLeftTitlesRect,
  computeRightTitlesRect,
  snapToGridV,
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

  const NoVLines = "6"
  const NoHLines = "6"
  const VLineSpacing = "16.67"
  const HLineSpacing = "16.67"

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

  const handleMouseDown = (e) => {
    var stage = e.target.getStage()
    let cursorpos = stage.getPointerPosition()
    // if (
    //   cursorpos.x - graphPlotAreaRect.left >= 0 &&
    //   cursorpos.x < graphPlotAreaRect.right
    // )
    //   console.log(cursorpos.x - graphPlotAreaRect.left)
    console.log(cursorpos.y)
    console.log(graphPlotAreaRect)
    let tempy = snapToGridV(cursorpos.y, parseFloat(HLineSpacing, 2))
    console.log(tempy) // HERE
    // console.log(graphPlotAreaRect.left)
    // console.log(graphPlotAreaRect.right)
    // y={rect.top}
    // text = `Cursor position is: ${cursorpos.x}, ${cursorpos.y}`
  }

  return (
    <div>
      <Stage
        width={screenEdgeRect.right}
        height={screenEdgeRect.bottom}
        onMouseDown={handleMouseDown}
      >
        <Layer>
          <DrawChartBox rect={insideMarginsRect} />
          <DrawPlotTitle
            rect={insidePlotTitleRect}
            titleDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWPLOTTITLE
            }
            titleText={process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNPLOTTITLE}
          />
          {/* <DrawGraphPlotArea
            rect={graphPlotAreaRect}
            boundaryDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWBOUNDARY
            }
          /> */}
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
          <ArrayDesignDrawTopAxis
            axisDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWTOPAXIS
            }
            rect={graphPlotAreaRect}
            NoVLines={NoVLines}
            VLineSpacing={VLineSpacing}
          />
          <ArrayDesignDrawBottomAxis
            axisDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWBOTTOMAXIS
            }
            rect={graphPlotAreaRect}
            NoVLines={NoVLines}
            VLineSpacing={VLineSpacing}
          />
          <ArrayDesignDrawLeftAxis
            axisDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWLEFTAXIS
            }
            rect={graphPlotAreaRect}
            NoHLines={NoHLines}
            HLineSpacing={HLineSpacing}
          />
          <ArrayDesignDrawRightAxis
            axisDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWRIGHTAXIS
            }
            rect={graphPlotAreaRect}
            NoHLines={NoHLines}
            HLineSpacing={HLineSpacing}
          />
          <ArrayDesignDrawGridLines
            gridlinesDraw={
              process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWGRIDLINES
            }
            rect={graphPlotAreaRect}
            NoVLines={NoVLines}
            NoHLines={NoHLines}
            VLineSpacing={VLineSpacing}
            HLineSpacing={HLineSpacing}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default memo(SeismicArrayDesign)
