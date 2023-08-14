import React, { memo } from "react"

import "../styles/realtimehome.scss"

const RealTimeHomePage = () => {
  return (
    <div className="home">
      <div className="box box1">Today's Calendar</div>
      <div className="box box2">News Headlines</div>
      <div className="box box3">Golf Course Weather & next Tee Time</div>
      <div className="box box4">Cruise Ships in Belfast or En Route</div>
      <div className="box box5">Traffic</div>
      <div className="box box6">Shares</div>
      <div className="box box7">Crimes</div>
      <div className="box box8">Bus Services</div>
      <div className="box box9">To Do</div>
    </div>
  )
}

export default memo(RealTimeHomePage)
