import React, { memo, useState, useEffect } from "react"
import styled from "styled-components"
import SeismicArrayDesign from "../components/SeismicArrayDesign"

import { getSeismicDesignsData } from "../functionHandlers/loadSeismicDesignsDataHandler"

const SeismicArrayDesignContainer = styled.div`
  display: flex;
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
      <SeismicArrayDesign />
    </SeismicArrayDesignContainer>
  )
}

export default memo(SeismicArrayDesignPage)
