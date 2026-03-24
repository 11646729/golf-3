import { useState, useEffect } from "react"
import axios from "axios"

const useNearbyCrimes = (lat, lng, date = null) => {
  const [crimes, setCrimes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const dateParam = date ? `&date=${date}` : ""
    const url = `https://data.police.uk/api/crimes-street/all-crime?&${dateParam}&lat=${lat}&lng=${lng}`

    axios
      .get(url)
      .then((response) => {
        setCrimes(response.data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
      })
  }, [lat, lng, date])

  return { crimes, isLoading, error }
}

export default useNearbyCrimes
