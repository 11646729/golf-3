import React, { memo } from "react"
import RawDataTable from "../components/RawDataTable"
import RawDataStatusBox from "../components/RawDataStatusBox"
import "../styles/rawdata.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const RawDataPage = () => {
  return (
    <div className="rawdatacontainer">
      <div className="rawdatatablecontainer">
        <RawDataTable rawDataTableTitle="Raw Data Importing Operations" />
      </div>
      <div className="rawdatastatusboxcontainer">
        <RawDataStatusBox messageString="Here is the status message" />
      </div>
    </div>
  )
}

export default memo(RawDataPage)
