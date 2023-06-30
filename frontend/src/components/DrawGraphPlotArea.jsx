import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect } from "react-konva"

const DrawGraphPlotArea = (props) => {
  const { rect, boundaryDraw } = props

  // If Draw Boundary !== true then return
  if (boundaryDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawGraphPlotArea.propTypes = {
    rect: PropTypes.object,
    boundaryDraw: PropTypes.string,
  }

  return (
    <Rect
      x={rect.left}
      y={rect.top}
      width={rect.right - rect.left}
      height={rect.bottom - rect.top}
      stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
      strokeWidth={parseInt(
        process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
      )}
      fill="lightyellow"
    />
  )
}

export default memo(DrawGraphPlotArea)
