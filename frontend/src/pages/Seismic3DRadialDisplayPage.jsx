import React, { memo } from "react"
import Seismic3DRadialDisplay from "../components/Seismic3DRadialDisplay"
import "../styles/seismic3dradialdisplay.scss"

const SeismicArrayDesignPage = () => {
  return (
    <div className="seismic3dradialdisplaycontainer">
      <Seismic3DRadialDisplay />
    </div>
  )
}

export default memo(SeismicArrayDesignPage)
