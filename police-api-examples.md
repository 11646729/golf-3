# UK Police API - JavaScript Examples

Based on the pattern used in `NearbyCrimesPage.jsx` and `loadCrimesDataHandler.js`.

API docs: https://data.police.uk/docs/method/crime-street/

---

## Basic fetch (no library)

```javascript
const fetchNearbyCrimes = async (lat, lng, date = null) => {
  // date format: "YYYY-MM" (e.g. "2024-01"), or omit for latest available
  const dateParam = date ? `&date=${date}` : ""
  const url = `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}${dateParam}`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
    const crimes = await response.json()
    return crimes
  } catch (err) {
    console.error("Failed to fetch crimes:", err)
    throw err
  }
}

// Usage — most recent data
fetchNearbyCrimes(51.5074, -0.1278)
  .then((crimes) => {
    console.log(`Found ${crimes.length} crimes`)
    crimes.forEach((crime) => {
      console.log(crime.category, crime.location.street.name)
    })
  })

// Usage — specific month
fetchNearbyCrimes(51.5074, -0.1278, "2024-06")
  .then((crimes) => console.log(crimes))
```

---

## Using axios (matches the app's pattern)

```javascript
import axios from "axios"

const fetchNearbyCrimes = async (lat, lng, date = null) => {
  const dateParam = date ? `&date=${date}` : ""
  const url = `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}${dateParam}`

  const response = await axios.get(url, { timeout: 20000 })
  return response.data
}
```

---

## React hook (matches NearbyCrimesPage pattern)

```javascript
import { useState, useEffect } from "react"
import axios from "axios"

const useNearbyCrimes = (lat, lng, date = null) => {
  const [crimes, setCrimes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const dateParam = date ? `&date=${date}` : ""
    const url = `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}${dateParam}`

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
```

---

## Notes

- No API key required — it is a public API
- Returns an array of crime objects with `category`, `location` (lat/lng + street name), `month`, and `outcome_status`
- The area searched is a 1-mile radius around the given coordinates by default
- Data is typically 2–3 months behind the current date
