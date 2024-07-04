import React from "react";
import { FaUserCircle, FaEllipsisH, FaVideo, FaEdit } from "react-icons/fa"; // Importa los iconos
import "../../../styles/userInfo.scss";

const UserInfo = () => {
  return (
    <div className="userInfo">
      <div className="user">
        <FaUserCircle className="avatar" />
        <h2>Anakin Skywalker</h2>
      </div>
      <div className="icons">
        <FaEllipsisH className="icon" />
        <FaVideo className="icon" />
        <FaEdit className="icon" />
      </div>
    </div>
  )
}

export default UserInfo;
