import React, { useEffect, useState, useRef } from "react";
import { FaUserCircle, FaPhone, FaVideo, FaInfoCircle, FaSmile, FaImage, FaCamera, FaMicrophone } from "react-icons/fa"; // Importa los iconos necesarios
import EmojiPicker from "emoji-picker-react";
import "../../styles/chat.scss";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: "smooth" })
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", "RAqkOcn4tgcdeQ63jExe"), (res) => {
      setChat(res.data())
    })

    return () => {
      unSub();
    }
  }, []);

  console.log(chat);

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
        <div className="message">
          <FaUserCircle className="avatar" />
          <div className="texts">
            <p>¡Tú eras el Elegido! ¡Se suponía que destruirías a los Sith, no que te unieras a ellos! ¡Traerías el equilibrio a la Fuerza, no que la dejaras en la oscuridad!</p>
            <span>Hace 1 minuto</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
            <p>Hola!!!</p>
            <span>Hace 1 minuto</span>
          </div>
        </div>
        <div className="message">
          <FaUserCircle className="avatar" />
          <div className="texts">
            <p>Hola!!!</p>
            <span>Hace 1 minuto</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
            <p>Hola!!!</p>
            <span>Hace 1 minuto</span>
          </div>
        </div>
        <div className="message">
          <FaUserCircle className="avatar" />
          <div className="texts">
            <p>Hola!!!</p>
            <span>Hace 1 minuto</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
            <img className='imagen' src={require("../../images/ola.jpg")} alt="" />
            <p>Holaaaaaaaaaaaaa!!!</p>
            <span>Hace 1 minuto</span>
          </div>
        </div>
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
