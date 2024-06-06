import React, { memo, useState } from "react"
import PropTypes from "prop-types"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
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
      <div className="tabletitlecontainer">
        <Title>{rawDataTableTitle}</Title>
      </div>

      <Paper
        sx={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px" }}
      >
        <div className="tablecontainer">
          <table className="tablestyle">
            <thead className="tableheader">
              <tr className="tablerow">
                <th className="tablehead">ID</th>
                <th className="tablehead">Import Raw Data Types</th>
                <th className="tablehead">Actions</th>
              </tr>
            </thead>
            <tbody className="tablebody">
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td className="tablecell">{row.id}</td>
                  <td className="tablecell">{row.datatype}</td>
                  <td className="tablecell">
                    <Button
                      sx={{
                        ml: 6,
                        textTransform: "capitalize",
                        backgroundColor: row.buttonbackgroundcolor,
                      }}
                      variant="contained"
                      onClick={() => handleClick(row.id)}
                    >
                      {row.buttontext}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Paper>
    </div>
  )
}

export default memo(RawDataTable)
