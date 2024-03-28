import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Box from "@mui/material/Box"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"

import Title from "./Title"

const TransportAgenciesTableStyle = styled.div`
  width: 94%;
  margin-left: 20px;
  margin-right: 20px;
  border-spacing: 20px;
  border: 1px solid lightgray;
  border-collapse: collapse;
  background-color: #ebeccd;
  color: black;
  font-weight: normal;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
`

const TransportAgenciesTable = (props) => {
  const [selectedIndex, setSelectedIndex] = React.useState(1)

  const { transportAgencyArray } = props

  TransportAgenciesTable.propTypes = {
    transportAgencyArray: PropTypes.array,
  }

  const TransportAgenciesTableTitle = "Transport Agencies"

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index)
    alert(index)
  }

  return (
    <div>
      <div>
        <Title>{TransportAgenciesTableTitle}</Title>
      </div>
      <TransportAgenciesTableStyle>
        <Box>
          <List dense>
            {transportAgencyArray.map((transportAgency) => (
              <ListItemButton
                key={transportAgency.agency_id}
                selected={selectedIndex === transportAgency.agency_id}
                onClick={(event) =>
                  handleListItemClick(event, transportAgency.agency_id)
                }
              >
                <ListItemText>{transportAgency.agency_id}</ListItemText>
                <ListItemText>{transportAgency.agency_name}</ListItemText>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </TransportAgenciesTableStyle>
    </div>
  )
}

export default memo(TransportAgenciesTable)
