import React, { memo, useState } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Title from "./Title"
import StatusButton from "./StatusButton"

// import { loadTemperaturesDataHandler } from "../functionHandlers/loadTemperaturesDataHandler"
// import { loadGolfCoursesDataHandler } from "../functionHandlers/loadGolfCoursesDataHandler"
// import { loadCruiseShipArrivalsDataHandler } from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
// import { loadBusTransportDataHandler } from "../functionHandlers/loadBusTransportDataHandler"
// import { loadCrimesDataHandler } from "../functionHandlers/loadCrimesDataHandler"
// import { startRealtimeDataHandler } from "../functionHandlers/startRealtimeDataHandler"

const RawDataTableTitleContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const RawDataTableContainer = styled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
`

const RawDataTableStyle = styled.table`
  width: 94%;
  margin-left: 20px;
  margin-right: 20px;
  border-spacing: 20px;
  border: 1px solid lightgray;
  border-collapse: collapse;
  font-size: 13px;
`

const RawDataTableHeader = styled.thead`
  /* text-align: left; */
  font-size: 14px;
`

const RawDataTableRow = styled.tr`
  &:hover {
    background-color: #ebeccd;
  }
`

const RawDataTableHead = styled.th`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
`

const RawDataTableBody = styled.tbody``

const RawDataTableDataCellLeft = styled.td`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
  text-align: left;
`

const RawDataTableDataCell = styled.td`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
  text-align: center;
`

const RawDataTable = (props) => {
  const { rawDataTableTitle } = props

  RawDataTable.propTypes = {
    rawDataTableTitle: PropTypes.string,
  }

  const messageArray = ["Ready", "Button Pressed", "Working", "Ended"]

  const [btnState1, setBtnState1] = useState(0)
  const [btnState2, setBtnState2] = useState(0)
  const [btnState3, setBtnState3] = useState(0)
  const [btnState4, setBtnState4] = useState(0)
  const [btnState5, setBtnState5] = useState(0)
  const [btnState6, setBtnState6] = useState(0)

  return (
    <div>
      <RawDataTableTitleContainer>
        <Title>{rawDataTableTitle}</Title>
      </RawDataTableTitleContainer>

      <RawDataTableContainer>
        <RawDataTableStyle>
          <RawDataTableHeader>
            <RawDataTableRow>
              <RawDataTableHead>Import Raw Data Types</RawDataTableHead>
              <RawDataTableHead>Status</RawDataTableHead>
              <RawDataTableHead>Actions</RawDataTableHead>
            </RawDataTableRow>
          </RawDataTableHeader>
          <RawDataTableBody>
            <RawDataTableRow>
              <RawDataTableDataCellLeft>
                Temperatures Data
              </RawDataTableDataCellLeft>
              <RawDataTableDataCell>
                {messageArray[btnState1]}
              </RawDataTableDataCell>
              <RawDataTableDataCell>
                <StatusButton
                  stateText="Fetch Temperatures"
                  onShow={() => {
                    btnState1 < 3
                      ? setBtnState1(btnState1 + 1)
                      : setBtnState1(0)

                    // loadTemperaturesDataHandler()
                  }}
                />
              </RawDataTableDataCell>
            </RawDataTableRow>
            <RawDataTableRow>
              <RawDataTableDataCellLeft>
                Golf Course Data
              </RawDataTableDataCellLeft>
              <RawDataTableDataCell>
                {messageArray[btnState2]}
              </RawDataTableDataCell>
              <RawDataTableDataCell>
                <StatusButton
                  stateText="Fetch Golf Courses"
                  onShow={() => {
                    btnState2 < 3
                      ? setBtnState2(btnState2 + 1)
                      : setBtnState2(0)

                    // loadGolfCoursesDataHandler()
                  }}
                />
              </RawDataTableDataCell>
            </RawDataTableRow>
            <RawDataTableRow>
              <RawDataTableDataCellLeft>
                Cruise Ship Arrivals Data
              </RawDataTableDataCellLeft>
              <RawDataTableDataCell>
                {messageArray[btnState3]}
              </RawDataTableDataCell>
              <RawDataTableDataCell>
                <StatusButton
                  stateText="Fetch Cruise Ships"
                  onShow={() => {
                    btnState3 < 3
                      ? setBtnState3(btnState3 + 1)
                      : setBtnState3(0)
                    // loadCruiseShipArrivalsDataHandler()
                  }}
                />
              </RawDataTableDataCell>
            </RawDataTableRow>
            <RawDataTableRow>
              <RawDataTableDataCellLeft>
                Bus Transport Data
              </RawDataTableDataCellLeft>
              <RawDataTableDataCell>
                {messageArray[btnState4]}
              </RawDataTableDataCell>
              <RawDataTableDataCell>
                <StatusButton
                  stateText="Fetch Bus Data"
                  onShow={() => {
                    btnState4 < 3
                      ? setBtnState4(btnState4 + 1)
                      : setBtnState4(0)

                    // loadBusTransportDataHandler()
                  }}
                />
              </RawDataTableDataCell>
            </RawDataTableRow>
            <RawDataTableRow>
              <RawDataTableDataCellLeft>Crime Data</RawDataTableDataCellLeft>
              <RawDataTableDataCell>
                {messageArray[btnState5]}
              </RawDataTableDataCell>
              <RawDataTableDataCell>
                <StatusButton
                  stateText="Fetch Crime Data"
                  onShow={() => {
                    btnState5 < 3
                      ? setBtnState5(btnState5 + 1)
                      : setBtnState5(0)

                    // loadCrimesDataHandler()
                  }}
                />
              </RawDataTableDataCell>
            </RawDataTableRow>
            <RawDataTableRow>
              <RawDataTableDataCellLeft>Realtime Data</RawDataTableDataCellLeft>
              <RawDataTableDataCell>
                {messageArray[btnState6]}
              </RawDataTableDataCell>
              <RawDataTableDataCell>
                <StatusButton
                  stateText="Start Realtime Data"
                  onShow={() => {
                    btnState6 < 3
                      ? setBtnState6(btnState6 + 1)
                      : setBtnState6(0)

                    // startRealtimeDataHandler()
                  }}
                />
              </RawDataTableDataCell>
            </RawDataTableRow>
          </RawDataTableBody>
        </RawDataTableStyle>
      </RawDataTableContainer>
    </div>
  )
}

export default memo(RawDataTable)
