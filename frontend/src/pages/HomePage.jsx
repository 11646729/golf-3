import React, { memo } from "react"
import { Grid } from "@mui/material"
import styled from "styled-components"

import CopyRight from "../components/CopyRight"
import RawDataLoadCard from "../cards/RawDataLoadCard"
import WeatherCard from "../cards/WeatherCard"
import GolfCoursesCard from "../cards/GolfCoursesCard"
import NearbyCrimesCard from "../cards/NearbyCrimesCard"
import CruiseCard from "../cards/CruiseCard"
import BusRoutesCard from "../cards/BusRoutesCard"
import SeismicDesignCard from "../cards/SeismicDesignCard"
import Menu from "../components/Menu"

const HomePageContainer = styled.div`
  display: flex;
`

const MenuContainer = styled.div`
  flex: 1;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  height: auto;
  width: 100px;
  // background-color: lightyellow;
`

const CardContainer = styled.div`
  flex: 4;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  width: 100%;
  min-height: 500px;
  // background-color: lightgreen;
`
const HomePage = () => {
  return (
    <div>
      <HomePageContainer>
        <MenuContainer>{/* <Menu /> */}</MenuContainer>
        <CardContainer>
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
              <SeismicDesignCard />
            </Grid>
          </Grid>
        </CardContainer>
      </HomePageContainer>

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

export default memo(HomePage)
