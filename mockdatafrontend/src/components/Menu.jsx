import { Link } from "react-router"
import { menu } from "../menuData"
import "../styles/menu.scss"

const Menu = () => {
  return (
    <div className="menu">
      {menu.map((item) => (
        <div className="item" key={item.id}>
          <span className="title">{item.title}</span>
          {item.listItems.map((listitems) => (
            <Link className="listItem" to={listitems.url} key={listitems.id}>
              <img className="listItemIcon" src={listitems.icon} alt="" />
              <span className="listItemTitle">{listitems.title}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Menu
