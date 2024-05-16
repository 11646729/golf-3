import React, { memo } from "react"
import PropTypes from "prop-types"
import Title from "./Title"
import "../styles/cruisestable.scss"

const CruisesTableTitle = "Cruise Ships Arriving Soon"

const CruisesTable = (props) => {
  const { portArrivals } = props

  CruisesTable.propTypes = {
    portArrivals: PropTypes.array,
  }

  return (
    <div>
      <div className="cruisestabletitlecontainer">
        <Title>{CruisesTableTitle}</Title>
      </div>

      <div className="cruisestablecontainer">
        <table className="cruisestablestyle">
          <thead className="cruisestableheader">
            <tr className="cruisestablerow">
              <th className="cruisestablehead">Day</th>
              <th className="cruisestablehead">Ship</th>
              <th className="cruisestablehead">Arrival</th>
              <th className="cruisestablehead">Departure</th>
              <th className="cruisestablehead">Itinerary</th>
            </tr>
          </thead>
          {portArrivals.map((portArrival) => (
            <tr className="cruisestablerow" key={portArrival.portarrivalid}>
              <td className="cruisestabledatacell">
                <div className="cruisescellcenter">
                  {portArrival.arrivalDate}
                </div>
                <div className="cruisescellcenter">{portArrival.weekday}</div>
              </td>
              <td className="cruisestabledatacellcenter">
                <div className="cruisesship">
                  <img
                    className="cruisesshiplogo"
                    src={portArrival.cruiselinelogo}
                    alt="Cruise Line Logo"
                  />
                  <div className="cruisesshipname">
                    {portArrival.vesselshortcruisename}
                  </div>
                </div>
              </td>
              <td className="cruisestabledatacell">
                <div className="cruisescellcenter">
                  {portArrival.vesseletatime}
                </div>
              </td>
              <td className="cruisestabledatacell">
                <div className="cruisescellcenter">
                  {portArrival.vesseletdtime}
                </div>
              </td>
              <td className="cruisestabledatacell">
                <button className="cruisesbutton">Show</button>
              </td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  )
}

export default memo(CruisesTable)
