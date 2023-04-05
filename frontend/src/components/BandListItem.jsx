import React, { useState, memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import { ListItem } from "@mui/material"
import BandButton from "./BandButton"
import BandCheckbox from "./BandCheckbox"
import BandListItemText from "./BandListItemText"
// import { selectedUniqueRoute } from "../functionHandlers/loadBusTransportDataHandler"

const BandListItemContainer = styled.div`
  width: 100%;
  max-width: 360px;
`
const BandListContainer = styled.div`
  padding: 0px;
`

const BandListItem = (props) => {
  // const { routeId, routeColor, routeNumber, routeName, routeVia } = props
  const { routeColor, routeNumber, routeName, routeVia } = props

  const routeVisible = true

  BandListItem.propTypes = {
    // routeId: PropTypes.string,
    routeColor: PropTypes.string,
    routeNumber: PropTypes.string,
    routeName: PropTypes.string,
    routeVia: PropTypes.string,
    // routeVisible: { routeVisible },
  }

  // const [routeVisibleCheckbox, setRouteVisibleCheckbox] = useState(routeVisible)
  const [routeVisibleCheckbox] = useState(routeVisible)

  // const handleListItemClick = (event, routeNumber) => {
  //   // These if choices refer to checkbox state before changes
  //   if (routeVisibleCheckbox === true) {
  //     setRouteVisibleCheckbox(false)
  //     selectedUniqueRoute(
  //       "http://localhost:4000/api/bus/groutes/:routenumber",
  //       routeNumber,
  //       false
  //     )
  //   } else {
  //     setRouteVisibleCheckbox(true)
  //     selectedUniqueRoute(
  //       "http://localhost:4000/api/bus/groutes/:routenumber",
  //       routeNumber,
  //       true
  //     )
  //   }
  // }

  return (
    <BandListContainer>
      <BandListItemContainer>
        <ListItem
          button
          // onClick={(event) => handleListItemClick(event, routeNumber)}
        >
          <div className="bandcheckboxcontainer">
            <BandCheckbox checked={routeVisibleCheckbox} />
          </div>
          <div className="bandbuttoncontainer">
            <BandButton routeColor={routeColor} routeNumber={routeNumber} />
          </div>
          <div className="bandlistitemtextcontainer">
            <BandListItemText routeName={routeName} routeVia={routeVia} />
          </div>
        </ListItem>
      </BandListItemContainer>
    </BandListContainer>
  )
}

export default memo(BandListItem)
