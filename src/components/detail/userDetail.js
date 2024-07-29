import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import StoriesDetail from "./storiesDetail";
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
  const [newStories, setNewStories] = useState([]);
  const { user } = useChatStore();
  
  const userDetailRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
          setPresentation(userDoc.data().presentation || "Hola a Todos!");
          setNewStories(userDoc.data().newStories || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();
  }, [user]);

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
        <h4>{user?.subname}</h4>
        <h3>{continentNames[user?.continent]}</h3>
        <p>{presentation}</p>
        <button onClick={handleBackToChat}>Regresar</button>
      </div>
      <StoriesDetail stories={newStories} />
    </div>
  );
};

export default UserDetail;
