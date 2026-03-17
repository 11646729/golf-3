import { memo } from "react"
import NearbyCrimesInputPanel from "../components/NearbyCrimesInputPanel"
import NearbyCrimesMap from "../components/NearbyCrimesMap"
import useNearbyCrimes from "../functionHandlers/useNearbyCrimes"
import "../styles/nearbycrimes.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const NearbyCrimesPage = () => {
  const lat = parseFloat(import.meta.env.VITE_HOME_LATITUDE)
  const lng = parseFloat(import.meta.env.VITE_HOME_LONGITUDE)

  const { crimes: rawCrimesData, isLoading } = useNearbyCrimes(
    lat,
    lng,
    "2024-01",
  )

  console.log(rawCrimesData)

  return (
    <div className="nearbycrimescontainer">
      <div className="nearbycrimesinputpanelcontainer">
        <NearbyCrimesInputPanel
          isLoading={isLoading}
          homeCheckboxStatus // Leaving it blank means true, "={false} otherwise"
          latestCheckboxStatus
        />
      </div>
      <div className="nearbycrimesmapcontainer">
        <NearbyCrimesMap crimesData={rawCrimesData} />
      </div>
    </div>
  )
}

export default memo(NearbyCrimesPage)
