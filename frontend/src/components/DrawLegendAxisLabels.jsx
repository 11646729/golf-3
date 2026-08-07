import React, { memo } from "react"
import PropTypes from "prop-types"
import { Text, Rect } from "react-konva"

import {
  computeAmplitudeScaleValue,
  readAmplitudeColorBands,
} from "../functionHandlers/arrayResponseFunctions"

const DrawLegendAxisLabels = (props) => {
  const { rect, legendDraw, greyScale } = props

  // If DrawLeftAxis !== true then return
  if (legendDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawLegendAxisLabels.propTypes = {
    rect: PropTypes.object,
    legendDraw: PropTypes.string,
    greyScale: PropTypes.string,
  }

  // Read Amplitude Values - Max & Interval Values
  var MaxAmplitude = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMAXIMUMAMPLITUDE
  ).toFixed(2)

  var NoOfAmplitudeIntervalBands = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALNUMBEROFAMPLITUDEBANDS
  ).toFixed(0)

  const ScaleValue = computeAmplitudeScaleValue()
  const VerticalInterval = (rect.bottom - rect.top) / NoOfAmplitudeIntervalBands

  const values = []
  const legendRects = []

  // The heatmap reads its colours from the same place, so a colour on
  // the Legend always means the same as that colour on the plot
  const legendRectColors = readAmplitudeColorBands(greyScale)

  for (let i = 0; i <= NoOfAmplitudeIntervalBands; i++) {
    const y = parseInt(rect.top + i * VerticalInterval)
    const x = rect.right + 10

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
        stroke={import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINEWIDTH
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
