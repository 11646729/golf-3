import { memo } from "react"
import PropTypes from "prop-types"
import { Typography } from "@mui/material"
import "../styles/variables.scss"

const Title = (props) => {
  const { children } = props

  Title.propTypes = {
    children: PropTypes.node,
  }

  return (
    <Typography component="h2" variant="h6" color="$menu-color" gutterBottom>
      {children}
    </Typography>
  )
}

export default memo(Title)
