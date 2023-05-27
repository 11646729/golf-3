import React, { memo } from "react"
import styled from "styled-components"
import { Stage, Layer, Text } from "react-konva"

const DrawPatternContainer = styled.div`
  display: flex;
`

console.log("Here")

const DrawPatternPage = () => {
  return (
    <DrawPatternContainer>
      {/* <Stage>
      <Layer>
        <Text
          fontSize={16}
          text={"Hello"}
          stroke="grey"
          strokeWidth={0.5}
          x={20}
          y={20}
          align="center"
          verticalAlign="middle"
        />
      </Layer>
    </Stage> */}
    </DrawPatternContainer>
  )
}

export default memo(DrawPatternPage)
