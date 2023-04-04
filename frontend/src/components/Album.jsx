import React, { memo } from "react"
import { Grid, Container } from "@mui/material"

import CopyRight from "./CopyRight"
import RawDataLoadCard from "../cards/RawDataLoadCard"
import WeatherCard from "../cards/WeatherCard"
import GolfCoursesCard from "../cards/GolfCoursesCard"
import NearbyCrimesCard from "../cards/NearbyCrimesCard"
import CruiseCard from "../cards/CruiseCard"
import BusRoutesCard from "../cards/BusRoutesCard"
import CanvasTestCard from "../cards/CanvasTestCard"

// const useStyles = makeStyles((theme) => ({
//   icon: {
//     marginRight: theme.spacing(2),
//   },
//   heroContent: {
//     backgroundColor: theme.palette.background.paper,
//     padding: theme.spacing(8, 0, 6),
//   },
//   heroButtons: {
//     marginTop: theme.spacing(4),
//   },
//   cardGrid: {
//     paddingTop: theme.spacing(8),
//     paddingBottom: theme.spacing(8),
//   },
//   card: {
//     height: "100%",
//     display: "flex",
//     flexDirection: "column",
//   },
//   cardMedia: {
//     paddingTop: "56.25%", // 16:9
//   },
//   cardContent: {
//     flexGrow: 1,
//   },
//   footer: {
//     backgroundColor: theme.palette.background.paper,
//     padding: theme.spacing(6),
//   },
//   paper: {
//     padding: theme.spacing(2),
//     display: "flex",
//     overflow: "auto",
//     flexDirection: "column",
//   },
//   fixedHeight: {
//     height: "100%",
//   },
// }))

const Album = () => {
  return (
    <div>
      <main>
        {/* Hero Unit */}
        {/* <div>
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              My Dashboard
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
              Something short and leading about ...
            </Typography>
          </Container>
        </div> */}
        {/* End Hero Unit */}

        {/* Main Area */}
        <Container maxWidth="xl">
          <Grid container>
            <Grid item sm={3} style={{ padding: 20 }}>
              <RawDataLoadCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <WeatherCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <GolfCoursesCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <NearbyCrimesCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <CruiseCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <BusRoutesCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <CanvasTestCard />
            </Grid>
          </Grid>
        </Container>
        {/* End Main Area */}
      </main>

      {/* Footer */}
      <footer>
        {/* <Typography variant="h6" align="center" gutterBottom>
          Footer
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          component="p"
        >
          Something here to give the footer a purpose!
        </Typography> */}
        <CopyRight />
      </footer>
    </div>
  )
}

export default memo(Album)
