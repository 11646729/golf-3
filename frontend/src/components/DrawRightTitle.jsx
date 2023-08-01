import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawRightTitle = (props) => {
  const { rect, titleDraw, titleText } = props

  // If DrawTopTitle !== true then return
  if (titleDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawRightTitle.propTypes = {
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
      />
      <Text
        fontFamily="Arial"
        fontStyle="normal"
        fontSize={16}
        text={titleText}
        stroke="white"
        fill="white"
        strokeWidth={0.5}
        x={rect.right}
        y={rect.top}
        width={rect.bottom - rect.top}
        height={rect.right - rect.left}
        align="center"
        verticalAlign="top"
        rotation={90}
      />
    </>
  )
}

export default memo(DrawRightTitle)
