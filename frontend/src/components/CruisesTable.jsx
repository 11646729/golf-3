import { useState, memo, useEffect } from "react"
import PropTypes from "prop-types"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
// import Link from "@mui/material/Link"   // unused — ship name is plain text until vesselurl available
// import Box from "@mui/material/Box"     // unused — modal removed
// import Button from "@mui/material/Button" // unused — modal removed
// import Modal from "@mui/material/Modal"   // unused — modal removed
import Title from "./Title"
import "../styles/cruisestable.scss"

// const style = { ... } // modal style — removed with modal

const CruisesTableTitle = "Cruise Ships Arriving in the next 3 Months"

const columns = [
  { id: "date", label: "Arrival Date", minWidth: 10, align: "center" },
  {
    id: "arrival",
    label: "Arrival Time",
    minWidth: 10,
    align: "center",
  },
  { id: "ship", label: "Ship", minWidth: 10, align: "center" },
  {
    id: "departure",
    label: "Departure Time",
    minWidth: 10,
    align: "center",
  },
  // { id: "itinerary", label: "Itinerary", minWidth: 10, align: "center" },
  // TODO: restore Itinerary column once vesselurl is stored in belfastharbour_cruise_schedule
]

const CruisesTable = (props) => {
  const { portArrivals } = props

  CruisesTable.propTypes = {
    portArrivals: PropTypes.array,
  }

  const [modifiedPortArrivals, setModifiedPortArrivals] = useState([])

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const WEEKDAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ]

  useEffect(() => {
    portArrivals.forEach((element) => {
      const etaDate = new Date(element.vesseleta)
      if (etaDate.getUTCHours() === 11 && etaDate.getUTCMinutes() === 59) {
        element.etadisplaytime = "Not Known"
        etaDate.setUTCHours(0, 0, 0, 0)
        element.vesseleta = etaDate.toISOString()
      } else {
        element.etadisplaytime =
          String(etaDate.getUTCHours()).padStart(2, "0") +
          ":" +
          String(etaDate.getUTCMinutes()).padStart(2, "0")
      }

      element.arrivaldatedisplay = `${MONTHS[etaDate.getUTCMonth()]} ${etaDate.getUTCDate()} ${etaDate.getUTCFullYear()}`
      element.weekdaydisplay = WEEKDAYS[etaDate.getUTCDay()]

      const etdDate = new Date(element.vesseletd)
      if (etdDate.getUTCHours() === 11 && etdDate.getUTCMinutes() === 59) {
        element.etddisplaytime = "Not Known"
        etdDate.setUTCHours(0, 0, 0, 0)
        element.vesseletd = etdDate.toISOString()
      } else {
        element.etddisplaytime =
          String(etdDate.getUTCHours()).padStart(2, "0") +
          ":" +
          String(etdDate.getUTCMinutes()).padStart(2, "0")
      }
    })

    setModifiedPortArrivals(portArrivals)
  }, [portArrivals])

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  // const [open, setOpen] = useState(false)
  // const [selectedImage, setSelectedImage] = useState(null)
  // TODO: restore modal/handleOpen when vesselurl is available in belfastharbour_cruise_schedule

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  return (
    <div>
      <div className="cruisestabletitlecontainer">
        <Title>{CruisesTableTitle}</Title>
      </div>

      <Paper sx={{ height: 600, display: "flex", flexDirection: "column" }}>
        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
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
              <TableRow sx={{ height: "60px" }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {modifiedPortArrivals
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((modifiedPortArrivals) => (
                  <TableRow
                    className="cruisestablerow"
                    key={modifiedPortArrivals.portarrivalid}
                  >
                    <TableCell className="cruisestabledatacell">
                      <div className="cruisescellcenter">
                        {modifiedPortArrivals.weekdaydisplay}
                      </div>
                      <div className="cruisescellcenter">
                        {modifiedPortArrivals.arrivaldatedisplay}
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      {modifiedPortArrivals.etadisplaytime}
                    </TableCell>
                    <TableCell className="cruisestabledatacellcenter">
                      <div className="cruisesship">
                        {(modifiedPortArrivals.locallogopath || modifiedPortArrivals.cruiselinelogo) && (
                          <img
                            className="cruisesshiplogo"
                            src={modifiedPortArrivals.locallogopath ?? modifiedPortArrivals.cruiselinelogo}
                            onError={(e) => { e.target.style.display = "none" }}
                            alt="Cruise Line Logo"
                          />
                        )}
                        <div className="cruisesshipname">
                          {/* vesselurl not in belfastharbour_cruise_schedule — plain text until available */}
                          {modifiedPortArrivals.vesselname}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      {modifiedPortArrivals.etddisplaytime}
                    </TableCell>
                    {/* Itinerary column removed — vesselurl not in Belfast schedule data */}
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Modal commented out — depends on vesselurl which is not in Belfast schedule
          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              {selectedImage && (
                <img src={selectedImage} alt="Selected" style={{ width: "100%" }} />
              )}
              <Button onClick={handleClose} style={{ marginTop: "10px" }}>Close</Button>
            </Box>
          </Modal> */}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={portArrivals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  )
}

export default memo(CruisesTable)
