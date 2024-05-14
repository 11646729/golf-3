import React, { memo, useState } from "react"
import styled from "styled-components"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import LanguageIcon from "@mui/icons-material/Language"
import SettingsIcon from "@mui/icons-material/Settings"
import StatusIcon from "./StatusIcon"
import "../styles/header.scss"

const TopBarIconContainer = styled.div`
  position: relative;
  cursor: pointer;
  margin-right: 10px;
  color: $main-color;
`

const TopIconBadge = styled.div`
  height: 15px;
  width: 15px;
  position: absolute;
  top: -5px;
  right: 0px;
  background-color: red;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
`

const TopAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
`

const Header = () => {
  const [isActiveStatus1, setIsActiveStatus1] = useState(true)
  const [isActiveStatus2, setIsActiveStatus2] = useState(false)

  return (
    <div className="headercontainer">
      <div className="topbarcontainer">
        <div className="topbarlogo">Real-time Data Simulator</div>
        <div className="topright">
          <TopBarIconContainer>
            <NotificationsNoneIcon />
            <TopIconBadge>1</TopIconBadge>
          </TopBarIconContainer>
          <TopBarIconContainer>
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
            <TopIconBadge>2</TopIconBadge>
          </TopBarIconContainer>
          <TopBarIconContainer>
            <SettingsIcon />
          </TopBarIconContainer>
          <TopAvatar src="/static/images/brian.jpeg" alt="" />
        </div>
      </div>
    </div>
  )
}

export default memo(Header)
