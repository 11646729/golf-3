import React, { memo } from "react"
import RTCalendar from "../components/RTCalendar"
import "../styles/realtimehome.scss"

const RealTimeHomePage = () => {
  return (
    <div className="home">
      <div className="box box1">
        <RTCalendar />
      </div>
      <div className="box box2">News Headlines</div>
      <div className="box box3">Golf Course Weather & next Tee Time</div>
      <div className="box box4">Golf Handicap, Trend & Practise</div>
      <div className="box box5">Cruise Ships in Belfast or En Route</div>
      <div className="box box6">Traffic</div>
      <div className="box box7">Shares</div>
      <div className="box box8">Crimes</div>
      <div className="box box9">Bus Services</div>
      <div className="box box10">Learning</div>
      <div className="box box11">Book Tee Time</div>
      <div className="box box12">Crime Prevention Advice</div>
      <div className="box box13">Seismic Productivity</div>
    </div>
  )
}

export default memo(RealTimeHomePage)
