import React, { memo, useState } from "react"
import PropTypes from "prop-types"
import mystyled from "styled-components"
import { styled } from "@mui/material/styles"
import Title from "./Title"
import { Button } from "@mui/material"
import MuiToggleButton from "@mui/material/ToggleButton"

import { loadTemperaturesDataHandler } from "../functionHandlers/loadTemperaturesDataHandler"
import { loadGolfCoursesDataHandler } from "../functionHandlers/loadGolfCoursesDataHandler"
import { loadCruiseShipArrivalsDataHandler } from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import { loadStaticGTFSDataHandler } from "../functionHandlers/loadStaticGTFSDataHandler"
import { loadRealtimeGTFSDataHandler } from "../functionHandlers/loadRealtimeGTFSDataHandler"
import { startRegularUpdatesOfRealtimeGTFSDataHandler } from "../functionHandlers/loadRealtimeGTFSDataHandler"
import { loadCrimesDataHandler } from "../functionHandlers/loadCrimesDataHandler"
import { startRealtimeDataHandler } from "../functionHandlers/startRealtimeDataHandler"
import { loadRTCalendarEventsHandler } from "../functionHandlers/loadRTCalendarDataHandler"
import { loadRTNewsItemsHandler } from "../functionHandlers/loadRTNewsDataHandler"

const ToggleButton = styled(MuiToggleButton)({
  "&.Mui-selected, &.Mui-selected:hover": {
    color: "white",
    backgroundColor: "#00ff00",
  },
})

const TableTitleContainer = mystyled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const TableContainer = mystyled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
`

const TableStyle = mystyled.table`
  width: 94%;
  margin-left: 20px;
  margin-right: 20px;
  border-spacing: 20px;
  border: 1px solid lightgray;
  border-collapse: collapse;
  font-weight: normal;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
`

const TableHeader = mystyled.thead`
  /* text-align: left; */
  font-size: 14px;
`

const TableRow = mystyled.tr`
  &:hover {
    background-color: #ebeccd;
    color: black;
  }
`

const TableHead = mystyled.th`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
`

const TableBody = mystyled.tbody``

const TableCell = mystyled.td`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
  text-align: center;
`

const tableData = [
  {
    id: 1,
    datatype: "Temperatures Data",
    buttontext: "Fetch Temperatures",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 2,
    datatype: "Golf Course Data",
    buttontext: "Fetch Golf Courses",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 3,
    datatype: "Cruise Ship Arrivals Data",
    buttontext: "Fetch Cruise Ships",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 4,
    datatype: "GTFS Transport Data",
    buttontext: "Initialise All Static & Realtime GTFS Data",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 5,
    datatype: "GTFS Transport Data",
    buttontext: "Update Realtime GTFS Data",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 6,
    datatype: "GTFS Transport Data",
    buttontext: "Update GTFS Trip & Vehicle Position Data",
    buttonbackgroundcolor: "darkblue",
  },
  {
    id: 7,
    datatype: "Crime Data",
    buttontext: "Fetch Crime Data",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 8,
    datatype: "Realtime Calendar & News Data",
    buttontext: "Start Calendar & News Realtime Data",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 9,
    datatype: "Realtime Calendar Data",
    buttontext: "Fetch Realtime Calendar Data",
    buttonbackgroundcolor: "darkred",
  },
  {
    id: 10,
    datatype: "Realtime News Data",
    buttontext: "Fetch Realtime News Data",
    buttonbackgroundcolor: "darkred",
  },
]

const RawDataTable = (props) => {
  const { rawDataTableTitle } = props

  RawDataTable.propTypes = {
    rawDataTableTitle: PropTypes.string,
  }

  // const [toggle, setToggle] = useState(false)
  // const [buttonBackgroundColor, setButtonBackgroundColor] = useState("darkred")

  const handleClick = (id) => {
    // Define the logic for handling the button click here

    switch (id) {
      case 1:
        loadTemperaturesDataHandler()
        break
      case 2:
        loadGolfCoursesDataHandler()
        break
      case 3:
        loadCruiseShipArrivalsDataHandler()
        break
      case 4:
        loadStaticGTFSDataHandler()
        break
      case 5:
        loadRealtimeGTFSDataHandler()
        break
      case 6:
        // setToggle(!toggle)
        startRegularUpdatesOfRealtimeGTFSDataHandler()
        break
      case 7:
        loadCrimesDataHandler()
        break
      case 8:
        startRealtimeDataHandler()
        break
      case 9:
        loadRTCalendarEventsHandler()
        break
      case 10:
        loadRTNewsItemsHandler()
        break

      default:
      // code block
    }
  }

  return (
    <div>
      <TableTitleContainer>
        <Title>{rawDataTableTitle}</Title>
      </TableTitleContainer>

      <TableContainer>
        <TableStyle>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Import Raw Data Types</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.datatype}</TableCell>
                <TableCell>
                  if(true)
                  {
                    <ToggleButton
                      sx={{
                        ml: 6,
                        textTransform: "capitalize",
                        backgroundColor: row.buttonbackgroundcolor,
                      }}
                      variant="contained"
                      onClick={() => handleClick(row.id)}
                    >
                      {row.buttontext}
                    </ToggleButton>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableStyle>
      </TableContainer>
    </div>
  )
}

export default memo(RawDataTable)
