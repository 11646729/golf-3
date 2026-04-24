import { useState, useEffect } from "react"
import {
  getGolfCoursesData,
  loadGolfCoursesDataHandler,
  getGolfImportStatus,
} from "../functionHandlers/loadGolfCoursesDataHandler"

const useGolfCourses = () => {
  const [golfcourses, setGolfCoursesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [fetchStatus, setFetchStatus] = useState("idle")
  const [lastImportDate, setLastImportDate] = useState(null)

  useEffect(() => {
    getGolfCoursesData("http://localhost:4000/api/golf/getGolfCourses")
      .then((returnedData) => {
        setGolfCoursesData(returnedData)
        setLoadError(null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error loading golf courses data:", err)
        setLoadError(err.message || "Failed to load golf courses")
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    getGolfImportStatus().then(({ lastUpdated }) => {
      if (lastUpdated) setLastImportDate(new Date(lastUpdated))
    })
  }, [])

  const handleFetchData = async () => {
    setFetchStatus("loading")
    try {
      await loadGolfCoursesDataHandler()
      setLastImportDate(new Date())
      setFetchStatus("complete")
    } catch (err) {
      console.error(err)
      setFetchStatus("error")
    }
  }

  return {
    golfcourses,
    isLoading,
    loadError,
    fetchStatus,
    lastImportDate,
    handleFetchData,
  }
}

export default useGolfCourses
