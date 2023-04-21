import React, { useEffect, useState, memo } from "react"
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva"

// From https://codesandbox.io/s/react-konva-responsive-stage-kpmy7?file=/src/index.js:0-1594

var SCENE_BASE_WIDTH = 800
// var SCENE_BASE_HEIGHT = 600

const CanvasDiagram = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const checkSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  // do your calculations for stage properties
  const scale = size.width / SCENE_BASE_WIDTH

  return (
    <Stage
      width={size.width}
      height={size.height}
      scaleX={scale}
      scaleY={scale}
    >
      <Layer>
        <Text text="Try to resize the window" fontSize={15} />
        <Rect
          x={20}
          y={50}
          width={100}
          height={100}
          fill="red"
          shadowBlur={10}
        />
        <Circle x={200} y={100} radius={50} fill="green" />
        <Line
          x={20}
          y={200}
          points={[0, 0, 100, 0, 100, 100]}
          tension={0.5}
          closed
          stroke="black"
          fillLinearGradientStartPoint={{ x: -50, y: -50 }}
          fillLinearGradientEndPoint={{ x: 50, y: 50 }}
          fillLinearGradientColorStops={[0, "red", 1, "yellow"]}
        />
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
