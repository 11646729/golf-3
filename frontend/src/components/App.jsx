import React, { memo } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Album from "./Album"
import TopBar from "./TopBar"
import RawDataPage from "../pages/RawDataPage"
import WeatherPage from "../pages/WeatherPage"
import GolfCoursesPage from "../pages/GolfCoursesPage"
import NearbyCrimesPage from "../pages/NearbyCrimesPage"
import CruisesPage from "../pages/CruisesPage"
import BusRoutesPage from "../pages/BusRoutesPage"
import CanvasTestPage from "../pages/CanvasTestPage"

function App() {
  return (
    <div>
      <TopBar />

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="rawdatapage" element={<RawDataPageLink />} />
          <Route path="weatherpage" element={<WeatherPageLink />} />
          <Route path="golfcoursespage" element={<GolfCoursesPageLink />} />
          <Route path="nearbycrimespage" element={<NearbyCrimesPageLink />} />
          <Route path="cruisespage" element={<CruisesPageLink />} />
          <Route path="busroutespage" element={<BusRoutesPageLink />} />
          <Route path="canvastestpage" element={<CanvasTestPageLink />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  )
}

function Home() {
  return <Album />
}

function RawDataPageLink() {
  return <RawDataPage />
}

function WeatherPageLink() {
  return <WeatherPage />
}

function GolfCoursesPageLink() {
  return <GolfCoursesPage />
}

function CruisesPageLink() {
  return <CruisesPage />
}

function NearbyCrimesPageLink() {
  return <NearbyCrimesPage />
}

function BusRoutesPageLink() {
  return <BusRoutesPage />
}

function CanvasTestPageLink() {
  return <CanvasTestPage />
}

function NotFound() {
  return (
    <div>
      <h1>Not found!</h1>
      <p>Sorry your page was not found!</p>
    </div>
  )
}

export default memo(App)
