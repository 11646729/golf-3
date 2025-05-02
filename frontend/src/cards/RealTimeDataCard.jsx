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

const RealTimeDataCard = () => {
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
        image="/static/images/RealTime.jpg"
        title="Run RealTime Data Feed"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          Run RealTime Data Feed
        </Typography>
        <Typography>This runs a RealTime Data Feed</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          component={Link}
          to="/realtimehomepage"
        >
          Select Action
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(RealTimeDataCard)
