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

const GTFSBusTransportCard = () => {
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
        title="Bus Transport Map"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          Bus Transport
        </Typography>
        <Typography>This shows Bus Transport in the Province</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          component={Link}
          to="/busroutespage"
        >
          View
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(GTFSBusTransportCard)
