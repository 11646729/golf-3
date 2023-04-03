import React, { memo } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva"

// import Album from "./Album"
// import TopBar from "./TopBar"
// import RawDataPage from "../pages/RawDataPage"
// import WeatherPage from "../pages/WeatherPage"
// import GolfCoursesPage from "../pages/GolfCoursesPage"
// import NearbyCrimesPage from "../pages/NearbyCrimesPage"
// import CruisesPage from "../pages/CruisesPage"
// import BusRoutesPage from "../pages/BusRoutesPage"
// import CanvasTestPage from "../pages/CanvasTestPage"

function App() {
  return (
    <div>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Text text="Some text on canvas" fontSize={15} />
          <Rect
            x={20}
            y={50}
            width={100}
            height={100}
            fill="red"
            shadowBlur={10}
          />
          <Circle x={200} y={100} radius={50} fill="green" />
          <Line
            x={20}
            y={200}
            points={[0, 0, 100, 0, 100, 100]}
            tension={0.5}
            closed
            stroke="black"
            fillLinearGradientStartPoint={{ x: -50, y: -50 }}
            fillLinearGradientEndPoint={{ x: 50, y: 50 }}
            fillLinearGradientColorStops={[0, "red", 1, "yellow"]}
          />
        </Layer>
      </Stage>

      {/* <TopBar /> */}

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
  // return <Album />
}

function RawDataPageLink() {
  // return <RawDataPage />
}

function WeatherPageLink() {
  // return <WeatherPage />
}

function GolfCoursesPageLink() {
  // return <GolfCoursesPage />
}

function CruisesPageLink() {
  // return <CruisesPage />
}

function NearbyCrimesPageLink() {
  // return <NearbyCrimesPage />
}

function BusRoutesPageLink() {
  // return <BusRoutesPage />
}

function CanvasTestPageLink() {
  // return <CanvasTestPage />
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
