import { memo } from "react"
import { Grid } from "@mui/material"
import RealTimeDataCard from "../cards/RealTimeDataCard"
import RawDataLoadCard from "../cards/RawDataLoadCard"
import WeatherCard from "../cards/WeatherCard"
import GolfCoursesCard from "../cards/GolfCoursesCard"
import NearbyCrimesCard from "../cards/NearbyCrimesCard"
import CruiseCard from "../cards/CruiseCard"
import TransportRoutesCard from "../cards/TransportRoutesCard"
import SeismicDesignCard from "../cards/SeismicDesignCard"
import "../styles/home.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const HomePage = () => {
  return (
    <div className="homecontainer">
      <div className="cardcontainer">
        <Grid container>
          <Grid item sm={3} style={{ padding: 20 }}>
            <RealTimeDataCard />
          </Grid>
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
            <TransportRoutesCard />
          </Grid>
          <Grid item sm={3} style={{ padding: 20 }}>
            <SeismicDesignCard />
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default memo(HomePage)
