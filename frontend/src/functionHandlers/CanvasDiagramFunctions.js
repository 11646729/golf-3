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

  return insideMarginsRect
}

// -------------------------------------------------------
// Function to compute InsidePlotTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeInsidePlotTitlesRect = (insideMarginsRect) => {
  const MainTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWPLOTTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH)
      : 0

  let insidePlotTitleRect = {
    top: insideMarginsRect.top,
    bottom: insideMarginsRect.top + MainTitleWidth,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right,
  }

  return insidePlotTitleRect
}

// -------------------------------------------------------
// Function to compute TopTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeTopTitlesRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const TopTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
      : 0

  const LegendWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEGENDWIDTH)
      : 0

  let topTitlesRect = {
    top: insidePlotTitleRect.bottom,
    bottom: insidePlotTitleRect.bottom + TopTitleWidth,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right - LegendWidth,
  }

  return topTitlesRect
}

// -------------------------------------------------------
// Function to compute BottomTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeBottomTitlesRect = (insideMarginsRect) => {
  const BottomTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWBOTTOMTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH)
      : 0

  const LegendWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEGENDWIDTH)
      : 0

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
export const computeLeftTitlesRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const TopTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
      : 0

  const BottomTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWBOTTOMTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH)
      : 0

  const LeftTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTTITLEWIDTH)
      : 0

  const RightTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWRIGHTTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTTITLEWIDTH)
      : 0

  const LegendWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEGENDWIDTH)
      : 0

  const tempHeight =
    insideMarginsRect.bottom -
    BottomTitleWidth -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
    insidePlotTitleRect.bottom +
    TopTitleWidth +
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)

  const tempWidth =
    insideMarginsRect.right -
    RightTitleWidth -
    LegendWidth -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
    (insideMarginsRect.left +
      LeftTitleWidth +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH))

  let leftTitlesRect = {
    top: insidePlotTitleRect.bottom + TopTitleWidth,
    bottom: insideMarginsRect.bottom - BottomTitleWidth,
    left: insideMarginsRect.left + (tempWidth - tempHeight) / 2,
    right:
      insideMarginsRect.left + LeftTitleWidth + (tempWidth - tempHeight) / 2,
  }

  return leftTitlesRect
}

// -------------------------------------------------------
// Function to compute RightTitlesRect - translated from C++ code
// -------------------------------------------------------
export const computeRightTitlesRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const TopTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
      : 0

  const BottomTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWBOTTOMTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH)
      : 0

  const LeftTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTTITLEWIDTH)
      : 0

  const RightTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWRIGHTTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTTITLEWIDTH)
      : 0

  const LegendWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEGENDWIDTH)
      : 0

  // LegendWidth is ok
  // TopTitleWidth is ok
  // BottomTitleWidth is ok
  // LeftTitleWidth is ok
  // RightTitleWidth is ok

  const tempHeight =
    insideMarginsRect.bottom -
    BottomTitleWidth -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
    insidePlotTitleRect.bottom +
    TopTitleWidth +
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)

  // int tempheight = ((InsideTitles.bottom - BottomAxisHeight) - (InsideTitles.top + TopAxisHeight))
  // InsideTitles.bottom = InsideMargins.bottom - BottomTitleHeight
  // InsideTitles.top = InsidePlotTitle.bottom + TopTitleHeight
  // InsideTitles.left = InsideMargins.left + LeftTitleWidth

  const tempWidth =
    insideMarginsRect.right -
    RightTitleWidth -
    LegendWidth -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
    (insideMarginsRect.left +
      LeftTitleWidth +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH))

  // int tempwidth = ((InsideTitles.right - RightAxisWidth) - (InsideTitles.left + LeftAxisWidth))
  // InsideTitles.right = InsideMargins.right - RightTitleWidth - LegendWidth
  // InsideTitles.left = InsideMargins.left + LeftTitleWidth

  let rightTitlesRect = {
    top: insidePlotTitleRect.bottom + TopTitleWidth,
    bottom: insideMarginsRect.bottom - BottomTitleWidth,
    left:
      insideMarginsRect.right -
      RightTitleWidth -
      LegendWidth -
      (tempWidth - tempHeight) / 2,
    right: insideMarginsRect.right - LegendWidth - (tempWidth - tempHeight) / 2,
  }

  console.log(rightTitlesRect)

  return rightTitlesRect
}

// -------------------------------------------------------
// Function to compute GraphPlotAreaRect - translated from C++ code
// -------------------------------------------------------
export const computeGraphPlotAreaRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const TopTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
      : 0

  const BottomTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWBOTTOMTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH)
      : 0

  const LeftTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTTITLEWIDTH)
      : 0

  const RightTitleWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWRIGHTTITLE === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTTITLEWIDTH)
      : 0

  const LegendWidth =
    process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND === "true"
      ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEGENDWIDTH)
      : 0

  const tempHeight =
    insideMarginsRect.bottom -
    BottomTitleWidth -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
    insidePlotTitleRect.bottom +
    TopTitleWidth +
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)

  const tempWidth =
    insideMarginsRect.right -
    RightTitleWidth -
    LegendWidth -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
    (insideMarginsRect.left +
      LeftTitleWidth +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH))

  let graphPlotAreaRect = {
    top:
      insidePlotTitleRect.bottom +
      TopTitleWidth +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH),
    bottom:
      insideMarginsRect.bottom -
      BottomTitleWidth -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH),
    left:
      insideMarginsRect.left +
      LeftTitleWidth +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH) +
      (tempWidth - tempHeight) / 2,
    right:
      insideMarginsRect.right -
      RightTitleWidth -
      LegendWidth -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
      (tempWidth - tempHeight) / 2,
  }

  return graphPlotAreaRect
}

export { computeInsideMarginsRect as default }
