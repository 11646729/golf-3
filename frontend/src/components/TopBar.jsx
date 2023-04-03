import React, { memo, useState } from "react"
import styled from "styled-components"
import { NotificationsNone, Language, Settings } from "@mui/icons-material"
// import StatusIcon from "./StatusIcon"

const Container = styled.div`
  width: 100%;
  height: 50px;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 999;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
`

const TopBarWrapper = styled.div`
  height: 100%;
  padding: 0px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Logo = styled.span`
  font-weight: bold;
  font-size: 30px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  color: darkblue;
  cursor: pointer;
`

const TopRight = styled.div`
  display: flex;
  align-items: center;
`

const TopBarIconContainer = styled.div`
  position: relative;
  cursor: pointer;
  margin-right: 10px;
  color: #555;
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

const TopBar = () => {
  // const [isActiveStatus1, setIsActiveStatus1] = useState(true)
  // const [isActiveStatus2, setIsActiveStatus2] = useState(false)

  return (
    <Container>
      <TopBarWrapper>
        <Logo>My Website</Logo>
        <TopRight>
          <TopBarIconContainer>
            <NotificationsNone />
            <TopIconBadge>1</TopIconBadge>
          </TopBarIconContainer>
          <TopBarIconContainer>
            {/* <StatusIcon
              size={5}
              status={isActiveStatus1}
              onShow={() => setIsActiveStatus1(!isActiveStatus1)}
            />
            <StatusIcon
              size={5}
              status={isActiveStatus2}
              onShow={() => setIsActiveStatus2(!isActiveStatus2)}
            /> */}
            <Language />
            <TopIconBadge>2</TopIconBadge>
          </TopBarIconContainer>
          <TopBarIconContainer>
            <Settings />
          </TopBarIconContainer>
          <TopAvatar src="/static/images/brian.jpeg" alt="" />
        </TopRight>
      </TopBarWrapper>
    </Container>
  )
}

export default memo(TopBar)
