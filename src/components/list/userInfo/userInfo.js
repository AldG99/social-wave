import React from "react";
import { useUserStore } from "../../../lib/userStore";
import { FaEllipsisH, FaVideo, FaEdit } from "react-icons/fa";
import "../../../styles/userInfo.scss";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  console.log("currentUser:", currentUser);

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser?.avatar} alt="Avatar" />
        <h2>{currentUser?.username}</h2>
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
