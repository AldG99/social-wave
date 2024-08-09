import React, { useState, useEffect } from "react";
import "../../styles/auth/addUser.scss";
import { FaQuestionCircle } from "react-icons/fa";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, serverTimestamp, where, doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";

const AddUser = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [isUserAdded, setIsUserAdded] = useState(false); // Nuevo estado para verificar si el usuario está agregado
  const { currentUser } = useUserStore();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Verifica si el usuario ya está en los chats cuando el componente se monta
    const checkUserAdded = async () => {
      if (user) {
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChatsSnap = await getDoc(userChatsRef);
        if (userChatsSnap.exists()) {
          const chats = userChatsSnap.data().chats || [];
          const isAdded = chats.some(chat => chat.receiverId === user.id);
          setIsUserAdded(isAdded);
        }
      }
    };

    checkUserAdded();
  }, [user, currentUser.id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const omegaCode = formData.get("omegaCode");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("omegaCode", "==", omegaCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data();
        setUser(foundUser);
      }
    } catch (err) {
      console.error("Error searching user:", err);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      // Verifica si ya existe un chat con este usuario
      const existingChatQuery = query(userChatsRef, where("chats.receiverId", "==", user.id));
      const existingChatSnapshot = await getDocs(existingChatQuery);

      if (!existingChatSnapshot.empty) {
        console.log('El chat con este usuario ya existe.');
        return; // Sal de la función si ya existe un chat
      }

      // Crear un nuevo chat
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createAt: serverTimestamp(),
        message: [],
      });

      console.log('Chat creado:', newChatRef.id);

      // Asegúrate de que los documentos de userchats existen
      const currentUserChatDoc = doc(userChatsRef, currentUser.id);
      const userChatDoc = doc(userChatsRef, user.id);

      const currentUserChatSnap = await getDoc(currentUserChatDoc);
      if (!currentUserChatSnap.exists()) {
        await setDoc(currentUserChatDoc, {
          chats: [],
        });
      }

      const userChatSnap = await getDoc(userChatDoc);
      if (!userChatSnap.exists()) {
        await setDoc(userChatDoc, {
          chats: [],
        });
      }

      // Actualiza los chats de ambos usuarios
      await updateDoc(currentUserChatDoc, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updateAt: Date.now(),
        }),
      });

      console.log(`Chat añadido a ${user.id}`);

      await updateDoc(userChatDoc, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updateAt: Date.now(),
        }),
      });

      console.log(`Chat añadido a ${currentUser.id}`);

      // Actualiza el estado para indicar que el usuario ya está añadido
      setIsUserAdded(true);
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
              <button 
                onClick={handleAdd} 
                disabled={isUserAdded} // Deshabilita el botón si el usuario ya está agregado
              >
                {isUserAdded ? "Ya tienes a este usuario" : "Añadir Usuario"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AddUser;
