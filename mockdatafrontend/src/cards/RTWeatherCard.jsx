import React, { memo } from "react"
import { Link } from "react-router-dom"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material"

const RTWeatherCard = () => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardMedia
        sx={{ paddingTop: "56.25%" }}
        image="/static/images/WeatherImage.png"
        title="Real-time Weather"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2"></Typography>
        <Typography>Real-time Weather Feed</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          component={Link}
          // to="/golfcoursespage"
        >
          Live Data
        </Button>
        <Button
          size="small"
          color="primary"
          component={Link}
          // to="/golfcoursespage"
        >
          Dummy Data
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(RTWeatherCard)
