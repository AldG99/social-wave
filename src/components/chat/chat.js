import React, { useEffect, useState, useRef } from "react";
import { FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { format, formatDistanceToNow, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import "../../styles/chat/chat.scss";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const CHAR_LIMIT = 275;  // Límite de caracteres
const MESSAGE_INTERVAL = 2000; // Intervalo mínimo en milisegundos

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [warning, setWarning] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState(null);

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

  // Expresión regular mejorada para detectar enlaces
  const containsURL = (text) => {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])|(\bwww\.[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
    return urlPattern.test(text);
  };

  const containsOffensiveWords = (text) => {
    const offensiveWords = ["palabra1", "palabra2"]; // Agrega aquí la lista de palabras ofensivas
    const regex = new RegExp(`\\b(${offensiveWords.join('|')})\\b`, 'i');
    return regex.test(text);
  };

  const handleSend = async () => {
    if (!text.trim()) {
      setWarning("El mensaje no puede estar vacío.");
      return;
    }

    if (text.length > CHAR_LIMIT) {
      setWarning(`El mensaje no puede superar los ${CHAR_LIMIT} caracteres.`);
      return;
    }

    if (containsURL(text)) {
      setWarning("No se permiten enlaces en los mensajes.");
      return;
    }

    if (containsOffensiveWords(text)) {
      setWarning("Tu mensaje contiene palabras ofensivas.");
      return;
    }

    const now = new Date().getTime();
    if (lastMessageTime && now - lastMessageTime < MESSAGE_INTERVAL) {
      setWarning("Debes esperar antes de enviar otro mensaje.");
      return;
    }

    setWarning(""); // Clear any previous warnings

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

      setLastMessageTime(now); // Update the last message time
    } catch (err) {
      console.log(err);
    }

    setText("");
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const daysDifference = differenceInCalendarDays(now, date);

    if (date < oneWeekAgo) {
      return format(date, "dd/MM/yyyy 'a las' hh:mm a", { locale: es });
    } else if (daysDifference === 1) {
      return `ayer a las ${format(date, 'hh:mm a', { locale: es })}`;
    } else if (daysDifference === 0) {
      return `hoy a las ${format(date, 'hh:mm a', { locale: es })}`;
    } else if (daysDifference < 7) {
      return `${format(date, "eeee 'a las' hh:mm a", { locale: es })}`;
    } else {
      const distance = formatDistanceToNow(date, { locale: es });
      return `${distance} a las ${format(date, 'hh:mm a', { locale: es })}`;
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= CHAR_LIMIT) {
      setText(newText);
      setWarning("");
    } else {
      setWarning(`El mensaje no puede superar los ${CHAR_LIMIT} caracteres.`);
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar} alt="Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{user?.uid}</p>
          </div>
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createAt}>
            <div className="texts">
              <p>{message.text}</p>
              <span className="time">{formatTimeAgo(new Date(message.createAt.toDate()))}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "No puedes enviar un mensaje" : "Escribe un mensaje..."}
          value={text}
          onChange={handleTextChange}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        {warning && <div className="warning">{warning}</div>}
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
