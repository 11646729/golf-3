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
    console.log(anchor)

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
      sx={{ display: "flex" }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      {/* <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}

      <List>
        <ListItem key={"Array Pattern Design"} disablePadding>
          <ListItemButton component={Link} to="/seismicarraydesignpage">
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"Array Pattern Design"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={"2D Array Response Plot"} disablePadding>
          <ListItemButton component={Link} to="/seismicarraydesignpage">
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"2D Array Response Plot"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={"3D Array Response Plot"} disablePadding>
          <ListItemButton component={Link} to="/3darrayresponseplotpage">
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"3D Array Response Plot"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <div>
      {["Change Screens"].map((anchor) => (
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
