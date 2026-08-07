// -------------------------------------------------------
// Functions to compute the Geophone Array Response that is
// plotted by the 3D Radial display as a polar heatmap.
//
// The response is evaluated over a polar grid of Azimuth
// (angle around the plot) and Wavenumber (distance out from
// the centre of the plot). The response Amplitude is in dB
// and is what the heatmap colours represent.
// -------------------------------------------------------

const pi_rad = Math.PI / 180

// -------------------------------------------------------
// Function to build the Geophone positions (in metres) for a
// rectangular array, centred on the middle of the array
// -------------------------------------------------------
export const computeArrayGeometry = () => {
  const NoOfInlineGroups = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALNOOFINLINEGROUPS
  )
  const InlineGroupSpacing = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALINLINEGROUPSPACING
  )
  const NoOfCrosslineGroups = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALNOOFCROSSLINEGROUPS
  )
  const CrosslineGroupSpacing = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCROSSLINEGROUPSPACING
  )

  // Offsets that shift the array so that its centre is at (0, 0)
  const inlineOffset = ((NoOfInlineGroups - 1) * InlineGroupSpacing) / 2
  const crosslineOffset = ((NoOfCrosslineGroups - 1) * CrosslineGroupSpacing) / 2

  const geophones = []

  for (let i = 0; i < NoOfInlineGroups; i++) {
    for (let j = 0; j < NoOfCrosslineGroups; j++) {
      geophones.push({
        x: i * InlineGroupSpacing - inlineOffset,
        y: j * CrosslineGroupSpacing - crosslineOffset,
      })
    }
  }

  return geophones
}

// -------------------------------------------------------
// Function to compute the normalised Array Response in dB over
// a polar grid of Azimuth & Wavenumber.
//
// For a wavenumber vector k at azimuth a, each geophone at
// (x, y) contributes a phase shift of 2.PI.k.(x.cos(a) + y.sin(a)).
// Summing those contributions and dividing by the number of
// geophones gives a response of 1.0 (0 dB) when every geophone
// is in phase - which is the main lobe at the centre of the plot.
//
// Amplitudes are returned in a single flat array indexed as
// [angleStep * NoOfWaveNumberSteps + waveNumberStep] to keep the
// per-cell lookup done by the heatmap cheap.
// -------------------------------------------------------
export const computeArrayResponse = (geophones) => {
  const NoOfAngleSteps = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALHEATMAPANGLESTEPS
  )
  const NoOfWaveNumberSteps = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALHEATMAPWAVENUMBERSTEPS
  )
  const MinWaveNumber = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMINIMUMWAVENUMBER
  )
  const MaxWaveNumber = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMAXIMUMWAVENUMBER
  )
  const MinAmplitude = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMINIMUMAMPLITUDE
  )

  const amplitudes = new Float32Array(NoOfAngleSteps * NoOfWaveNumberSteps)
  const angleStep = 360 / NoOfAngleSteps
  const waveNumberStep = (MaxWaveNumber - MinWaveNumber) / NoOfWaveNumberSteps

  for (let a = 0; a < NoOfAngleSteps; a++) {
    // Evaluate at the centre of the cell rather than its edge
    const azimuth = (a + 0.5) * angleStep * pi_rad
    const cosAzimuth = Math.cos(azimuth)
    const sinAzimuth = Math.sin(azimuth)

    for (let w = 0; w < NoOfWaveNumberSteps; w++) {
      const waveNumber = MinWaveNumber + (w + 0.5) * waveNumberStep
      const twoPiK = 2 * Math.PI * waveNumber

      let real = 0
      let imaginary = 0

      for (let g = 0; g < geophones.length; g++) {
        const phase =
          twoPiK * (geophones[g].x * cosAzimuth + geophones[g].y * sinAzimuth)

        real += Math.cos(phase)
        imaginary += Math.sin(phase)
      }

      const response =
        Math.sqrt(real * real + imaginary * imaginary) / geophones.length

      // Clamp the deep nulls to the bottom of the Amplitude scale,
      // otherwise they run away towards minus infinity
      const decibels = response > 0 ? 20 * Math.log10(response) : MinAmplitude

      amplitudes[a * NoOfWaveNumberSteps + w] = Math.max(decibels, MinAmplitude)
    }
  }

  return {
    amplitudes,
    NoOfAngleSteps,
    NoOfWaveNumberSteps,
    MinWaveNumber,
    MaxWaveNumber,
  }
}

