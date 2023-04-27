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
  const MainTitleHeight = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH
  )

  // const MainTitleHeight = 0

  let insidePlotTitleRect = {
    top: insideMarginsRect.top,
    bottom: insideMarginsRect.top + MainTitleHeight,
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
  const TopTitleHeight = 20
  const BottomTitleHeight = 20
  const LeftTitleHeight = 20
  const RightTitleMargin = 20
  const LegendWidth = 30

  // const TopTitleHeight = 0
  // const BottomTitleHeight = 0
  // const LeftTitleHeight = 0
  // const RightTitleMargin = 0
  // const LegendWidth = 0

  let insideTitlesRect = {
    top: insidePlotTitleRect.bottom + TopTitleHeight,
    bottom: insidePlotTitleRect.top - BottomTitleHeight,
    left: insidePlotTitleRect.left + LeftTitleHeight,
    right: insidePlotTitleRect.right - RightTitleMargin - LegendWidth,
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
  const TopTitleHeight = 30
  // const LegendWidth = 100

  // const TopTitleHeight = 0
  const LegendWidth = 0

  let topTitlesRect = {
    top: insidePlotTitleRect.bottom,
    bottom: insidePlotTitleRect.bottom + TopTitleHeight,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right - LegendWidth,
  }

  // console.log(topTitlesRect)

  return topTitlesRect
}

export { computeInsideMarginsRect as default }
