import axios from "axios"
import * as cheerio from "cheerio"
import { getAndSavePortArrivals } from "./controllers/portArrivalsController.js"
import {
  saveVesselDetails,
  scrapeVesselDetails,
} from "./controllers/vesselController.js"

// -------------------------------------------------------
// Import Port Arrivals & Vessel Details
// -------------------------------------------------------
export const importPortArrivalsAndVessels = async (req, res) => {
  // Get the Port Name & Associated values
  //  let port = req.query.portName.toUpperCase()

  const port = process.env.BELFAST_PORT_NAME.toUpperCase()
  // const port = process.env.GEIRANGER_PORT_NAME.toUpperCase()
  // const port = process.env.BERGEN_PORT_NAME.toUpperCase()
  const portUrl = port + "_PORT_URL"
  const portName = process.env[portUrl]

  // Thirdly get the available Months & Years for chosen Port
  const scheduledPeriods = await getScheduleMonths(portName)

  if (scheduledPeriods.length === 0) {
    console.log("CruiseMapper currently has no ship schedule for Selected Port")
  } else {
    // Fourthly get all the Vessel Arrivals per Month
    let vesselUrls = await getAndSavePortArrivals(
      scheduledPeriods,
      port,
      portName
    )

    // Now remove duplicates and store Urls in DeduplicatedVesselUrlArray array
    const DeduplicatedVesselUrlArray = Array.from(new Set(vesselUrls))

    // Sort array ascending
    DeduplicatedVesselUrlArray.sort()

    let loop = 0
    do {
      // Extract urls for vessels & store in newVessel array
      let scrapedVessel = await scrapeVesselDetails(
        DeduplicatedVesselUrlArray[loop]
      )

      saveVesselDetails(scrapedVessel)

      loop++
    } while (loop < DeduplicatedVesselUrlArray.length)

    stackoverflowTestScrape(".post")
    // scrapeBelfastHarbourCruiseShips()
    // testScrape()

    // Length of vesselUrls array is the Number of Vessel Arrivals
    console.log(vesselUrls.length + " Port Arrivals added")
    console.log(DeduplicatedVesselUrlArray.length + " Vessels added")
  }
}

// -------------------------------------------------------
// Fetch Year & Months which show Vessel Arrival Data
// Path: Local function called by importPortArrivalsAndVessels
// -------------------------------------------------------
const getScheduleMonths = async (portName) => {
  let scheduledPeriods = []

  let initialPeriod = new Date().toISOString().slice(0, 7)

  let initialUrl =
    process.env.CRUISE_MAPPER_URL +
    portName +
    "?tab=schedule&month=" +
    initialPeriod +
    "#schedule"

  // Fetch the initial data
  const { data: html } = await axios.get(initialUrl)

  // Load up cheerio
  const $ = cheerio.load(html)

  $("#schedule > div:nth-child(2) > div.col-xs-8.thisMonth option").each(
    (i, item) => {
      const monthYearString = $(item).attr("value")

      scheduledPeriods.push({
        monthYearString,
      })
    }
  )

  return scheduledPeriods
}

