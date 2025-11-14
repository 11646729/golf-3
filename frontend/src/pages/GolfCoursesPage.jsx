import { useState, useEffect } from "react"
import GolfCoursesTable from "../components/GolfCoursesTable"
import GolfCoursesMap from "../components/GolfCoursesMap"
import { getGolfCoursesData } from "../functionHandlers/loadGolfCoursesDataHandler"
import "../styles/golfcourses.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const GolfCoursesPage = () => {
  const [golfcourses, setGolfCoursesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getGolfCoursesData("http://localhost:4000/api/golf/getGolfCourses")
      .then((returnedData) => {
        setGolfCoursesData(returnedData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div className="golfcoursescontainer">
      <div className="golfcoursestablecontainer">
        <GolfCoursesTable golfcourses={golfcourses} />
      </div>
      <div className="golfcoursesmapcontainer">
        <GolfCoursesMap isLoading={isLoading} golfcourses={golfcourses} />
      </div>
    </div>
  )
}

export default GolfCoursesPage
