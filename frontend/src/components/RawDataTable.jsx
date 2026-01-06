import React, { memo, useState } from "react"
import PropTypes from "prop-types"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Title from "./Title"

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
import "../styles/rawdatatable.scss"

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
    buttontext: "Initialise Static GTFS Data",
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

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  // const [toggle, setToggle] = useState(false)
  // const [buttonBackgroundColor, setButtonBackgroundColor] = useState("darkred")

  const handleClick = (id) => {
    // Define the logic for handling the button click based on the row ID

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
      <div className="tabletitlecontainer">
        <Title>{rawDataTableTitle}</Title>
      </div>

      <Paper
        sx={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px" }}
      >
        <TableContainer>
          <Table
            stickyHeader
            aria-label="sticky table"
            size="small"
            sx={{
              borderCollapse: "separate",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Import Raw Data Types</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.datatype}</TableCell>
                  <TableCell>
                    <Button
                      sx={{
                        // ml: 6,
                        textTransform: "capitalize",
                        backgroundColor: row.buttonbackgroundcolor,
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
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={tableData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  )
}

export default memo(RawDataTable)
