import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
import PropTypes from "prop-types"
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  // OverlayView,
} from "@react-google-maps/api"
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Link,
  CardActions,
} from "@mui/material"
import styled from "styled-components"

import Title from "./Title"

const GolfCoursesMapTitle = "Golf Course Locations"

const GolfCoursesMapContainer = styled.div`
  font-size: 20px;
  font-weight: 600;
  padding-left: 20px;
  padding-top: 30px;
`

const GolfCoursesMap = (props) => {
  const { golfCourses } = props

  GolfCoursesMap.propTypes = {
    golfCourses: PropTypes.array,
  }

  const [map, setMap] = useState(null)
  const [selected, setSelected] = useState(null)

  const mapContainerStyle = {
    height: "750px",
    width: "750px",
    border: "1px solid #ccc",
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 20,
  }

  const mapZoom = parseInt(process.env.REACT_APP_MAP_DEFAULT_ZOOM, 10)

  const mapCenter = useMemo(
    () => ({
      lat: parseFloat(process.env.REACT_APP_HOME_LATITUDE),
      lng: parseFloat(process.env.REACT_APP_HOME_LONGITUDE),
    }),
    []
  )

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
  })

  // Store a reference to the google map instance in state
  const onLoadHandler = useCallback((Mymap) => setMap(Mymap), [])

  // Clear the reference to the google map instance
  const onUnmountHandler = useCallback(() => setMap(null), [])

  useEffect(() => {
    if (map) {
      if (golfCourses.length > 0) {
        const bounds = new window.google.maps.LatLngBounds(mapCenter)

        golfCourses.map((golfCourse) =>
          bounds.extend({
            lat: golfCourse.lat,
            lng: golfCourse.lng,
          })
        )
        map.fitBounds(bounds)
      }
    }
  }, [map, golfCourses, mapCenter])

  const iconPin = {
    path: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z",
    fillColor: "#78a32e",
    fillOpacity: 0.7,
    scale: 0.03, // to reduce the size of icons
    strokeColor: "#2f4024",
    strokeWeight: 1,
  }

  // const onClick = () => {
  //   console.info("I have been clicked!")
  // }

  // const divStyle = {
  //   background: "white",
  //   border: "1px solid #ccc",
  //   padding: 15,
  // }

  return isLoaded ? (
    <GolfCoursesMapContainer>
      <Title>{GolfCoursesMapTitle}</Title>
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
        {golfCourses
          ? golfCourses.map((golfcourse) => (
              <Marker
                key={golfcourse.name}
                position={{
                  lat: golfcourse.lat,
                  lng: golfcourse.lng,
                }}
                icon={iconPin}
                onClick={() => {
                  setSelected(golfcourse)
                }}
              />
            ))
          : null}

        {/* <OverlayView
          position={mapCenter}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div style={divStyle}>
            <h1>OverlayView</h1>

            <button onClick={onClick} type="button">
              Click me
            </button>
          </div>
        </OverlayView> */}
        {selected ? (
          <InfoWindow
            position={{
              lat: selected.lat,
              lng: selected.lng,
            }}
            onCloseClick={() => {
              setSelected(null)
            }}
          >
            <Card>
              <CardMedia
                style={{
                  height: 0,
                  paddingTop: "40%",
                  marginTop: "30",
                }}
                image={selected.photourl}
                title={selected.phototitle}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {selected.name}
                </Typography>
                <Typography component="p">{selected.description}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  // to="/golfcoursespage"
                >
                  View
                </Button>
              </CardActions>
            </Card>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </GolfCoursesMapContainer>
  ) : null
}

export default memo(GolfCoursesMap)
