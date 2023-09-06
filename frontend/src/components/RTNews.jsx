import React, { memo } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import "../styles/news.scss"

// -------------------------------------------------------
// Real Time News component
// -------------------------------------------------------
const RTNews = (props) => {
  const { isLoading, newsEvents } = props

  RTNews.propTypes = {
    isLoading: PropTypes.bool,
    newsEvents: PropTypes.array,
  }

  console.log(newsEvents)

  // <div className="thead">
  //   <div className="tr">
  //     <div className="th">Time</div>
  //     <div className="th">Description</div>
  //   </div>
  // </div>

  return !isLoading ? (
    <div className="table">
      {newsEvents.map((item, index) =>
        index === 0 ? (
          <div key={index}>
            <div className="caption">
              {"News Events for Today Mon "}
              {moment.utc(item.published_date).format("DD/MM/YYYY")}
            </div>
            <div className="tbody">
              <div className="eventtime">
                {moment.utc(item.published_date).format("hh:mm")}
              </div>
              <div className="eventdescription">{item.excerpt}</div>
            </div>
          </div>
        ) : (
          <div key={index}>
            <div className="tbody">
              <div className="eventtime">
                {moment.utc(item.published_date).format("hh:mm")}
              </div>
              <div className="eventdescription">{item.excerpt}</div>
            </div>
          </div>
        )
      )}
    </div>
  ) : null
}

export default memo(RTNews)
