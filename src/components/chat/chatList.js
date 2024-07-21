import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaMinus } from "react-icons/fa";
import "../../styles/chat/chatList.scss";
import AddUser from "../auth/addUser";
import { useUserStore } from "../../lib/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (res.exists()) {
        const items = res.data().chats || [];

        const promises = items.map(async (item) => {
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

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()));

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <FaSearch className="searchIcon" />
          <input type="text" placeholder="Buscar" onChange={(e) => setInput(e.target.value)} />
        </div>
        {addMode ? (
          <FaMinus className="addIcon" onClick={() => setAddMode((prev) => !prev)} />
        ) : (
          <FaPlus className="addIcon" onClick={() => setAddMode((prev) => !prev)} />
        )}
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt="Avatar"
          />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id) ? "Usuario" : chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;