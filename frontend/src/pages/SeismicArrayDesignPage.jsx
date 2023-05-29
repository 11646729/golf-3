import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import SeismicDesignDrawer from "../components/SeismicDesignDrawer"
import DrawChartBox from "../components/DrawChartBox"
import DrawPlotTitle from "../components/DrawPlotTitle"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
  computeGraphPlotAreaRect,
  computeInsidePlotTitlesRect,
} from "../functionHandlers/seismic3DRadialDisplayFunctions"

const SeismicArrayDesignPage = () => {
  // -------------------------------------------------------
  // Prepare rectangles for titles, axes & legend
  // -------------------------------------------------------
  // Hook is initialised with width & height values
  const [screenEdgeRect, setScreenRect] = useState(computeScreenEdgeRect())
  const [insideMarginsRect, setInsideMarginsRect] = useState(
    computeInsideMarginsRect(screenEdgeRect)
  )
  const [graphPlotAreaRect, setGraphPlotAreaRect] = useState(
    computeGraphPlotAreaRect(insideMarginsRect)
  )
  const [insidePlotTitleRect, setInsidePlotTitleRect] = useState(
    computeInsidePlotTitlesRect(insideMarginsRect)
  )

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenEdgeRect))
      setGraphPlotAreaRect(computeGraphPlotAreaRect(insideMarginsRect))
      setInsidePlotTitleRect(
        computeInsidePlotTitlesRect(insideMarginsRect, graphPlotAreaRect)
      )
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenEdgeRect, insideMarginsRect, graphPlotAreaRect])

  return (
    <div>
      <SeismicDesignDrawer />
      <Stage width={screenEdgeRect.right} height={screenEdgeRect.bottom}>
        <Layer>
          <DrawChartBox rect={insideMarginsRect} />
          <DrawPlotTitle
            rect={insidePlotTitleRect}
            titleText={process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNPLOTTITLE}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default memo(SeismicArrayDesignPage)
