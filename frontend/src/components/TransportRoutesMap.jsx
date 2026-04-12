import { useState, useEffect, useCallback, memo, useMemo } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  InfoWindow,
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
import "../styles/transportroutes.scss"
import { Polyline } from "../../polyline"

// Helper to parse and validate coordinates
const parseCoordinate = (value) => {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : null
}

// Helper to get valid transport stops with parsed coordinates
const getValidStops = (stops = []) =>
  stops.reduce((list, stop) => {
    const lat = parseCoordinate(stop.stop_lat)
    const lng = parseCoordinate(stop.stop_lon)

    if (lat === null || lng === null) {
      return list
    }

    list.push({ ...stop, lat, lng })
    return list
  }, [])

const FitBoundsLayer = ({ stops, defaultZoom }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || stops.length === 0) {
      return
    }

    try {
      // Adjust the viewport so every stop marker is visible
      const bounds = new window.google.maps.LatLngBounds()
      stops.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))

      if (stops.length === 1) {
        map.setCenter(bounds.getCenter())
        map.setZoom(Math.min(map.getZoom() ?? defaultZoom, 15))
        return
      }

      map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 })
    } catch (error) {
      console.error("Error fitting map bounds:", error)
    }
  }, [map, stops, defaultZoom])

  return null
}

const CustomCircle = ({
  color = "#6dbef1",
  size = 10,
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

// -------------------------------------------------------
// React View component
// -------------------------------------------------------
const TransportRoutesMap = (props) => {
  const {
    transportAgencyName,
    transportShapesArray,
    transportStopsArray,
    vehiclePositions = [],
  } = props

  TransportRoutesMap.propTypes = {
    transportAgencyName: PropTypes.string,
    transportShapesArray: PropTypes.array,
    transportStopsArray: PropTypes.array,
    vehiclePositions: PropTypes.array,
  }

  const [mapZoom] = useState(
    parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10),
  )
  const [mapCenter] = useState({
    lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
    lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
  })
  const [selectedMarker, setSelectedMarker] = useState(null)

  const mapContainerStyle = {
    height: "750px",
    width: "750px",
    border: "1px solid #ccc",
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 20,
  }

  // Memoize valid stops to avoid recalculating on every render
  const validStops = useMemo(
    () => getValidStops(transportStopsArray),
    [transportStopsArray],
  )

  // Memoize the selected stop object
  const selectedStop = useMemo(() => {
    if (!selectedMarker) return null
    return validStops.find((stop) => stop.stop_id === selectedMarker) || null
  }, [selectedMarker, validStops])

  const handleMarkerClick = useCallback((markerId) => {
    setSelectedMarker(markerId)
  }, [])

  const VehicleBusIcon = ({ bearing }) => (
    <div
      style={{
        width: "16px",
        height: "16px",
        backgroundColor: "#f59e0b",
        borderRadius: "3px",
        border: "2px solid #ffffff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
        cursor: "pointer",
        transform: bearing != null ? `rotate(${bearing}deg)` : "none",
      }}
    />
  )

  // const handleTransportShapeClick = (event) => {
  //   console.log(event)
  // }

  // const handleTransportRouteClick = (event) => {
  //   console.log(event)
  //   // console.log(transportRouteSelected)
  //   // setTransportRouteSelected(transportRoute)
  // }

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
          >
            <FitBoundsLayer stops={validStops} defaultZoom={mapZoom} />

            {/* Note: Polyline not yet available in vis.gl/react-google-maps */}
            {transportShapesArray
              ? transportShapesArray.map((transportShape) => (
                  <Polyline
                    key={transportShape.shapeKey}
                    path={transportShape.shapeCoordinates}
                    options={{
                      strokeColor: "#FF0000",
                      strokeOpacity: "1.0",
                      strokeWeight: 1,
                    }}
                    // onClick={() => {
                    //   handleTransportShapeClick()
                    // }}
                  />
                ))
              : null}
            {validStops.map((transportStop) => (
              <AdvancedMarker
                key={transportStop.stop_id}
                position={{ lat: transportStop.lat, lng: transportStop.lng }}
                onClick={() => handleMarkerClick(transportStop.stop_id)}
              >
                <CustomCircle />
              </AdvancedMarker>
            ))}
            {/* Live vehicle markers */}
            {vehiclePositions.map((vehicle) => (
              <AdvancedMarker
                key={vehicle.vehicle_id}
                position={{ lat: vehicle.latitude, lng: vehicle.longitude }}
                title={`Vehicle ${vehicle.vehicle_id}${vehicle.speed != null ? ` · ${Math.round(vehicle.speed)} km/h` : ""}`}
              >
                <VehicleBusIcon bearing={vehicle.bearing} />
              </AdvancedMarker>
            ))}

            {selectedStop && (
              <InfoWindow
                position={{
                  lat: selectedStop.lat,
                  lng: selectedStop.lng,
                }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <Card>
                  <CardMedia
                    style={{
                      height: 0,
                      paddingTop: "40%",
                      marginTop: "30",
                    }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {selectedStop.stop_name || "Unnamed Stop"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      component={Link}
                      // to="/golfcoursespage"§
                    >
                      View
                    </Button>
                  </CardActions>
                </Card>
              </InfoWindow>
            )}
          </Map>
        </div>
      </div>
    </APIProvider>
  )
}

export default memo(TransportRoutesMap)
