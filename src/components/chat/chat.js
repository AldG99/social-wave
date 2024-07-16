import React, { useEffect, useState, useRef } from "react";
import { FaUserCircle, FaPhone, FaVideo, FaInfoCircle, FaSmile, FaImage, FaCamera, FaMicrophone } from "react-icons/fa"; // Importa los iconos necesarios
import EmojiPicker from "emoji-picker-react";
import "../../styles/chat.scss";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { chatId } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: "smooth" })
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data())
    })

    return () => {
      unSub();
    }
  }, [chatId]);

  const handleEmoji = e => {
    setText((prev) => prev + e.emoji);
    setOpen(false)
  }

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
        {chat?.messages?.map(message => (
            <div className="message own" key={message?.createAt}>
             <div className="texts">
                {message.img && <img className='imagen' src={message.img} alt="" />}
                <p>{message.text}</p>
            {/* <span>{message}</span> */}
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="buttom">
        <div className="icons">
          <FaImage className="icon" />
          <FaCamera className="icon" />
          <FaMicrophone className="icon" />
        </div>
        <input type="text" placeholder="Escribe un mensaje..." value={text} onChange={e => setText(e.target.value)} />
        <div className="emoji">
          <FaSmile className="emojiIcon" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton">Enviar</button>
      </div>
    </div>
  )
}

export default Chat;
