import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Text } from "react-konva"
import SeismicDesignDrawer from "../components/SeismicDesignDrawer"
import DrawChartBox from "../components/DrawChartBox"

import {
  computeScreenEdgeRect,
  computeInsideMarginsRect,
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

  useEffect(() => {
    const checkSize = () => {
      setScreenRect(computeScreenEdgeRect())
      setInsideMarginsRect(computeInsideMarginsRect(screenEdgeRect))
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenEdgeRect])

  return (
    <div>
      <SeismicDesignDrawer />
      <Stage width={screenEdgeRect.right} height={screenEdgeRect.bottom}>
        <Layer>
          <DrawChartBox rect={insideMarginsRect} />
        </Layer>
        <Layer>
          <Text
            fontSize={16}
            text="Source & Receiver Patterns"
            stroke="grey"
            strokeWidth={0.5}
            x={window.innerWidth / 2 - 50}
            y={window.innerHeight / 2}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default memo(SeismicArrayDesignPage)
