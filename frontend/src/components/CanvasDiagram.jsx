import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Circle, Rect } from "react-konva"
// import { DrawChartBox } from "./DrawChartBox"

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

  const rectangleYPosition =
    rect.height *
    (process.env.REACT_APP_GEOPHONEARRAY_TOPMARGINPERCENTAGE / 100)
  const chartXPosition = rect.width / 2
  const chartYPosition = rect.height / 2
  const circleRadius =
    (rect.height *
      (1 -
        process.env.REACT_APP_GEOPHONEARRAY_TOPMARGINPERCENTAGE / 100 -
        process.env.REACT_APP_GEOPHONEARRAY_BOTTOMMARGINPERCENTAGE / 100)) /
    2
  const rectangleXPosition = (rect.width - circleRadius * 2) / 2

  return (
    <Stage width={rect.width} height={rect.height} margin={0}>
      <Layer>
        <Rect
          x={rectangleXPosition}
          y={rectangleYPosition}
          width={circleRadius * 2}
          height={circleRadius * 2}
          stroke={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINECOLOR}
          strokeWidth={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINEWIDTH}
        />
        <Circle
          x={chartXPosition}
          y={chartYPosition}
          radius={circleRadius}
          stroke={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINECOLOR}
          strokeWidth={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINEWIDTH}
        />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
