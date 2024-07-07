import { FaUserCircle } from "react-icons/fa";
import "../../styles/addUser.scss";

const AddUser = () => {
  return (
    <div className="addUser">
      <form>
        <input type="text" placeholder="Username" name="username" />
        <button>Búsqueda</button>
      </form>
      <div className="user">
        <div className="detail">
          <FaUserCircle className="avatar" />
          <span>Will Smith</span>
        </div>
        <button>Añadir Usuario</button>
      </div>
    </div>
  )
}

export default AddUser;
