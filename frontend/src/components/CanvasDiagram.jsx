import React, { memo } from "react"
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva"
import styled from "styled-components"

import Title from "./Title"

const CanvasDiagramContainer = styled.div`
  font-size: 20px;
  font-weight: 600;
  padding-left: 20px;
  padding-top: 30px;
`

const CanvasDiagramTitle = "Canvas Diagram"

const CanvasDiagram = (props) => {
  var canvasWidth = window.innerWidth / 2
  var canvasHeight = window.innerHeight
  console.log("Canvas Height: " + canvasHeight)
  console.log("Canvas Width: " + canvasWidth)

  return (
    <div>
      <CanvasDiagramContainer>
        <Title>{CanvasDiagramTitle}</Title>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Text text="Some text on canvas" fontSize={15} />
            <Rect
              x={20}
              y={50}
              width={100}
              height={100}
              fill="red"
              shadowBlur={10}
            />
            <Circle
              x={canvasWidth / 2}
              y={canvasHeight / 2.5}
              radius={canvasHeight * 0.4}
              fill="lightgrey"
              stroke="black"
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
      </CanvasDiagramContainer>
    </div>
  )
}

export default memo(CanvasDiagram)
