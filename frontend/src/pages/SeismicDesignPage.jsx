import React, { memo } from "react"
import styled from "styled-components"
import SeismicDesign from "../components/SeismicDesign"

const SeismicDesignContainer = styled.div`
  display: flex;
`

const SeismicDesignPage = () => {
  return (
    <SeismicDesignContainer>
      <SeismicDesign />
    </SeismicDesignContainer>
  )
}

export default memo(SeismicDesignPage)
