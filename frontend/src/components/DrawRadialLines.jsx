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
      points={[
        rect.iWidth / 2,
        rect.iHeight / 2,
        rect.iWidth,
        rect.iHeight / 2,
      ]}
      stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
      strokeWidth={parseInt(
        process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
        10
      )}
    />
  )
}

export default memo(DrawRadialLines)
