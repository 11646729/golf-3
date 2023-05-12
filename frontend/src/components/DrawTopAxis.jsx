import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawTopAxis = (props) => {
  const { rect } = props

  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect height = 0 then do not draw the Rectangle
  if (rect.bottom - rect.top === 0) return

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

  console.log(MinWaveNumber)
  console.log(MaxWaveNumber)
  console.log(WaveNumberInterval)

  const lineCount = 50
  const lineLength = 20
  const lineSpacing = 30
  console.log(rect)

  const lines = []
  for (let i = 0; i < lineCount; i++) {
    const x1 = i * lineSpacing + lineLength
    const x2 = x1 + lineLength
    const y = 50

    lines.push(
      <Line key={i} points={[x1, y, x2, y]} stroke="red" strokeWidth={1} />
    )
  }

  return <>{lines}</>
}

export default memo(DrawTopAxis)
