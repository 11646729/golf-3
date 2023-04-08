import React, { memo } from "react"
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva"

import Title from "./Title"

// import PropTypes from "prop-types"
import styled from "styled-components"

const CanvasDiagramContainer = styled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
  font-weight: normal;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
`

const CanvasDiagramTitle = "Canvas Diagram"

const CanvasDiagram = (props) => {
  var canvasWidth = window.innerWidth
  var canvasHeight = window.innerHeight
  console.log(canvasHeight)

  // const { golfCourses } = props

  CanvasDiagram.propTypes = {
    // golfCourses: PropTypes.array,
  }

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
              y={canvasHeight / 2}
              radius={canvasHeight * 0.4}
              fill="lightgrey"
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
