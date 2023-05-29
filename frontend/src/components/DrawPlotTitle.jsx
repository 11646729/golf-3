import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawPlotTitle = (props) => {
  const { rect, titleText } = props

  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect height = 0 then do not draw the Rectangle
  if (rect.bottom - rect.top === 0) return

  DrawPlotTitle.propTypes = {
    rect: PropTypes.object,
    titleText: PropTypes.string,
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
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
      />
      <Text
        fontFamily="Arial"
        fontStyle="normal"
        fontSize={18}
        text={titleText}
        stroke="black"
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

export default memo(DrawPlotTitle)
