import React, { useEffect, useState } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../../styles/detail/detail.scss";

const continentNames = {
  africa: "África",
  asia: "Asia",
  europe: "Europa",
  "north-america": "América del Norte",
  "south-america": "América del Sur",
  oceania: "Oceanía",
};

const Detail = ({ onProfileClick }) => {
  const [presentation, setPresentation] = useState("");
  const { user } = useChatStore();

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

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar} alt="Avatar" />
        <h2>{user?.username}</h2>
        <h4>{user?.omegaCode}</h4>
        <h3>{continentNames[user?.continent]}</h3>
        <p>{presentation}</p>
        <button onClick={onProfileClick}>
          Perfil de Usuario
        </button>
      </div>
    </div>
  );
};

export default Detail;
