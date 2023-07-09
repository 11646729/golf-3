import React, { memo } from "react"
import styled from "styled-components"

import Seismic3DRadialDisplay from "../components/Seismic3DRadialDisplay"

const Seismic3DRadialDisplayContainer = styled.div`
  display: flex;
`
const SeismicArrayDesignPage = () => {
  return (
    <Seismic3DRadialDisplayContainer>
      <Seismic3DRadialDisplay />
    </Seismic3DRadialDisplayContainer>
  )
}

export default memo(SeismicArrayDesignPage)
