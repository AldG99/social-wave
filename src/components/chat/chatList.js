import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import "../../styles/chat/chatList.scss";
import AddUser from "../auth/addUser";
import { useUserStore } from "../../lib/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";

const MAX_LENGTH = 30; // Ajusta este valor según tus necesidades

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;

  let truncated = text.slice(0, maxLength);

  // Asegúrate de que el texto no termine en medio de una palabra
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > -1) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }

  return truncated + '...';
};

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

    userChats[chatIndex].isSeen = true; // Marca el chat como visto
    userChats[chatIndex].hasNewMessage = false; // Marca el chat como sin nuevos mensajes

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
        <div className="app">
          <FaUserPlus
            className={`addIcon ${addMode ? 'active' : ''}`}
            onClick={() => setAddMode(prev => !prev)}
          />
        </div>
      </div>
      <div className="chatListItems">
        {filteredChats.map((chat) => (
          <div
            className={`item ${!chat.isSeen ? 'newMessage' : ''}`} // Aplica la clase newMessage si el chat tiene nuevos mensajes
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{ backgroundColor: !chat.isSeen ? "rgb(110, 180, 180)" : "transparent" }} // Color para nuevos mensajes
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
              <p>{truncateText(chat.lastMessage, MAX_LENGTH)}</p>
            </div>
          </div>
        ))}
      </div>
      {addMode && <AddUser onClose={() => setAddMode(false)} />}
    </div>
  );
};

export default ChatList;
