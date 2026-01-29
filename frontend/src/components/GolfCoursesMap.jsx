import { useEffect, useMemo, useState } from "react"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps"
import Title from "./Title"
import "../styles/golfcoursesmap.scss"

const mapContainerStyle = {
  height: "750px",
  width: "750px",
  border: "1px solid #ccc",
  marginLeft: 0,
  marginRight: 0,
  marginBottom: 0,
}

const GolfCoursesMapTitle = "Golf Course Locations"

const defaultMapZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)

const defaultMapCenter = {
  lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
  lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
}

const MapErrorFallback = ({ error }) => (
  <div
    style={{
      height: "750px",
      width: "750px",
      border: "1px solid #ccc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: "4px",
    }}
  >
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3 style={{ color: "#d32f2f", marginBottom: "10px" }}>
        Unable to Load Map
      </h3>
      <p style={{ color: "#666", marginBottom: "10px" }}>
        {error || "Google Maps failed to load"}
      </p>
      <p style={{ fontSize: "12px", color: "#999" }}>
        Please check your Google Maps API key configuration and ensure it has
        the required APIs enabled (Maps SDK for JavaScript).
      </p>
      <p style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
        Error details: Check the browser console for more information.
      </p>
    </div>
  </div>
)

// Helper to parse and validate coordinates
const parseCoordinate = (value) => {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : null
}

const getValidCourses = (courses = []) =>
  courses.reduce((list, course) => {
    const lat = parseCoordinate(course.lat)
    const lng = parseCoordinate(course.lng)

    if (lat === null || lng === null) {
      return list
    }

    list.push({ ...course, lat, lng })
    return list
  }, [])

const FitBoundsLayer = ({ courses }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || courses.length === 0) {
      return
    }

    try {
      // Adjust the viewport so every course marker is visible
      const bounds = new window.google.maps.LatLngBounds()
      courses.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))

      if (courses.length === 1) {
        map.setCenter(bounds.getCenter())
        map.setZoom(Math.min(map.getZoom() ?? defaultMapZoom, 15))
        return
      }

      map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 })
    } catch (error) {
      console.error("Error fitting map bounds:", error)
    }
  }, [map, courses])

  return null
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

const GolfCoursesMap = ({ golfcourses = [] }) => {
  const [mapError, setMapError] = useState(null)
  const validCourses = useMemo(
    () => getValidCourses(golfcourses),
    [golfcourses],
  )

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Validate API key is configured
  if (!apiKey) {
    const errorMsg =
      "Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file."
    console.error(errorMsg)
    return (
      <>
        <Title>{GolfCoursesMapTitle}</Title>
        <MapErrorFallback error={errorMsg} />
      </>
    )
  }

  // Handle API loading errors
  const handleApiLoadError = (error) => {
    const errorMsg = `Google Maps API Error: ${error?.message || "Unknown error"}`
    console.error(errorMsg, error)
    setMapError(errorMsg)
  }

  if (mapError) {
    return (
      <>
        <Title>{GolfCoursesMapTitle}</Title>
        <MapErrorFallback error={mapError} />
      </>
    )
  }

  return (
    <APIProvider
      apiKey={apiKey}
      onLoad={() => console.log("Google Maps API loaded successfully")}
      onLoadError={handleApiLoadError}
    >
      <Title>{GolfCoursesMapTitle}</Title>
      <div className="golfcoursesmapcontainer">
        <Map
          defaultZoom={defaultMapZoom}
          defaultCenter={defaultMapCenter}
          style={mapContainerStyle}
          mapId="golf-courses-map"
          disableDefaultUI={true}
          zoomControl={true}
        >
          <FitBoundsLayer courses={validCourses} />
          {validCourses.map((course) => (
            <AdvancedMarker
              key={course.courseid}
              position={{ lat: course.lat, lng: course.lng }}
            >
              <CustomCircle />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  )
}

export default GolfCoursesMap
