import React, { useState, useEffect } from "react";
import "../../styles/auth/addUser.scss";
import { FaQuestionCircle } from "react-icons/fa";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";

const AddUser = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false); // Nuevo estado
  const { currentUser } = useUserStore();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkRequestSent = async () => {
      if (user) {
        const requestsRef = doc(db, "requests", currentUser.id);
        const requestsSnap = await getDoc(requestsRef);
        if (requestsSnap.exists()) {
          const requests = requestsSnap.data().requests || [];
          const isSent = requests.some(request => request.receiverId === user.id);
          setIsRequestSent(isSent);
        }

        // Verificar si ya existe un chat entre los usuarios
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChatsSnap = await getDoc(userChatsRef);
        if (userChatsSnap.exists()) {
          const chats = userChatsSnap.data().chats || [];
          const alreadyConnected = chats.some(chat => chat.receiverId === user.id);
          setIsAlreadyConnected(alreadyConnected);
        }
      }
    };

    checkRequestSent();
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

  const handleSendRequest = async () => {
    try {
      const requestsRef = doc(db, "requests", user.id);
      const requestsSnap = await getDoc(requestsRef);
      let requests = requestsSnap.exists() ? requestsSnap.data().requests : [];

      const requestExists = requests.some(request => request.senderId === currentUser.id);
      if (requestExists) {
        console.log('La solicitud ya ha sido enviada.');
        return;
      }

      requests.push({ senderId: currentUser.id, requestId: new Date().getTime() });

      await setDoc(requestsRef, { requests });
      console.log('Solicitud enviada correctamente.');
      setIsRequestSent(true);
    } catch (err) {
      console.error('Error al enviar la solicitud:', err);
    }
  };

  const toggleTooltip = () => {
    setTooltipVisible(!tooltipVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
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
                onClick={handleSendRequest} 
                disabled={isRequestSent || isAlreadyConnected} // Deshabilita el botón si ya está conectado o la solicitud está enviada
              >
                {isAlreadyConnected 
                  ? "Ya estás conectado"
                  : isRequestSent 
                  ? "Solicitud Enviada" 
                  : "Enviar Solicitud"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AddUser;
