import React, { memo } from "react"
import { Link } from "react-router-dom"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  makeStyles,
} from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
}))

const WeatherCard = () => {
  const classes = useStyles()

  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.cardMedia}
        image="/static/images/Temperature.jpg"
        title="Outside Temperature"
      />
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
          Outside Temperature
        </Typography>
        <Typography>This shows the Outside Temperature at Home</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" component={Link} to="/weatherpage">
          View
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(WeatherCard)
