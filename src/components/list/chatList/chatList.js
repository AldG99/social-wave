import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaMinus } from "react-icons/fa";
import "../../../styles/chatList.scss";
import AddUser from "../../addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebaseConfig";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);

  const { currentUser } = useUserStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (res.exists()) {
        const items = res.data().chats || [];
  
        const promises = items.map(async(item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
  
          const user = userDocSnap.data();
  
          return { ...item, user };
        });
  
        const chatData = await Promise.all(promises);
  
        setChats(chatData.sort((a, b) => b.updateAt - a.updateAt));
      } else {
        console.log("No se encontraron chats para el usuario actual");
        setChats([]);
      }
    });
  
    return () => {
      unSub();
    };
  }, [currentUser.id]);  

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <FaSearch className="searchIcon" />
          <input type="text" placeholder="Buscar" />
        </div>
        {addMode ? (
          <FaMinus className="addIcon" onClick={() => setAddMode((prev) => !prev)} />
        ) : (
          <FaPlus className="addIcon" onClick={() => setAddMode((prev) => !prev)} />
        )}
      </div>
      {chats.map(chat => (
        <div className="item" key={chat.chatId}>
          <img src={chat.user.avatar} alt="Avatar" />
          <div className="texts">
            <span>{chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))};
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
