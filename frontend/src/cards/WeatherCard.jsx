import React, { memo } from "react"
import { Link } from "react-router"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material"

const WeatherCard = () => {
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
        image="/static/images/Temperature.jpg"
        title="Outside Temperature"
      />
      <CardContent sx={{ flexGrow: 1 }}>
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
