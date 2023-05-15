import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawLeftTitle = (props) => {
  const { rect } = props

  // If DrawTopTitle !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTTITLE !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawLeftTitle.propTypes = {
    rect: PropTypes.object,
  }

  return (
    <>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        // stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        // strokeWidth={parseInt(
        //   process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
        //   10
        // )}
      />
      <Text
        fontSize={16}
        text={process.env.REACT_APP_GEOPHONEARRAY_TOPTITLETEXT}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left}
        y={rect.bottom}
        width={rect.bottom - rect.top}
        height={rect.right - rect.left}
        align="center"
        verticalAlign="center"
        rotation={270}
      />
    </>
  )
}

export default memo(DrawLeftTitle)
