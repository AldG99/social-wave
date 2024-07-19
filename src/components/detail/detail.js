import React from "react";
import { FaArrowUp, FaArrowDown, FaDownload } from "react-icons/fa";
import { auth } from "../../lib/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
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
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

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
        <p>Somos nosotros contra las máquinas.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Privacidad y ayuda</span>
            <FaArrowUp className="arrowIcon" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Fotos compartidas</span>
            <FaArrowDown className="arrowIcon" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img className="imagen" src={require("../../images/edificio.jpg")} alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <FaDownload className="downloadIcon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Archivos Compartidos</span>
            <FaArrowUp className="arrowIcon" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "¡Estás bloqueado!"
            : isReceiverBlocked
            ? "Usuario bloqueado"
            : "Bloquear usuario"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Salir
        </button>
      </div>
    </div>
  );
};

export default Detail;