// -------------------------------------------------------
// -------------------------------------------------------
const scrapeBelfastHarbourCruiseShips = async () => {
  const data = `
<table id="shortcodeTable">
  <thead>
    <tr>
      <th></th>
      <th>ARRIVAL<br />DATE &amp; TIME</th>
      <th></th>
      <th>DEPARTURE<br />DATE &amp; TIME</th>
      <th>COMPANY</th>
      <th>SHIP NAME</th>
      <th></th>
    </tr>
  </thead>
  <tbody id="load_data">
    <tr class="desktopTr" onclick="showRemaining(1501)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        05 MAY <br />
        06:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        05 MAY <br />
        18:00
      </td>
      <td width="18%" class="textBlue">PONANT</td>
      <td width="18%" class="textBlue">LE LYRIAL</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1501"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1501"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Le-Lyrial-scaled.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1501">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">142</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">184 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">112 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">GAC </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">POLLOCK </span>
          </p>
          <p>
            <span class="normalText"
              >Le Lyrial is one of four sister ships in the fleet of Ponant, a
              French luxury expedition cruise line. The ship holds just 264
              people but manages to pack a lot into a small space, including a
              full-service spa, fitness centre and heated swimming pool. The
              ship has a wonderfully calm vibe, with a sedate elegance and a
              marine-inspired d��cor. She will call in Belfast once in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1501)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />05 MAY <br />
        06:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">PONANT</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1501"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1501"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1501">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >05 MAY <br />
              06:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >05 MAY <br />
              18:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">LE LYRIAL </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">PONANT </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Le-Lyrial-scaled.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">142 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">GAC </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">184 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">POLLOCK </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">112 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Le Lyrial is one of four sister ships in the fleet of Ponant, a
              French luxury expedition cruise line. The ship holds just 264
              people but manages to pack a lot into a small space, including a
              full-service spa, fitness centre and heated swimming pool. The
              ship has a wonderfully calm vibe, with a sedate elegance and a
              marine-inspired d��cor. She will call in Belfast once in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1502)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        05 MAY <br />
        11:30
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        05 MAY <br />
        20:00
      </td>
      <td width="18%" class="textBlue">NORWEGIAN</td>
      <td width="18%" class="textBlue">NORWEGIAN PEARL</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1502"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1502"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Norwegian-pearl.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1502">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">294</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">2400 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1099 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Norwegian Pearl is a newly refurbished ship featuring a chic
              bowling alley, 16 delicious dining options, 15 bars and lounges, a
              night club, a dazzling casino, tranquil spa, and spacious Garden
              Villas. This Jewel Class cruise ship is a destination in itself.
              Norwegian Pearl will make one visit to Belfast in 2024. (Image
              Credit: Cruise Critic).
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1502)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />05 MAY <br />
        11:30
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">NORWEGIAN</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1502"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1502"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1502">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >05 MAY <br />
              11:30</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >05 MAY <br />
              20:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">NORWEGIAN PEARL </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">NORWEGIAN </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Norwegian-pearl.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">294 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">2400 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1099 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Norwegian Pearl is a newly refurbished ship featuring a chic
              bowling alley, 16 delicious dining options, 15 bars and lounges, a
              night club, a dazzling casino, tranquil spa, and spacious Garden
              Villas. This Jewel Class cruise ship is a destination in itself.
              Norwegian Pearl will make one visit to Belfast in 2024. (Image
              Credit: Cruise Critic).
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1503)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        06 MAY <br />
        07:30
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        06 MAY <br />
        19:00
      </td>
      <td width="18%" class="textBlue">TUI</td>
      <td width="18%" class="textBlue">MEIN SCHIFF 3</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1503"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1503"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/1647881312-881914884-TUI-Mein-Schiff-3-min.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1503">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">293</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">2506 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1000 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >A relatively young ship, built in 2014, Mein Schiff 3 is a
              German-speaking cruise liner. She��s scheduled to visit Belfast
              seven times this season. Young, the young-at-heart, and
              sophisticated travellers alike love the relaxed, casual atmosphere
              on board Mein Schiff 3. She��s a family-friendly ship with a
              variety of entertainment and dining options. The Mein Schiff
              series has significantly lower emissions thanks to their extensive
              environmental features, such as their exhaust desulphurisation
              system and nitrogen oxide catalytic converter.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1503)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />06 MAY <br />
        07:30
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">TUI</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1503"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1503"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1503">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >06 MAY <br />
              07:30</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >06 MAY <br />
              19:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">MEIN SCHIFF 3 </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">TUI </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/1647881312-881914884-TUI-Mein-Schiff-3-min.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">293 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">2506 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1000 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >A relatively young ship, built in 2014, Mein Schiff 3 is a
              German-speaking cruise liner. She��s scheduled to visit Belfast
              seven times this season. Young, the young-at-heart, and
              sophisticated travellers alike love the relaxed, casual atmosphere
              on board Mein Schiff 3. She��s a family-friendly ship with a
              variety of entertainment and dining options. The Mein Schiff
              series has significantly lower emissions thanks to their extensive
              environmental features, such as their exhaust desulphurisation
              system and nitrogen oxide catalytic converter.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1504)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        07 MAY <br />
        07:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        07 MAY <br />
        20:00
      </td>
      <td width="18%" class="textBlue">PRINCESS</td>
      <td width="18%" class="textBlue">REGAL PRINCESS</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1504"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1504"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Regal-Princess-2.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1504">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">330</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">3560 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1500 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Regal Princess is unmistakably elegant, accomplishing something
              mainstream cruise ships occasionally struggle with: finding a
              balance between fun and refinement. Regal Princess is a near twin
              of fleet-mate Royal Princess, with similar features including the
              SeaWalk, a cantilevered glass walkway that juts out from the Lido
              Deck, allowing passengers to take in unobstructed views of the sea
              below. She will be one of our most frequent visitors to Belfast
              during the 2024 season, with eight calls scheduled.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1504)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />07 MAY <br />
        07:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">PRINCESS</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1504"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1504"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1504">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >07 MAY <br />
              07:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >07 MAY <br />
              20:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">REGAL PRINCESS </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">PRINCESS </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Regal-Princess-2.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">330 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">3560 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1500 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Regal Princess is unmistakably elegant, accomplishing something
              mainstream cruise ships occasionally struggle with: finding a
              balance between fun and refinement. Regal Princess is a near twin
              of fleet-mate Royal Princess, with similar features including the
              SeaWalk, a cantilevered glass walkway that juts out from the Lido
              Deck, allowing passengers to take in unobstructed views of the sea
              below. She will be one of our most frequent visitors to Belfast
              during the 2024 season, with eight calls scheduled.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1505)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        08 MAY <br />
        07:30
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        08 MAY <br />
        15:30
      </td>
      <td width="18%" class="textBlue">NORWEGIAN</td>
      <td width="18%" class="textBlue">NORWEGIAN GETAWAY</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1505"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1505"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/norwegian_getaway_.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1505">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">326</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">3969 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1640 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Getaway simply oozes Miami, and that's exactly what Norwegian
              Cruise Line was going for when it built the ship. It starts with
              the hull, with art designed by Miami artist David "LEBO" Le
              Batard. It's impossible to miss the painting, which features a
              mermaid and pelicans and employs the colours of the sea. Inside,
              the overall colour palette successfully melds bright purples and
              turquoises with more muted browns and gleaming silvers. Even the
              public spaces feel like Miami. Getaway scores huge points for
              entertainment options; she was built for socialising and
              passengers on Getaway would have to go out of their way to squeeze
              in everything. She is scheduled to make one appearance in Belfast
              in 2024. (Image Credit: Cruise Critic)
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1505)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />08 MAY <br />
        07:30
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">NORWEGIAN</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1505"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1505"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1505">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >08 MAY <br />
              07:30</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >08 MAY <br />
              15:30</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">NORWEGIAN GETAWAY </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">NORWEGIAN </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/norwegian_getaway_.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">326 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">3969 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1640 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Getaway simply oozes Miami, and that's exactly what Norwegian
              Cruise Line was going for when it built the ship. It starts with
              the hull, with art designed by Miami artist David "LEBO" Le
              Batard. It's impossible to miss the painting, which features a
              mermaid and pelicans and employs the colours of the sea. Inside,
              the overall colour palette successfully melds bright purples and
              turquoises with more muted browns and gleaming silvers. Even the
              public spaces feel like Miami. Getaway scores huge points for
              entertainment options; she was built for socialising and
              passengers on Getaway would have to go out of their way to squeeze
              in everything. She is scheduled to make one appearance in Belfast
              in 2024. (Image Credit: Cruise Critic)
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1506)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        08 MAY <br />
        08:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        08 MAY <br />
        18:00
      </td>
      <td width="18%" class="textBlue">VIKING</td>
      <td width="18%" class="textBlue">VIKING SATURN</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1506"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1506"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Viking-Saturn-scaled.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1506">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">229</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">930 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">465 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">STORMONT </span>
          </p>
          <p>
            <span class="normalText"
              >The 930-passenger Viking Saturn is an adult-only vessel with chic
              Scandinavian design and a sophisticated, grown-up feel. As with
              her sister ships, Viking Saturn offers a high number of inclusions
              including 24-hour room service, a range of shore excursions,
              gratuities, dining at specialty restaurants, wine, beer, and sodas
              with lunch and dinner, plus access to the spa's thermal suite. She
              will make three visits to Belfast in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1506)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />08 MAY <br />
        08:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">VIKING</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1506"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1506"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1506">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >08 MAY <br />
              08:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >08 MAY <br />
              18:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">VIKING SATURN </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">VIKING </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Viking-Saturn-scaled.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">229 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">930 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">STORMONT </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">465 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >The 930-passenger Viking Saturn is an adult-only vessel with chic
              Scandinavian design and a sophisticated, grown-up feel. As with
              her sister ships, Viking Saturn offers a high number of inclusions
              including 24-hour room service, a range of shore excursions,
              gratuities, dining at specialty restaurants, wine, beer, and sodas
              with lunch and dinner, plus access to the spa's thermal suite. She
              will make three visits to Belfast in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1507)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        09 MAY <br />
        08:30
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        09 MAY <br />
        16:00
      </td>
      <td width="18%" class="textBlue">FOCL</td>
      <td width="18%" class="textBlue">BOREALIS</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1507"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1507"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/FOCL-Borealis-min.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1507">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">239</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">1353 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">642 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Stylish, spacious and comfortable, with the capacity for 1,353
              guests, Borealis is in keeping with Fred Olsen's commitment to
              offering a more traditional style of cruising. But while Borealis'
              capacity is smaller than many cruise vessels, she's still one of
              Fred Olsen's largest ships. Borealis has six restaurants and 11
              bars and lounges. She has two swimming pools - one with a
              retractable roof - a pair of hot tubs and a spa with nine
              treatment rooms, a hydro pool and two saunas. She is now a regular
              visitor to Belfast and called twice during the 2023 season.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1507)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />09 MAY <br />
        08:30
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">FOCL</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1507"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1507"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1507">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >09 MAY <br />
              08:30</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >09 MAY <br />
              16:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">BOREALIS </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">FOCL </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/FOCL-Borealis-min.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">239 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">1353 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">642 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Stylish, spacious and comfortable, with the capacity for 1,353
              guests, Borealis is in keeping with Fred Olsen's commitment to
              offering a more traditional style of cruising. But while Borealis'
              capacity is smaller than many cruise vessels, she's still one of
              Fred Olsen's largest ships. Borealis has six restaurants and 11
              bars and lounges. She has two swimming pools - one with a
              retractable roof - a pair of hot tubs and a spa with nine
              treatment rooms, a hydro pool and two saunas. She is now a regular
              visitor to Belfast and called twice during the 2023 season.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1508)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        10 MAY <br />
        06:15
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        10 MAY <br />
        17:00
      </td>
      <td width="18%" class="textBlue">NORWEGIAN</td>
      <td width="18%" class="textBlue">NORWEGIAN STAR</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1508"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1508"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/706-large-9c82c7143c102b71c593d98d96093fde.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1508">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">295</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">2800 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1200 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >The American-owned Norwegian Star is now a regular visitor to
              Belfast, with another two visits scheduled for the 2024 season.
              She underwent a refurbishment in 2018, which saw extensive
              enhancements to its staterooms, public spaces, restaurants, bars
              and lounges. Guests can enjoy a choice of more than 10
              restaurants, nearly 10 bars and lounges, including the 5 O'Clock
              Somewhere Bar, and a variety of entertainment options such as
              dance classes, comedy performances and a casino.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1508)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />10 MAY <br />
        06:15
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">NORWEGIAN</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1508"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1508"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1508">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >10 MAY <br />
              06:15</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >10 MAY <br />
              17:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">NORWEGIAN STAR </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">NORWEGIAN </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/706-large-9c82c7143c102b71c593d98d96093fde.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">295 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">2800 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1200 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >The American-owned Norwegian Star is now a regular visitor to
              Belfast, with another two visits scheduled for the 2024 season.
              She underwent a refurbishment in 2018, which saw extensive
              enhancements to its staterooms, public spaces, restaurants, bars
              and lounges. Guests can enjoy a choice of more than 10
              restaurants, nearly 10 bars and lounges, including the 5 O'Clock
              Somewhere Bar, and a variety of entertainment options such as
              dance classes, comedy performances and a casino.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1510)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        11 MAY <br />
        07:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        11 MAY <br />
        17:00
      </td>
      <td width="18%" class="textBlue">AMBASSADOR</td>
      <td width="18%" class="textBlue">AMBIENCE</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1510"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1510"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/stepaboard-classic-ships-1200x585-1.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1510">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">245</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">1600 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1000 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">DOYLE </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Flagship of the Ambassador Cruise Line fleet, Ambience underwent
              a refurbishment in 2022. Now a regular visitor to Belfast, she
              will call three times this season. Ambience offers no less than 11
              different lounges and bars, a gym and wellness centre, a casino,
              shopping galleria, library, swimming pool and two hot tubs.
              Entertainment venues include the multi-tiered The Palladium and
              the stylish Observatory, which plays host to cabarets and
              late-night discos.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1510)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />11 MAY <br />
        07:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">
        AMBASSADOR
      </td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1510"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1510"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1510">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >11 MAY <br />
              07:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >11 MAY <br />
              17:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">AMBIENCE </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">AMBASSADOR </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/stepaboard-classic-ships-1200x585-1.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">245 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">DOYLE </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">1600 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1000 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Flagship of the Ambassador Cruise Line fleet, Ambience underwent
              a refurbishment in 2022. Now a regular visitor to Belfast, she
              will call three times this season. Ambience offers no less than 11
              different lounges and bars, a gym and wellness centre, a casino,
              shopping galleria, library, swimming pool and two hot tubs.
              Entertainment venues include the multi-tiered The Palladium and
              the stylish Observatory, which plays host to cabarets and
              late-night discos.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1509)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        11 MAY <br />
        08:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        11 MAY <br />
        18:00
      </td>
      <td width="18%" class="textBlue">HURTIGRUTEN</td>
      <td width="18%" class="textBlue">MAUD</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1509"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1509"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/1.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1509">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">135</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">528 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">300 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">DOYLE </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">STORMONT </span>
          </p>
          <p>
            <span class="normalText"
              >MS Maud is Hurtigruten's first UK-based ship, operating from
              Dover. This 528-passenger vessel (originally 'Midnatsol') is named
              after Roald Amundsen's "Maud" from 1917. The ship has a dedicated
              Expedition Team on hand, consisting of an expedition leader, whale
              and dolphin watcher, a geologist, a micro-biologist, a historian
              and a photographer. The public areas (the atrium, lounges and
              amphitheatre where lectures are held) are an appealing place to
              spend time after a busy day hiking an icy mountain or kayaking the
              glassy waters of a fjord. Overall, if you're after a unique,
              adventurous cruising experience and enjoy being active in nature,
              then an expedition cruise on MS Maud is the ideal choice. Maud
              will call in Belfast five times in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1509)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />11 MAY <br />
        08:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">
        HURTIGRUTEN
      </td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1509"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1509"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1509">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >11 MAY <br />
              08:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >11 MAY <br />
              18:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">MAUD </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">HURTIGRUTEN </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/1.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">135 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">DOYLE </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">528 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">STORMONT </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">300 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >MS Maud is Hurtigruten's first UK-based ship, operating from
              Dover. This 528-passenger vessel (originally 'Midnatsol') is named
              after Roald Amundsen's "Maud" from 1917. The ship has a dedicated
              Expedition Team on hand, consisting of an expedition leader, whale
              and dolphin watcher, a geologist, a micro-biologist, a historian
              and a photographer. The public areas (the atrium, lounges and
              amphitheatre where lectures are held) are an appealing place to
              spend time after a busy day hiking an icy mountain or kayaking the
              glassy waters of a fjord. Overall, if you're after a unique,
              adventurous cruising experience and enjoy being active in nature,
              then an expedition cruise on MS Maud is the ideal choice. Maud
              will call in Belfast five times in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1511)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        12 MAY <br />
        07:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        12 MAY <br />
        13:00
      </td>
      <td width="18%" class="textBlue">PHOENIX REISEN</td>
      <td width="18%" class="textBlue">DEUTSCHLAND</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1511"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1511"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Phoenix-Reisen-Deutschland.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1511">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">175</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">513 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">260 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">DOYLE </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >This well-known traditional ship has been part of the Phoenix
              fleet for several years. Built in Kiel in 1998, and christened by
              former German President Richard von Weizsacker, MS Deutschland is
              the epitome of German cruise passion. While on board, passengers
              can enjoy magnificent architecture, the classic, maritime design
              and an array of artistically valuable decorations. She will make
              one visit to Belfast in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1511)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />12 MAY <br />
        07:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">
        PHOENIX REISEN
      </td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1511"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1511"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1511">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >12 MAY <br />
              07:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >12 MAY <br />
              13:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">DEUTSCHLAND </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">PHOENIX REISEN </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Phoenix-Reisen-Deutschland.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">175 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">DOYLE </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">513 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">260 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >This well-known traditional ship has been part of the Phoenix
              fleet for several years. Built in Kiel in 1998, and christened by
              former German President Richard von Weizsacker, MS Deutschland is
              the epitome of German cruise passion. While on board, passengers
              can enjoy magnificent architecture, the classic, maritime design
              and an array of artistically valuable decorations. She will make
              one visit to Belfast in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1512)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        13 MAY <br />
        08:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        13 MAY <br />
        18:00
      </td>
      <td width="18%" class="textBlue">VIKING</td>
      <td width="18%" class="textBlue">VIKING SKY</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1512"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1512"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/VikingSky-Edd-scaled.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1512">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">228</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">930 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">465 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Viking Sky is an award-winning, all-veranda small ship. Built in
              2017, she has the capacity for 930 guests. Her understated
              elegance and modern Scandinavian design is complemented by an
              array of wonderful dining options, a Nordic spa, fitness centre,
              grand theatre, cinema screens and Explorer's Lounge. Viking Sky is
              scheduled to make three visits to Belfast in 2024. She last called
              in 2021. (Image Credit: Cruise Critic)
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1512)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />13 MAY <br />
        08:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">VIKING</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1512"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1512"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1512">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >13 MAY <br />
              08:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >13 MAY <br />
              18:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">VIKING SKY </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">VIKING </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/VikingSky-Edd-scaled.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">228 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">930 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">465 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Viking Sky is an award-winning, all-veranda small ship. Built in
              2017, she has the capacity for 930 guests. Her understated
              elegance and modern Scandinavian design is complemented by an
              array of wonderful dining options, a Nordic spa, fitness centre,
              grand theatre, cinema screens and Explorer's Lounge. Viking Sky is
              scheduled to make three visits to Belfast in 2024. She last called
              in 2021. (Image Credit: Cruise Critic)
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1513)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        14 MAY <br />
        08:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        14 MAY <br />
        17:00
      </td>
      <td width="18%" class="textBlue">SAGA</td>
      <td width="18%" class="textBlue">SPIRIT OF ADVENTURE</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1513"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1513"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/2140-a92c4a3e472.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1513">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">236</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">999 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">517 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Spirit of Adventure is a boutique ship and made her maiden voyage
              in 2021. She returns to Belfast for two visits this season, with a
              capacity for 999 guests and over 500 crew across 554 all-balcony
              cabins in Standard, Deluxe and Suite categories. Designed for a UK
              market, passengers can expect upmarket interiors, spacious venues,
              communal areas, and a distinctly British way to cruise.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1513)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />14 MAY <br />
        08:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">SAGA</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1513"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1513"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1513">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >14 MAY <br />
              08:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >14 MAY <br />
              17:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">SPIRIT OF ADVENTURE </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">SAGA </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/2140-a92c4a3e472.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">236 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">999 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">517 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Spirit of Adventure is a boutique ship and made her maiden voyage
              in 2021. She returns to Belfast for two visits this season, with a
              capacity for 999 guests and over 500 crew across 554 all-balcony
              cabins in Standard, Deluxe and Suite categories. Designed for a UK
              market, passengers can expect upmarket interiors, spacious venues,
              communal areas, and a distinctly British way to cruise.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1514)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        15 MAY <br />
        06:15
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        15 MAY <br />
        19:00
      </td>
      <td width="18%" class="textBlue">TUI</td>
      <td width="18%" class="textBlue">MEIN SCHIFF 3</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1514"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1514"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/1647881312-881914884-TUI-Mein-Schiff-3-min.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1514">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">293</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">2506 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1000 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >A relatively young ship, built in 2014, Mein Schiff 3 is a
              German-speaking cruise liner. She's scheduled to visit Belfast
              seven times this season. Young, the young-at-heart, and
              sophisticated travellers alike love the relaxed, casual atmosphere
              on board Mein Schiff 3. She's a family-friendly ship with a
              variety of entertainment and dining options. The Mein Schiff
              series has significantly lower emissions thanks to their extensive
              environmental features, such as their exhaust desulphurisation
              system and nitrogen oxide catalytic converter.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1514)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />15 MAY <br />
        06:15
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">TUI</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1514"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1514"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1514">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >15 MAY <br />
              06:15</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >15 MAY <br />
              19:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">MEIN SCHIFF 3 </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">TUI </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/1647881312-881914884-TUI-Mein-Schiff-3-min.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">293 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">2506 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1000 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >A relatively young ship, built in 2014, Mein Schiff 3 is a
              German-speaking cruise liner. She's scheduled to visit Belfast
              seven times this season. Young, the young-at-heart, and
              sophisticated travellers alike love the relaxed, casual atmosphere
              on board Mein Schiff 3. She's a family-friendly ship with a
              variety of entertainment and dining options. The Mein Schiff
              series has significantly lower emissions thanks to their extensive
              environmental features, such as their exhaust desulphurisation
              system and nitrogen oxide catalytic converter.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1515)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        16 MAY <br />
        08:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        16 MAY <br />
        18:00
      </td>
      <td width="18%" class="textBlue">VIKING</td>
      <td width="18%" class="textBlue">VIKING NEPTUNE</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1515"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1515"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Viking-Neptune.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1515">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">229</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">930 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">465 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Viking Cruises latest oceangoing ship, Neptune, began an epic
              World Cruise in December 2022, setting sail from Fort Lauderdale
              on a 137-night World Cruise to London. Following that, she made
              her inaugural visit to Belfast. Neptune bears all the trappings of
              the understated Scandinavian style for which Viking is known. With
              spacious public rooms, and comfortable, charming staterooms, all
              of which offer private balconies, Viking unapologetically caters
              to sophisticated travellers. Also noteworthy is the sheer amount
              of open deck space. Hardly a single upper deck doesn't offer
              considerably vantage points for scenic cruising. Neptune will make
              five calls to Belfast in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1515)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />16 MAY <br />
        08:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">VIKING</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1515"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1515"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1515">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >16 MAY <br />
              08:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >16 MAY <br />
              18:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">VIKING NEPTUNE </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">VIKING </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Viking-Neptune.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">229 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">930 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">465 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Viking Cruises latest oceangoing ship, Neptune, began an epic
              World Cruise in December 2022, setting sail from Fort Lauderdale
              on a 137-night World Cruise to London. Following that, she made
              her inaugural visit to Belfast. Neptune bears all the trappings of
              the understated Scandinavian style for which Viking is known. With
              spacious public rooms, and comfortable, charming staterooms, all
              of which offer private balconies, Viking unapologetically caters
              to sophisticated travellers. Also noteworthy is the sheer amount
              of open deck space. Hardly a single upper deck doesn't offer
              considerably vantage points for scenic cruising. Neptune will make
              five calls to Belfast in 2024.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1516)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        17 MAY <br />
        07:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        17 MAY <br />
        19:00
      </td>
      <td width="18%" class="textBlue">PONANT</td>
      <td width="18%" class="textBlue">LE CHAMPLAIN</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1516"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1516"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Le-Champlain.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1516">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">131</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">184 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">112 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">GAC </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >With Le Champlain, Ponant has distilled the essence of its style
              of adventure cruising into a purpose-built vessel that is modern
              and comfortable. She returns to Belfast for one call this year,
              having called twice in 2023. Champlain is a cosy and intimate
              ship, with state-of-the-art features that include power-saving
              energy systems and efficient, non-discharge wastewater treatment.
              She is particularly well-suited for passengers easing into
              expedition cruising who may have held back because of the lack of
              suitable vessels to match their upscale comfort expectations.
              Ponant has raised the bar for upscale expedition cruising with Le
              Champlain.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1516)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />17 MAY <br />
        07:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">PONANT</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1516"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1516"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1516">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >17 MAY <br />
              07:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >17 MAY <br />
              19:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">LE CHAMPLAIN </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">PONANT </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Le-Champlain.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">131 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">GAC </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">184 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">112 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >With Le Champlain, Ponant has distilled the essence of its style
              of adventure cruising into a purpose-built vessel that is modern
              and comfortable. She returns to Belfast for one call this year,
              having called twice in 2023. Champlain is a cosy and intimate
              ship, with state-of-the-art features that include power-saving
              energy systems and efficient, non-discharge wastewater treatment.
              She is particularly well-suited for passengers easing into
              expedition cruising who may have held back because of the lack of
              suitable vessels to match their upscale comfort expectations.
              Ponant has raised the bar for upscale expedition cruising with Le
              Champlain.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1517)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        18 MAY <br />
        07:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        18 MAY <br />
        23:00
      </td>
      <td width="18%" class="textBlue">SILVERSEA</td>
      <td width="18%" class="textBlue">SILVER DAWN</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1517"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1517"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Silversea-Silver-Dawn.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1517">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">213</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">596 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">411 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Silver Dawn is the third ship in Silversea Cruises' Muse Class.
              The vessel joined the award-winning cruise operator in spring 2022
              and continues Silversea's dedication to providing guests with an
              elegant onboard experience consisting of well-appointed
              accommodations, world-class dining options and an array of
              hotel-style facilities and amenities. Going a step further than
              her sister ships, Silver Dawn has introduced OTIVM, a
              revolutionary spa and wellbeing concept and a first for Silversea
              Cruises. She will call in Belfast once in 2024
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1517)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />18 MAY <br />
        07:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">SILVERSEA</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1517"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1517"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1517">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >18 MAY <br />
              07:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >18 MAY <br />
              23:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">SILVER DAWN </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">SILVERSEA </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Silversea-Silver-Dawn.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">213 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">596 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">411 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Silver Dawn is the third ship in Silversea Cruises' Muse Class.
              The vessel joined the award-winning cruise operator in spring 2022
              and continues Silversea's dedication to providing guests with an
              elegant onboard experience consisting of well-appointed
              accommodations, world-class dining options and an array of
              hotel-style facilities and amenities. Going a step further than
              her sister ships, Silver Dawn has introduced OTIVM, a
              revolutionary spa and wellbeing concept and a first for Silversea
              Cruises. She will call in Belfast once in 2024
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1518)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        19 MAY <br />
        07:30
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        19 MAY <br />
        20:00
      </td>
      <td width="18%" class="textBlue">PRINCESS</td>
      <td width="18%" class="textBlue">REGAL PRINCESS</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1518"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1518"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Regal-Princess-2.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1518">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">330</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">3560 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1500 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Regal Princess is unmistakably elegant, accomplishing something
              mainstream cruise ships occasionally struggle with: finding a
              balance between fun and refinement. Regal Princess is a near twin
              of fleet-mate Royal Princess, with similar features including the
              SeaWalk, a cantilevered glass walkway that juts out from the Lido
              Deck, allowing passengers to take in unobstructed views of the sea
              below. She will be one of our most frequent visitors to Belfast
              during the 2024 season, with eight calls scheduled.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1518)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />19 MAY <br />
        07:30
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">PRINCESS</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1518"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1518"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1518">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >19 MAY <br />
              07:30</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >19 MAY <br />
              20:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">REGAL PRINCESS </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">PRINCESS </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2023/02/Regal-Princess-2.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">330 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">3560 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1500 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Regal Princess is unmistakably elegant, accomplishing something
              mainstream cruise ships occasionally struggle with: finding a
              balance between fun and refinement. Regal Princess is a near twin
              of fleet-mate Royal Princess, with similar features including the
              SeaWalk, a cantilevered glass walkway that juts out from the Lido
              Deck, allowing passengers to take in unobstructed views of the sea
              below. She will be one of our most frequent visitors to Belfast
              during the 2024 season, with eight calls scheduled.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1519)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        20 MAY <br />
        07:00
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        20 MAY <br />
        18:00
      </td>
      <td width="18%" class="textBlue">MYSTIC</td>
      <td width="18%" class="textBlue">WORLD EXPLORER</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1519"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1519"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/Mystic-World-Explorer-min.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1519">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">126</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">172 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">130 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">POLLOCK </span>
          </p>
          <p>
            <span class="normalText"
              >This is the third year in a row that World Explorer will call in
              Belfast. Designed in 2019 for operations in the Polar Regions, she
              is a small, all-suite expedition vessel boasting a glass-domed
              Observation Lounge, a dedicated lecture theatre, a library, shop,
              gym, sauna, an outdoor running track, pool and a small spa. All 86
              cabins on board have large ocean views with either a private
              walk-out balcony or a shallow French balcony.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1519)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />20 MAY <br />
        07:00
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">MYSTIC</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1519"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1519"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1519">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >20 MAY <br />
              07:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >20 MAY <br />
              18:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">WORLD EXPLORER </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">MYSTIC </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/Mystic-World-Explorer-min.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">126 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">172 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">POLLOCK </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">130 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >This is the third year in a row that World Explorer will call in
              Belfast. Designed in 2019 for operations in the Polar Regions, she
              is a small, all-suite expedition vessel boasting a glass-domed
              Observation Lounge, a dedicated lecture theatre, a library, shop,
              gym, sauna, an outdoor running track, pool and a small spa. All 86
              cabins on board have large ocean views with either a private
              walk-out balcony or a shallow French balcony.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr class="desktopTr" onclick="showRemaining(1520)">
      <td width="18%" class="day-call">DAY CALL</td>
      <td width="18%" class="textBlue">
        20 MAY <br />
        08:30
      </td>
      <td width="5%" class="textBlue text-center">-</td>
      <td width="18%" class="textBlue">
        20 MAY <br />
        19:00
      </td>
      <td width="18%" class="textBlue">CELEBRITY</td>
      <td width="18%" class="textBlue">SILHOUETTE</td>
      <td width="5%" class="icon">
        <img
          id="arraowImg1520"
          class="arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
        />
      </td>
    </tr>

    <tr
      class="closeTr extra_info desktopTr"
      id="showRem1520"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="4" class="tdDesktop">
        <img
          class="image"
          src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/Celebrity-Silhouette-min.jpg"
        />
      </td>
      <td colspan="3" class="tdDesktop">
        <div class="closeDiv" id="showRemCont1520">
          <p>
            <span class="smallBlueText">LENGTH: </span>
            <span class="normalText">318</span>
          </p>
          <p>
            <span class="smallBlueText">PAX: </span>
            <span class="normalText">2850 </span>
          </p>
          <p>
            <span class="smallBlueText">CREW: </span>
            <span class="normalText">1500 </span>
          </p>
          <p>
            <span class="smallBlueText">AGENT: </span>
            <span class="normalText">HAMILTON </span>
          </p>
          <p>
            <span class="smallBlueText">BERTH: </span>
            <span class="normalText">D1 </span>
          </p>
          <p>
            <span class="normalText"
              >Having undergone a full transformation in 2020, Silhouette boasts
              luxuriously transformed staterooms, newly reimagined bars and
              restaurants, new boutiques and a wide variety of wellness and spa
              facilities. She has been a regular visitor to Belfast in the last
              couple of years and will make three calls to Belfast in the 2024
              season. She remains one of the biggest ships to arrive in Belfast
              waters this year, with a capacity for over 3,000 guests, and a
              crew of 1,300.
            </span>
          </p>
        </div>
      </td>
    </tr>

    <tr
      class="mobile_Tr row-front frontmobile_Tr"
      onclick="mobile_showRemaining(1520)"
    >
      <td width="45%" class="mobile_textBluelarge">
        <span class="day-call">DAY CALL</span><br />20 MAY <br />
        08:30
      </td>
      <td width="45%" class="cruise-company mobile_textBluelarge">CELEBRITY</td>

      <td width="10%" class="icon">
        <img
          id="mobile_arraowImg1520"
          class="mobile_arrow"
          src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
          width="20px"
        />
      </td>
    </tr>

    <tr
      class="mobile_closeTr mobile_extra_info mobile_Tr"
      id="mobile_showRem1520"
      style="display: none"
      align="center"
      ;=""
    >
      <td colspan="3">
        <div class="mobile_closeDiv" id="mobile_showRemCont1520">
          <p>
            <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >20 MAY <br />
              08:30</span
            >
          </p>
          <p>
            <span class="mobile_normalText"
              >DEPARTURE<br />DATE &amp; TIME </span
            ><span class="mobile_BlueText"
              >20 MAY <br />
              19:00</span
            >
          </p>
          <p>
            <span class="mobile_normalText">SHIP NAME </span>
            <span class="mobile_BlueText">SILHOUETTE </span>
          </p>
          <p>
            <span class="mobile_normalText">COMPANY </span>
            <span class="mobile_BlueText">CELEBRITY </span>
          </p>
          <img
            class="mobile_image"
            src="https://www.belfast-harbour.co.uk/wp-content/uploads/2022/04/Celebrity-Silhouette-min.jpg"
          />

          <div class="mobile_flexContainer">
            <p>
              <span class="mobile_smallBlueText">LENGTH: </span>
              <span class="mobile_smallnormalText">318 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">AGENT: </span>
              <span class="mobile_smallnormalText">HAMILTON </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">PAX: </span>
              <span class="mobile_smallnormalText">2850 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">BERTH: </span>
              <span class="mobile_smallnormalText">D1 </span>
            </p>
            <p>
              <span class="mobile_smallBlueText">CREW: </span>
              <span class="mobile_smallnormalText">1500 </span>
            </p>
          </div>
          <p>
            <span class="mobile_smallnormalText"
              >Having undergone a full transformation in 2020, Silhouette boasts
              luxuriously transformed staterooms, newly reimagined bars and
              restaurants, new boutiques and a wide variety of wellness and spa
              facilities. She has been a regular visitor to Belfast in the last
              couple of years and will make three calls to Belfast in the 2024
              season. She remains one of the biggest ships to arrive in Belfast
              waters this year, with a capacity for over 3,000 guests, and a
              crew of 1,300.
            </span>
          </p>
        </div>
      </td>
    </tr>
  </tbody>
</table>
`

  const initialUrl = "https://www.belfast-harbour.co.uk/port/cruise-schedule/"
  // const initialUrl = "https://www.barchart.com/stocks/quotes/aapl/performance"

  // Fetch the initial data
  // axios.get(initialUrl).then(({ data }) => {

  // Load up cheerio
  const $ = cheerio.load(data)

  // console.log($(".elementor-shortcode > table").html())
  const rows = []
  // const sel = ".elementor-shortcode table tr"
  // const sel = "<table tr>"
  const table = $("table")
  // const sel = "barchart-table-scroll table tr"
  // $(sel).each(function (i, e) {
  const row = []
  console.log($(".desktopTr").html())
  table.find(".desktopTr").each((i, row) => {
    // console.table($(this).text().trim())
    // rows.push(row)
    // console.log(row)

    $(this)
      .find("th, td")
      // .find(".desktopTr")
      .each(function (i, e) {
        row.push($(this).text().trim())
      })
  })
  // console.table(rows)
  // })

  // table.find(".desktopTr").each((i, row) => {

  //   // Fetch the initial data
  //   const { data: html } = await axios.get(initialUrl)

  //   // Load up cheerio
  //   const $ = cheerio.load(html)

  //   // Select the table body element
  //   const table = $("table#shortcodeTable")

  //   // Initialize an empty array to store the table data
  //   const tableData = []

  //   // Iterate over each row of the table using the find and each methods
  //   table.find("tr").each((i, row) => {
  //     // Initialize an empty object to store the row data
  //     const rowData = {}

  //     // Iterate over each cell of the row using the find and each methods
  //     $(row)
  //       .find("td, th")
  //       .each((j, cell) => {
  //         // Add the cell data to the row data object
  //         rowData[$(cell).text()] = j
  //       })

  //     // Add the row data to the table data array
  //     tableData.push(rowData)
  //   })

  //   // Print the table data
  //   console.log(tableData)
}

