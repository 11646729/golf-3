import { Link } from "react-router-dom"
import "./menu.scss"

const Menu = () => {
  return (
    <div className="menu">
      <div className="item">
        <span className="title">MAIN</span>
        <Link to="/rawdatapage">
          <img src="" alt="" />
          <span className="listItemTitle">Raw Data</span>
        </Link>
        <Link to="/">
          <img src="" alt="" />
          <span className="listItemTitle">Profile</span>
        </Link>
      </div>
      <div className="item">
        <span className="title">Seismic Array Design</span>
        <Link to="/seismicarraydesignpage">
          <img src="" alt="" />
          <span className="listItemTitle">Array Design</span>
        </Link>
        {/* <Link to="/">
          <img src="" alt="" />
          <span className="listItemTitle">2D Radial Design</span>
        </Link> */}
        <Link to="/3darrayresponseplotpage">
          <img src="" alt="" />
          <span className="listItemTitle">3D Radial Design</span>
        </Link>
      </div>
    </div>
  )
}
export default Menu
