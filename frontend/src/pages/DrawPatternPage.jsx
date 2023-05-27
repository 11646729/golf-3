import React, { memo } from "react"
import { Stage, Layer, Text } from "react-konva"
import TemporaryDrawer from "../components/TemporaryDrawer"

const DrawPatternPage = () => {
  return (
    <div>
      <TemporaryDrawer />
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Text
            fontSize={16}
            text="Source & Receiver Patterns"
            stroke="grey"
            strokeWidth={0.5}
            x={window.innerWidth / 2 - 50}
            y={window.innerHeight / 2}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default memo(DrawPatternPage)
