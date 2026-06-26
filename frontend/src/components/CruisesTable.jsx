import { useState, useMemo } from "react"
import PropTypes from "prop-types"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Title from "./Title"
import "../styles/cruisestable.scss"

const CruisesTableTitle = "Cruise Ships Arriving in the next 3 Months"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
]

const columns = [
  { id: "live",      label: "Live",           minWidth: 10, align: "center" },
  { id: "date",      label: "Arrival Date",   minWidth: 10, align: "center" },
  { id: "arrival",   label: "Arrival Time",   minWidth: 10, align: "center" },
  { id: "ship",      label: "Ship",           minWidth: 10, align: "center" },
  { id: "departure", label: "Departure Time", minWidth: 10, align: "center" },
]

const Led = ({ active }) => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      backgroundColor: active ? "#4caf50" : "#f44336",
      boxShadow: active ? "0 0 6px 2px #4caf50" : "0 0 4px 1px #f44336",
      display: "inline-block",
    }}
  />
)

const formatTime = (date) =>
  String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0")

const processArrival = (element) => {
  const etaDate = new Date(element.vesseleta)
  const isUnknownEta = etaDate.getUTCHours() === 11 && etaDate.getUTCMinutes() === 59
  if (isUnknownEta) etaDate.setUTCHours(0, 0, 0, 0)

  const etdDate = new Date(element.vesseletd)
  const isUnknownEtd = etdDate.getUTCHours() === 11 && etdDate.getUTCMinutes() === 59

  return {
    ...element,
    vesseleta:          isUnknownEta ? etaDate.toISOString() : element.vesseleta,
    etadisplaytime:     isUnknownEta ? "Not Known" : formatTime(etaDate),
    etddisplaytime:     isUnknownEtd ? "Not Known" : formatTime(etdDate),
    arrivaldatedisplay: `${MONTHS[etaDate.getUTCMonth()]} ${etaDate.getUTCDate()} ${etaDate.getUTCFullYear()}`,
    weekdaydisplay:     WEEKDAYS[etaDate.getUTCDay()],
  }
}

const CruisesTable = ({ portArrivals = [], vesselPositions = [] }) => {
  CruisesTable.propTypes = {
    portArrivals:   PropTypes.array,
    vesselPositions: PropTypes.array,
  }

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const modifiedPortArrivals = useMemo(
    () => portArrivals.map(processArrival),
    [portArrivals],
  )

  const trackedMmsis = useMemo(
    () => new Set(vesselPositions.map((p) => Number(p.mmsi))),
    [vesselPositions],
  )

  const handleChangePage = (_event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(+event.target.value); setPage(0) }

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
            sx={{ borderCollapse: "separate", paddingLeft: "10px", paddingRight: "10px" }}
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
                .map((row) => (
                  <TableRow className="cruisestablerow" key={row.portarrivalid}>
                    <TableCell align="center" className="cruisestabledatacellcenter">
                      <Led active={trackedMmsis.has(Number(row.mmsi))} />
                    </TableCell>
                    <TableCell className="cruisestabledatacell">
                      <div className="cruisescellcenter">{row.weekdaydisplay}</div>
                      <div className="cruisescellcenter">{row.arrivaldatedisplay}</div>
                    </TableCell>
                    <TableCell align="center" className="cruisestabledatacellcenter">
                      {row.etadisplaytime}
                    </TableCell>
                    <TableCell className="cruisestabledatacellcenter">
                      <div className="cruisesship">
                        {(row.locallogopath || row.cruiselinelogo) && (
                          <img
                            className="cruisesshiplogo"
                            src={row.locallogopath ?? row.cruiselinelogo}
                            onError={(e) => { e.target.style.display = "none" }}
                            alt="Cruise Line Logo"
                          />
                        )}
                        <div className="cruisesshipname">{row.vesselname}</div>
                      </div>
                    </TableCell>
                    <TableCell align="center" className="cruisestabledatacellcenter">
                      {row.etddisplaytime}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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

export default CruisesTable
