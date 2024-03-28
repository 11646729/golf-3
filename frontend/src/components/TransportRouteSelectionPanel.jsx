import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Title from "./Title"
import TransportRouteSelectionList from "./TransportRouteSelectionList"

const transportRoutesPanelTitle = "Transport Routes Table"

const TransportRoutesPanelContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const TransportRouteSelectionPanelListContainer = styled.div`
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 50px;
  height: 600px;
  max-height: 100%;
`

const TransportRouteSelectionPanel = (props) => {
  const { transportRoutesArray } = props

  TransportRouteSelectionPanel.propTypes = {
    transportRoutesArray: PropTypes.array,
  }

  return (
    <div>
      <TransportRoutesPanelContainer>
        <Title>{transportRoutesPanelTitle}</Title>
      </TransportRoutesPanelContainer>
      <TransportRouteSelectionPanelListContainer>
        <TransportRouteSelectionList
          transportRoutesArray={transportRoutesArray}
        />
      </TransportRouteSelectionPanelListContainer>
    </div>
  )
}

export default memo(TransportRouteSelectionPanel)
