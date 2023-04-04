import React, { memo } from "react"
import styled from "styled-components"

import RawDataTable from "../components/RawDataTable"
import RawDataStatusBox from "../components/RawDataStatusBox"

const RawDataContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const RawDataTableContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
`

const RawDataStatusBoxContainer = styled.div`
  flex: 1;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 200px;
`

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const RawDataPage = () => {
  return (
    <RawDataContainer>
      <RawDataTableContainer>
        <RawDataTable rawDataTableTitle="Raw Data Importing Operations" />
      </RawDataTableContainer>
      <RawDataStatusBoxContainer>
        <RawDataStatusBox messageString="Here is the status message" />
      </RawDataStatusBoxContainer>
    </RawDataContainer>
  )
}

export default memo(RawDataPage)
