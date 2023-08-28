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

  return !isLoading ? (
    <div className="table">
      <div className="caption">
        {"News Events for Today Mon "}
        {moment.utc(newsEvents.items[0].published_date).format("DD/MM/YYYY")}
      </div>
      {/* <div className="thead">
        <div className="tr">
          <div className="th">Time</div>
          <div className="th">Description</div>
        </div>
      </div> */}
      {newsEvents.items.map((item) => (
        <div className="tbody" key={item._id}>
          <div className="eventtime">
            {moment.utc(item.published_date).format("hh:mm")}
          </div>
          <div className="eventdescription">{item.excerpt}</div>
        </div>
      ))}
    </div>
  ) : null
}

export default memo(RTNews)
