import { memo } from "react"
import { Link } from "react-router"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material"

const GameCard = () => {
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
        image="/static/images/home.svg"
        title="Space Invaders"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          Space Invaders
        </Typography>
        <Typography>Classic arcade shooter — destroy the alien invasion!</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" component={Link} to="/gamepage">
          Play
        </Button>
      </CardActions>
    </Card>
  )
}

export default memo(GameCard)
