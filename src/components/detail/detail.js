import React, { useEffect, useState } from "react";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../../styles/detail/detail.scss";

const continentNames = {
  africa: "África",
  asia: "Asia",
  europe: "Europa",
  "north-america": "América del Norte",
  "south-america": "América del Sur",
  oceania: "Oceanía",
};

const Detail = () => {
  const [presentation, setPresentation] = useState("");
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

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

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar} alt="Avatar" />
        <h2>{user?.username}</h2>
        <h4>{user?.subname}</h4>
        <h3>{continentNames[user?.continent]}</h3>
        <p>{presentation}</p>
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

export default Detail;
