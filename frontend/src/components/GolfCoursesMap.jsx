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

  const mapCenter = useMemo(
    () => ({
      lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
      lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
    }),
    []
  )

  // Store a reference to the google map instance in state
  const onLoadHandler = useCallback((Mymap) => setMap(Mymap), [])

  // Clear the reference to the google map instance
  const onUnmountHandler = useCallback(() => setMap(null), [])

  useEffect(() => {
    if (map && golfcourses && golfcourses.length > 0) {
      // Create bounds to encompass all golf courses
      const bounds = new window.google.maps.LatLngBounds()

      // Add each golf course location to the bounds
      golfcourses.forEach((golfCourse) => {
        bounds.extend({
          lat: golfCourse.lat,
          lng: golfCourse.lng,
        })
      })

      // Fit the map to show all golf courses with padding
      const padding = {
        top: 100,
        right: 100,
        bottom: 100,
        left: 100,
      }

      map.fitBounds(bounds, padding)

      // For single golf course, ensure reasonable zoom level
      if (golfcourses.length === 1) {
        // Add a small delay to allow fitBounds to complete, then set zoom
        setTimeout(() => {
          if (map.getZoom() > 15) {
            map.setZoom(15)
          }
        }, 100)
      }
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
            defaultZoom={defaultMapZoom}
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
