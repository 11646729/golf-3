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

const RTCalendarCard = () => {
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
        image="/static/images/CalendarImage.jpg"
        title="Real-time Calendar"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2"></Typography>
        <Typography>Real-time Calendar Feed</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          component={Link}
          to="/rtcalendarpage"
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

export default memo(RTCalendarCard)
