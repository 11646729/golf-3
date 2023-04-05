import React, { memo } from "react"
// import moment from "moment"
import PropTypes from "prop-types"
import {
  useTheme,
  Grid,
  Container,
  // Button,
} from "@mui/material"
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  // Tooltip,
  ResponsiveContainer,
} from "recharts"

import Title from "./Title"
// import LoadingTitle from "./LoadingTitle"

const TemperaturesChart = (props) => {
  const { temperatureData } = props

  TemperaturesChart.propTypes = {
    temperatureData: PropTypes.array,
  }

  const theme = useTheme()

  //  const formatXAxis = (tickItem) => moment(tickItem).format("HH:mm MMM Do")
  const formatXAxis = (tickItem) => +tickItem // Temporary Code
  const formatYAxis = (tickItem) => +tickItem.toFixed(2)

  return (
    <div>
      <Grid container>
        <Container maxWidth="xl">
          <Grid item xs={12} sm={12} style={{ marginTop: 50, width: "100%" }}>
            {temperatureData.length < 1 ? (
              <Title>Home Temperature is loading...</Title>
            ) : (
              <Title>
                Home Temperature is: &nbsp;
                {Object.values(temperatureData[0])[4]} °F
              </Title>
            )}
            {/* {props.loadingError ? (
              <LoadingTitle>Error Loading...</LoadingTitle>
            ) : null} */}
            {/* <Button size="small" color="primary" onClick={clearDataArray}>
                Clear
              </Button> */}
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            style={{
              marginTop: 20,
              marginBottom: 20,
              width: "100%",
              height: 400,
            }}
          >
            <ResponsiveContainer>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  dataKey="timeofmeasurement"
                  tickFormatter={formatXAxis}
                >
                  <Label
                    position="insideBottom"
                    offset={-10}
                    style={{
                      textAnchor: "middle",
                      fill: theme.palette.text.primary,
                    }}
                  >
                    Time &amp; Date
                  </Label>
                </XAxis>
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  dataKey="locationtemperature"
                  tickFormatter={formatYAxis}
                  type="number"
                  domain={["dataMin", "dataMax"]}
                >
                  <Label
                    angle={270}
                    position="left"
                    offset={-1}
                    style={{
                      textAnchor: "middle",
                      fill: theme.palette.text.primary,
                    }}
                  >
                    Temperature &deg;F
                  </Label>
                </YAxis>
                {/* <Tooltip labelFormatter={formatXAxis} /> */}
                <Line
                  type="monotone"
                  dataKey="locationtemperature"
                  stroke={theme.palette.primary.main}
                />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Container>
      </Grid>
    </div>
  )
}

export default memo(TemperaturesChart)
