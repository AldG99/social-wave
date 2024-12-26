import React, { useEffect, useState } from 'react';
// Importa React y los hooks `useEffect` y `useState` para manejar efectos secundarios y el estado del componente.

import { FaSearch } from 'react-icons/fa';
// Importa el ícono de búsqueda de `react-icons`.

import { FaUserPlus } from 'react-icons/fa6';
// Importa el ícono para añadir usuarios de `react-icons`.

import '../../styles/chat/chatList.scss';
// Importa los estilos específicos del componente desde un archivo SCSS.

import AddUser from '../auth/addUser';
// Importa el componente `AddUser` que permite agregar nuevos usuarios.

import { useUserStore } from '../../lib/userStore';
// Hook personalizado para acceder al estado global del usuario actual.

import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
// Funciones de Firestore para interactuar con documentos y suscriptores en tiempo real.

import { db } from '../../lib/firebaseConfig';
// Importa la configuración de Firebase Firestore.

import { useChatStore } from '../../lib/chatStore';
// Hook personalizado para manejar el estado global de los chats.

const MAX_LENGTH = 30;
// Longitud máxima para truncar mensajes en la lista de chats.

const truncateText = (text, maxLength) => {
  // Función para truncar texto si excede una longitud máxima.
  if (text.length <= maxLength) return text;
  // Si el texto es más corto que `maxLength`, lo retorna sin cambios.

  let truncated = text.slice(0, maxLength);
  // Recorta el texto hasta el límite establecido.

  const lastSpaceIndex = truncated.lastIndexOf(' ');
  // Encuentra el último espacio en blanco para evitar cortar palabras.

  if (lastSpaceIndex > -1) {
    // Si existe un espacio en blanco, ajusta el texto para truncar en ese punto.
    truncated = truncated.slice(0, lastSpaceIndex);
  }

  return truncated + '...';
  // Añade puntos suspensivos al final del texto truncado.
};

const ChatList = () => {
  // Define el componente principal `ChatList`.

  const [chats, setChats] = useState([]);
  // Estado para almacenar los chats del usuario actual.

  const [addMode, setAddMode] = useState(false);
  // Estado para alternar la visibilidad del componente `AddUser`.

  const [input, setInput] = useState('');
  // Estado para manejar el texto de búsqueda de chats.

  const { currentUser } = useUserStore();
  // Obtiene el usuario actual desde el estado global.

  const { changeChat } = useChatStore();
  // Obtiene la función para cambiar el chat activo desde el estado global.

  useEffect(() => {
    // Efecto para suscribirse en tiempo real a los chats del usuario actual.
    const unSub = onSnapshot(
      doc(db, 'userchats', currentUser.id),
      async res => {
        // Suscriptor en tiempo real al documento de chats del usuario actual.
        if (res.exists()) {
          // Si el documento de chats existe:
          const items = res.data().chats || [];
          // Obtiene los chats desde el documento, o un array vacío si no hay datos.

          const promises = items.map(async item => {
            // Itera sobre los chats para obtener información adicional del usuario.
            const userDocRef = doc(db, 'users', item.receiverId);
            // Referencia al documento del usuario en Firestore.

            const userDocSnap = await getDoc(userDocRef);
            // Recupera los datos del usuario.

            const user = userDocSnap.data();
            // Obtiene los datos del usuario como un objeto.

            return { ...item, user };
            // Combina los datos del chat con los datos del usuario.
          });

          const chatData = await Promise.all(promises);
          // Resuelve todas las promesas y obtiene los datos de todos los chats.

          setChats(chatData.sort((a, b) => b.updateAt - a.updateAt));
          // Ordena los chats por la última actualización y actualiza el estado.
        } else {
          console.log('No se encontraron chats para el usuario actual');
          // Si no hay chats, muestra un mensaje en la consola.

          setChats([]);
          // Limpia el estado de chats.
        }
      }
    );

    return () => {
      // Limpia la suscripción cuando el componente se desmonta.
      unSub();
    };
  }, [currentUser.id]);
  // Ejecuta este efecto cada vez que cambia el ID del usuario actual.

  const handleSelect = async chat => {
    // Función para seleccionar un chat y marcarlo como leído.
    const userChats = chats.map(item => {
      // Copia los chats excluyendo los datos del usuario.
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);
    // Encuentra el índice del chat seleccionado.

    userChats[chatIndex].isSeen = true;
    // Marca el chat como visto.

    userChats[chatIndex].hasNewMessage = false;
    // Marca el chat como sin nuevos mensajes.

    const userChatsRef = doc(db, 'userchats', currentUser.id);
    // Referencia al documento de chats del usuario actual.

    try {
      await updateDoc(userChatsRef, {
        // Actualiza el documento de chats en Firestore.
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
      // Cambia el chat activo utilizando el estado global.
    } catch (err) {
      console.log(err);
      // Maneja errores en la actualización del documento.
    }
  };

  const filteredChats = chats.filter(c =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );
  // Filtra los chats según el texto ingresado en el campo de búsqueda.

  return (
    <div className="chatList">
      {/* Contenedor principal de la lista de chats */}
      <div className="search">
        <div className="searchBar">
          {/* Barra de búsqueda */}
          <FaSearch className="searchIcon" />
          {/* Icono de búsqueda */}
          <input
            type="text"
            placeholder="Buscar"
            onChange={e => setInput(e.target.value)}
          />
          {/* Campo para ingresar texto de búsqueda */}
        </div>
        <div className="app">
          <FaUserPlus
            className={`addIcon ${addMode ? 'active' : ''}`}
            // Icono para alternar la visibilidad del componente `AddUser`.
            onClick={() => setAddMode(prev => !prev)}
          />
        </div>
      </div>
      <div className="chatListItems">
        {/* Lista de chats */}
        {filteredChats.map(chat => (
          // Itera sobre los chats filtrados y los renderiza.
          <div
            className={`item ${!chat.isSeen ? 'newMessage' : ''}`}
            // Clase para destacar chats con nuevos mensajes.
            key={chat.chatId}
            // Clave única para el chat.
            onClick={() => handleSelect(chat)}
            // Llama a `handleSelect` cuando se selecciona el chat.
            style={{
              backgroundColor: !chat.isSeen
                ? 'rgb(110, 180, 180)'
                : 'transparent',
            }}
            // Cambia el color de fondo si el chat tiene mensajes nuevos.
          >
            <img
              src={
                chat.user.blocked.includes(currentUser.id)
                  ? // Si el usuario actual está bloqueado, muestra un avatar genérico.
                    './avatar.png'
                  : chat.user.avatar || './avatar.png'
              }
              alt="Avatar"
            />
            <div className="texts">
              <span>
                {chat.user.blocked.includes(currentUser.id)
                  ? 'Usuario'
                  : chat.user.username}
              </span>
              {/* Nombre del usuario o "Usuario" si está bloqueado */}
              <p>{truncateText(chat.lastMessage, MAX_LENGTH)}</p>
              {/* Último mensaje del chat truncado */}
            </div>
          </div>
        ))}
      </div>
      {addMode && <AddUser onClose={() => setAddMode(false)} />}
      {/* Renderiza el componente `AddUser` si está activo */}
    </div>
  );
};

export default ChatList;
// Exporta el componente para que pueda ser utilizado en otros lugares.
