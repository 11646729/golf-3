import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawBottomAxis = (props) => {
  const { rect } = props

  // If DrawBottomAxis !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWBOTTOMAXIS !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawBottomAxis.propTypes = {
    rect: PropTypes.object,
  }

  // Read Axis Values - Min, Max & Interval Values
  var MinWaveNumber = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MINIMUMWAVENUMBER
  ).toFixed(2)

  var MaxWaveNumber = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MAXIMUMWAVENUMBER
  ).toFixed(2)

  var WaveNumberInterval = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_WAVENUMBERINTERVAL
  ).toFixed(2)

  const ScaleHorizontal =
    (rect.right - rect.left) /
    ((MaxWaveNumber - MinWaveNumber) / WaveNumberInterval)

  const lineLength = 10

  const lines = []

  for (
    let i = 0;
    i <= (MaxWaveNumber - MinWaveNumber) / WaveNumberInterval;
    i++
  ) {
    const x = rect.left + i * ScaleHorizontal
    const y1 = rect.bottom
    const y2 = rect.bottom + lineLength

    lines.push(
      <Line
        key={i}
        points={[x, y1, x, y2]}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
      />
    )
  }

  return <>{lines}</>
}

export default memo(DrawBottomAxis)
