import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import BandListItem from "./BandListItem"

const RouteSelectionListContainer = styled.div`
  width: "100%";
  max-width: 360px;
`

const RouteSelectionList = (props) => {
  const { busRoutesCollection } = props

  RouteSelectionList.propTypes = {
    busRoutesCollection: PropTypes.array,
  }

  return (
    <RouteSelectionListContainer>
      {busRoutesCollection
        ? busRoutesCollection.map((busRoute) => (
            <BandListItem
              key={busRoute.routeId}
              routeColor={busRoute.routeColor}
              routeNumber={busRoute.routeShortName}
              routeName={busRoute.routeLongName}
              routeVia={busRoute.routeLongName}
            />
          ))
        : null}
    </RouteSelectionListContainer>
  )
}

export default memo(RouteSelectionList)
