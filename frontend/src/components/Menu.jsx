import { Link } from "react-router-dom"
import "./menu.scss"

const Menu = () => {
  return (
    <div className="menu">
      <div className="item">
        <span className="title">Main</span>
        <Link to="/rawdatapage">
          <img className="listItemIcon" src="" alt="" />
          <span className="listItemTitle">Raw Data</span>
        </Link>
        <Link to="/">
          <img className="listItemIcon" src="" alt="" />
          <span className="listItemTitle">Profile</span>
        </Link>
      </div>
      <div className="item">
        <span className="title">Weather</span>
        <Link to="/weatherpage">
          <img className="listItemIcon" src="" alt="" />
          <span className="listItemTitle">Weather</span>
        </Link>
      </div>
      <div className="item">
        <span className="title">Seismic Array Design</span>
        <Link to="/seismicarraydesignpage">
          <img
            className="listItemIcon"
            src="/static/images/scatter_plot_black_24dp.svg"
            alt=""
          />
          <span className="listItemTitle">Array Design</span>
        </Link>
        <Link to="/seismicarraydesignpage">
          <img
            className="listItemIcon"
            src="/static/images/ssid_chart_black_24dp.svg"
            alt=""
          />
          <span className="listItemTitle">2D Radial Design</span>
        </Link>
        <Link to="/3darrayresponseplotpage">
          <img
            className="listItemIcon"
            src="/static/images/pie_chart_outline_black_24dp.svg"
            alt=""
          />
          <span className="listItemTitle">3D Radial Design</span>
        </Link>
      </div>
    </div>
  )
}
export default Menu
