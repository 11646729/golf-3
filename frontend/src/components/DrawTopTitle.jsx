import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawTopTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawTopTitle.propTypes = {
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
        // fill="lightyellow"
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
      />
    </>
  )
}

export default memo(DrawTopTitle)
