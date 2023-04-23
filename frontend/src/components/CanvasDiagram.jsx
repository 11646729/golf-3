import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Text } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawRadialLines from "./DrawRadialLines"

const CanvasDiagram = () => {
  const [screenRect, setDimensions] = useState({
    width:
      window.innerWidth * process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
    height:
      window.innerHeight * process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
  })

  useEffect(() => {
    const checkSize = () => {
      setDimensions({
        width:
          window.innerWidth *
          process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
        height:
          window.innerHeight *
          process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT,
      })
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  return (
    <Stage width={screenRect.width} height={screenRect.height} margin={0}>
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
