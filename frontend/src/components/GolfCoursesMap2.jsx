import { useEffect, useState } from "react"
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from "@vis.gl/react-google-maps"
import Title from "./Title"
import "../styles/golfcoursesmap.scss"
import { getGolfCoursesData } from "../functionHandlers/loadGolfCoursesDataHandler"

const GolfCoursesMapTitle = "Golf Course Locations"

const defaultMapZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)

const defaultMapCenter = {
  lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
  lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
}

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

// Helper to parse and validate coordinates
const parseCoordinate = (value) => {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : null
}

const MarkersComponent = () => {
  const map = useMap()
  if (map) {
    console.log("map:", map)
  }
}

const GolfCoursesMap2 = (props) => {
  const { isLoading, golfcourses } = props

  console.log(golfcourses)

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      onLoad={() => console.log("Maps API has loaded.")}
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
        </Map>
        <MarkersComponent />
      </div>
    </APIProvider>
  )
}

export default GolfCoursesMap2
