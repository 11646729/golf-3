import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Text } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawRadialLines from "./DrawRadialLines"

const CanvasDiagram = () => {
  // Hook is initialised with width & height values
  const [screenRect, setScreenRect] = useState({
    iLeft: 0,
    iTop: 0,
    iWidth:
      window.innerWidth * process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
    iHeight:
      window.innerHeight * process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
  })

  useEffect(() => {
    const checkSize = () => {
      setScreenRect({
        iLeft: 0,
        iTop: 0,
        iWidth:
          window.innerWidth *
          process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
        iHeight:
          window.innerHeight *
          process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
      })
      //   setScreenWithMarginsRect({})
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  // Prepare rectangles for titles, axes & legend

  return (
    <Stage width={screenRect.iWidth} height={screenRect.iHeight} margin={0}>
      <Layer>
        <Text
          text={process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLETEXT}
          fontSize={20}
          align="center"
          verticalAlign="middle"
          width={window.innerWidth}
          height={50}
        />
        <DrawChartBox rect={screenRect} />
        <DrawRadialLines rect={screenRect} />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
