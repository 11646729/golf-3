import React, { memo } from "react"
import PropTypes from "prop-types"
import { Circle, Line } from "react-konva"

const DrawRadialLinesAndCircles = (props) => {
  const { rect } = props

  if (!rect) return

  DrawRadialLinesAndCircles.propTypes = {
    rect: PropTypes.object,
  }

  const NoOfAngles = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALNOOFANGLES
  )
  const pi_rad = Math.PI / 180
  const mcentrex = (rect.right - rect.left) / 2
  const mcentrey = (rect.bottom - rect.top) / 2
  const lines = []
  const circles = []

  // DRAW CIRCLES
  const NoOfCircles =
    (process.env.REACT_APP_GEOPHONEARRAY_MAXIMUMWAVENUMBER -
      process.env.REACT_APP_GEOPHONEARRAY_MINIMUMWAVENUMBER) /
    (process.env.REACT_APP_GEOPHONEARRAY_WAVENUMBERINTERVAL * 2)

  for (let temp = 1; temp <= NoOfCircles; temp++) {
    circles.push(
      <Circle
        x={rect.left + mcentrex}
        y={rect.top + mcentrey}
        radius={50}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
      />
    )
  }

  // DRAW RADIAL LINES
  if (
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALDISPLAYRADIALLINES === "true"
  ) {
    for (let i = 1; i <= NoOfAngles; i++) {
      const dOffx = mcentrey * Math.sin((360 / NoOfAngles) * pi_rad * i)
      const dOffy = 0 - mcentrey * Math.cos((360 / NoOfAngles) * pi_rad * i)

      const y1 = rect.top + mcentrey
      const x1 = rect.left + mcentrex
      const y2 = rect.top + mcentrey + dOffy
      const x2 = rect.left + mcentrex + dOffx

      lines.push(
        <Line
          key={i}
          points={[x1, y1, x2, y2]}
          stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
          strokeWidth={parseInt(
            process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
          )}
        />
      )
    }

    return (
      <>
        {circles}
        {lines}
      </>
    )
  }
}

export default memo(DrawRadialLinesAndCircles)
