// ============== IMPORTACIONES ==============
// React y sus hooks principales
import React, { useEffect, useState, useRef } from 'react';
// useEffect: Para efectos secundarios (lifecycle)
// useState: Para manejar estado local
// useRef: Para referencias a elementos DOM

// Importamos el ícono de sonrisa de react-icons
import { FaSmile } from 'react-icons/fa';
// Importamos el selector de emojis
import EmojiPicker from 'emoji-picker-react';

// Funciones para manejo de fechas de la librería date-fns
import {
  format,
  formatDistanceToNow,
  differenceInCalendarDays,
} from 'date-fns';
// Importamos la localización en español para las fechas
import { es } from 'date-fns/locale';

// Importamos los estilos SCSS del chat
import '../../styles/chat/chat.scss';

// Funciones de Firebase Firestore para manejo de base de datos
import {
  arrayUnion, // Para agregar elementos a un array en Firestore
  doc, // Para referenciar documentos
  getDoc, // Para obtener documentos
  onSnapshot, // Para escuchar cambios en tiempo real
  updateDoc, // Para actualizar documentos
} from 'firebase/firestore';
// Importamos la instancia de Firebase configurada
import { db } from '../../lib/firebaseConfig';

// Stores personalizados para manejo de estado global
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

// ============== CONSTANTES ==============
// Definimos el límite de caracteres para cada mensaje
const CHAR_LIMIT = 275;
// Definimos el intervalo mínimo entre mensajes (2 segundos en milisegundos)
const MESSAGE_INTERVAL = 2000;

