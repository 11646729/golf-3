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

const CruiseCard = () => {
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
        image="/static/images/CruiseShips.jpg"
        title="Cruise Ship in Belfast Lough"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          Cruise Ship Arrivals
        </Typography>
        <Typography>
          Details about the Cruise Ships arriving soon in Belfast
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" component={Link} to="/cruisespage">
          View
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(CruiseCard)
