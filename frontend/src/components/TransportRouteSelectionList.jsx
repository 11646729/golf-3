import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

// import BandListItem from "./BandListItem"

const RouteSelectionListContainer = styled.div`
  width: "100%";
  max-width: 360px;
`

const RouteSelectionList = (props) => {
  const { transportRoutesArray } = props

  RouteSelectionList.propTypes = {
    transportRoutesArray: PropTypes.array,
  }

  // console.log(transportRoutesArray)

  return (
    <RouteSelectionListContainer>
      {/* {transportRoutesArray
        ? transportRoutesArray.map((transportRoute) => (
            <BandListItem
              key={transportRoute.routeId}
              routeColor={transportRoute.routeColor}
              routeNumber={transportRoute.routeShortName}
              routeName={transportRoute.routeLongName}
              routeVia={transportRoute.routeLongName}
            />
          ))
        : null} */}
    </RouteSelectionListContainer>
  )
}

export default memo(RouteSelectionList)
