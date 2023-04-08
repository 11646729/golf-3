import React, { memo } from "react"
import styled from "styled-components"
import CanvasDiagram from "../components/CanvasDiagram"

const CanvasContainer = styled.div`
  display: flex;
`

const CanvasDesignContainer = styled.div`
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
      <CanvasDesignContainer />
      <CanvasDiagramContainer>
        <CanvasDiagram />
      </CanvasDiagramContainer>
    </CanvasContainer>
  )
}

export default memo(CanvasPage)
