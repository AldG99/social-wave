import { useState } from "react";
import "../../styles/addUser.scss";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

const AddUser = () => {
  const [user, setUser] = useState(null)

  const handleSearch = async e => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const username = formData.get("username")

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));
      const querySnapShop = await getDocs(q);

      if(!querySnapShop.empty) {
        setUser(querySnapShop.docs[0].data());
      }

    } catch(err) {
      console.log(err);
    }
  }
  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Búsqueda</button>
      </form>
      {user && <div className="user">
        <div className="detail">
          <img src={user.avatar} alt="Avatar" />
          <span>{user.username}</span>
        </div>
        <button>Añadir Usuario</button>
      </div>}
    </div>
  )
}

export default AddUser;
