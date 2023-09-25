// -------------------------------------------------------
// Get date-time string for calender
// -------------------------------------------------------
const dateTimeForCalendar = () => {
  // Your Timezone Offset
  const TIMEOFFSET = "+01:00"

  let date = new Date()

  let year = date.getFullYear()
  let month = date.getMonth() + 1
  if (month < 10) {
    month = `0${month}`
  }
  let day = date.getDate()
  if (day < 10) {
    day = `0${day}`
  }
  let hour = date.getHours()
  if (hour < 10) {
    hour = `0${hour}`
  }
  let minute = date.getMinutes()
  if (minute < 10) {
    minute = `0${minute}`
  }

  let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`

  let event = new Date(Date.parse(newDateTime))

  let startDate = event
  // Delay in end time is 1
  let endDate = new Date(new Date(startDate).setHours(startDate.getHours() + 1))

  return {
    start: startDate,
    end: endDate,
  }
}

// -------------------------------------------------------
// Create Google Calendar Event
// -------------------------------------------------------
export const createCalendarEvent = async (req, res) => {
  const calendarEvent = {
    summary: `This is the summary.`,
    description: `This is the description.`,
    start: {
      dateTime: dateTime["start"],
      timeZone: "Europe/London",
    },
    end: {
      dateTime: dateTime["end"],
      timeZone: "Europe/London",
    },
  }

  res.send(calendarEvent)
}

export default createCalendarEvent