// ============== COMPONENTE PRINCIPAL ==============
const Chat = () => {
  // ============== ESTADOS (useState) ==============
  // Estado para almacenar los datos del chat actual
  const [chat, setChat] = useState();
  // Estado para controlar si el selector de emojis está abierto
  const [open, setOpen] = useState(false);
  // Estado para el texto del mensaje que se está escribiendo
  const [text, setText] = useState('');
  // Estado para mensajes de advertencia/error
  const [warning, setWarning] = useState('');
  // Estado para controlar el tiempo entre mensajes
  const [lastMessageTime, setLastMessageTime] = useState(null);

  // ============== STORES GLOBALES ==============
  // Obtenemos la información del usuario actual del store
  const { currentUser } = useUserStore();
  // Obtenemos la información del chat actual y estados de bloqueo
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  // ============== REFERENCIAS (useRef) ==============
  // Referencia al último mensaje para hacer auto-scroll
  const endRef = useRef(null);

  // ============== EFECTOS (useEffect) ==============
  // Efecto para hacer scroll automático cuando hay nuevos mensajes
  useEffect(() => {
    // Si existe la referencia, hacemos scroll suave hacia ella
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]); // Se ejecuta cada vez que chat cambia

  // Efecto para suscribirse a cambios en el chat en tiempo real
  useEffect(() => {
    // Creamos un listener para los cambios en el documento del chat
    const unSub = onSnapshot(doc(db, 'chats', chatId), res => {
      // Actualizamos el estado con los nuevos datos
      setChat(res.data());
    });

    // Función de limpieza que se ejecuta al desmontar el componente
    return () => {
      unSub(); // Cancelamos la suscripción
    };
  }, [chatId]); // Se ejecuta cuando cambia el chatId

  // ============== FUNCIONES AUXILIARES ==============
  // Función para manejar la selección de emojis
  const handleEmoji = e => {
    // Agregamos el emoji seleccionado al texto actual
    setText(prev => prev + e.emoji);
    // Cerramos el selector de emojis
    setOpen(false);
  };

  // Función para detectar URLs en el texto usando expresiones regulares
  const containsURL = text => {
    // Patrón regex para detectar URLs (http, https, ftp, www)
    const urlPattern =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])|(\bwww\.[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
    return urlPattern.test(text);
  };

  // Función para detectar palabras ofensivas
  const containsOffensiveWords = text => {
    // Array de palabras prohibidas (añadir según necesidades)
    const offensiveWords = ['palabra1', 'palabra2'];
    // Creamos un patrón regex con todas las palabras
    const regex = new RegExp(`\\b(${offensiveWords.join('|')})\\b`, 'i');
    return regex.test(text);
  };

  // ============== MANEJADOR DE ENVÍO DE MENSAJES ==============
  const handleSend = async () => {
    // ===== VALIDACIONES =====
    // Verificamos que el mensaje no esté vacío
    if (!text.trim()) {
      setWarning('El mensaje no puede estar vacío.');
      return;
    }

    // Verificamos el límite de caracteres
    if (text.length > CHAR_LIMIT) {
      setWarning(`El mensaje no puede superar los ${CHAR_LIMIT} caracteres.`);
      return;
    }

    // Verificamos que no contenga URLs
    if (containsURL(text)) {
      setWarning('No se permiten enlaces en los mensajes.');
      return;
    }

    // Verificamos palabras ofensivas
    if (containsOffensiveWords(text)) {
      setWarning('Tu mensaje contiene palabras ofensivas.');
      return;
    }

    // Verificamos el intervalo entre mensajes
    const now = new Date().getTime();
    if (lastMessageTime && now - lastMessageTime < MESSAGE_INTERVAL) {
      setWarning('Debes esperar antes de enviar otro mensaje.');
      return;
    }

    // Limpiamos cualquier advertencia previa
    setWarning('');

    try {
      // ===== ACTUALIZACIÓN DE FIREBASE =====
      // Agregamos el nuevo mensaje al array de mensajes en Firestore
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createAt: new Date(),
        }),
      });

      // Actualizamos la información del último mensaje para ambos usuarios
      const userIDs = [currentUser.id, user.id];

      // Iteramos sobre ambos usuarios para actualizar sus chats
      userIDs.forEach(async id => {
        const userChatsRef = doc(db, 'userchats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          if (userChatsData.chats) {
            // Encontramos el índice del chat actual
            const chatIndex = userChatsData.chats.findIndex(
              c => c.chatId === chatId
            );

            if (chatIndex !== -1) {
              // Actualizamos la información del último mensaje
              userChatsData.chats[chatIndex].lastMessage = text;
              userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
              userChatsData.chats[chatIndex].updateAt = Date.now();

              // Guardamos los cambios en Firestore
              await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
              });
            }
          }
        }
      });

      // Actualizamos el tiempo del último mensaje
      setLastMessageTime(now);
    } catch (err) {
      console.log(err);
    }

    // Limpiamos el campo de texto
    setText('');
  };

  // ============== FORMATEO DE FECHAS ==============
  const formatTimeAgo = date => {
    const now = new Date();
    // Calculamos la fecha de hace una semana
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Calculamos la diferencia en días
    const daysDifference = differenceInCalendarDays(now, date);

    // Retornamos diferentes formatos según la antigüedad
    if (date < oneWeekAgo) {
      // Para mensajes de más de una semana
      return format(date, "dd/MM/yyyy 'a las' hh:mm a", { locale: es });
    } else if (daysDifference === 1) {
      // Para mensajes de ayer
      return `ayer a las ${format(date, 'hh:mm a', { locale: es })}`;
    } else if (daysDifference === 0) {
      // Para mensajes de hoy
      return `hoy a las ${format(date, 'hh:mm a', { locale: es })}`;
    } else if (daysDifference < 7) {
      // Para mensajes de esta semana
      return `${format(date, "eeee 'a las' hh:mm a", { locale: es })}`;
    } else {
      // Para otros casos
      const distance = formatDistanceToNow(date, { locale: es });
      return `${distance} a las ${format(date, 'hh:mm a', { locale: es })}`;
    }
  };

  // Manejador para cambios en el campo de texto
  const handleTextChange = e => {
    const newText = e.target.value;
    // Verificamos que no exceda el límite de caracteres
    if (newText.length <= CHAR_LIMIT) {
      setText(newText);
      setWarning('');
    } else {
      setWarning(`El mensaje no puede superar los ${CHAR_LIMIT} caracteres.`);
    }
  };

  // ============== RENDERIZADO DEL COMPONENTE ==============
  return (
    <div className="chat">
      {/* Cabecera del chat - Muestra información del usuario */}
      <div className="top">
        <div className="user">
          <img src={user?.avatar} alt="Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{user?.uid}</p>
          </div>
        </div>
      </div>

      {/* Centro del chat - Lista de mensajes */}
      <div className="center">
        {/* Iteramos sobre los mensajes y los renderizamos */}
        {chat?.messages?.map(message => (
          <div
            // Clase condicional: 'message own' para mensajes propios, 'message' para otros
            className={
              message.senderId === currentUser?.id ? 'message own' : 'message'
            }
            key={message?.createAt}
          >
            <div className="texts">
              <p>{message.text}</p>
              {/* Mostramos el tiempo formateado */}
              <span className="time">
                {formatTimeAgo(new Date(message.createAt.toDate()))}
              </span>
            </div>
          </div>
        ))}
        {/* Referencia para auto-scroll */}
        <div ref={endRef}></div>
      </div>

      {/* Parte inferior - Entrada de mensaje y controles */}
      <div className="bottom">
        {/* Campo de entrada de texto */}
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? 'No puedes enviar un mensaje'
              : 'Escribe un mensaje...'
          }
          value={text}
          onChange={handleTextChange}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />

        {/* Mostrar advertencias si existen */}
        {warning && <div className="warning">{warning}</div>}

        {/* Selector de emojis */}
        <div className="emoji">
          <FaSmile
            className="emojiIcon"
            onClick={() => setOpen(prev => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>

        {/* Botón de enviar */}
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

// Exportamos el componente para poder utilizarlo en otras partes de la aplicación
export default Chat;
