import { useState } from "react";
import "../../styles/addUser.scss";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, serverTimestamp, where, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);

  const {currentUser} = useUserStore();

  const handleSearch = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

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
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
  
    try {
      const newChatRef = doc(chatRef)
  
      await setDoc(newChatRef, {
        createAt: serverTimestamp(),
        message: [],
      });
  
      console.log('Chat creado:', newChatRef.id);
  
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updateAt: Date.now(),
        }),
      });
  
      console.log(`Chat añadido a ${user.id}`);
  
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updateAt: Date.now(),
        }),
      });
  
      console.log(`Chat añadido a ${currentUser.id}`);
  
    } catch(err) {
      console.log('Error al añadir chat:', err);
    }
  };

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
        <button onClick={handleAdd}>Añadir Usuario</button>
      </div>}
    </div>
  )
}

export default AddUser;
