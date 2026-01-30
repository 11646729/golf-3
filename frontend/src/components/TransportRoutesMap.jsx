import { useState, useEffect, useCallback, memo } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  Marker,
  // Polyline,
  // InfoWindow,
} from "@vis.gl/react-google-maps"
import "../styles/transportroutes.scss"

import Title from "./Title"

// -------------------------------------------------------
// React View component
// -------------------------------------------------------
const TransportRoutesMap = (props) => {
  const {
    transportAgencyName,
    // transportRoutesArray,
    transportShapesArray,
    transportStopsArray,
  } = props

  TransportRoutesMap.propTypes = {
    transportAgencyName: PropTypes.string,
    // transportRoutesArray: PropTypes.array,
    transportShapesArray: PropTypes.array,
    transportStopsArray: PropTypes.array,
  }

  const [map, setMap] = useState(null)
  const [mapZoom] = useState(
    parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10),
  )
  const [mapCenter] = useState({
    lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
    lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
  })

  const mapContainerStyle = {
    height: "750px",
    width: "750px",
    border: "1px solid #ccc",
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 20,
  }

  // Store a reference to the google map instance in state
  const onLoadHandler = useCallback((Mymap) => {
    setMap(Mymap)
  }, [])

  // Clear the reference to the google map instance
  const onUnmountHandler = useCallback(() => {
    setMap(null)
  }, [])

  // Helper to parse and validate coordinates
  const parseCoordinate = (value) => {
    const num = parseFloat(value)
    return Number.isFinite(num) ? num : null
  }

  // Now compute bounds of map to display
  useEffect(() => {
    if (map) {
      if (transportStopsArray.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()

        transportStopsArray.forEach((transportStop) => {
          const lat = parseCoordinate(transportStop.stop_lat)
          const lng = parseCoordinate(transportStop.stop_lon)
          if (lat !== null && lng !== null) {
            bounds.extend({ lat, lng })
          }
        })
        map.fitBounds(bounds)
      }
    }
  }, [map, transportStopsArray])

  // const handleTransportStopClick = (event) => {
  //   console.log(event)
  //   // console.log(transportStopSelected)
  //   // setTransportStopSelected(transportStop)
  // }

  // const handleTransportShapeClick = (event) => {
  //   console.log(event)
  // }

  // const handleTransportRouteClick = (event) => {
  //   console.log(event)
  //   // console.log(transportRouteSelected)
  //   // setTransportRouteSelected(transportRoute)
  // }

  const transportStopIcon = {
    path: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z",
    fillColor: "#6dbef1",
    fillOpacity: 0.7,
    scale: 0.015, // to reduce the size of icons
    strokeColor: "#1342B4",
    strokeWeight: 1,
  }

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div>
        <div>
          <Title>{transportAgencyName}</Title>
        </div>
        <div className="transportroutesmapcontainer">
          <Map
            style={mapContainerStyle}
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            mapId="transport-routes-map"
            disableDefaultUI={true}
            zoomControl={true}
            onLoad={onLoadHandler}
            onUnmount={onUnmountHandler}
          >
            {/* Note: Polyline not yet available in vis.gl/react-google-maps */}
            {/* {transportShapesArray
              ? transportShapesArray.map((transportShape) => (
                  <Polyline
                    key={transportShape.shapeKey}
                    path={transportShape.shapeCoordinates}
                    options={{
                      strokeColor: transportShape.defaultColor,
                      strokeOpacity: "1.0",
                      strokeWeight: 2,
                    }}
                    // onClick={() => {
                    //   handleTransportShapeClick()
                    // }}
                  />
                ))
              : null} */}
            {transportStopsArray
              ? transportStopsArray
                  .filter((transportStop) => {
                    const lat = parseCoordinate(transportStop.stop_lat)
                    const lng = parseCoordinate(transportStop.stop_lon)
                    return lat !== null && lng !== null
                  })
                  .map((transportStop) => (
                    <Marker
                      key={transportStop.stop_id}
                      position={{
                        lat: parseCoordinate(transportStop.stop_lat),
                        lng: parseCoordinate(transportStop.stop_lon),
                      }}
                      icon={transportStopIcon}
                      // onClick={() => {
                      //   handleBusStopClick()
                      // }}
                    />
                  ))
              : null}
            {/* {transportStopSelected ? (
              <InfoWindow
                position={{
                  lat: transportStopSelected.stop_lat,
                  lng: transportStopSelected.stop_lon,
                }}
                onCloseClick={() => {
                  setTransportStopSelected(null)
                }}
              >
                <div style={classes.divStyle}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {transportStopSelected.stop_name}
                  </Typography>
                </div>
              </InfoWindow>
            ) : null} */}
          </Map>
        </div>
      </div>
    </APIProvider>
  )
}

export default memo(TransportRoutesMap)
