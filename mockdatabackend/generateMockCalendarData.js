export const generateMockCalendarData = (indexCount) => {
  try {
    let mockCalendarMessageBody = []
    let creatorOrganizerDetails = {
      email: "bds6052@gmail.com",
      self: true,
    }
    let startEndDateDetails = {
      date: "2023-12-20",
    }
    let remindersDetails = {
      useDefault: false,
    }
    let latestReading1 = {
      kind: "calendar#event",
      etag: '"3398564254684000"',
      id: "_8l236d1l6koj4b9h8l244b9k6sok4b9p74sk4b9p8ks32e9m6h330d9k6k",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=XzhsMjM2ZDFsNmtvajRiOWg4bDI0NGI5azZzb2s0YjlwNzRzazRiOXA4a3MzMmU5bTZoMzMwZDlrNmsgYmRzNjA1MkBt&ctz=Europe/London",
      created: "2023-11-06T14:48:47.000Z",
      updated: "2023-11-06T14:48:47.342Z",
      summary: "Bill & Merav Visiting",
      creator: creatorOrganizerDetails,
      organizer: creatorOrganizerDetails,
      start: startEndDateDetails,
      end: startEndDateDetails,
      iCalUID: "ED345512-1EDB-471B-999B-9E81964F0545",
      sequence: 0,
      reminders: remindersDetails,
      eventType: "default",
    }

    let latestReading2 = {
      kind: "calendar#event",
      etag: '"3405692353396000"',
      id: "_84ok4chm611j4b9h6h0kab9k70r48ba26h2jiba26ssj0hhp88r3ccq18g",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=Xzg0b2s0Y2htNjExajRiOWg2aDBrYWI5azcwcjQ4YmEyNmgyamliYTI2c3NqMGhocDg4cjNjY3ExOGcgYmRzNjA1MkBt&ctz=Europe/London",
      created: "2023-11-27T19:17:59.000Z",
      updated: "2023-12-17T20:49:36.698Z",
      summary: "Xmas Carol Service",
      location:
        "St. Mark's Church\nChurch St, Newtownards, BT23 4AN, Northern Ireland",
      creator: creatorOrganizerDetails,
      organizer: creatorOrganizerDetails,
      start: startEndDateDetails,
      end: startEndDateDetails,
      iCalUID: "A1B260C2-14AE-486D-B4E9-B790F9B663AD",
      sequence: 2,
      reminders: remindersDetails,
      eventType: "default",
    }

    mockCalendarMessageBody.push(latestReading1)
    mockCalendarMessageBody.push(latestReading2)

    return mockCalendarMessageBody
  } catch (error) {
    console.log("Error in generateMockCalendarData: ", error)
    return null
  }
}
