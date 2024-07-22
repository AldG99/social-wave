import React, { useState } from "react";
import { useUserStore } from "../../lib/userStore";
import { FaSave, FaUserCircle } from "react-icons/fa";
import "../../styles/user/mainUserInfo.scss";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebaseConfig";
import upload from "../../lib/upload";
import HighlightedStories from "./highlightedStories";

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
      console.log(err);
      setError("Error al guardar la presentación.");
    }
    setLoading(false);
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
        console.log(err);
        setError("Error al guardar el avatar.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="mainUserInfo">
      <div className="user">
        <label htmlFor="avatar-file" className="avatar-label">
          {avatar.url ? (
            <img src={avatar.url} alt="Avatar" />
          ) : (
            <FaUserCircle className="avatarIcon" />
          )}
        </label>
        <input
          type="file"
          id="avatar-file"
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
              maxLength="200"
            />
            <button onClick={handleSavePresentation} disabled={loading}>
              <FaSave className="icon" />
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        ) : (
          <p onClick={() => setIsEditing(true)}>{presentation}</p>
        )}
        {error && <p className="error">{error}</p>}
        <button onClick={handleSaveAvatar} disabled={!avatar.file || loading}>
          {loading ? "Guardando..." : "Guardar Foto"}
        </button>
      </div>
      <button className="logout" onClick={() => auth.signOut()}>
          Salir
        </button>
      <HighlightedStories />
    </div>
  );
};

export default MainUserInfo;
