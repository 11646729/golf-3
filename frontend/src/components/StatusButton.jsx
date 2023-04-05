import React, { memo, useState } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

const theme = {
  greensalmon: {
    truebackcolor: "lightgreen",
    falsebackcolor: "salmon",
    truetextcolor: "white",
    falsetextcolor: "black",
    hover: "#105b72c2",
  },
}

// const StyledButton = styled.button`
//   padding: 5px 7px;
//   border: none;
//   border-radius: 10px;
//   margin: auto;
//   display: block;
//   color: ${(props) => theme[props.theme].textcolor};
//   background-color: ${(props) => theme[props.theme].backcolor};

//   &:hover {
//     background-color: ${(props) => theme[props.theme].hover};
//   }
//   &:disabled {
//     cursor: default;
//     opacity: 0.7;
//   }
// `

// StyledButton.defaultProps = {
//   theme: "greensalmon",
// }

const StyledButtonTrue = styled.button`
  padding: 5px 7px;
  border: none;
  border-radius: 10px;
  margin: auto;
  display: block;
  color: ${(props) => theme[props.theme].truetextcolor};
  background-color: ${(props) => theme[props.theme].truebackcolor};

  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`

StyledButtonTrue.defaultProps = {
  theme: "greensalmon",
}

const StyledButtonFalse = styled.button`
  padding: 5px 7px;
  border: none;
  border-radius: 10px;
  margin: auto;
  display: block;
  color: ${(props) => theme[props.theme].falsetextcolor};
  background-color: ${(props) => theme[props.theme].falsebackcolor};

  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`

StyledButtonFalse.defaultProps = {
  theme: "greensalmon",
}

// Status: 0 - 3
// StateText: Local Variable ?

const StatusButton = (props) => {
  const { stateText, onShow } = props
  const [isActive, setIsActive] = useState(false)

  StatusButton.propTypes = {
    stateText: PropTypes.string,
    onShow: PropTypes.func.isRequired,
  }

  return (
    <div>
      {isActive ? (
        <StyledButtonFalse onClick={() => setIsActive(true)}>
          {stateText}
        </StyledButtonFalse>
      ) : (
        <StyledButtonTrue onClick={() => setIsActive(false)}>
          {stateText}
        </StyledButtonTrue>
      )}

      {/* {status === true ? (
        <StyledButtonFalse onClick={onShow}>{stateText}</StyledButtonFalse>
      ) : (
        <StyledButtonTrue onClick={onShow}>{stateText}</StyledButtonTrue>
      )} */}
    </div>
  )
}

export default memo(StatusButton)