// -------------------------------------------------------
// Function to compute the dB covered by one Amplitude colour band.
// The Legend and the heatmap both use this so that a colour on the
// plot always means the same thing as that colour on the Legend
// -------------------------------------------------------
export const computeAmplitudeScaleValue = () => {
  const MinAmplitude = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMINIMUMAMPLITUDE
  )
  const MaxAmplitude = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMAXIMUMAMPLITUDE
  )
  const NoOfAmplitudeIntervalBands = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALNUMBEROFAMPLITUDEBANDS
  )

  return parseInt((MaxAmplitude - MinAmplitude) / NoOfAmplitudeIntervalBands)
}

// -------------------------------------------------------
// Function to convert an Amplitude in dB to a colour band number.
// Band 1 is the loudest band & sits at the top of the Legend,
// so the bands count downwards from the Maximum Amplitude
// -------------------------------------------------------
export const computeAmplitudeBandIndex = (amplitude) => {
  const MaxAmplitude = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMAXIMUMAMPLITUDE
  )
  const NoOfAmplitudeIntervalBands = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALNUMBEROFAMPLITUDEBANDS
  )

  const bandIndex =
    Math.floor((MaxAmplitude - amplitude) / computeAmplitudeScaleValue()) + 1

  if (bandIndex < 1) return 1
  if (bandIndex > NoOfAmplitudeIntervalBands) return NoOfAmplitudeIntervalBands

  return bandIndex
}

// -------------------------------------------------------
// Function to convert from Colors to Grey Scale - translated from C++ code
// -------------------------------------------------------
export const convertRGBToGreyScale = (red, green, blue) => {
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

// -------------------------------------------------------
// Function to read the Amplitude colour bands from the environment
// settings. The returned array is 1 based so that its index is the
// band number - band 1 being the loudest.
//
// The colour bands are a single hue running light to dark, which is
// what a scale of "how much" should be - it keeps the ordering of the
// bands readable & survives being converted to grey scale.
//
// Note the environment values have to be read one at a time because
// Vite substitutes import.meta.env values at build time & so cannot
// resolve a name that is built up at run time
// -------------------------------------------------------
export const readAmplitudeColorBands = (greyScale) => {
  const NoOfAmplitudeIntervalBands = parseInt(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALNUMBEROFAMPLITUDEBANDS
  )

  const colorBands = []

  colorBands[1] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND1
  colorBands[2] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND2
  colorBands[3] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND3
  colorBands[4] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND4
  colorBands[5] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND5
  colorBands[6] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND6
  colorBands[7] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND7
  colorBands[8] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND8
  colorBands[9] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND9
  colorBands[10] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND10
  colorBands[11] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND11
  colorBands[12] = import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALCOLORBAND12

  if (greyScale !== "true") return colorBands

  for (let j = 1; j <= NoOfAmplitudeIntervalBands; j++) {
    let rgb = colorBands[j]

    if (!rgb) continue

    rgb = rgb.replace(/[^\d,]/g, "").split(",")

    const gray = convertRGBToGreyScale(rgb[0], rgb[1], rgb[2])

    colorBands[j] =
      "RGB(" +
      Math.round(gray[0], 0) +
      "," +
      Math.round(gray[1], 0) +
      "," +
      Math.round(gray[2], 0) +
      ")"
  }

  return colorBands
}

export { computeArrayResponse as default }
