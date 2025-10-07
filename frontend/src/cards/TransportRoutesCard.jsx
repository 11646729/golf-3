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

const GTFSTransportCard = () => {
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
        image="/static/images/GTFS_UI.png"
        // image="/static/images/HamiltonBus.jpg"
        title="Transport Map"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          Transport
        </Typography>
        <Typography>This shows Transport in the Province</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          component={Link}
          to="/transportroutespage"
        >
          View
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(GTFSTransportCard)
