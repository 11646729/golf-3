import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawRadialLines = (props) => {
  const { rect } = props

  if (!rect) return

  DrawRadialLines.propTypes = {
    rect: PropTypes.object,
  }

  return (
    <Line
      x={rect.iWidth / 2}
      y={rect.iHeight / 2}
      points={[0, rect.iHeight / 2, 0, 0]}
      stroke={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINECOLOR}
      strokeWidth={parseInt(
        process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINEWIDTH,
        10
      )}
    />
  )
}

export default memo(DrawRadialLines)
