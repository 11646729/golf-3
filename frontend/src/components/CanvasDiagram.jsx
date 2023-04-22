import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
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
        <DrawChartBox rect={rect} />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
