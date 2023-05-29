import React, { memo } from "react"
import styled from "styled-components"
import SeismicArrayDesign from "../components/SeismicArrayDesign"

const SeismicArrayDesignContainer = styled.div`
  display: flex;
`

const SeismicArrayDesignPage = () => {
  return (
    <SeismicArrayDesignContainer>
      <SeismicArrayDesign />
    </SeismicArrayDesignContainer>
  )
}

export default memo(SeismicArrayDesignPage)
