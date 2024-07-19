import React, { useState } from "react";
import { useUserStore } from "../../lib/userStore";
import { FaEllipsisH, FaEdit, FaSave, FaUserCircle } from "react-icons/fa";
import "../../styles/user/mainUserInfo.scss";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import upload from "../../lib/upload";

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

  const handleSavePresentation = async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        presentation: presentation,
      });
      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
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
      try {
        const imgUrl = await upload(avatar.file);
        await updateDoc(doc(db, "users", currentUser.id), {
          avatar: imgUrl,
        });
        setAvatar({ ...avatar, url: imgUrl });
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="mainUserInfo">
      <div className="user">
        <label htmlFor="file" className="avatar-label">
          {avatar.url ? (
            <img src={avatar.url} alt="Avatar" />
          ) : (
            <FaUserCircle className="avatarIcon" />
          )}
        </label>
        <input
          type="file"
          id="file"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
        <h2>{currentUser?.username}</h2>
        <h4>{currentUser?.subname}</h4>
        <h3>{continentNames[currentUser?.continent]}</h3>
        {isEditing ? (
          <div className="presentation-container">
            <textarea
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
            />
            <button onClick={handleSavePresentation}>
              <FaSave className="icon" />
            </button>
          </div>
        ) : (
          <p onClick={() => setIsEditing(true)}>{presentation}</p>
        )}
        <button onClick={handleSaveAvatar} disabled={!avatar.file}>
          Guardar Foto
        </button>
      </div>
      <div className="icons">
        <FaEllipsisH className="icon" />
        <FaEdit className="icon" onClick={() => setIsEditing(true)} />
      </div>
    </div>
  );
};

export default MainUserInfo;
