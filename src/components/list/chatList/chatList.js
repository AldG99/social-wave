import React, { useState } from "react";
import { FaSearch, FaPlus, FaMinus, FaUserCircle } from "react-icons/fa"; // Importa los iconos necesarios
import "../../../styles/chatList.scss";
import AddUser from "../../addUser/addUser";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <FaSearch className="searchIcon" />
          <input type="text" placeholder="Buscar" />
        </div>
        {addMode ? (
          <FaMinus className="addIcon" onClick={() => setAddMode((prev) => !prev)} />
        ) : (
          <FaPlus className="addIcon" onClick={() => setAddMode((prev) => !prev)} />
        )}
      </div>
      <div className="item">
        <FaUserCircle className="avatar" />
        <div className="texts">
          <span>John Connor</span>
          <p>Hola!</p>
        </div>
      </div>
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
