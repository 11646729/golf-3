import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Title from "./Title"
import BusRouteSelectionList from "./BusRouteSelectionList"

const BusRoutesPanelTitle = "Bus Routes Table"

const BusRoutesPanelContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const BusRouteSelectionPanelListContainer = styled.div`
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 50px;
  height: 600px;
  max-height: 100%;
`

const BusRouteSelectionPanel = (props) => {
  const { busRoutesCollection } = props

  BusRouteSelectionPanel.propTypes = {
    busRoutesCollection: PropTypes.array,
  }

  return (
    <div>
      <BusRoutesPanelContainer>
        <Title>{BusRoutesPanelTitle}</Title>
      </BusRoutesPanelContainer>
      <BusRouteSelectionPanelListContainer>
        <BusRouteSelectionList busRoutesCollection={busRoutesCollection} />
      </BusRouteSelectionPanelListContainer>
    </div>
  )
}

export default memo(BusRouteSelectionPanel)
