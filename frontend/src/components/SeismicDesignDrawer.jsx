import Drawer from "@mui/material/Drawer"
import Button from "@mui/material/Button"
import ListItem from "@mui/material/ListItem"
import { ListItemIcon, ListItemText, ListItemButton, Link } from "@mui/material"
import { PieChartOutline, ShowChart, ScatterPlot } from "@mui/icons-material"

import { useState, memo } from "react"

const data = [
  {
    name: "Array Pattern Design",
    icon: <ScatterPlot />,
    link: "/seismicarraydesignpage",
  },
  {
    name: "2D Array Response Plot",
    icon: <ShowChart />,
    link: "/seismicarraydesignpage",
  },
  {
    name: "3D Array Response Plot",
    icon: <PieChartOutline />,
    link: "/3darrayresponseplotpage",
  },
]

const TestDrawer = () => {
  const [open, setOpen] = useState(false)

  const getList = () => (
    <div style={{ width: 300 }} onClick={() => setOpen(false)}>
      {data.map((item, index) => (
        <ListItem key={index}>
          <ListItemButton component={Link} to={item.link}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </div>
  )
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Change Display</Button>
      <Drawer open={open} anchor={"left"} onClose={() => setOpen(false)}>
        {getList()}
      </Drawer>
    </div>
  )
}

export default memo(TestDrawer)
