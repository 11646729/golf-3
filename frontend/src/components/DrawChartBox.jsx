import React, { memo } from "react"
import PropTypes from "prop-types"
import { Circle, Rect } from "react-konva"

const DrawChartBox = (props) => {
  const { rect } = props

  if (!rect) return

  DrawChartBox.propTypes = {
    rect: PropTypes.array,
  }

  const rectangleYPosition =
    rect.height *
    (process.env.REACT_APP_GEOPHONEARRAY_TOPMARGINPERCENTAGE / 100)
  const chartXPosition = rect.width / 2
  const chartYPosition = rect.height / 2
  const circleRadius =
    (rect.height *
      (1 -
        process.env.REACT_APP_GEOPHONEARRAY_TOPMARGINPERCENTAGE / 100 -
        process.env.REACT_APP_GEOPHONEARRAY_BOTTOMMARGINPERCENTAGE / 100)) /
    2
  const rectangleXPosition = (rect.width - circleRadius * 2) / 2

  return (
    <div>
      <Rect
        x={rectangleXPosition}
        y={rectangleYPosition}
        width={circleRadius * 2}
        height={circleRadius * 2}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINEWIDTH,
          10
        )}
      />
      <Circle
        x={chartXPosition}
        y={chartYPosition}
        radius={circleRadius}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINEWIDTH,
          10
        )}
      />
    </div>
  )
}

export default memo(DrawChartBox)
