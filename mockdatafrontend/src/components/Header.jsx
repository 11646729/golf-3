import React, { memo, useState } from "react"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import LanguageIcon from "@mui/icons-material/Language"
import SettingsIcon from "@mui/icons-material/Settings"
import StatusIcon from "./StatusIcon"
import "../styles/header.scss"

const Header = () => {
  const [isActiveStatus1, setIsActiveStatus1] = useState(true)
  const [isActiveStatus2, setIsActiveStatus2] = useState(false)

  return (
    <div className="headercontainer">
      <div className="topbarcontainer">
        <div className="topbarlogo">My Dashboard</div>
        <div className="topright">
          <div className="topbariconcontainer">
            <NotificationsNoneIcon />
            <span className="topiconbadge">1</span>
          </div>
          <div className="topbariconcontainer">
            <StatusIcon
              size={5}
              status={isActiveStatus1}
              onShow={() => setIsActiveStatus1(!isActiveStatus1)}
            />
            <StatusIcon
              size={5}
              status={isActiveStatus2}
              onShow={() => setIsActiveStatus2(!isActiveStatus2)}
            />
            <LanguageIcon />
            <span className="topiconbadge">2</span>
          </div>
          <div className="topbariconcontainer">
            <SettingsIcon />
          </div>
          <img className="topavatar" src="/static/images/brian.jpeg" />
        </div>
      </div>
    </div>
  )
}

export default memo(Header)
