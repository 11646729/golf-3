import React, { memo } from "react"
import PropTypes from "prop-types"
import { Group, Text, Rect } from "react-konva"

const DrawTopAxisTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawTopAxisTitle.propTypes = {
    rect: PropTypes.object,
  }

  const topAxisTitleRect = {
    left: rect.left,
    top:
      rect.top + parseInt(process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH),
    right: rect.right,
    bottom:
      rect.top +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH) +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_AXISTITLEWIDTH),
  }

  console.log(rect)
  console.log(topAxisTitleRect)

  return (
    <Group>
      <Rect
        x={topAxisTitleRect.left}
        y={topAxisTitleRect.top}
        width={topAxisTitleRect.right}
        height={topAxisTitleRect.bottom - topAxisTitleRect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
        fill="lightyellow"
      />
      {/* <Text
        text={process.env.REACT_APP_GEOPHONEARRAY_AXISTITLETEXT}
        fontSize={20}
        align="center"
        verticalAlign="middle"
        width={window.innerWidth}
        height={50}
      /> */}
    </Group>
  )
}

export default memo(DrawTopAxisTitle)
