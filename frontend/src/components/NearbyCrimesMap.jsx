import { useMemo, memo } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  InfoWindow,
} from "@vis.gl/react-google-maps"
import Title from "./Title"
import "../styles/nearbycrimesmap.scss"

const NearbyCrimesMapTitle = "Crimes Location Map"

const options = {
  imagePath: "../../static/images/m", // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
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
          {/* Note: MarkerClusterer not yet available in vis.gl, using simple markers */}
          {crimesData.map((crime) => (
            <AdvancedMarker
              key={`crime-${crime.id}`}
              position={{
                lat: parseFloat(crime.location.latitude),
                lng: parseFloat(crime.location.longitude),
              }}
              //   onClick={() => {
              //     console.log(crime)
              //   }}
            >
              <CustomCircle />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  )
}

export default memo(NearbyCrimesMap)
