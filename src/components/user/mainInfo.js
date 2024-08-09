import React, { useState, useEffect } from "react";
import { useUserStore } from "../../lib/userStore";
import { FaSave, FaUserCircle, FaEdit, FaBell } from "react-icons/fa";
import { IoIosLogOut } from 'react-icons/io';
import "../../styles/user/mainInfo.scss";
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db, auth } from "../../lib/firebaseConfig";
import upload from "../../lib/upload";
import UserStories from "./userStories";

const continentNames = {
  africa: "África",
  asia: "Asia",
  europe: "Europa",
  "north-america": "América del Norte",
  "south-america": "América del Sur",
  oceania: "Oceanía",
};

const MainUserInfo = () => {
  const { currentUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [presentation, setPresentation] = useState(currentUser?.presentation || "Hola a Todos!");
  const [avatar, setAvatar] = useState({ file: null, url: currentUser?.avatar || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    // Cargar solicitudes del usuario
    const loadRequests = async () => {
      const requestsRef = doc(db, "requests", currentUser.id);
      const requestsSnap = await getDoc(requestsRef);
      if (requestsSnap.exists()) {
        setRequests(requestsSnap.data().requests || []);
      }
    };

    loadRequests();
  }, [currentUser.id]);

  const handleSavePresentation = async () => {
    if (presentation.trim().length === 0) {
      setError("La presentación no puede estar vacía.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        presentation: presentation.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Error al guardar la presentación.");
    }
    setLoading(false);
  };

  const handleCancelEditing = () => {
    setPresentation(currentUser?.presentation || "Hola a Todos!");
    setAvatar({ file: null, url: currentUser?.avatar || "" });
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSaveAvatar = async () => {
    if (avatar.file) {
      setLoading(true);
      setError(null);
      try {
        const imgUrl = await upload(avatar.file);
        await updateDoc(doc(db, "users", currentUser.id), {
          avatar: imgUrl,
        });
        setAvatar({ ...avatar, url: imgUrl, file: null });
      } catch (err) {
        console.error(err);
        setError("Error al guardar el avatar.");
      }
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (isEditing) {
      handleSaveAvatar();
      handleSavePresentation();
    }
    setIsEditing(!isEditing);
  };

  const handleAcceptRequest = async (requestId, senderId) => {
    try {
      // Verifica si el documento de userchats existe para ambos usuarios
      const currentUserChatDocRef = doc(db, "userchats", currentUser.id);
      const userChatDocRef = doc(db, "userchats", senderId);
  
      const [currentUserChatSnap, userChatSnap] = await Promise.all([
        getDoc(currentUserChatDocRef),
        getDoc(userChatDocRef),
      ]);
  
      if (!currentUserChatSnap.exists()) {
        await setDoc(currentUserChatDocRef, { chats: [] });
      }
      if (!userChatSnap.exists()) {
        await setDoc(userChatDocRef, { chats: [] });
      }
  
      // Crear un nuevo chat
      const chatRef = doc(collection(db, "chats")); // Crear una referencia válida
      await setDoc(chatRef, {
        createAt: serverTimestamp(),
        message: [],
      });
  
      // Actualizar los chats de ambos usuarios
      await Promise.all([
        updateDoc(currentUserChatDocRef, {
          chats: arrayUnion({
            chatId: chatRef.id,
            lastMessage: "",
            receiverId: senderId,
            updateAt: Date.now(),
          }),
        }),
        updateDoc(userChatDocRef, {
          chats: arrayUnion({
            chatId: chatRef.id,
            lastMessage: "",
            receiverId: currentUser.id,
            updateAt: Date.now(),
          }),
        }),
      ]);
  
      // Eliminar la solicitud aceptada
      const requestsRef = doc(db, "requests", currentUser.id);
      await updateDoc(requestsRef, {
        requests: arrayRemove({
          requestId,
          senderId,
        }),
      });
  
      console.log('Solicitud aceptada y chat creado.');
      setRequests(requests.filter(request => request.requestId !== requestId));
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);
    }
  };  

  return (
    <div className="mainUserInfo">
      <div className="user">
        <div className="avatar-container">
          <label
            htmlFor="avatar-file"
            className={`avatar-label ${isEditing ? 'editing' : ''}`}
          >
            {avatar.url ? (
              <img src={avatar.url} alt="Avatar" />
            ) : (
              <FaUserCircle className="avatarIcon" />
            )}
          </label>
          {isEditing && (
            <input
              type="file"
              id="avatar-file"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          )}
        </div>
        <h2>{currentUser?.username}</h2>
        <h4>{currentUser?.omegaCode}</h4>
        <h3>{continentNames[currentUser?.continent]}</h3>
        {isEditing ? (
          <div className="presentation-container">
            <textarea
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
              maxLength="200"
            />
          </div>
        ) : (
          <p>{presentation}</p>
        )}
        <div className="button-container">
          <button onClick={handleEditProfile}>
            {isEditing ? (
              <>
                <FaSave className="icon" />
                {loading ? "Guardando..." : "Guardar"}
              </>
            ) : (
              <>
                <FaEdit className="icon" />
                Editar Perfil
              </>
            )}
          </button>
          {isEditing && (
            <button onClick={handleCancelEditing} className="cancel-btn">
              Cancelar
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </div>
      <button className="logout" onClick={() => auth.signOut()}>
        <IoIosLogOut />
      </button>
      <div className="requests-container">
        <button onClick={() => setShowRequests(!showRequests)}>
          <FaBell /> Solicitudes ({requests.length})
        </button>
        {showRequests && (
          <div className="requests-list">
            {requests.length === 0 ? (
              <p>No tienes nuevas solicitudes.</p>
            ) : (
              requests.map((request) => (
                <div key={request.requestId} className="request">
                  <span>Solicitud de usuario {request.senderId}</span>
                  <button onClick={() => handleAcceptRequest(request.requestId, request.senderId)}>
                    Aceptar
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <UserStories />
    </div>
  );
};

export default MainUserInfo;
