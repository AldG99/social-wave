import React, { useState } from "react";
import "../../styles/auth/addUser.scss";
import { FaQuestionCircle } from "react-icons/fa";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, serverTimestamp, where, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";

const AddUser = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const omegaCode = formData.get("omegaCode");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("omegaCode", "==", omegaCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (err) {
      console.error("Error searching user:", err);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

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
    } catch (err) {
      console.error('Error al añadir chat:', err);
    }
  };

  const toggleTooltip = () => {
    setTooltipVisible(!tooltipVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose(); // Notify parent to close AddUser
  };

  return (
    <>
      {isVisible && (
        <div className="addUser">
          <button className="close-btn" onClick={handleClose}>×</button>
          <form onSubmit={handleSearch}>
            <span className="omega-code-container">
              Ingresa el Código Omega del contacto que deseas añadir.
              <FaQuestionCircle 
                className="info-icon" 
                onClick={toggleTooltip} 
              />
              {tooltipVisible && (
                <div className="info-tooltip">
                  <p>¿Qué es el Código Omega?</p>
                  <p>Es una clave única asignada automáticamente a cada contacto al registrarse, facilitando su búsqueda y gestión.</p>
                  <p>¿Dónde encontrarlo?</p>
                  <p>Está ubicado en el perfil, justo debajo del nombre completo.</p>
                </div>
              )}
            </span>
            <input type="text" placeholder="XXYY0000-ZZ0000-0000" name="omegaCode" />
            <button type="submit">Buscar</button>
          </form>
          {user && (
            <div className="user">
              <div className="detail">
                <img src={user.avatar} alt="Avatar" />
                <span>{user.username}</span>
              </div>
              <button onClick={handleAdd}>Añadir Usuario</button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AddUser;
