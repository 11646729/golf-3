import React, { memo } from "react"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import InboxIcon from "@mui/icons-material/MoveToInbox"
import MailIcon from "@mui/icons-material/Mail"
import Link from "@mui/material/Link"

const SeismicDesignDrawer = () => {
  const [state, setState] = React.useState({
    left: false,
  })

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return
    }

    setState({ ...state, [anchor]: open })
  }

  const list = (anchor) => (
    <Box
      sx={250}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem key={"Pattern Entry"} disablePadding>
          <ListItemButton component={Link} to="/seismicarraydesignpage">
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"Pattern Entry"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={"2D Response"} disablePadding>
          <ListItemButton component={Link} to="/seismicarraydesignpage">
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"2D Response"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={"3D Radial Response"} disablePadding>
          <ListItemButton component={Link} to="/seismicdesignpage">
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"3D Radial Response"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <div>
      {["left"].map((anchor) => (
        <React.Fragment key={anchor}>
          <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  )
}

export default memo(SeismicDesignDrawer)
