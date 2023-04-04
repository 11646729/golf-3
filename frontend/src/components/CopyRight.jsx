import React, { memo } from "react"
import { Typography, Link } from "@mui/material"

const CopyRight = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {"Copyright © "}
    <Link color="inherit" href="https://mui.com/">
      My Website
    </Link>
    {` ${new Date().getFullYear()}`}
  </Typography>
)

export default memo(CopyRight)
