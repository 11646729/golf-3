import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawLegendTitle = (props) => {
  const { rect } = props

  // If DrawTopTitle !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect height = 0 then do not draw the Rectangle
  if (rect.bottom - rect.top === 0) return

  DrawLegendTitle.propTypes = {
    rect: PropTypes.object,
  }

  return (
    <>
      <Rect
        x={rect.left}
        y={
          rect.top -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH) -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
        }
        width={rect.right - rect.left}
        height={parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)}
        // stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        // strokeWidth={parseInt(
        //   process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        // )}
        // fill="lightyellow"
      />
      <Text
        fontSize={16}
        text={process.env.REACT_APP_GEOPHONEARRAY_LEGENDTEXT}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left}
        y={
          rect.top -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH) -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
        }
        width={rect.right - rect.left}
        height={parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)}
        align="center"
        verticalAlign="bottom"
      />
    </>
  )
}

export default memo(DrawLegendTitle)
