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
} from "@mui/material"

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

const TemperaturesCard = () => {
  const classes = useStyles()

  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.cardMedia}
        image="/static/images/SaveData.jpg"
        title="Load Data"
      />
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
          Find and Load Data
        </Typography>
        <Typography>This loads Raw Data into the SQL database</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" component={Link} to="/rawdatapage">
          Select Action
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(TemperaturesCard)
