import { useEffect, useMemo } from "react"
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

    // Adjust the viewport so every course marker is visible
    const bounds = new window.google.maps.LatLngBounds()
    courses.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))

    if (courses.length === 1) {
      map.setCenter(bounds.getCenter())
      map.setZoom(Math.min(map.getZoom() ?? defaultMapZoom, 15))
      return
    }

    map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 })
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
  const validCourses = useMemo(
    () => getValidCourses(golfcourses),
    [golfcourses],
  )

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
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
