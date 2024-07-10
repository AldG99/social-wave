import React from "react";
import { useUserStore } from "../../../lib/userStore";
import { FaEllipsisH, FaVideo, FaEdit } from "react-icons/fa"; // Importa los iconos
import "../../../styles/userInfo.scss";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  console.log("currentUser:", currentUser); // Verifica los datos obtenidos

  return (
    <div className="userInfo">
      <div className="user">
        <img src={require("../../../images/avatar.png")} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <FaEllipsisH className="icon" />
        <FaVideo className="icon" />
        <FaEdit className="icon" />
      </div>
    </div>
  );
};

export default UserInfo;
