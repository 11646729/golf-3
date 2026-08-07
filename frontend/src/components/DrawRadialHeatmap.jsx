import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Shape, Label, Tag, Text } from "react-konva"

import {
  computeArrayGeometry,
  computeArrayResponse,
  computeAmplitudeBandIndex,
  readAmplitudeColorBands,
} from "../functionHandlers/arrayResponseFunctions"

const pi_rad = Math.PI / 180

const DrawRadialHeatmap = (props) => {
  const { rect, heatmapDraw, greyScale } = props

  const shapeRef = useRef(null)
  const [readout, setReadout] = useState(null)

  // The Array Response only depends on the array geometry, so it is
  // computed once & then re-used every time the plot is re-drawn
  const response = useMemo(
    () => computeArrayResponse(computeArrayGeometry()),
    []
  )
  const colorBands = useMemo(
    () => readAmplitudeColorBands(greyScale),
    [greyScale]
  )

  const {
    amplitudes,
    NoOfAngleSteps,
    NoOfWaveNumberSteps,
    MinWaveNumber,
    MaxWaveNumber,
  } = response

  // The centre & outer radius match DrawRadialLinesAndCircles, so the
  // heatmap sits exactly under the radial lines & circles
  const drawable = Boolean(rect) && rect.bottom - rect.top > 0
  const centreX = drawable ? rect.left + (rect.right - rect.left) / 2 : 0
  const centreY = drawable ? rect.top + (rect.bottom - rect.top) / 2 : 0
  const maxRadius = drawable ? (rect.bottom - rect.top) / 2 : 0

  // -------------------------------------------------------
  // Local function to convert a screen position into the Azimuth,
  // Wavenumber & Amplitude under the cursor
  // -------------------------------------------------------
  const readValueAt = useCallback(
    (position) => {
      const dx = position.x - centreX
      const dy = position.y - centreY
      const radius = Math.sqrt(dx * dx + dy * dy)

      if (radius > maxRadius) return null

      // Azimuth is measured the same way round as the labels drawn by
      // DrawRadialLinesAndCircles - from the 3 o'clock position
      let azimuth = Math.atan2(dy, dx) / pi_rad
      if (azimuth < 0) azimuth = azimuth + 360

      let a = Math.floor(azimuth / (360 / NoOfAngleSteps))
      if (a > NoOfAngleSteps - 1) a = NoOfAngleSteps - 1

      let w = Math.floor((radius / maxRadius) * NoOfWaveNumberSteps)
      if (w > NoOfWaveNumberSteps - 1) w = NoOfWaveNumberSteps - 1

      return {
        x: position.x,
        y: position.y,
        azimuth: azimuth,
        waveNumber:
          MinWaveNumber + (radius / maxRadius) * (MaxWaveNumber - MinWaveNumber),
        amplitude: amplitudes[a * NoOfWaveNumberSteps + w],
      }
    },
    [
      amplitudes,
      centreX,
      centreY,
      maxRadius,
      MaxWaveNumber,
      MinWaveNumber,
      NoOfAngleSteps,
      NoOfWaveNumberSteps,
    ]
  )

  const handleMouseMove = useCallback(
    (e) => {
      const position = e.target.getStage().getPointerPosition()

      if (!position) return

      setReadout(readValueAt(position))
    },
    [readValueAt]
  )

  const handleMouseLeave = useCallback(() => setReadout(null), [])

  // -------------------------------------------------------
  // Painting the cells is expensive & Konva re-draws the whole Layer
  // whenever anything on it changes - including the readout following
  // the cursor. Caching the finished heatmap into its own canvas means
  // those re-draws just copy the picture instead of painting it again
  // -------------------------------------------------------
  useEffect(() => {
    if (!drawable || !shapeRef.current) return

    // The plot has been re-sized, so anything the cursor was over before
    // is no longer where the readout says it is
    setReadout(null)

    shapeRef.current.cache({
      x: centreX - maxRadius - 2,
      y: centreY - maxRadius - 2,
      width: maxRadius * 2 + 4,
      height: maxRadius * 2 + 4,
    })
    shapeRef.current.getLayer().batchDraw()
  }, [drawable, centreX, centreY, maxRadius, colorBands])

  // If DrawHeatmap !== true then return
  if (heatmapDraw !== "true") return
  // If there is no rectangle to draw into then return
  if (!drawable) return

  DrawRadialHeatmap.propTypes = {
    rect: PropTypes.object,
    heatmapDraw: PropTypes.string,
    greyScale: PropTypes.string,
  }

  const angleStep = (2 * Math.PI) / NoOfAngleSteps
  const radiusStep = maxRadius / NoOfWaveNumberSteps

  // Grow each cell by a fraction so that neighbouring cells overlap.
  // The response is a continuous field, so hairline gaps between the
  // cells would be read as structure that is not in the data
  const radiusOverlap = 0.75
  const angleOverlap = 0.6 / maxRadius

  // -------------------------------------------------------
  // Local function to paint every cell of the polar grid. This is done
  // in a single Konva Shape rather than one node per cell - the plot
  // holds tens of thousands of cells & a node each would crawl
  // -------------------------------------------------------
  const drawHeatmap = (context) => {
    for (let a = 0; a < NoOfAngleSteps; a++) {
      const startAngle = a * angleStep
      const endAngle = startAngle + angleStep + angleOverlap

      for (let w = 0; w < NoOfWaveNumberSteps; w++) {
        const innerRadius = w * radiusStep
        const outerRadius = innerRadius + radiusStep + radiusOverlap

        const bandIndex = computeAmplitudeBandIndex(
          amplitudes[a * NoOfWaveNumberSteps + w]
        )

        context.beginPath()
        context.arc(centreX, centreY, outerRadius, startAngle, endAngle, false)
        context.arc(centreX, centreY, innerRadius, endAngle, startAngle, true)
        context.closePath()
        context.fillStyle = colorBands[bandIndex]
        context.fill()
      }
    }
  }

  return (
    <>
      <Shape
        ref={shapeRef}
        sceneFunc={(context) => drawHeatmap(context)}
        hitFunc={(context, shape) => {
          context.beginPath()
          context.arc(centreX, centreY, maxRadius, 0, 2 * Math.PI, false)
          context.closePath()
          context.fillStrokeShape(shape)
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {readout && (
        <Label
          x={readout.x < rect.right - 150 ? readout.x + 12 : readout.x - 150}
          y={readout.y - 12}
          listening={false}
        >
          <Tag
            fill="white"
            opacity={0.92}
            stroke={import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALGRIDLINECOLOR}
            strokeWidth={parseInt(
              import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINEWIDTH
            )}
            cornerRadius={4}
          />
          <Text
            fontFamily="Arial"
            fontSize={11}
            fill="black"
            padding={6}
            lineHeight={1.4}
            text={
              "Azimuth " +
              readout.azimuth.toFixed(0) +
              "°\nWavenumber " +
              readout.waveNumber.toFixed(3) +
              " c/m\nAmplitude " +
              readout.amplitude.toFixed(1) +
              " dB"
            }
          />
        </Label>
      )}
    </>
  )
}

export default memo(DrawRadialHeatmap)
