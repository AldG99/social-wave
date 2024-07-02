import React, { useState } from "react";
import { FaSearch, FaPlus, FaMinus } from 'react-icons/fa'; // Importa los iconos necesarios
import "../../../styles/chatList.scss"

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
    </div>
  )
}

export default ChatList;
