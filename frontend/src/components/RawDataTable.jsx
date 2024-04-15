import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import Title from "./Title"
import { Button } from "@mui/material"

import { loadTemperaturesDataHandler } from "../functionHandlers/loadTemperaturesDataHandler"
import { loadGolfCoursesDataHandler } from "../functionHandlers/loadGolfCoursesDataHandler"
import { loadCruiseShipArrivalsDataHandler } from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import { loadStaticGTFSDataHandler } from "../functionHandlers/loadStaticGTFSDataHandler"
import { loadRealtimeGTFSDataHandler } from "../functionHandlers/loadStaticGTFSDataHandler"
import { loadCrimesDataHandler } from "../functionHandlers/loadCrimesDataHandler"
import { startRealtimeDataHandler } from "../functionHandlers/startRealtimeDataHandler"
import { loadRTCalendarEventsHandler } from "../functionHandlers/loadRTCalendarDataHandler"
import { loadRTNewsItemsHandler } from "../functionHandlers/loadRTNewsDataHandler"

const TableTitleContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const TableContainer = styled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
`

const TableStyle = styled.table`
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

const TableHeader = styled.thead`
  /* text-align: left; */
  font-size: 14px;
`

//  table tbody tr:hover { background-color: red; }

const TableRow = styled.tr`
  &:hover {
    background-color: #ebeccd;
    color: black;
  }
`

const TableHead = styled.th`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
`

const TableBody = styled.tbody``

// const TableCellLeft = styled.td`
//   height: 34px;
//   margin: 0;
//   padding: 0.5rem;
//   border-bottom: 1px solid lightgray;
//   border-right: 1px solid lightgray;
//   text-align: left;
// `

const TableCell = styled.td`
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
  },
  {
    id: 2,
    datatype: "Golf Course Data",
    buttontext: "Fetch Golf Courses",
  },
  {
    id: 3,
    datatype: "Cruise Ship Arrivals Data",
    buttontext: "Fetch Cruise Ships",
  },
  {
    id: 4,
    datatype: "Static GTFS Transport Data",
    buttontext: "Fetch Static GTFS Data",
  },
  {
    id: 5,
    datatype: "Realtime GTFS Transport Data",
    buttontext: "Fetch Realtime Bus Data",
  },
  {
    id: 6,
    datatype: "Crime Data",
    buttontext: "Fetch Crime Data",
  },
  {
    id: 7,
    datatype: "Realtime Data",
    buttontext: "Start Realtime Data",
  },
  {
    id: 8,
    datatype: "Realtime Calendar Data",
    buttontext: "Fetch Realtime Calendar Data",
  },
  {
    id: 9,
    datatype: "Realtime News Data",
    buttontext: "Fetch Realtime News Data",
  },
]

function handleClick(id) {
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
      loadCrimesDataHandler()
      break
    case 7:
      startRealtimeDataHandler()
      break
    case 8:
      loadRTCalendarEventsHandler()
      break
    case 9:
      loadRTNewsItemsHandler()
      break

    default:
    // code block
  }
}

const RawDataTable = (props) => {
  const { rawDataTableTitle } = props

  RawDataTable.propTypes = {
    rawDataTableTitle: PropTypes.string,
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
                  <Button
                    sx={{
                      ml: 6,
                      textTransform: "capitalize",
                    }}
                    variant="contained"
                    onClick={() => handleClick(row.id)}
                  >
                    {row.buttontext}
                  </Button>
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
