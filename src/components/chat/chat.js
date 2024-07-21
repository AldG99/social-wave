import React, { useEffect, useState, useRef } from "react";
import { FaPhone, FaVideo, FaInfoCircle, FaSmile, FaImage } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import "../../styles/chat/chat.scss";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

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

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImg({
        file: file,
        url: URL.createObjectURL(file),
      });
    } else {
      alert("Por favor, seleccione un archivo de imagen válido");
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
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
              userChatsData.chats[chatIndex].lastMessage = text || "Imagen enviada";
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

    setImg({
      file: null,
      url: ""
    });

    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar} alt="Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{user?.subname}</p>
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
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createAt}>
            <div className="texts">
              {message.img && <img className="imagen" src={message.img} alt="" />}
              <p>{message.text}</p>
              <span className="time">{formatDistanceToNow(new Date(message.createAt.toDate()), { locale: es })} atrás</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <FaImage className="icon" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        </div>
        <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "No puedes enviar un mensaje" : "Escribe un mensaje..."} value={text} onChange={(e) => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />
        <div className="emoji">
          <FaSmile className="emojiIcon" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
