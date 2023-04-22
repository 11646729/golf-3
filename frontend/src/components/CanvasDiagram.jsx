import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Circle, Rect } from "react-konva"
// import { DrawChartBox } from "./DrawChartBox"

const sizeAdjustment = 0.98
const shapesOutlineColor = "lightgrey"
const shapesOutlineWidth = 1
const topMarginPercentage = 10
const bottomMarginPercentage = 10

const CanvasDiagram = () => {
  const [rect, setDimensions] = useState({
    width: window.innerWidth * sizeAdjustment,
    height: window.innerHeight * sizeAdjustment,
  })

  useEffect(() => {
    const checkSize = () => {
      setDimensions({
        width: window.innerWidth * sizeAdjustment,
        height: window.innerHeight * sizeAdjustment,
      })
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  console.log(rect)

  const rectangleYPosition = rect.height * (topMarginPercentage / 100)
  const chartXPosition = rect.width / 2
  const chartYPosition = rect.height / 2
  const circleRadius =
    (rect.height *
      (1 - topMarginPercentage / 100 - bottomMarginPercentage / 100)) /
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
          stroke={shapesOutlineColor}
          strokeWidth={shapesOutlineWidth}
        />
        <Circle
          x={chartXPosition}
          y={chartYPosition}
          radius={circleRadius}
          stroke={shapesOutlineColor}
          strokeWidth={shapesOutlineWidth}
        />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
