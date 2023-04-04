import React, { memo } from "react"
import PropTypes from "prop-types"
import { Typography } from "@mui/material"

const Title = (props) => {
  const { children } = props

  Title.propTypes = {
    children: PropTypes.node,
  }

  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {children}
    </Typography>
  )
}

export default memo(Title)
