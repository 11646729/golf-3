import React, { memo } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import "../styles/calendar.scss"

// -------------------------------------------------------
// Real Time Calendar component
// -------------------------------------------------------
const RTCalendar = (props) => {
  const { isLoading, calendarEvents } = props

  RTCalendar.propTypes = {
    isLoading: PropTypes.bool,
    calendarEvents: PropTypes.array,
  }

  return !isLoading ? (
    <div className="table">
      <div className="caption">
        {"Calendar Events for Today Mon "}
        {moment.utc(calendarEvents[0].DTSTAMP).format("DD/MM/YYYY")}
      </div>
      {/* <div className="thead">
        <div className="tr">
          <div className="th">Time</div>
          <div className="th">Description</div>
        </div>
      </div> */}
      {calendarEvents.map((event) => (
        <div className="tbody" key={event.id}>
          <div className="eventtime">
            {moment.utc(event.DTSTAMP).format("hh:mm")}
          </div>
          <div className="eventdescription">{event.event_description}</div>
        </div>
      ))}
    </div>
  ) : null
}

export default memo(RTCalendar)
