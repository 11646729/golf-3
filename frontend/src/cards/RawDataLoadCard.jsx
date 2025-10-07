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

const RawDataLoadCard = () => {
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
        image="/static/images/SaveData.jpg"
        title="Load Raw Data"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          Load Raw Data
        </Typography>
        <Typography>This loads Raw Data into the SQL database</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" component={Link} to="/rawdatapage">
          Select Action
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(RawDataLoadCard)
