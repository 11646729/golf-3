import React, { memo } from "react"
import PropTypes from "prop-types"
import { makeStyles, ListItemText, Typography } from "@material-ui/core"

const useStyles = makeStyles({
  routeName: () => ({
    paddingLeft: "10px",
    fontSize: "14px",
    fontWeight: "400",
    variant: "caption",
  }),
  routeVia: () => ({
    paddingLeft: "10px",
    fontSize: "12px",
    fontWeight: "50",
  }),
})

const BandListItemText = (props) => {
  const { routeName, routeVia } = props

  const classes = useStyles(props)

  BandListItemText.propTypes = {
    routeName: PropTypes.string,
    routeVia: PropTypes.string,
  }

  return (
    <ListItemText
      primary={
        <Typography className={classes.routeName}>{routeName}</Typography>
      }
      secondary={
        <Typography className={classes.routeVia}>{routeVia}</Typography>
      }
    />
  )
}

export default memo(BandListItemText)
