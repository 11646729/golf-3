import React, { memo } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import "../styles/weather.scss"

// -------------------------------------------------------
// Real Time News component
// -------------------------------------------------------
const RTWeather = (props) => {
  const { isLoading, temperatureReadings } = props

  RTWeather.propTypes = {
    isLoading: PropTypes.bool,
    temperatureReadings: PropTypes.array,
  }

  // console.log(temperatureReadings)

  // <div className="thead">
  //   <div className="tr">
  //     <div className="th">Time</div>
  //     <div className="th">Description</div>
  //   </div>
  // </div>

  return !isLoading ? (
    <div className="table">
      {temperatureReadings.map((item, index) =>
        index === 0 ? (
          <div key={index}>
            <div className="caption">
              {"Golf Course Weather for: "}
              {moment.utc(item.timeNow).format("ddd  DD/MM/YYYY")}
            </div>
            <div className="tbody">
              <div className="readingtime">
                {moment.utc(item.readingTime).format("hh:mm")}
              </div>
              <div className="readinglocation">{item.location}</div>
            </div>
          </div>
        ) : (
          <div key={index}>
            <div className="tbody">
              <div className="readingtime">
                {moment.utc(item.readingTime).format("hh:mm")}
              </div>
              <div className="readinglocation">{item.location}</div>
            </div>
          </div>
        )
      )}
    </div>
  ) : null
}

export default memo(RTWeather)
