import React, { memo } from "react"
import PropTypes from "prop-types"
import Checkbox from "@mui/material"
import { createTheme, makeStyles } from "@mui/material"
import { blue } from "@mui/material"

import styled from "styled-components"

const CheckboxContainer = styled.div`
  color: black;
`

const theme = createTheme({
  status: {
    danger: blue[500],
  },
})

const useStyles = makeStyles(() => ({
  root: {
    color: theme.status.danger,
    "&$checked": {
      color: theme.status.danger,
    },
  },
  checked: {},
}))

const CustomCheckbox = (props) => {
  const { checked } = props

  const classes = useStyles()

  CustomCheckbox.propTypes = {
    checked: PropTypes.bool,
  }

  return (
    <CheckboxContainer>
      <Checkbox
        checked={checked}
        classes={{
          root: classes.root,
          checked: classes.checked,
        }}
      />
    </CheckboxContainer>
  )
}

export default memo(CustomCheckbox)