// -------------------------------------------------------
// -------------------------------------------------------
const testScrape = () => {
  const html = `
    <table>
      <thead>
        <tr>
          <th></th>
          <th>ARRIVAL<br>DATE &amp; TIME</th>
          <th></th>
          <th>DEPARTURE<br>DATE &amp; TIME</th>
          <th>COMPANY</th>
          <th>SHIP NAME</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="load_data">
        <tr class="desktopTr" onclick="showRemaining(1501)">
          <td width="18%" class="day-call">DAY CALL</td>
          <td width="18%" class="textBlue">
            05 MAY <br />
            06:00
          </td>
          <td width="5%" class="textBlue text-center">-</td>
          <td width="18%" class="textBlue">
            05 MAY <br />
            18:00
          </td>
          <td width="18%" class="textBlue">PONANT</td>
          <td width="18%" class="textBlue">LE LYRIAL</td>
          <td width="5%" class="icon">
            <img
              id="arraowImg1501"
              class="arrow"
              src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
            />
          </td>
        </tr>

        <tr
          class="closeTr extra_info desktopTr"
          id="showRem1501"
          style="display: none"
          align="center"
          ;=""
        >
          <td colspan="4" class="tdDesktop">
            <img
              class="image"
              src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Le-Lyrial-scaled.jpg"
            />
          </td>
          <td colspan="3" class="tdDesktop">
            <div class="closeDiv" id="showRemCont1501">
              <p>
                <span class="smallBlueText">LENGTH: </span>
                <span class="normalText">142</span>
              </p>
              <p>
                <span class="smallBlueText">PAX: </span>
                <span class="normalText">184 </span>
              </p>
              <p>
                <span class="smallBlueText">CREW: </span>
                <span class="normalText">112 </span>
              </p>
              <p>
                <span class="smallBlueText">AGENT: </span>
                <span class="normalText">GAC </span>
              </p>
              <p>
                <span class="smallBlueText">BERTH: </span>
                <span class="normalText">POLLOCK </span>
              </p>
              <p>
                <span class="normalText"
                  >Le Lyrial is one of four sister ships in the fleet of Ponant, a
                  French luxury expedition cruise line. The ship holds just 264
                  people but manages to pack a lot into a small space, including a
                  full-service spa, fitness centre and heated swimming pool. The
                  ship has a wonderfully calm vibe, with a sedate elegance and a
                  marine-inspired d��cor. She will call in Belfast once in 2024.
                </span>
              </p>
            </div>
          </td>
        </tr>

        <tr
          class="mobile_Tr row-front frontmobile_Tr"
          onclick="mobile_showRemaining(1501)"
        >
          <td width="45%" class="mobile_textBluelarge">
            <span class="day-call">DAY CALL</span><br />05 MAY <br />
            06:00
          </td>
          <td width="45%" class="cruise-company mobile_textBluelarge">PONANT</td>

          <td width="10%" class="icon">
            <img
              id="mobile_arraowImg1501"
              class="mobile_arrow"
              src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
              width="20px"
            />
          </td>
        </tr>

        <tr
          class="mobile_closeTr mobile_extra_info mobile_Tr"
          id="mobile_showRem1501"
          style="display: none"
          align="center"
          ;=""
        >
          <td colspan="3">
            <div class="mobile_closeDiv" id="mobile_showRemCont1501">
              <p>
                <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
                ><span class="mobile_BlueText"
                  >05 MAY <br />
                  06:00</span
                >
              </p>
              <p>
                <span class="mobile_normalText"
                  >DEPARTURE<br />DATE &amp; TIME </span
                ><span class="mobile_BlueText"
                  >05 MAY <br />
                  18:00</span
                >
              </p>
              <p>
                <span class="mobile_normalText">SHIP NAME </span>
                <span class="mobile_BlueText">LE LYRIAL </span>
              </p>
              <p>
                <span class="mobile_normalText">COMPANY </span>
                <span class="mobile_BlueText">PONANT </span>
              </p>
              <img
                class="mobile_image"
                src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Le-Lyrial-scaled.jpg"
              />

              <div class="mobile_flexContainer">
                <p>
                  <span class="mobile_smallBlueText">LENGTH: </span>
                  <span class="mobile_smallnormalText">142 </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">AGENT: </span>
                  <span class="mobile_smallnormalText">GAC </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">PAX: </span>
                  <span class="mobile_smallnormalText">184 </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">BERTH: </span>
                  <span class="mobile_smallnormalText">POLLOCK </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">CREW: </span>
                  <span class="mobile_smallnormalText">112 </span>
                </p>
              </div>
              <p>
                <span class="mobile_smallnormalText"
                  >Le Lyrial is one of four sister ships in the fleet of Ponant, a
                  French luxury expedition cruise line. The ship holds just 264
                  people but manages to pack a lot into a small space, including a
                  full-service spa, fitness centre and heated swimming pool. The
                  ship has a wonderfully calm vibe, with a sedate elegance and a
                  marine-inspired d��cor. She will call in Belfast once in 2024.
                </span>
              </p>
            </div>
          </td>
        </tr>

        <tr class="desktopTr" onclick="showRemaining(1502)">
          <td width="18%" class="day-call">DAY CALL</td>
          <td width="18%" class="textBlue">
            05 MAY <br />
            11:30
          </td>
          <td width="5%" class="textBlue text-center">-</td>
          <td width="18%" class="textBlue">
            05 MAY <br />
            20:00
          </td>
          <td width="18%" class="textBlue">NORWEGIAN</td>
          <td width="18%" class="textBlue">NORWEGIAN PEARL</td>
          <td width="5%" class="icon">
            <img
              id="arraowImg1502"
              class="arrow"
              src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
            />
          </td>
        </tr>

        <tr
          class="closeTr extra_info desktopTr"
          id="showRem1502"
          style="display: none"
          align="center"
          ;=""
        >
          <td colspan="4" class="tdDesktop">
            <img
              class="image"
              src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Norwegian-pearl.jpg"
            />
          </td>
          <td colspan="3" class="tdDesktop">
            <div class="closeDiv" id="showRemCont1502">
              <p>
                <span class="smallBlueText">LENGTH: </span>
                <span class="normalText">294</span>
              </p>
              <p>
                <span class="smallBlueText">PAX: </span>
                <span class="normalText">2400 </span>
              </p>
              <p>
                <span class="smallBlueText">CREW: </span>
                <span class="normalText">1099 </span>
              </p>
              <p>
                <span class="smallBlueText">AGENT: </span>
                <span class="normalText">HAMILTON </span>
              </p>
              <p>
                <span class="smallBlueText">BERTH: </span>
                <span class="normalText">D1 </span>
              </p>
              <p>
                <span class="normalText"
                  >Norwegian Pearl is a newly refurbished ship featuring a chic
                  bowling alley, 16 delicious dining options, 15 bars and lounges, a
                  night club, a dazzling casino, tranquil spa, and spacious Garden
                  Villas. This Jewel Class cruise ship is a destination in itself.
                  Norwegian Pearl will make one visit to Belfast in 2024. (Image
                  Credit: Cruise Critic).
                </span>
              </p>
            </div>
          </td>
        </tr>

        <tr
          class="mobile_Tr row-front frontmobile_Tr"
          onclick="mobile_showRemaining(1502)"
        >
          <td width="45%" class="mobile_textBluelarge">
            <span class="day-call">DAY CALL</span><br />05 MAY <br />
            11:30
          </td>
          <td width="45%" class="cruise-company mobile_textBluelarge">NORWEGIAN</td>

          <td width="10%" class="icon">
            <img
              id="mobile_arraowImg1502"
              class="mobile_arrow"
              src="https://www.belfast-harbour.co.uk/wp-content/plugins/cruise-listing/includes/assets/arrow-straight.svg"
              width="20px"
            />
          </td>
        </tr>

        <tr
          class="mobile_closeTr mobile_extra_info mobile_Tr"
          id="mobile_showRem1502"
          style="display: none"
          align="center"
          ;=""
        >
          <td colspan="3">
            <div class="mobile_closeDiv" id="mobile_showRemCont1502">
              <p>
                <span class="mobile_normalText">ARRIVAL<br />DATE &amp; TIME </span
                ><span class="mobile_BlueText"
                  >05 MAY <br />
                  11:30</span
                >
              </p>
              <p>
                <span class="mobile_normalText"
                  >DEPARTURE<br />DATE &amp; TIME </span
                ><span class="mobile_BlueText"
                  >05 MAY <br />
                  20:00</span
                >
              </p>
              <p>
                <span class="mobile_normalText">SHIP NAME </span>
                <span class="mobile_BlueText">NORWEGIAN PEARL </span>
              </p>
              <p>
                <span class="mobile_normalText">COMPANY </span>
                <span class="mobile_BlueText">NORWEGIAN </span>
              </p>
              <img
                class="mobile_image"
                src="https://www.belfast-harbour.co.uk/wp-content/uploads/2024/03/Norwegian-pearl.jpg"
              />

              <div class="mobile_flexContainer">
                <p>
                  <span class="mobile_smallBlueText">LENGTH: </span>
                  <span class="mobile_smallnormalText">294 </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">AGENT: </span>
                  <span class="mobile_smallnormalText">HAMILTON </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">PAX: </span>
                  <span class="mobile_smallnormalText">2400 </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">BERTH: </span>
                  <span class="mobile_smallnormalText">D1 </span>
                </p>
                <p>
                  <span class="mobile_smallBlueText">CREW: </span>
                  <span class="mobile_smallnormalText">1099 </span>
                </p>
              </div>
              <p>
                <span class="mobile_smallnormalText"
                  >Norwegian Pearl is a newly refurbished ship featuring a chic
                  bowling alley, 16 delicious dining options, 15 bars and lounges, a
                  night club, a dazzling casino, tranquil spa, and spacious Garden
                  Villas. This Jewel Class cruise ship is a destination in itself.
                  Norwegian Pearl will make one visit to Belfast in 2024. (Image
                  Credit: Cruise Critic).
                </span>
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  `

  // Load the HTML content into a Cheerio object
  const $ = cheerio.load(html)

  // Select the table element
  const table = $("table")

  // Initialize an empty array to store the table data
  const tableData = []

  // console.log($("table").html())
  // console.log($("table > tbody > tr.desktopTr").html())
  // console.log($("tbody > tr:not(.extra_info)").html())  // OK ?
  // console.log($("tbody > tr").html())
  // console.log($("table > tbody > tr.closeTr").html())

  // Initialize an empty object to store the row data
  const rowData = {}

  // ;("p:not(.intro)")

  // Iterate over each row of the table using the find and each methods
  // table.find("tr:not(.extra_info)").each((i, row) => {
  table.find("tr.desktopTr").each((i, row) => {
    // OK
    // Iterate over each cell of the row using the find and each methods
    $(row)
      .find("td")
      // .find("img")
      .each((j, cell) => {
        // Add the cell data to the row data object
        rowData[$(cell).html()] = j
      })
    // Add the row data to the table data array
    tableData.push(rowData)
  })

  // Print the table data
  console.log(tableData)
}

