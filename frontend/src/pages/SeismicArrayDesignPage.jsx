import React, { memo, useState, useEffect } from "react"
import SeismicArrayDesign from "../components/SeismicArrayDesign"

import { getSeismicDesignsData } from "../functionHandlers/loadSeismicDesignsDataHandler"
import "../styles/arraydesign.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const SeismicArrayDesignPage = () => {
  const [seismicDesigns, setSeismicDesignsData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const seismicDesignsDataUrl =
    "http://localhost:4000/api/seismicdesigns/getSeismicDesigns"

  useEffect(() => {
    getSeismicDesignsData(seismicDesignsDataUrl)
      .then((returnedData) => {
        setSeismicDesignsData(returnedData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  console.log(seismicDesigns)

  return (
    <div className="arraydesignmain">
      <div className="arraydesigntitle">Test Data</div>
      {/* <SeismicArrayDesign
        isLoading={isLoading}
        seismicDesigns={seismicDesigns}
      /> */}
    </div>
  )
}

export default memo(SeismicArrayDesignPage)
