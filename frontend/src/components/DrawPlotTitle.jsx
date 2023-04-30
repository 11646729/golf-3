import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect } from "react-konva"

const DrawPlotTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawPlotTitle.propTypes = {
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
      fill="lightgreen"
    />
  )
}

export default memo(DrawPlotTitle)
