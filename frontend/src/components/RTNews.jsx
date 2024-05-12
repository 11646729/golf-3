import React, { memo } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import "../styles/rtnews.scss"

// -------------------------------------------------------
// Real Time News component
// -------------------------------------------------------
const RTNews = (props) => {
  const { isLoadingNewsHeadlinesData, newsHeadlinesItems } = props

  RTNews.propTypes = {
    isLoadingNewsHeadlinesData: PropTypes.bool,
    newsHeadlinesItems: PropTypes.array,
  }

  return !isLoadingNewsHeadlinesData ? (
    <div className="table">
      {newsHeadlinesItems.map((item, publishedAt) =>
        publishedAt === 0 ? (
          <div key={publishedAt}>
            <div className="caption">
              {"News Events for: "}
              {moment.utc(item.published_date).format("ddd  DD/MM/YYYY")}
            </div>
            <div className="tbody">
              <div className="eventtime">
                {moment.utc(item.publishedAt).format("hh:mm")}
              </div>
              <div className="eventdescription">{item.title}</div>
            </div>
          </div>
        ) : (
          <div key={publishedAt}>
            <div className="tbody">
              <div className="eventtime">
                {moment.utc(item.publishedAt).format("hh:mm")}
              </div>
              <div className="eventdescription">{item.title}</div>
            </div>
          </div>
        )
      )}
    </div>
  ) : (
    <div className="loadingnotice">Loading...</div>
  )
}

export default memo(RTNews)
