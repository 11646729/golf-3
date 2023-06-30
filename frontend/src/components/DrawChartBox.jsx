import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect } from "react-konva"

const DrawChartBox = (props) => {
  const { rect } = props

  if (!rect) return

  DrawChartBox.propTypes = {
    rect: PropTypes.object,
  }

  // const handleClick = (e) => {
  //   console.log(e.target.getStage())
  //   console.log(e.target.getLayer())
  // }

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
      // onClick={(e) => {
      //   handleClick(e)
      // }}
    />
  )
}

export default memo(DrawChartBox)
