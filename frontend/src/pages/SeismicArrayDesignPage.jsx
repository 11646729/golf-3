import React, { memo, useState, useEffect } from "react"
import styled from "styled-components"
import SeismicArrayDesign from "../components/SeismicArrayDesign"
import Menu from "../components/Menu"

import { getSeismicDesignsData } from "../functionHandlers/loadSeismicDesignsDataHandler"

const SeismicDisplayContainer = styled.div`
  // flex: 4;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  width: 100%;
  min-height: 500px;
  // background-color: lightgreen;
`

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
    <SeismicDisplayContainer>
      <SeismicArrayDesign
        isLoading={isLoading}
        seismicDesigns={seismicDesigns}
      />
    </SeismicDisplayContainer>
  )
}

export default memo(SeismicArrayDesignPage)
