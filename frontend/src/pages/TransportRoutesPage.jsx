import { useState, useEffect, memo } from "react"
import socketIOClient from "socket.io-client"
import TransportRoutesMap from "../components/TransportRoutesMap"
import TransportRoutesImportButton from "../components/TransportRoutesImportButton"
import { Autocomplete, TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  loadStaticGTFSDataHandler,
  getAllAgenciesFrontEnd,
  getRoutesForSingleAgencyFrontEnd,
  getShapesForSingleRouteFrontEnd,
  getStopsForSingleRouteFrontEnd,
} from "../functionHandlers/loadStaticGTFSDataHandler"
import "../styles/transportroutes.scss"

const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
    // Default transform is "translate(14px, 20px) scale(1)""
    // This lines up the label with the initial cursor position in the input
    // after changing its padding-left.
    transform: "translate(34px, 20px) scale(1);",
  },
  "&.Mui-focused .MuiInputLabel-outlined": {
    color: "purple",
  },
  "& .MuiAutocomplete-inputRoot": {
    color: "purple",
    // This matches the specificity of the default styles at https://github.com/mui-org/material-ui/blob/v4.11.3/packages/material-ui-lab/src/Autocomplete/Autocomplete.js#L90
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input:first-of-type': {
      // Default left padding is 6px
      paddingLeft: 26,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "green",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "red",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "purple",
    },
  },
})

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const TransportRoutesPage = () => {
  const [transportAgencyArray, setTransportAgencyArray] = useState([])
  const [transportAgencyId, setTransportAgencyId] = useState("")
  const [transportAgencyName, setTransportAgencyName] = useState("")
  const [transportRoutesArray, setTransportRoutesArray] = useState([])
  const [transportShapesArray, setTransportShapesArray] = useState([])
  const [transportStopsArray, setTransportStopsArray] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [vehiclePositions, setVehiclePositions] = useState([])
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [fetchStatus, setFetchStatus] = useState("idle")
  const [lastImportDate, setLastImportDate] = useState(null)

  // build agenciesData Url
  const transportAgenciesDataUrl =
    "http://localhost:4000/api/gtfs/transportagencies"
  const routesDataBaseUrl =
    "http://localhost:4000/api/gtfs/routesforsingleagency?transportAgencyId="
  const shapesDataBaseUrl =
    "http://localhost:4000/api/gtfs/shapesforsingleroute?routeId="
  const stopsDataBaseUrl =
    "http://localhost:4000/api/gtfs/stopsforsingleroute?routeId="

  // Socket.io — vehicle positions
  useEffect(() => {
    const socket = socketIOClient(
      import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL ||
        "http://localhost:4000",
      { autoConnect: false },
    )
    socket.connect()

    socket.on("FromGtfsVehiclePositions", (positions) => {
      console.log("GTFS vehicle positions:", positions)
      if (selectedRouteId) {
        setVehiclePositions(
          positions.filter((v) => v.route_id === selectedRouteId),
        )
      } else if (transportRoutesArray.length > 0) {
        const agencyRouteIds = new Set(
          transportRoutesArray.map((r) => r.routeid),
        )
        setVehiclePositions(
          positions.filter((v) => agencyRouteIds.has(v.route_id)),
        )
      } else {
        setVehiclePositions([])
      }
    })

    return () => socket.disconnect()
  }, [selectedRouteId, transportRoutesArray])

  useEffect(() => {
    getAllAgenciesFrontEnd(transportAgenciesDataUrl)
      .then((data) => {
        setTransportAgencyArray(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const handleFetchData = async () => {
    setFetchStatus("loading")
    try {
      await loadStaticGTFSDataHandler()
      setLastImportDate(new Date())
      setFetchStatus("complete")
    } catch (err) {
      console.error(err)
      setFetchStatus("error")
    }
  }

  return (
    <div>
      <TransportRoutesImportButton
        fetchStatus={fetchStatus}
        lastImportDate={lastImportDate}
        onFetch={handleFetchData}
      />
    <div className="transportroutescontainer">
      <div className="transportroutestablescontainer">
        <div className="transportroutesselectioncontainer">
            <StyledAutocomplete
              id="agency-box"
              disablePortal
              onChange={(_, newValue) => {
                setTransportAgencyId(newValue.agencyid)
                setTransportAgencyName(newValue.label)
                getRoutesForSingleAgencyFrontEnd(
                  routesDataBaseUrl + newValue.agencyid,
                  transportAgencyId,
                ).then((returnedData) => {
                  setTransportRoutesArray(returnedData)
                })
              }}
              options={transportAgencyArray}
              renderOption={(props, option) => {
                return (
                  <li
                    {...props}
                    key={option.agencyid}
                    style={
                      !option.label.includes("Go-Ahead") &&
                      !option.label.includes("Dublin Bus") &&
                      !option.label.includes("Bus Éireann")
                        ? { color: "lightgray" }
                        : undefined
                    }
                  >
                    {option.label}
                  </li>
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{
                    input: { color: "white" },
                    width: "100%",
                    marginBottom: 4,
                  }}
                  label="Agency"
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    style: {
                      color: "white",
                    },
                  }}
                  // key={key}
                />
              )}
            />

            <StyledAutocomplete
              id="routes-box"
              disabled={!transportAgencyId}
              onChange={(_, newValue) => {
                setSelectedRouteId(newValue.routeid)
                getShapesForSingleRouteFrontEnd(
                  shapesDataBaseUrl + newValue.routeid,
                  newValue.routeid,
                  transportRoutesArray,
                )
                  .then((returnedData) => {
                    setTransportShapesArray(returnedData)
                  })
                  .then(console.log("Route Id: " + newValue.routeid))
                const stopsDataUrl = stopsDataBaseUrl + newValue.routeid
                getStopsForSingleRouteFrontEnd(
                  stopsDataUrl,
                  newValue.routeid,
                  transportRoutesArray,
                ).then((returnedData) => {
                  setTransportStopsArray(returnedData)
                })
              }}
              options={transportRoutesArray}
              // renderOption={(props, option) => {
              //   return (
              //     <li {...props} key={option.routeid}>
              //       {option.label}
              //     </li>
              //   )
              // }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ input: { color: "white" }, width: "100%" }}
                  label="Route"
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    style: {
                      color: "white",
                    },
                  }}
                  // key={key}
                />
              )}
            />
        </div>
      </div>
      <div className="transportroutesmapcontainer">
        <TransportRoutesMap
          isLoading={isLoading}
          transportAgencyName={transportAgencyName}
          transportShapesArray={transportShapesArray}
          transportStopsArray={transportStopsArray}
          vehiclePositions={vehiclePositions}
        />
      </div>
    </div>
    </div>
  )
}

export default memo(TransportRoutesPage)
