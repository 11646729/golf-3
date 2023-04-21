import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Circle } from "react-konva"

const CanvasDiagram = () => {
  const [rect, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const checkSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  const chartXPosition = rect.width / 2
  const chartYPosition = rect.height / 2
  const circleRadius = (rect.height * 0.8) / 2

  return (
    <div>
      <Stage
        width={window.innerWidth * 0.98}
        height={window.innerHeight * 0.98}
      >
        <Layer>
          <Circle
            x={chartXPosition}
            y={chartYPosition}
            radius={circleRadius}
            fill="lightblue"
            stroke="grey"
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default memo(CanvasDiagram)
