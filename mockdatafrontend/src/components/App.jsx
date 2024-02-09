import React, { memo } from "react"
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom"

import Header from "./Header"
import Menu from "./Menu"
import Footer from "./Footer"
import RealTimeHomePage from "../pages/RealTimeHomePage"

import "../styles/global.scss"

const App = () => {
  const Layout = () => {
    return (
      <div className="main">
        <Header />
        <div className="container">
          <div className="menuContainer">
            <Menu />
          </div>
          <div className="contentContainer">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <RealTimeHomePage />,
        },
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
