import { useMemo, memo } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  // MarkerClusterer,
  Marker,
} from "@vis.gl/react-google-maps"
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
    [],
  )

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="nearbycrimesmapcontainer">
        <Title>{NearbyCrimesMapTitle}</Title>
        <Map
          style={mapContainerStyle}
          defaultZoom={mapZoom}
          defaultCenter={mapCenter}
          mapId="nearby-crimes-map"
          disableDefaultUI={true}
          zoomControl={true}
        >
          {/* <Marker position={mapCenter} icon={iconPin} /> */}

          {/* Note: MarkerClusterer not yet available in vis.gl, using simple markers */}
          {crimesData.map((crime) => (
            <Marker
              key={`crime-${crime.id}`}
              position={{
                lat: parseFloat(crime.latitude),
                lng: parseFloat(crime.longitude),
              }}
              onClick={() => {
                console.log(crime)
              }}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  )
}

export default memo(NearbyCrimesMap)
