import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawTopTitle = (props) => {
  const { rect, titleDraw, titleText } = props

  // If DrawTopTitle !== true then return
  if (titleDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect height = 0 then do not draw the Rectangle
  if (rect.bottom - rect.top === 0) return

  DrawTopTitle.propTypes = {
    rect: PropTypes.object,
    titleDraw: PropTypes.string,
    titleText: PropTypes.string,
  }

  return (
    <div>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
      />
      <Text
        fontFamily="Arial"
        fontStyle="normal"
        fontSize={16}
        text={titleText}
        stroke="white"
        fill="white"
        strokeWidth={0.5}
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        align="center"
        verticalAlign="bottom"
      />
    </div>
  )
}

export default memo(DrawTopTitle)
