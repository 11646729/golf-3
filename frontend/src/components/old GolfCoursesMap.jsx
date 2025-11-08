import { useState, useEffect, useCallback, useMemo, memo } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
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

  const map1 = useMap()
  console.log("map1:", map1)

  // Debug log to check data
  console.log("GolfCoursesMap received data:", {
    golfcourses,
    length: golfcourses?.length,
    sample: golfcourses?.[0],
  })

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

  const CustomCircle = ({
    color = "#78a32e",
    size = 15,
    borderColor = "#ffffff",
    borderWidth = 1,
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

  const defaultMapZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)

  const defaultMapCenter = useMemo(
    () => ({
      lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
      lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
    }),
    []
  )

  // Helper to parse and validate coordinates
  const parseCoordinate = (value) => {
    const num = parseFloat(value)
    return Number.isFinite(num) ? num : null
  }

  // Store a reference to the google map instance in state
  const onLoadHandler = useCallback((mapInstance) => {
    console.log("Map loaded:", mapInstance)
    setMap(mapInstance)
  }, [])

  // Clear the reference to the google map instance
  const onUnmountHandler = useCallback(() => setMap(null), [])

  useEffect(() => {
    console.log("fitBounds useEffect triggered", {
      map: !!map,
      golfcoursesLength: golfcourses?.length,
      golfcourses: golfcourses,
    })

    if (map && golfcourses && golfcourses.length > 0) {
      // Validate coordinates before creating bounds
      const validCourses = golfcourses.filter((course) => {
        const lat = parseCoordinate(course.lat)
        const lng = parseCoordinate(course.lng)
        const isValid = lat !== null && lng !== null
        if (!isValid) {
          console.warn("Invalid coordinates for course:", course.name, {
            lat: course.lat,
            lng: course.lng,
          })
        }
        return isValid
      })

      if (validCourses.length === 0) {
        console.warn("No valid coordinates found in golf courses data")
        return
      }

      console.log("Valid courses for bounds:", validCourses.length)

      // Create bounds to encompass all golf courses
      const bounds = new window.google.maps.LatLngBounds()

      // Add each golf course location to the bounds
      validCourses.forEach((golfCourse) => {
        const lat = parseCoordinate(golfCourse.lat)
        const lng = parseCoordinate(golfCourse.lng)
        console.log(`Adding to bounds: ${golfCourse.name}`, { lat, lng })
        bounds.extend(new window.google.maps.LatLng(lat, lng))
      })

      console.log("Bounds created:", bounds.toString())

      // Fit the map to show all golf courses with padding
      try {
        map.fitBounds(bounds, 50) // Simple padding number instead of object
        console.log("fitBounds called successfully")

        // For single golf course, ensure reasonable zoom level
        if (validCourses.length === 1) {
          setTimeout(() => {
            const currentZoom = map.getZoom()
            console.log("Current zoom after fitBounds:", currentZoom)
            if (currentZoom > 15) {
              map.setZoom(15)
              console.log("Zoom limited to 15 for single course")
            }
          }, 100)
        }
      } catch (error) {
        console.error("Error calling fitBounds:", error)
      }
    }
  }, [map, golfcourses])

  // const divStyle = {
  //   background: "white",
  //   border: "1px solid #ccc",
  //   padding: 15,
  // }

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div>
        <div className="golfcoursesmapcontainer">
          <Title>{GolfCoursesMapTitle}</Title>
          <Map
            style={mapContainerStyle}
            defaultCenter={defaultMapCenter}
            defaultZoom={defaultMapZoom}
            mapId="golf-courses-map"
            disableDefaultUI={true}
            zoomControl={true}
            onLoad={onLoadHandler}
            onUnmount={onUnmountHandler}
          >
            {golfcourses
              ? golfcourses
                  .filter((golfcourse) => {
                    const lat = parseCoordinate(golfcourse.lat)
                    const lng = parseCoordinate(golfcourse.lng)
                    return lat !== null && lng !== null
                  })
                  .map((golfcourse) => (
                    <AdvancedMarker
                      key={golfcourse.name}
                      position={{
                        lat: parseCoordinate(golfcourse.lat),
                        lng: parseCoordinate(golfcourse.lng),
                      }}
                      onClick={() =>
                        console.log(`Clicked marker ${golfcourse.name}`)
                      }
                    >
                      <CustomCircle />
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
