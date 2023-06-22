import Drawer from "@mui/material/Drawer"
import Button from "@mui/material/Button"
import ListItem from "@mui/material/ListItem"
import { ListItemIcon, ListItemText, ListItemButton, Link } from "@mui/material"
import {
  CheckBoxOutlineBlankOutlined,
  InboxOutlined,
  MailOutline,
} from "@mui/icons-material"

import { useState, memo } from "react"

const data = [
  {
    name: "Array Pattern Design",
    icon: <InboxOutlined />,
    link: "/seismicarraydesignpage",
  },
  {
    name: "2D Array Response Plot",
    icon: <CheckBoxOutlineBlankOutlined />,
    link: "/seismicarraydesignpage",
  },
  {
    name: "3D Array Response Plot",
    icon: <MailOutline />,
    link: "/3darrayresponseplotpage",
  },
]

const TestDrawer = () => {
  const [open, setOpen] = useState(false)

  const getList = () => (
    <div style={{ width: 250 }} onClick={() => setOpen(false)}>
      {data.map((item, index) => (
        <ListItem key={index}>
          <ListItemButton component={Link} to={item.link}>
            {/* <ListItemIcon>{item.icon}</ListItemIcon> */}
            <ListItemText primary={item.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </div>
  )
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Click me</Button>
      <Drawer open={open} anchor={"left"} onClose={() => setOpen(false)}>
        {getList()}
      </Drawer>
    </div>
  )
}

export default memo(TestDrawer)
