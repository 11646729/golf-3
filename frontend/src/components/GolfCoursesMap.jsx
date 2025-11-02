import { useState, useEffect, useCallback, useMemo, memo } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  // OverlayView,
} from "@vis.gl/react-google-maps"
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Link,
  CardActions,
} from "@mui/material"
import Title from "./Title"
import "../styles/golfcoursesmap.scss"

const GolfCoursesMapTitle = "Golf Course Locations"

const GolfCoursesMap = (props) => {
  const { golfcourses } = props

  GolfCoursesMap.propTypes = {
    golfcourses: PropTypes.array,
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

  const defaultMapZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)

  const mapCenter = useMemo(() => {
    // If we have golf courses, center the map on them
    if (golfcourses && golfcourses.length > 0) {
      const totalLat = golfcourses.reduce((sum, course) => sum + course.lat, 0)
      const totalLng = golfcourses.reduce((sum, course) => sum + course.lng, 0)
      return {
        lat: totalLat / golfcourses.length,
        lng: totalLng / golfcourses.length,
      }
    }

    // Otherwise use default home location
    return {
      lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
      lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
    }
  }, [golfcourses])

  // Function to calculate zoom level to show all golf course pins
  const mapZoom = useMemo(() => {
    if (!golfcourses || golfcourses.length === 0) {
      return defaultMapZoom
    }

    if (golfcourses.length === 1) {
      return 12 // Good zoom for single golf course
    }

    // Calculate bounds of all golf courses
    let minLat = golfcourses[0].lat
    let maxLat = golfcourses[0].lat
    let minLng = golfcourses[0].lng
    let maxLng = golfcourses[0].lng

    golfcourses.forEach((course) => {
      minLat = Math.min(minLat, course.lat)
      maxLat = Math.max(maxLat, course.lat)
      minLng = Math.min(minLng, course.lng)
      maxLng = Math.max(maxLng, course.lng)
    })

    // Calculate the distance span
    const latSpan = maxLat - minLat
    const lngSpan = maxLng - minLng
    const maxSpan = Math.max(latSpan, lngSpan)

    // Calculate zoom level based on span
    // This is an approximation - adjust these values based on your needs
    let zoom = defaultMapZoom
    if (maxSpan >= 10) zoom = 6 // Very wide area
    else if (maxSpan >= 5) zoom = 7 // Wide area
    else if (maxSpan >= 2) zoom = 8 // Large area
    else if (maxSpan >= 1) zoom = 9 // Medium area
    else if (maxSpan >= 0.5) zoom = 10 // Small area
    else if (maxSpan >= 0.1) zoom = 11 // Very small area
    else zoom = 12 // Tight area

    return zoom
  }, [golfcourses, defaultMapZoom])

  // Store a reference to the google map instance in state
  const onLoadHandler = useCallback((Mymap) => setMap(Mymap), [])

  // Clear the reference to the google map instance
  const onUnmountHandler = useCallback(() => setMap(null), [])

  useEffect(() => {
    if (map && golfcourses && golfcourses.length > 1) {
      // Only use fitBounds if we have multiple golf courses and want precise fitting
      // This provides a fallback for cases where calculated zoom might not be perfect
      const bounds = new window.google.maps.LatLngBounds()

      golfcourses.forEach((golfCourse) =>
        bounds.extend({
          lat: golfCourse.lat,
          lng: golfCourse.lng,
        })
      )

      // Add some padding around the bounds
      map.fitBounds(bounds, { padding: 50 })
    }
  }, [map, golfcourses])

  const CustomCircle = ({
    color = "#78a32e",
    size = 15,
    borderColor = "#ffffff",
    borderWidth = 2,
  }) => (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: "50%",
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    />
  )

  // const divStyle = {
  //   background: "white",
  //   border: "1px solid #ccc",
  //   padding: 15,
  // }

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_KEY}>
      <div>
        <div className="golfcoursesmapcontainer">
          <Title>{GolfCoursesMapTitle}</Title>
          <Map
            style={mapContainerStyle}
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            mapId="golf-courses-map"
            disableDefaultUI={true}
            zoomControl={true}
            onLoad={onLoadHandler}
            onUnmount={onUnmountHandler}
          >
            {golfcourses
              ? golfcourses.map((golfcourse) => (
                  <AdvancedMarker
                    key={golfcourse.name}
                    position={{ lat: golfcourse.lat, lng: golfcourse.lng }}
                    onClick={() =>
                      console.log(`Clicked marker ${golfcourse.name}`)
                    }
                  >
                    <CustomCircle
                      color="#78a32e"
                      size={15}
                      borderColor="#ffffff"
                      borderWidth={1}
                    />
                  </AdvancedMarker>
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
                    <Typography component="p">
                      {selected.description}
                    </Typography>
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
          </Map>
        </div>
      </div>
    </APIProvider>
  )
}

export default memo(GolfCoursesMap)
