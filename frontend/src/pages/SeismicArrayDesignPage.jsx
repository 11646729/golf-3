import React, { memo, useState, useEffect } from "react"
import styled from "styled-components"
import SeismicArrayDesign from "../components/SeismicArrayDesign"

import { getSeismicDesignsData } from "../functionHandlers/loadSeismicDesignsDataHandler"

const SeismicArrayDesignContainer = styled.div`
  display: flex;
`

const SeismicMenuContainer = styled.div`
  flex: 1;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  height: auto;
  // min-width: 200px;
  background-color: lightyellow;
`

const SeismicDisplayContainer = styled.div`
  flex: 4;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
  background-color: lightgreen;
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
    <SeismicArrayDesignContainer>
      <SeismicMenuContainer>{/* TODO */}</SeismicMenuContainer>
      <SeismicDisplayContainer>
        {/* <SeismicArrayDesign
          isLoading={isLoading}
          seismicDesigns={seismicDesigns}
        /> */}
      </SeismicDisplayContainer>
    </SeismicArrayDesignContainer>
  )
}

export default memo(SeismicArrayDesignPage)
