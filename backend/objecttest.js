//
// RealtimeData contains Type (of data), theData (actual data), Date of creation of the theData,

var RealtimeDataMain = {
  type: "datatype",
  creationDate: Date(),
  contents: {
    CalendarItem: true,
    NewsItem: true,
    WeatherItem: true,
    CruiseShipItem: false,
  },

  CalendarItem: {
    version: 1,
    type: "calendaritem",
    prop2: "CalendarItemprop2",
    Obj2: {
      type: "hey you",
      prop2: "CalendarItemObj2prop2",
      prop3: function () {
        return this.type + " " + this.prop2
      },
    },
  },

  NewsItem: {
    version: 1,
    type: "newsitem",
    prop2: "NewsItemprop2",
  },

  WeatherItem: {
    version: 1,
    type: "weatheritem",
    prop2: "WeatherItemprop2",
    prop3: 3,
  },
}

console.log(RealtimeDataMain.CalendarItem.Obj2.prop3())

// parent class
class Person {
  constructor(firstName) {
    this.firstName = firstName
  }

  greet() {
    console.log(`Hello ${this.firstName}`)
  }
}

// inheriting parent class
class RealtimeData extends Person {}

let student1 = new RealtimeData("Jack")
student1.greet()
