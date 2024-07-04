import React from "react";
import { FaUserCircle, FaArrowUp, FaArrowDown, FaDownload } from "react-icons/fa"; // Importa los iconos necesarios
import "../../styles/detail.scss";

const Detail = () => {
  return (
    <div className="detail">
      <div className="user">
        <FaUserCircle className="avatar" />
        <h2>John Connor</h2>
        <p>Somos nosotros contra las máquinas.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Configuración del Chat</span>
            <FaArrowUp className="arrowIcon" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Configuración del Chat</span>
            <FaArrowUp className="arrowIcon" />
          </div>
        </div>
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
            <div className="photoItem">
              <div className="photoDetail">
                <img className="imagen" src={require("../../images/edificio.jpg")} alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <FaDownload className="downloadIcon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img className="imagen" src={require("../../images/edificio.jpg")} alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <FaDownload className="downloadIcon" />
            </div>
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
        <button>Bloquear usuario</button>
        <button className="logout">Salir</button>
      </div>
    </div>
  )
}

export default Detail;
