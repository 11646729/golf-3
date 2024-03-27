import React, { useState, useEffect, useCallback, memo } from "react"
import PropTypes from "prop-types"
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  // InfoWindow,
} from "@react-google-maps/api"
import "../styles/transportroutes.scss"

import Title from "./Title"

// -------------------------------------------------------
// React View component
// -------------------------------------------------------
const TransportRoutesMap = (props) => {
  const {
    transportAgencyName,
    transportShapesCollection,
    // transportRoutesArray,
    transportStopsCollection,
  } = props

  TransportRoutesMap.propTypes = {
    transportAgencyName: PropTypes.string,
    transportShapesCollection: PropTypes.array,
    transportStopsCollection: PropTypes.array,
    // transportRoutesArray: PropTypes.array,
  }

  const [map, setMap] = useState(null)
  const [mapZoom] = useState(
    parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)
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

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_KEY,
  })

  // Store a reference to the google map instance in state
  const onLoadHandler = useCallback((Mymap) => {
    setMap(Mymap)
  }, [])

  // Clear the reference to the google map instance
  const onUnmountHandler = useCallback(() => {
    setMap(null)
  }, [])

  // Now compute bounds of map to display
  useEffect(() => {
    if (map) {
      if (transportStopsCollection.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()

        transportStopsCollection.map((transportStop) =>
          bounds.extend({
            lat: transportStop.stop_lat,
            lng: transportStop.stop_lon,
          })
        )
        map.fitBounds(bounds)
      }
    }
  }, [map, transportStopsCollection])

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

  const iconPin = {
    path: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z",
    fillColor: "#6dbef1",
    fillOpacity: 0.7,
    scale: 0.02, // to reduce the size of icons
    strokeColor: "#1342B4",
    strokeWeight: 1,
  }

  return isLoaded ? (
    <div>
      <div>
        <Title>{transportAgencyName}</Title>
      </div>
      <div className="transportroutesmapcontainer">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            // mapTypeId: "hybrid",
            disableDefaultUI: true,
            zoomControl: true,
          }}
          onLoad={onLoadHandler}
          onUnmount={onUnmountHandler}
        >
          {transportShapesCollection
            ? transportShapesCollection.map((transportShape) => (
                <Polyline
                  key={transportShape.shapeKey}
                  path={transportShape.shapeCoordinates}
                  options={{
                    strokeColor: transportShape.defaultColor,
                    strokeOpacity: "1.0",
                    strokeWeight: 2,
                  }}
                  onClick={() => {
                    // handleTransportShapeClick()
                  }}
                />
              ))
            : null}
          {transportStopsCollection
            ? transportStopsCollection.map((transportStop) => (
                <Marker
                  key={transportStop.stop_id}
                  position={{
                    lat: transportStop.stop_lat,
                    lng: transportStop.stop_lon,
                  }}
                  icon={
                    // {
                    iconPin
                    // url: "https://maps.google.com/mapfiles/ms/icons/blue.png",
                    // }
                  }
                  onClick={() => {
                    // handleBusStopClick()
                  }}
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
        </GoogleMap>
      </div>
    </div>
  ) : null
}

export default memo(TransportRoutesMap)
