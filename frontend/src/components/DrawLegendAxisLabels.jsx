import React, { memo } from "react"
import PropTypes from "prop-types"
import { Text, Rect } from "react-konva"

// -------------------------------------------------------
// Function to convert from Colors to Grey Scale - translated from C++ code & refactored
// -------------------------------------------------------
const convertRGBToGreyScale = (red, green, blue) => {
  /* remember: if you multiply a number by a decimal between 0
  and 1, it will make the number smaller. That's why we don't
  need to divide the result by three - unlike the previous
  example - because it's already balanced. */

  const r = red * 0.3 // ------> Red is low
  const g = green * 0.59 // ---> Green is high
  const b = blue * 0.11 // ----> Blue is very low

  const gray = r + g + b

  return [gray, gray, gray]
}

const DrawLegendAxisLabels = (props) => {
  const { rect } = props

  // If DrawLeftAxis !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTAXIS !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawLegendAxisLabels.propTypes = {
    rect: PropTypes.object,
  }

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
  const VerticalInterval = (rect.bottom - rect.top) / NoOfAmplitudeIntervalBands

  const legendRectColors = []
  const values = []
  const legendRects = []

  legendRectColors[1] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND1
  legendRectColors[2] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND2
  legendRectColors[3] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND3
  legendRectColors[4] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND4
  legendRectColors[5] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND5
  legendRectColors[6] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND6
  legendRectColors[7] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND7
  legendRectColors[8] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND8
  legendRectColors[9] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND9
  legendRectColors[10] =
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND10
  legendRectColors[11] =
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND11
  legendRectColors[12] =
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND12

  // Code for grey scale on Legend
  if (process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALGREYSCALE === "true") {
    for (let j = 1; j <= NoOfAmplitudeIntervalBands; j++) {
      var rgb = legendRectColors[j]
      rgb = rgb.replace(/[^\d,]/g, "").split(",")
      const gray = convertRGBToGreyScale(rgb[0], rgb[1], rgb[2])
      legendRectColors[j] =
        "RGB(" +
        Math.round(gray[0], 0) +
        "," +
        Math.round(gray[1], 0) +
        "," +
        Math.round(gray[2], 0) +
        ")"
    }
  }

  for (let i = 0; i <= NoOfAmplitudeIntervalBands; i++) {
    const y = parseInt(rect.top + i * VerticalInterval)
    const x = rect.right - 50

    let AxisValue = MaxAmplitude - i * ScaleValue

    values.push(
      <Text
        key={i}
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

  for (let j = 1; j <= NoOfAmplitudeIntervalBands; j++) {
    const y = parseInt(rect.top + (j - 1) * VerticalInterval)
    const x = rect.right - 30

    legendRects.push(
      <Rect
        key={j}
        x={x}
        y={y}
        width={rect.right - x}
        height={VerticalInterval}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
        fill={legendRectColors[j]}
      />
    )
  }

  return (
    <>
      {values}
      {legendRects}
    </>
  )
}

export default memo(DrawLegendAxisLabels)
