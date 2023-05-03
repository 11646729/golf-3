import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect } from "react-konva"

const DrawLegendArea = (props) => {
  const { rect } = props

  if (!rect) return

  DrawLegendArea.propTypes = {
    rect: PropTypes.object,
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
      fill="darkgrey"
    />
  )
}

export default memo(DrawLegendArea)
