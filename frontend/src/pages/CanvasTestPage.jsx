import React, { memo } from "react"
import styled from "styled-components"
import CanvasDiagram from "../components/CanvasDiagram"

import Title from "../components/Title"

const CanvasTableTitle = "Canvas Diagram"

const CanvasContainer = styled.div`
  display: flex;
`

const CanvasTableContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
`

const CanvasDiagramContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 800px;
`

const CanvasPage = () => {
  return (
    <CanvasContainer>
      <CanvasTableContainer>
        <Title>{CanvasTableTitle}</Title>
        {/* <GolfCoursesTable golfCourses={golfCourses} /> */}
      </CanvasTableContainer>
      <CanvasDiagramContainer>
        <CanvasDiagram />
      </CanvasDiagramContainer>
    </CanvasContainer>
  )
}

export default memo(CanvasPage)
