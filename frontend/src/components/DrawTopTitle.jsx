import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect } from "react-konva"

const DrawTopTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawTopTitle.propTypes = {
    rect: PropTypes.object,
  }

  // console.log(rect)

  return (
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
      fill="lightyellow"
    />
  )
}

export default memo(DrawTopTitle)
