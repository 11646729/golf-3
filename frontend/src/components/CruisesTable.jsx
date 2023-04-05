import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Title from "./Title"

const CruisesTableTitleContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const CruisesTableContainer = styled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
`

const CruisesTableStyle = styled.table`
  width: 94%;
  margin-left: 20px;
  margin-right: 20px;
  border-spacing: 20px;
  border: 1px solid lightgray;
  border-collapse: collapse;
  font-size: 13px;
`

const CruisesTableHeaderStyle = styled.thead`
  /* text-align: left; */
  font-size: 14px;
`

const TableRow = styled.tr`
  &:hover {
    background-color: #ebeccd;
  }
`

const TableHeader = styled.th`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
`

const TableDataCell = styled.td`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
`

const TableDataCellCenter = styled.td`
  height: 34px;
  margin: 0;
  padding: 0.5rem;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
  text-align: center;
`

const CruisesTableBodyStyle = styled.tbody``

const CruiseShip = styled.div`
  display: flex;
  flex-direction: row;
`

const CruiseLineLogo = styled.img`
  width: 30px;
  height: 30px;
  object-fit: cover;
  margin-left: 70px;
`

const CruiseShipName = styled.div`
  text-decoration: underline;
  color: blue;
  cursor: pointer;
  margin-left: 10px;
`

const CruiseShipArrivalTime = styled.div``

const DateOfArrival = styled.div`
  // font-weight: 600;
  text-align: center;
`

const DayOfTheWeek = styled.div`
  font-weight: 600;
  text-align: center;
`

const ArrivalTime = styled.div`
  text-align: center;
`

const DepartureTime = styled.div`
  text-align: center;
`

const Button = styled.button`
  padding: 5px 7px;
  border: none;
  border-radius: 10px;
  background-color: lightgreen;
  color: darkgreen;
  margin: auto;
  display: block;

  &:hover {
    background-color: #105b72c2;
    color: white;
    cursor: pointer;
  }
`
const CruisesTableTitle = "Cruise Ships Arriving Soon"

const CruisesTable = (props) => {
  const { portArrivals } = props

  CruisesTable.propTypes = {
    portArrivals: PropTypes.array,
  }

  return (
    <div>
      <CruisesTableTitleContainer>
        <Title>{CruisesTableTitle}</Title>
      </CruisesTableTitleContainer>

      <CruisesTableContainer>
        <CruisesTableStyle>
          <CruisesTableHeaderStyle>
            <TableRow>
              <TableHeader>Day</TableHeader>
              <TableHeader>Ship</TableHeader>
              <TableHeader>Arrival</TableHeader>
              <TableHeader>Departure</TableHeader>
              <TableHeader>Itinerary</TableHeader>
            </TableRow>
          </CruisesTableHeaderStyle>
          <CruisesTableBodyStyle>
            {portArrivals.map((portArrival) => (
              <TableRow key={portArrival.portarrivalid}>
                <TableDataCell>
                  <CruiseShipArrivalTime>
                    <DateOfArrival>{portArrival.arrivalDate}</DateOfArrival>
                    <DayOfTheWeek>{portArrival.weekday}</DayOfTheWeek>
                  </CruiseShipArrivalTime>
                </TableDataCell>
                <TableDataCellCenter>
                  <CruiseShip>
                    <CruiseLineLogo
                      src={portArrival.cruiselinelogo}
                      alt="Cruise Line Logo"
                    />
                    <CruiseShipName>
                      {portArrival.vesselshortcruisename}
                    </CruiseShipName>
                  </CruiseShip>
                </TableDataCellCenter>
                <TableDataCell>
                  <ArrivalTime>{portArrival.vesseletatime}</ArrivalTime>
                </TableDataCell>
                <TableDataCell>
                  <DepartureTime>{portArrival.vesseletdtime}</DepartureTime>
                </TableDataCell>
                <TableDataCell>
                  <Button>Show</Button>
                </TableDataCell>
              </TableRow>
            ))}
          </CruisesTableBodyStyle>
        </CruisesTableStyle>
      </CruisesTableContainer>
    </div>
  )
}

export default memo(CruisesTable)
