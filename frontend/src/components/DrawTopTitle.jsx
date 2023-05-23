import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawTopTitle = (props) => {
  const { rect } = props

  // If DrawTopTitle !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect height = 0 then do not draw the Rectangle
  if (rect.bottom - rect.top === 0) return

  DrawTopTitle.propTypes = {
    rect: PropTypes.object,
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
        fontSize={16}
        text={process.env.REACT_APP_GEOPHONEARRAY_TOPTITLETEXT}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        align="center"
        verticalAlign="bottom"
      />
    </>
  )
}

export default memo(DrawTopTitle)
