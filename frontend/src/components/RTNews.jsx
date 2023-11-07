import React, { memo } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import "../styles/news.scss"

// -------------------------------------------------------
// Real Time News component
// -------------------------------------------------------
const RTNews = (props) => {
  const { isLoadingNewsData, newsItems } = props

  RTNews.propTypes = {
    isLoadingNewsData: PropTypes.bool,
    newsItems: PropTypes.array,
  }

  // console.log(newsItems)

  return !isLoadingNewsData ? (
    <div className="table">
      {newsItems.map((item, publishedAt) =>
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
