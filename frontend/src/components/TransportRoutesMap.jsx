import { useState, useEffect, memo, useMemo } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  // Polyline,
  // InfoWindow,
} from "@vis.gl/react-google-maps"
import Title from "./Title"
import "../styles/transportroutes.scss"

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

  // Memoize valid stops to avoid recalculating on every render
  const validStops = useMemo(
    () => getValidStops(transportStopsArray),
    [transportStopsArray],
  )

  console.log("Valid Stops:", validStops)

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
            {validStops.map((transportStop) => (
              <AdvancedMarker
                key={transportStop.stop_id}
                position={{ lat: transportStop.lat, lng: transportStop.lng }}
              >
                <CustomCircle />
              </AdvancedMarker>
            ))}
          </Map>
        </div>
      </div>
    </APIProvider>
  )
}

export default memo(TransportRoutesMap)
