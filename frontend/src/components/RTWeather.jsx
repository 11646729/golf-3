import React, { memo } from "react"
import PropTypes from "prop-types"
import moment from "moment"
// import "../styles/news.scss"

// -------------------------------------------------------
// Real Time News component
// -------------------------------------------------------
const RTWeather = (props) => {
  const { isLoading, weatherData } = props

  RTWeather.propTypes = {
    isLoading: PropTypes.bool,
    weatherData: PropTypes.array,
  }

  console.log(weatherData)

  // <div className="thead">
  //   <div className="tr">
  //     <div className="th">Time</div>
  //     <div className="th">Description</div>
  //   </div>
  // </div>

  // return !isLoading ? (
  //   <div className="table">
  //     {weatherData.map((item, publishedAt) =>
  //       publishedAt === 0 ? (
  //         <div key={publishedAt}>
  //           <div className="caption">
  //             {"Golf Course Weather for: "}
  //             {moment.utc(item.published_date).format("ddd  DD/MM/YYYY")}
  //           </div>
  //           <div className="tbody">
  //             <div className="eventtime">
  //               {moment.utc(item.publishedAt).format("hh:mm")}
  //             </div>
  //             <div className="eventdescription">{item.title}</div>
  //           </div>
  //         </div>
  //       ) : (
  //         <div key={publishedAt}>
  //           <div className="tbody">
  //             <div className="eventtime">
  //               {moment.utc(item.publishedAt).format("hh:mm")}
  //             </div>
  //             <div className="eventdescription">{item.title}</div>
  //           </div>
  //         </div>
  //       )
  //     )}
  //   </div>
  // ) : null
}

export default memo(RTWeather)
