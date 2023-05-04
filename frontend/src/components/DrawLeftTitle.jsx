import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawLeftTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawLeftTitle.propTypes = {
    rect: PropTypes.object,
  }

  return (
    <>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
        // fill="lightblue"
      />
      <Text
        fontSize={16}
        text={process.env.REACT_APP_GEOPHONEARRAY_TOPTITLETEXT}
        stroke="grey"
        strokeWidth={1}
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        align="center"
        verticalAlign="middle"
        // rotation={270}
      />
    </>
  )
}

export default memo(DrawLeftTitle)
