import axios from "axios"

// -------------------------------------------------------
// Function to fetch all Google Calendar data
// -------------------------------------------------------
export const getGoogleCalendarEvents = async (url) => {
  console.log("Here")

  // return await axios
  //   .get(url)
  //   .then((response) => response.data)
  //   .catch((err) => console.log(err))
}

export { getGoogleCalendarEvents as default }