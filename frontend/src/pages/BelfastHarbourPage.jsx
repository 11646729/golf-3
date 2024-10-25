import React, { useState, useEffect, memo } from "react"
// import CruisesTable from "../components/CruisesTable"
import { getBelfastHarbourMovementsData } from "../functionHandlers/getBelfastHarbourMovements"
import "../styles/cruises.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const BelfastHarbourPage = () => {
  const [belfastHarbourMovements, setBelfastHarbourMovements] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const belfastHarbourMovementsDataUrl =
    "http://localhost:4000/api/belfastharbourmovements/getBelfastHarbourMovements"

  // This routine gets Port Arrivals data
  useEffect(() => {
    getBelfastHarbourMovementsData(belfastHarbourMovementsDataUrl)
      .then((returnedData) => {
        // Sort by date & time because returnedData is not always in timestamp order
        returnedData.data.sort((a, b) => (a.vesseleta > b.vesseleta ? 1 : -1))

        setBelfastHarbourMovements(returnedData.data)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div className="cruisescontainer">
      <div className="cruisestablecontainer">
        {/* <CruisesTable belfastHarbourMovements={belfastHarbourMovements} /> */}
      </div>
    </div>
  )
}

export default memo(BelfastHarbourPage)
