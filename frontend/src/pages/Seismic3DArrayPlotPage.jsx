import React, { memo } from "react"
import styled from "styled-components"
import Seismic3DRadialDisplay from "../components/Seismic3DRadialDisplay"

const SeismicDesignContainer = styled.div`
  display: flex;
`

const Seismic3DArrayPlotPage = () => {
  return (
    <SeismicDesignContainer>
      <Seismic3DRadialDisplay />
    </SeismicDesignContainer>
  )
}

export default memo(Seismic3DArrayPlotPage)
