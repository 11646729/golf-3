import { memo } from "react"
import RawDataTable from "../components/RawDataTable"
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
    </div>
  )
}

export default memo(RawDataPage)
