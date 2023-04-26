import React, { memo } from "react"
import PropTypes from "prop-types"
import { Group, Text, Rect } from "react-konva"

const DrawPlotTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawPlotTitle.propTypes = {
    rect: PropTypes.object,
  }

  console.log(rect)

  return (
    <Group>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right}
        height={rect.bottom - rect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
        fill="lightgreen"
      />
      {/* <Text
        text={process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLETEXT}
        fontSize={20}
        align="center"
        verticalAlign="middle"
        width={window.innerWidth}
        height={50}
      /> */}
    </Group>
  )
}

export default memo(DrawPlotTitle)
