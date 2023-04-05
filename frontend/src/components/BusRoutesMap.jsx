import React, { useState, useEffect, useCallback, memo } from "react"
import PropTypes from "prop-types"
import {
  GoogleMap,
  useJsApiLoader,
  // Marker,
  Polyline,
  // InfoWindow,
} from "@react-google-maps/api"
import styled from "styled-components"

import Title from "./Title"

const BusMapContainer = styled.div`
  font-size: 20px;
  font-weight: 600;
  padding-left: 20px;
  padding-top: 30px;
`

// -------------------------------------------------------
// React View component
// -------------------------------------------------------
const BusRoutesMap = (props) => {
  const {
    busAgencyName,
    busShapesCollection,
    busStopsCollection,
    // busRoutesCollection,
  } = props

  BusRoutesMap.propTypes = {
    busAgencyName: PropTypes.string,
    busShapesCollection: PropTypes.array,
    busStopsCollection: PropTypes.array,
    // busRoutesCollection: PropTypes.array,
  }

  const [map, setMap] = useState(null)
  const [mapZoom] = useState(
    parseInt(process.env.REACT_APP_MAP_DEFAULT_ZOOM, 10)
  )
  const [mapCenter] = useState({
    lat: parseFloat(process.env.REACT_APP_HOME_LATITUDE),
    lng: parseFloat(process.env.REACT_APP_HOME_LONGITUDE),
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
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
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
      if (busStopsCollection.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()

        busStopsCollection.map((busStop) =>
          bounds.extend({
            lat: busStop.stop_lat,
            lng: busStop.stop_lon,
          })
        )
        map.fitBounds(bounds)
      }
    }
  }, [map, busStopsCollection])

  console.log(busStopsCollection)

  // const handleBusStopClick = (event) => {
  //   console.log(event)
  //   // console.log(busStopSelected)
  //   // setBusStopSelected(busStop)
  // }

  const handleBusShapeClick = (event) => {
    console.log(event)
  }

  // const handleBusRouteClick = (event) => {
  //   console.log(event)
  //   // console.log(busRouteSelected)
  //   // setBusRouteSelected(busRoute)
  // }

  return isLoaded ? (
    <div>
      <BusMapContainer>
        <Title>{busAgencyName}</Title>

        <div>
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
            {busShapesCollection
              ? busShapesCollection.map((busShape) => (
                  <Polyline
                    key={busShape.shapeKey}
                    path={busShape.shapeCoordinates}
                    options={{
                      strokeColor: busShape.defaultColor,
                      strokeOpacity: "1.0",
                      strokeWeight: 2,
                    }}
                    onClick={() => {
                      handleBusShapeClick()
                    }}
                  />
                ))
              : null}
            {/* {busStopsCollection
              ? busStopsCollection.map((busStop) => (
                  <Marker
                    key={busStop.stop_id}
                    position={{
                      lat: busStop.stop_lat,
                      lng: busStop.stop_lon,
                    }}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/blue.png",
                    }}
                    onClick={() => {
                      handleBusStopClick()
                    }}
                  />
                ))
              : null} */}
            {/* {busStopSelected ? (
              <InfoWindow
                position={{
                  lat: busStopSelected.stop_lat,
                  lng: busStopSelected.stop_lon,
                }}
                onCloseClick={() => {
                  setBusStopSelected(null)
                }}
              >
                <div style={classes.divStyle}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {busStopSelected.stop_name}
                  </Typography>
                </div>
              </InfoWindow>
            ) : null} */}
          </GoogleMap>
        </div>
      </BusMapContainer>
    </div>
  ) : null
}

export default memo(BusRoutesMap)
