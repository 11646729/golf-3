export const generateMockNewsData = (mockType, indexCount) => {
  let indexNum = 0

  try {
    let mockNewsMessageBody = []
    let sourceDetails = {
      id: "bbc-news",
      name: "BBC News",
    }
    let latestReading = {
      mocktype: mockType,
      index: indexCount,
      index: indexNum,
      title: "Watch: Inside Alaska Airlines plane as part blows off mid-air",
      author: "BBC News",
      source: sourceDetails,
      publishedAt: "2024-01-06T10:37:15.8148964Z",
      url: "https://www.bbc.co.uk/news/world-us-canada-67900834",
    }

    let latestReading1 = {
      mocktype: mockType,
      index: indexCount,
      index: indexNum,
      title: "David Soul: Starsky & Hutch actor dies aged 80",
      author: "BBC News",
      source: sourceDetails,
      publishedAt: "2024-01-06T09:37:24.0798292Z",
      url: "https://www.bbc.co.uk/news/entertainment-arts-67895679",
    }

    let latestReading2 = {
      mocktype: mockType,
      index: indexCount,
      index: indexNum,
      title: "Iowa school principal distracted gunman before being shot",
      author: "BBC News",
      source: sourceDetails,
      publishedAt: "2024-01-06T09:37:23.470604Z",
      url: "https://www.bbc.co.uk/news/world-us-canada-67889191",
    }

    let latestReading3 = {
      mocktype: mockType,
      index: indexCount,
      index: indexNum,
      title: "NRA chief executive Wayne LaPierre steps down",
      author: "BBC News",
      source: sourceDetails,
      publishedAt: "2024-01-06T09:37:22.2410452Z",
      url: "https://www.bbc.co.uk/news/world-us-canada-67889195",
    }

    let latestReading4 = {
      mocktype: mockType,
      index: indexCount,
      index: indexNum,
      title:
        "Glynn Simmons: Freedom 'exhilarating' for man exonerated after 48 years",
      author: "BBC News",
      source: sourceDetails,
      publishedAt: "2024-01-06T08:52:17.3916861Z",
      url: "https://www.bbc.co.uk/news/world-us-canada-67878504",
    }

    mockNewsMessageBody.push(latestReading)
    mockNewsMessageBody.push(latestReading1)
    mockNewsMessageBody.push(latestReading2)
    mockNewsMessageBody.push(latestReading3)
    mockNewsMessageBody.push(latestReading4)

    return mockNewsMessageBody
  } catch (error) {
    console.log("Error in generateMockNewsData: ", error)
    return null
  }
}
