import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawTopAxis = (props) => {
  const { rect } = props

  // If DrawLeftAxis !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTAXIS !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawTopAxis.propTypes = {
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
    const y = rect.top + i * ScaleHorizontal
    const x1 = rect.left
    const x2 = rect.left - lineLength

    lines.push(
      <Line
        key={i}
        points={[x1, y, x2, y]}
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

export default memo(DrawTopAxis)
