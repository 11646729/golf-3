import React from "react"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import Title from "./Title"
import "../styles/golfcoursesmap.scss"

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

const GolfCoursesMap2 = () => (
  <APIProvider
    apiKey={import.meta.env.VITE_GOOGLE_KEY}
    onLoad={() => console.log("Maps API has loaded.")}
  >
    <div className="golfcoursesmapcontainer">
      <Title>{GolfCoursesMapTitle}</Title>
      <Map
        defaultZoom={defaultMapZoom}
        defaultCenter={defaultMapCenter}
        style={mapContainerStyle}
      ></Map>
    </div>
  </APIProvider>
)

export default GolfCoursesMap2
