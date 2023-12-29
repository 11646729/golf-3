import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"
import "../styles/variables.scss"

const DrawPlotTitle = (props) => {
  const { rect, titleDraw, titleText } = props

  // If DrawPlotTitle !== true then return
  if (titleDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect height = 0 then do not draw the Rectangle
  if (rect.bottom - rect.top === 0) return

  DrawPlotTitle.propTypes = {
    rect: PropTypes.object,
    titleDraw: PropTypes.string,
    titleText: PropTypes.string,
  }

  return (
    <>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        stroke={import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
      />
      <Text
        fontFamily="Arial"
        fontStyle="normal"
        fontSize={18}
        text={titleText}
        stroke="white"
        fill="white"
        strokeWidth={0.5}
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
