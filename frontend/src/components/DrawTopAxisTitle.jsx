import React, { memo } from "react"
import PropTypes from "prop-types"
import { Group, Text, Rect } from "react-konva"

const DrawTopAxisTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawTopAxisTitle.propTypes = {
    rect: PropTypes.object,
  }

  // let topAxisTitleRect = null

  // if (process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPAXISTITLE) {
  //   topAxisTitleRect = {
  //     left: rect.left,
  //     top:
  //       rect.top + parseInt(process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH),
  //     right: rect.right,
  //     bottom:
  //       rect.top +
  //       parseInt(process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH) +
  //       parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISTITLEWIDTH),
  //   }
  // } else {
  //   topAxisTitleRect = {
  //     left: 0,
  //     top: 0,
  //     right: 0,
  //     bottom: 0,
  //   }
  // }

  // console.log(rect)

  return (
    <Group>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right}
        height={rect.bottom - rect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
        fill="lightyellow"
      />
      {/* <Text
        text={process.env.REACT_APP_GEOPHONEARRAY_TOPAXISTITLETEXT}
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
