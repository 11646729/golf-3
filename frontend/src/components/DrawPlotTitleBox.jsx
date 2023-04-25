import React, { memo } from "react"
import PropTypes from "prop-types"
import { Group, Text, Rect } from "react-konva"

const DrawPlotTitleBox = (props) => {
  const { rect } = props

  if (!rect) return

  DrawPlotTitleBox.propTypes = {
    rect: PropTypes.object,
  }

  const plotTitleRect = {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom:
      rect.top + parseInt(process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH),
  }

  return (
    <Group>
      <Rect
        x={plotTitleRect.left}
        y={plotTitleRect.top}
        width={plotTitleRect.right}
        height={plotTitleRect.bottom}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINEWIDTH,
          10
        )}
        fill="lightgreen"
      />
      <Text
        text={process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLETEXT}
        fontSize={20}
        align="center"
        verticalAlign="middle"
        width={window.innerWidth}
        height={50}
      />
    </Group>
  )
}

export default memo(DrawPlotTitleBox)
