import React, { memo } from "react"
import PropTypes from "prop-types"
import { Text, Rect } from "react-konva"

const DrawLegendAxisLabels = (props) => {
  const { rect } = props

  // If DrawLeftAxis !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTAXIS !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawLegendAxisLabels.propTypes = {
    rect: PropTypes.object,
  }

  // REACT_APP_GEOPHONEARRAY_MAXIMUMAMPLITUDE = "0.00"
  // REACT_APP_GEOPHONEARRAY_MINIMUMAMPLITUDE = "-96.00"
  // REACT_APP_GEOPHONEARRAY_NUMBEROFAMPLITUDEBANDS = "12"

  // Read Amplitude Values - Min, Max & Interval Values
  var MinAmplitude = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MINIMUMAMPLITUDE
  ).toFixed(2)

  var MaxAmplitude = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MAXIMUMAMPLITUDE
  ).toFixed(2)

  var NoOfAmplitudeIntervalBands = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_NUMBEROFAMPLITUDEBANDS
  ).toFixed(0)

  const ScaleValue = parseInt(
    (MaxAmplitude - MinAmplitude) / NoOfAmplitudeIntervalBands
  )
  const VerticalInterval = parseInt(
    (rect.bottom - rect.top) / NoOfAmplitudeIntervalBands
  )

  const values = []
  const colorRects = []

  for (let i = 0; i <= NoOfAmplitudeIntervalBands; i++) {
    const y = rect.top + i * VerticalInterval
    const x = rect.right - 50

    let AxisValue = MaxAmplitude - i * ScaleValue

    values.push(
      <Text
        fontSize={8}
        text={AxisValue}
        stroke="grey"
        strokeWidth={0.5}
        x={x}
        y={y - 3}
        align="right"
        verticalAlign="top"
      />
    )
  }

  for (let j = 0; j < NoOfAmplitudeIntervalBands; j++) {
    const y = rect.top + j * VerticalInterval
    const x = rect.right - 30

    colorRects.push(
      <Rect
        x={x}
        y={y}
        width={rect.right - x}
        height={VerticalInterval}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
        fill="lightyellow"
      />
    )
  }

  return (
    <>
      {values}
      {colorRects}
    </>
  )
}

export default memo(DrawLegendAxisLabels)
