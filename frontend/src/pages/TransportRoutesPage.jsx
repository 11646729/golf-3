import React, { useState, useEffect, memo } from "react"
import TransportRoutesMap from "../components/TransportRoutesMap"
import { Autocomplete, TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import {
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

  // build agenciesData Url
  const transportAgenciesDataUrl =
    "http://localhost:4000/api/gtfs/transportagencies"
  const routesDataBaseUrl =
    "http://localhost:4000/api/gtfs/routesforsingleagency?transportAgencyId="
  const shapesDataBaseUrl =
    "http://localhost:4000/api/gtfs/shapesforsingleroute?routeId="
  const stopsDataBaseUrl =
    "http://localhost:4000/api/gtfs/stopsforsingleroute?routeId="

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

  return (
    <div className="transportroutescontainer">
      <div className="transportroutestablescontainer">
        <div className="transportroutestables2container">
          <div className="transportagenciestablecontainer">
            <StyledAutocomplete
              id="agency-box"
              disablePortal
              onChange={(_, newValue) => {
                setTransportAgencyId(newValue.agencyid)
                setTransportAgencyName(newValue.label)
                getRoutesForSingleAgencyFrontEnd(
                  routesDataBaseUrl + newValue.agencyid,
                  transportAgencyId
                ).then((returnedData) => {
                  setTransportRoutesArray(returnedData)
                })
              }}
              options={transportAgencyArray}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.agencyid}>
                    {option.label}
                  </li>
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{
                    input: { color: "white" },
                    width: 580,
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
                getShapesForSingleRouteFrontEnd(
                  shapesDataBaseUrl + newValue.routeid,
                  newValue.routeid,
                  transportRoutesArray
                )
                  .then((returnedData) => {
                    setTransportShapesArray(returnedData)
                  })
                  .then(console.log(newValue.routeid))
                const stopsDataUrl = stopsDataBaseUrl + newValue.routeid
                getStopsForSingleRouteFrontEnd(
                  stopsDataUrl,
                  newValue.routeid,
                  transportRoutesArray
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
                  sx={{ input: { color: "white" }, width: 580 }}
                  label="Routes"
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
      </div>
      <div className="transportroutesmapcontainer">
        <TransportRoutesMap
          isLoading={isLoading}
          transportAgencyName={transportAgencyName}
          // transportRoutesArray={transportRoutesArray}
          transportShapesArray={transportShapesArray}
          transportStopsArray={transportStopsArray}
        />
      </div>
    </div>
  )
}

export default memo(TransportRoutesPage)
