import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Text } from "react-konva"
import DrawChartBox from "./DrawChartBox"

const CanvasDiagram = () => {
  const [rect, setDimensions] = useState({
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
    <Stage width={rect.width} height={rect.height} margin={0}>
      <Layer>
        <Text
          text="Omnidirectional Radial Array Response Plot"
          fontSize={20}
          align="center"
          verticalAlign="middle"
          width={window.innerWidth}
          height={50}
        />
        <DrawChartBox rect={rect} />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
