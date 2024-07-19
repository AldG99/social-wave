import React from "react";
import { useUserStore } from "../../lib/userStore";
import { FaEllipsisH, FaEdit } from "react-icons/fa";
import "../../styles/user/mainUserInfo.scss";

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

  return (
    <div className="mainUserInfo">
      <div className="user">
        <img src={currentUser?.avatar} alt="Avatar" />
        <h2>{currentUser?.username}</h2>
        <h4>{currentUser?.subname}</h4>
        <h3>{continentNames[currentUser?.continent]}</h3>
        <p>Somos nosotros contra las máquinas.</p>
      </div>
      <div className="icons">
        <FaEllipsisH className="icon" />
        <FaEdit className="icon" />
      </div>
    </div>
  );
};

export default MainUserInfo;
