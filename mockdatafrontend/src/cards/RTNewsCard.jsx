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

const RTNewsCard = () => {
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
        image="/static/images/NearbyGolfClubs.jpg"
        title="Golf Courses"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          News
        </Typography>
        <Typography>Real-time News Feed</Typography>
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

export default memo(RTNewsCard)
