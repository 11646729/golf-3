// -------------------------------------------------------
// Function to compute ScreenEdgeRect - translated from C++ code
// -------------------------------------------------------
export const computeScreenEdgeRect = () => {
  let screenEdgeRect = {
    top: 0,
    bottom:
      window.innerHeight -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT),
    left: 0,
    right:
      window.innerWidth -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT),
  }

  // console.log(screenEdgeRect)

  return screenEdgeRect
}

// -------------------------------------------------------
// Function to compute InsideMarginsRect - translated from C++ code
// -------------------------------------------------------
export const computeInsideMarginsRect = (ScreenEdgeRect) => {
  let insideMarginsRect = {
    top:
      ScreenEdgeRect.top +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    bottom:
      ScreenEdgeRect.bottom -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    left:
      ScreenEdgeRect.left +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    right:
      ScreenEdgeRect.right -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
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
    bottom: insidePlotTitleRect.bottom - BottomTitleWidth,
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
  let BottomTitleWidth = 0
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWBOTTOMTITLE) {
    BottomTitleWidth = parseInt(
      process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH
    )
  }

  // const LegendWidth = 100
  const LegendWidth = 0

  let bottomTitlesRect = {
    top: insideMarginsRect.bottom - BottomTitleWidth,
    bottom: insideMarginsRect.bottom,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right - LegendWidth,
  }

  return bottomTitlesRect
}

// -------------------------------------------------------
// Function to compute LeftTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeLeftTitlesRect = (insideMarginsRect) => {
  let LeftTitleWidth = 0
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTTITLE) {
    LeftTitleWidth = parseInt(
      process.env.REACT_APP_GEOPHONEARRAY_LEFTTITLEWIDTH
    )
  }

  let leftTitlesRect = {
    // top: insideMarginsRect.bottom - LeftTitleWidth,
    // bottom: insideMarginsRect.bottom,
    // left: insideMarginsRect.left,
    // right: insideMarginsRect.right,

    top: insideMarginsRect.top,
    bottom: insideMarginsRect.bottom,
    left: insideMarginsRect.left,
    right: insideMarginsRect.left + LeftTitleWidth,
  }

  return leftTitlesRect
}

export { computeInsideMarginsRect as default }
