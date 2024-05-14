import React, { useMemo, memo } from "react"
import PropTypes from "prop-types"
import {
  GoogleMap,
  MarkerClusterer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api"
import Title from "./Title"
import "../styles/nearbycrimesmap.scss"

const NearbyCrimesMapTitle = "Crimes Location Map"

const options = {
  imagePath: "../../static/images/m", // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
}

const NearbyCrimesMap = (props) => {
  // const [selected, setSelected] = useState(null)

  const { crimesData } = props

  NearbyCrimesMap.propTypes = {
    crimesData: PropTypes.array,
  }

  const mapContainerStyle = {
    height: "750px",
    width: "750px",
    border: "1px solid #ccc",
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 20,
  }

  const mapZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)

  const mapCenter = useMemo(
    () => ({
      lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
      lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
    }),
    []
  )

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_KEY,
  })

  return isLoaded ? (
    <div className="nearbycrimesmapcontainer">
      <Title>{NearbyCrimesMapTitle}</Title>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={mapZoom}
        center={mapCenter}
        options={{
          // mapTypeId: "hybrid",
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {/* <Marker position={mapCenter} icon={iconPin} /> */}

        <MarkerClusterer options={options}>
          {(clusterer) =>
            crimesData.map((crime) => (
              <Marker
                key={`crime-${crime.id}`}
                position={{
                  lat: parseFloat(crime.location.latitude),
                  lng: parseFloat(crime.location.longitude),
                }}
                onClick={() => {
                  // setSelected(crime)
                  console.log(crime)
                }}
                clusterer={clusterer}
              />
            ))
          }
        </MarkerClusterer>
      </GoogleMap>
    </div>
  ) : null
}

export default memo(NearbyCrimesMap)
