// -------------------------------------------------------
// Function to compute ScreenEdgeRect - translated from C++ code
// -------------------------------------------------------
export const computeScreenEdgeRect = () => {
  const screenSizeAdjustment =
    process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT

  let screenEdgeRect = {
    top: 0,
    bottom: Math.round(window.innerHeight * screenSizeAdjustment),
    left: 0,
    right: Math.round(window.innerWidth * screenSizeAdjustment),
  }

  // console.log(screenEdgeRect)

  return screenEdgeRect
}

// -------------------------------------------------------
// Function to compute InsideMarginsRect - translated from C++ code
// -------------------------------------------------------
export const computeInsideMarginsRect = (ScreenEdge) => {
  const marginWidth = parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH)

  let insideMarginsRect = {
    top: ScreenEdge.top + marginWidth,
    bottom: ScreenEdge.bottom - marginWidth,
    left: ScreenEdge.left + marginWidth,
    right: ScreenEdge.right - marginWidth,
  }

  // console.log(insideMarginsRect)

  return insideMarginsRect
}

// -------------------------------------------------------
// Function to compute InsidePlotTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeInsidePlotTitlesRect = (insideMarginsRect) => {
  let MainTitleWidth = 0

  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWPLOTTITLE) {
    MainTitleWidth = parseInt(
      process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH
    )
  }

  let insidePlotTitleRect = {
    top: insideMarginsRect.top,
    bottom: insideMarginsRect.top + MainTitleWidth,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right,
  }

  // console.log(insidePlotTitleRect)

  return insidePlotTitleRect
}

// -------------------------------------------------------
// Function to compute InsideTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeInsideTitlesRect = (insidePlotTitleRect) => {
  const TopTitleWidth = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH
  )
  const BottomTitleWidth = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH
  )
  const LeftTitleWidth = 30
  const RightTitleWidth = 30
  const LegendWidth = 100

  // const TopTitleWidth = 0
  // const BottomTitleWidth = 0
  // const LeftTitleWidth = 0
  // const RightTitleWidth = 0
  // const LegendWidth = 0

  let insideTitlesRect = {
    top: insidePlotTitleRect.bottom + TopTitleWidth,
    bottom: insidePlotTitleRect.top - BottomTitleWidth,
    left: insidePlotTitleRect.left + LeftTitleWidth,
    right: insidePlotTitleRect.right - RightTitleWidth - LegendWidth,
  }

  // console.log(insideTitlesRect)

  return insideTitlesRect
}

// -------------------------------------------------------
// Function to compute TopTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeTopTitlesRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  let TopTitleWidth = 0
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE) {
    TopTitleWidth = parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
  }

  // const LegendWidth = 100
  const LegendWidth = 0

  let topTitlesRect = {
    top: insidePlotTitleRect.bottom,
    bottom: insidePlotTitleRect.bottom + TopTitleWidth,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right - LegendWidth,
  }

  // console.log(topTitlesRect)

  return topTitlesRect
}

// -------------------------------------------------------
// Function to compute BottomTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeBottomTitlesRect = (insideMarginsRect) => {
  const BottomTitleWidth = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH
  )
  // const LegendWidth = 100

  // const BottomTitleWidth = 0
  const LegendWidth = 0

  let bottomTitlesRect = {
    top: insideMarginsRect.bottom - BottomTitleWidth,
    bottom: insideMarginsRect.bottom,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right - LegendWidth,
  }

  // console.log(bottomTitlesRect)

  return bottomTitlesRect
}

export { computeInsideMarginsRect as default }
