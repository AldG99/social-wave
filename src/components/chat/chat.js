import React, { useEffect, useState, useRef } from "react";
import { FaUserCircle, FaPhone, FaVideo, FaInfoCircle, FaSmile, FaImage, FaCamera, FaMicrophone } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import "../../styles/chat.scss";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, user } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createAt: new Date(),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          if (userChatsData.chats) {
            const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

            if (chatIndex !== -1) {
              userChatsData.chats[chatIndex].lastMessage = text;
              userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
              userChatsData.chats[chatIndex].updateAt = Date.now();

              await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
              });
            }
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <FaUserCircle className="avatar" />
          <div className="texts">
            <span>John Connor</span>
            <p>Somos nosotros contra las máquinas.</p>
          </div>
        </div>
        <div className="icons">
          <FaPhone className="icon" />
          <FaVideo className="icon" />
          <FaInfoCircle className="icon" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className="message own" key={message?.createAt}>
            <div className="texts">
              {message.img && <img className="imagen" src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <FaImage className="icon" />
          <FaCamera className="icon" />
          <FaMicrophone className="icon" />
        </div>
        <input type="text" placeholder="Escribe un mensaje..." value={text} onChange={(e) => setText(e.target.value)} />
        <div className="emoji">
          <FaSmile className="emojiIcon" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
