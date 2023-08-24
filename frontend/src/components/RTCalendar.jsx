import React, { memo } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import "../styles/calendar.scss"
import "../data"

// -------------------------------------------------------
// Real Time Calendar component
// -------------------------------------------------------
const RTCalendar = (props) => {
  const { isLoaded, calendarEvents } = props

  RTCalendar.propTypes = {
    isLoaded: PropTypes.bool,
    calendarEvents: PropTypes.array,
  }

  return isLoaded ? (
    <div className="table">
      <div className="caption">
        {"Calendar Events for Today Mon "}
        {moment.utc(calendarEvents.tableData[0].DTSTAMP).format("DD/MM/YYYY")}
      </div>
      {/* <div className="thead">
        <div className="tr">
          <div className="th">Time</div>
          <div className="th">Description</div>
        </div>
      </div> */}
      {calendarEvents.tableData.map((item) => (
        <div className="tbody" key={item.id}>
          <div className="eventtime">
            {moment.utc(item.DTSTAMP).format("hh:mm")}
          </div>
          <div className="eventdescription">{item.event}</div>
        </div>
      ))}
    </div>
  ) : null
}

export default memo(RTCalendar)
