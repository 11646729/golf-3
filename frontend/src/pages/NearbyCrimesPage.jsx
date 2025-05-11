import { useState, useEffect, memo } from "react"
import NearbyCrimesInputPanel from "../components/NearbyCrimesInputPanel"
import NearbyCrimesMap from "../components/NearbyCrimesMap"
import { getCrimesData } from "../functionHandlers/loadCrimesDataHandler"
import "../styles/nearbycrimes.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const NearbyCrimesPage = () => {
  const [rawCrimesData, setCrimesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Required for location of crimes data to fetch
  const mapCenter = {
    lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
    lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
  }

  // Required output from DataPicker
  // const dateInfo = "&date=2022-06"

  // build Crimes Url - set dateInfo to "" to fetch most recent data
  // const crimesUrl = `${process.env.VITE_CRIMES_ENDPOINT}?lat=${mapCenter.lat}&lng=${mapCenter.lng}${dateInfo}`
  const crimesUrl = `${import.meta.env.VITE_CRIMES_ENDPOINT}?lat=${
    mapCenter.lat
  }&lng=${mapCenter.lng}`

  // Download crimes data
  useEffect(() => {
    getCrimesData(crimesUrl)
      .then((returnedCrimesData) => {
        setCrimesData(returnedCrimesData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [crimesUrl])

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
