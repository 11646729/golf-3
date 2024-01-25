import React, { memo } from "react"
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom"

// import Header from "./Header"
// import Menu from "./Menu"
// import Footer from "./Footer"
// import HomePage from "../pages/HomePage"
// import RawDataPage from "../pages/RawDataPage"
// import WeatherPage from "../pages/WeatherPage"
// import GolfCoursesPage from "../pages/GolfCoursesPage"
// import NearbyCrimesPage from "../pages/NearbyCrimesPage"
// import CruisesPage from "../pages/CruisesPage"
// import BusRoutesPage from "../pages/BusRoutesPage"
// import SeismicArrayDesignPage from "../pages/SeismicArrayDesignPage"
// import Seismic3DRadialDisplayPage from "../pages/Seismic3DRadialDisplayPage"
import RealTimeHomePage from "../pages/RealTimePage"

// import "../styles/global.scss"

const App = () => {
  const Layout = () => {
    return (
      <button>STOP CLIENT</button>

      // <div className="main">
      //   {/* <Header /> */}
      //   <div className="container">
      //     <div className="menuContainer">{/* <Menu /> */}</div>
      //     <div className="contentContainer">{/* <Outlet /> */}</div>
      //   </div>
      //   {/* <Footer /> */}
      // </div>
    )
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        // {
        //   path: "/",
        //   element: <HomePage />,
        // },
        {
          path: "/realtimehomepage",
          element: <RealTimeHomePage />,
        },
        // {
        //   path: "/rawdatapage",
        //   element: <RawDataPage />,
        // },
        // {
        //   path: "/weatherpage",
        //   element: <WeatherPage />,
        // },
        // {
        //   path: "/golfcoursespage",
        //   element: <GolfCoursesPage />,
        // },
        // {
        //   path: "/nearbycrimespage",
        //   element: <NearbyCrimesPage />,
        // },
        // {
        //   path: "/cruisespage",
        //   element: <CruisesPage />,
        // },
        // {
        //   path: "/busroutespage",
        //   element: <BusRoutesPage />,
        // },
        // {
        //   path: "/seismicarraydesignpage",
        //   element: <SeismicArrayDesignPage />,
        // },
        // {
        //   path: "/seismic3dradialdisplaypage",
        //   element: <Seismic3DRadialDisplayPage />,
        // },
        {
          path: "*",
          element: (
            <div>
              <h1>Not found!</h1>
              <p>Sorry your page was not found!</p>
            </div>
          ),
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}

export default memo(App)
