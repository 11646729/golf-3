import React, { memo } from "react"
import PropTypes from "prop-types"
import { Circle, Line, Text } from "react-konva"

const DrawRadialLinesAndCircles = (props) => {
  const { rect } = props

  if (!rect) return

  DrawRadialLinesAndCircles.propTypes = {
    rect: PropTypes.object,
  }

  const NoOfAngles = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALNOOFANGLES
  )
  const pi_rad = Math.PI / 180
  const mcentrex = (rect.right - rect.left) / 2
  const mcentrey = (rect.bottom - rect.top) / 2
  const lines = []
  const circles = []
  const labels = []

  // DRAW CIRCLES
  const NoOfCircles =
    (import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMAXIMUMWAVENUMBER -
      import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMINIMUMWAVENUMBER) /
    (import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALWAVENUMBERINTERVAL * 2)

  for (let j = 1; j <= NoOfCircles; j++) {
    const circleRadius = Math.round(
      ((rect.bottom - rect.top) / 2 / NoOfCircles) * j
    )

    circles.push(
      <Circle
        key={j}
        x={rect.left + mcentrex}
        y={rect.top + mcentrey}
        radius={circleRadius}
        stroke={import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
      />
    )
  }

  // DRAW RADIAL LINES
  if (
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDISPLAYRADIALLINES === "true"
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
          stroke={import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINECOLOR}
          strokeWidth={parseInt(
            import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINEWIDTH
          )}
        />
      )
    }

    // DRAW LABELS
    if (import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDISPLAYLABELS === "true") {
      for (let k = 1; k <= NoOfAngles; k++) {
        const dOffx = mcentrey * Math.sin((360 / NoOfAngles) * pi_rad * k)
        const dOffy = 0 - mcentrey * Math.cos((360 / NoOfAngles) * pi_rad * k)

        let labelValue = "0.0"

        if (k < NoOfAngles * 0.25) {
          labelValue = k * (360 / NoOfAngles) + 270
        }

        if (k < NoOfAngles * 0.5 && k > NoOfAngles * 0.25) {
          labelValue = k * (360 / NoOfAngles) - 90
        }

        if (k <= NoOfAngles * 0.75 && k >= NoOfAngles * 0.5) {
          labelValue = k * (360 / NoOfAngles) - 90
        }

        if (k <= NoOfAngles && k > NoOfAngles * 0.75) {
          labelValue = k * (360 / NoOfAngles) - 90
        }

        labels.push(
          <Text
            key={k}
            fontSize={8}
            text={labelValue}
            stroke="grey"
            strokeWidth={0.5}
            x={rect.left + mcentrex + dOffx}
            y={rect.top + mcentrey + dOffy}
            align="center"
            verticalAlign="middle"
          />
        )
      }
    }

    return (
      <>
        {circles}
        {lines}
        {labels}
      </>
    )
  }
}

export default memo(DrawRadialLinesAndCircles)
