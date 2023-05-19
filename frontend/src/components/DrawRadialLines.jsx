import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawRadialLines = (props) => {
  const { rect } = props

  if (!rect) return

  DrawRadialLines.propTypes = {
    rect: PropTypes.object,
  }

  const y1 = rect.top
  const x1 = rect.left + (rect.right - rect.left) / 2
  const y2 = rect.top + (rect.bottom - rect.top) / 2
  const x2 = rect.left + (rect.right - rect.left) / 2

  return (
    <Line
      points={[x1, y1, x2, y2]}
      stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
      strokeWidth={parseInt(
        process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
      )}
    />
  )
}

export default memo(DrawRadialLines)
