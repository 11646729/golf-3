import React, { useState, memo } from "react"
import PropTypes from "prop-types"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
// import TableCell from "@mui/material/TableCell"
import TableCell, { tableCellClasses } from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Title from "./Title"
import "../styles/cruisestable.scss"

const CruisesTableTitle = "Cruise Ships Arriving Soon"

const columns = [
  { id: "date", label: "Date", minWidth: 10, align: "center" },
  {
    id: "arrival",
    label: "Arrival",
    minWidth: 10,
    align: "center",
  },
  { id: "ship", label: "Ship", minWidth: 10, align: "center" },
  {
    id: "departure",
    label: "Departure",
    minWidth: 10,
    align: "center",
  },
  {
    id: "itinerary",
    label: "Itinerary",
    minWidth: 10,
    align: "center",
  },
]

const CruisesTable = (props) => {
  const { portArrivals } = props

  CruisesTable.propTypes = {
    portArrivals: PropTypes.array,
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

  const handleClick = (event) => {
    // console.info("I have been clicked! " + event)
    alert("I have been clicked! " + event)
  }

  return (
    <div>
      <div className="cruisestabletitlecontainer">
        <Title>{CruisesTableTitle}</Title>
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
              // "&:last-child td, &:last-child th": { border: 0 },
              // [`& .${tableCellClasses.root}`]: {
              //   borderLeft: "1px solid #d9d9d6",
              //   borderRight: "1px solid #d9d9d6",
              //   borderTop: "1px solid #d9d9d6",
              //   borderBottom: "1px solid #d9d9d6",
              // },
            }}
          >
            <TableHead>
              <TableRow>
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
              {portArrivals
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((portArrival) => (
                  <TableRow
                    className="cruisestablerow"
                    key={portArrival.portarrivalid}
                  >
                    <TableCell className="cruisestabledatacell">
                      <div className="cruisescellcenter">
                        {portArrival.weekday}
                      </div>
                      <div className="cruisescellcenter">
                        {portArrival.arrivalDate}
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      {portArrival.vesseletatime}
                    </TableCell>
                    <TableCell className="cruisestabledatacellcenter">
                      <div className="cruisesship">
                        <img
                          className="cruisesshiplogo"
                          src={portArrival.cruiselinelogo}
                          alt="Cruise Line Logo"
                        />
                        <div className="cruisesshipname">
                          {portArrival.vesselshortcruisename}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      {portArrival.vesseletdtime}
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      <button
                        className="cruisesbutton"
                        onClick={() => handleClick(portArrival.portarrivalid)}
                      >
                        Show
                      </button>
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

export default memo(CruisesTable)
