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

const CanvasCard = () => {
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
        image="/static/images/eSeismic Canvas Test.png"
        title="Canvas Test"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          GridTestProg Canvas Test
        </Typography>
        <Typography>This is the GridTest Canvas Test</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" component={Link} to="/canvaspage">
          View
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(CanvasCard)
