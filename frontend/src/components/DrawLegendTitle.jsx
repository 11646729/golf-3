import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawLegendTitle = (props) => {
  const { rect, legendDraw, legendTitle } = props

  // If DrawTopTitle !== true then return
  if (legendDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect height = 0 then do not draw the Rectangle
  if (rect.bottom - rect.top === 0) return

  DrawLegendTitle.propTypes = {
    rect: PropTypes.object,
    legendDraw: PropTypes.string,
    legendTitle: PropTypes.string,
  }

  return (
    <>
      <Rect
        x={rect.left}
        y={
          rect.top -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALTOPAXISWIDTH) -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALTOPTITLEWIDTH)
        }
        width={rect.right - rect.left}
        height={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALTOPTITLEWIDTH
        )}
      />
      <Text
        fontSize={16}
        text={legendTitle}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left}
        y={
          rect.top -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALTOPAXISWIDTH) -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALTOPTITLEWIDTH)
        }
        width={rect.right - rect.left}
        height={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALTOPTITLEWIDTH
        )}
        align="center"
        verticalAlign="bottom"
      />
    </>
  )
}

export default memo(DrawLegendTitle)
