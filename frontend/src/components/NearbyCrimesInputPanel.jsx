import React, { memo } from "react"
import PropTypes from "prop-types"
import Title from "./Title"
import "../styles/nearbycrimesinputpanel.scss"

const NearbyCrimesPanelTitle = "Nearby Crimes"
const HomeCheckboxLabel = "Home Location"
const LatestCheckboxLabel = "Latest Available Data"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const NearbyCrimesInputPanel = (props) => {
  const { homeCheckboxStatus, latestCheckboxStatus } = props

  NearbyCrimesInputPanel.propTypes = {
    homeCheckboxStatus: PropTypes.bool,
    latestCheckboxStatus: PropTypes.bool,
  }

  return (
    <div>
      <div className="nearbycrimestitlecontainer">
        <Title>{NearbyCrimesPanelTitle}</Title>
      </div>
      <div className="nearbycrimestablecontainer">
        <input
          type="checkbox"
          name="homeCheckbox"
          defaultChecked={homeCheckboxStatus}
          value="Boat"
        />
        <label htmlFor="homeCheckbox">{HomeCheckboxLabel}</label>

        <input
          type="checkbox"
          name="latestCheckbox"
          defaultChecked={latestCheckboxStatus}
          value="Boat"
        />
        <label htmlFor="latestCheckbox">{LatestCheckboxLabel}</label>

        {/* <FormControlLabel
          style={styles.displayHomeLocationCheckBox}
          control={
            <Checkbox
              color="primary"
              checked={homeCheckbox}
              onChange={handleHomeCheckboxChange}
              name="homeCheckbox"
            />
          }
          label="Home Location"
          labelPlacement="end"
        /> */}
        {/* <FormControlLabel
        style={styles.displayLatestDataCheckBox}
        control={
          <Checkbox
            color="primary"
            checked={latestDataCheckbox}
            onChange={handleLatestDataCheckboxChange}
            name="latestDataCheckbox"
          />
        }
        label="Latest Data"
        labelPlacement="end"
      />
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DatePicker
          style={styles.displayDatePicker}
          name="datePicker"
          views={["year", "month"]}
          label="Year and Month"
          minDate={new Date("2018-01-01")}
          maxDate={new Date("2020-06-01")}
          disabled={latestDataCheckboxEnabled}
          value={selectedDate}
          onChange={(val) => {
            setDateChange(val)
            handleDateInfoChange(val)
          }}
        />
      </MuiPickersUtilsProvider> */}
      </div>
    </div>
  )
}

export default memo(NearbyCrimesInputPanel)
