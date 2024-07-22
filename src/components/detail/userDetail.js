import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../../styles/detail/userDetail.scss";

const continentNames = {
  africa: "África",
  asia: "Asia",
  europe: "Europa",
  "north-america": "América del Norte",
  "south-america": "América del Sur",
  oceania: "Oceanía",
};

const UserDetail = ({ handleBackToChat }) => {
  const [presentation, setPresentation] = useState("");
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  
  // Ref para el contenedor de UserDetail
  const userDetailRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
          setPresentation(userDoc.data().presentation || "Hola a Todos!");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();
  }, [user]);

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });

      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDetailRef.current && !userDetailRef.current.contains(event.target)) {
        handleBackToChat();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleBackToChat]);

  return (
    <div className="userDetail" ref={userDetailRef}>
      <div className="user">
        <img src={user?.avatar} alt="Avatar" />
        <h2>{user?.username}</h2>
        <h3>{continentNames[user?.continent]}</h3>
        <p>{presentation}</p>
        <button onClick={handleBackToChat}>Regresar</button>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "¡Estás bloqueado!"
            : isReceiverBlocked
            ? "Usuario bloqueado"
            : "Bloquear usuario"}
        </button>
      </div>
    </div>
  );
};

export default UserDetail;