import React, { useState, memo, useEffect } from "react"
import PropTypes from "prop-types"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Link from "@mui/material/Link"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Modal from "@mui/material/Modal"
import Title from "./Title"
import "../styles/cruisestable.scss"

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
}

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

  const [modifiedPortArrivals, setModifiedPortArrivals] = useState([])

  useEffect(() => {
    portArrivals.forEach((element) => {
      if (element.vesseletatime == "23:59") {
        element.vesseletatime = "Not Known"

        var date = new Date(element.vesseleta)
        date.setHours(date.getHours() - 23)
        date.setMinutes(date.getMinutes() - 59)
        element.vesseleta = date.toISOString()
      }

      if (element.vesseletdtime == "23:59") {
        element.vesseletdtime = "Not Known"

        var date = new Date(element.vesseletd)
        date.setHours(date.getHours() - 23)
        date.setMinutes(date.getMinutes() - 59)
        element.vesseletd = date.toISOString()
      }
    })

    setModifiedPortArrivals(portArrivals)
  }, [portArrivals])

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleOpen = (imageUrl) => {
    // setSelectedImage(imageUrl)
    setSelectedImage(
      "https://www.cruisemapper.com/images/ships/693-large-53e3a7161e428b65688f14b84d61c610.jpg"
    )
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedImage(null)
  }

  return (
    <div>
      <div className="cruisestabletitlecontainer">
        <Title>{CruisesTableTitle}</Title>
      </div>

      <Paper
      // sx={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px" }}
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
                        {modifiedPortArrivals.weekday}
                      </div>
                      <div className="cruisescellcenter">
                        {modifiedPortArrivals.arrivalDate}
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      {modifiedPortArrivals.vesseletatime}
                    </TableCell>
                    <TableCell className="cruisestabledatacellcenter">
                      <div className="cruisesship">
                        <img
                          className="cruisesshiplogo"
                          src={modifiedPortArrivals.cruiselinelogo}
                          alt="Cruise Line Logo"
                        />
                        <div className="cruisesshipname">
                          <Link
                            component="button"
                            onClick={() => {
                              setOpen(true)
                              handleOpen(modifiedPortArrivals.portarrivalid)
                            }}
                          >
                            {modifiedPortArrivals.vesselshortcruisename}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      {modifiedPortArrivals.vesseletdtime}
                    </TableCell>
                    <TableCell
                      align="center"
                      className="cruisestabledatacellcenter"
                    >
                      <button
                        className="cruisesbutton"
                        onClick={() =>
                          handleOpen(modifiedPortArrivals.portarrivalid)
                        }
                      >
                        Show
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected"
                  style={{ width: "100%" }}
                />
              )}
              <Button onClick={handleClose} style={{ marginTop: "10px" }}>
                Close
              </Button>
            </Box>
          </Modal>
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

//  Display Card
// <Card>
//   <CardMedia
//     style={{
//       height: 0,
//       paddingTop: "40%",
//       marginTop: "30",
//     }}
//     // image={selected.photourl}
//     // title={selected.phototitle}
//   />
//   <CardContent>
//     <Typography gutterBottom variant="h5" component="h2">
//       "Name"
//       {selected.name}
//     </Typography>
//     <Typography component="p">
//       "Description"
//       {selected.description}
//     </Typography>
//   </CardContent>
//   <CardActions>
//     <Button
//       size="small"
//       color="primary"
//       component={Link}
//       // to="/golfcoursespage"
//     >
//       View
//     </Button>
//   </CardActions>
// </Card>
