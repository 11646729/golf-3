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

const BelfastHarbourCard = () => {
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
        image="/static/images/BelfastHarbour.jpg"
        title="Cruise Ship in Belfast Harbour"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          Belfast Harbour
        </Typography>
        <Typography>Cruise Ships Movements</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          component={Link}
          to="/belfastharbourpage"
        >
          View
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(BelfastHarbourCard)
