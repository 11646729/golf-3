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
  { id: "ship", label: "Ship", minWidth: 10, align: "center" },
  {
    id: "arrival",
    label: "Arrival",
    minWidth: 10,
    align: "center",
  },
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
    console.info("I have been clicked! " + event)
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
            // sx={{
            //   [`& .${tableCellClasses.root}`]: {
            //     borderLeft: "1px solid #d9d9d6",
            //     // borderBottom: "none",
            //   },
            // }}
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
            <TableBody
              sx={{
                // fontSize: 20,
                // borderBottom: "1px solid #d9d9d6",
                // borderTop: "1px solid #d9d9d6",
                borderLeft: "1px solid #d9d9d6",
                // borderRight: "1px solid #d9d9d6",
              }}
            >
              {portArrivals
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((portArrival) => (
                  <tr
                    className="cruisestablerow"
                    key={portArrival.portarrivalid}
                  >
                    <td className="cruisestabledatacell">
                      <div className="cruisescellcenter">
                        {portArrival.arrivalDate}
                      </div>
                      <div className="cruisescellcenter">
                        {portArrival.weekday}
                      </div>
                    </td>
                    <td className="cruisestabledatacellcenter">
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
                    </td>
                    <td className="cruisestabledatacell">
                      <div className="cruisescellcenter">
                        {portArrival.vesseletatime}
                      </div>
                    </td>
                    <td className="cruisestabledatacell">
                      <div className="cruisescellcenter">
                        {portArrival.vesseletdtime}
                      </div>
                    </td>
                    <td className="cruisestabledatacell">
                      <button
                        className="cruisesbutton"
                        onClick={() => handleClick(portArrival.portarrivalid)}
                      >
                        Show
                      </button>
                    </td>
                  </tr>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
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
