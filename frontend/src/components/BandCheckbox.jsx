import React, { memo } from "react"
import PropTypes from "prop-types"

import { createTheme, ThemeProvider } from "@mui/material"
import { blue } from "@mui/material/colors"

// import CustomCheckbox from "./CustomCheckbox"

const theme = createTheme({
  status: {
    danger: blue[500],
  },
})

const BandCheckbox = (props) => {
  // const { checked } = props

  BandCheckbox.propTypes = {
    checked: PropTypes.bool,
  }

  return (
    <ThemeProvider theme={theme}>
      {/* <CustomCheckbox checked={checked} /> */}
    </ThemeProvider>
  )
}

export default memo(BandCheckbox)