// -------------------------------------------------------
//  Imported from stackoverflow "Cheerio how to remove DOM elements from selection"
// -------------------------------------------------------
const stackoverflowTestScrape = (selector) => {
  // Assume the source html is something like this:
  const html2 = `
<html>
  <head />
  <body>
    <article class="post">
      <h1>Title</h1>
      <p>First paragraph.</p>
      <script>That for some reason has been put here</script>
      <p>Second paragraph.</p>
      <ins>Google ADS</ins>
      <p>Third paragraph.</p>
      <div class="related">A block full of HTML and text</div>
      <p>Forth paragraph.</p>
    </article>
  </body>
</html>
`

  // What I want to achieve is something like
  {
    /* <h1>Title</h1>
<p>First paragraph.</p>
<p>Second paragraph.</p>
<p>Third paragraph.</p>
<p>Forth paragraph.</p> */
  }

  // Where:
  // $ is the cheerio object containing const $ = await cheerio.load(html);
  // selector is the dome selector for the container (in the example above it would be .post)

  let stripFromText = [
    ".social-share",
    "script",
    ".adv-in",
    ".postinfo",
    ".postauthor",
    ".widget",
    ".related",
    "img",
    "p:empty",
    "div:empty",
    "section:empty",
    "ins",
  ]

  const getHTMLContent = async (selector) => {
    const $ = cheerio.load(html2)

    let value
    try {
      let content = $(selector)

      for (const s of stripFromText) {
        console.log(`--- Stripping ${s}`)
        content.find(s).remove()
      }

      value = content.html()
    } catch (e) {
      console.log(`- [!] Unable to get ${selector}`)
    }
    console.log(value)
    // return value
  }

  getHTMLContent(".post")
}
