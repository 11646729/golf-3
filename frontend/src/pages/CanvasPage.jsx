import React, { memo } from "react"
import styled from "styled-components"
import CanvasDiagram from "../components/CanvasDiagram"

const CanvasContainer = styled.div`
  display: flex;
`

const CanvasPage = () => {
  return (
    <CanvasContainer>
      <CanvasDiagram />
    </CanvasContainer>
  )
}

export default memo(CanvasPage)
