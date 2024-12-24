import React, { useState, useEffect } from 'react';
// Importa React y los hooks `useState` y `useEffect` para manejar el estado y los efectos secundarios.

import '../../styles/auth/addUser.scss';
// Importa los estilos específicos del componente desde un archivo SCSS.

import { FaQuestionCircle } from 'react-icons/fa';
// Importa un ícono específico de la biblioteca `react-icons`.

import { db } from '../../lib/firebaseConfig';
// Importa la configuración de Firebase Firestore.

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
// Importa funciones de Firestore para interactuar con la base de datos.

import { useUserStore } from '../../lib/userStore';
// Importa un hook personalizado para acceder al estado del usuario actual.

const AddUser = ({ onClose }) => {
  // Define el componente `AddUser`, que recibe la función `onClose` como prop.

  const [user, setUser] = useState(null);
  // Estado para almacenar los datos del usuario buscado.

  const [isRequestSent, setIsRequestSent] = useState(false);
  // Estado para indicar si ya se ha enviado una solicitud de conexión.

  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false);
  // Estado para verificar si el usuario ya está conectado.

  const { currentUser } = useUserStore();
  // Obtiene el usuario actual desde el estado global mediante el hook `useUserStore`.

  const [tooltipVisible, setTooltipVisible] = useState(false);
  // Estado para mostrar u ocultar el tooltip de ayuda.

  const [isVisible, setIsVisible] = useState(true);
  // Estado para controlar si el componente está visible.

  useEffect(() => {
    // Hook que ejecuta lógica cada vez que `user` o `currentUser.id` cambian.
    const checkRequestSent = async () => {
      // Función para verificar si ya se envió una solicitud y si los usuarios ya están conectados.
      if (user) {
        // Solo ejecuta la lógica si hay un usuario buscado.
        const requestsRef = doc(db, 'requests', currentUser.id);
        // Obtiene la referencia al documento de solicitudes del usuario actual.

        const requestsSnap = await getDoc(requestsRef);
        // Recupera los datos del documento de solicitudes.

        if (requestsSnap.exists()) {
          // Verifica si el documento de solicitudes existe.
          const requests = requestsSnap.data().requests || [];
          // Obtiene el array de solicitudes, o un array vacío si no existen.

          const isSent = requests.some(
            request => request.receiverId === user.id
          );
          // Verifica si ya se envió una solicitud al usuario buscado.

          setIsRequestSent(isSent);
          // Actualiza el estado indicando si la solicitud ya fue enviada.
        }

        const userChatsRef = doc(db, 'userchats', currentUser.id);
        // Obtiene la referencia a los chats del usuario actual.

        const userChatsSnap = await getDoc(userChatsRef);
        // Recupera los datos del documento de chats.

        if (userChatsSnap.exists()) {
          // Verifica si el documento de chats existe.
          const chats = userChatsSnap.data().chats || [];
          // Obtiene el array de chats, o un array vacío si no existen.

          const alreadyConnected = chats.some(
            chat => chat.receiverId === user.id
          );
          // Verifica si ya hay un chat con el usuario buscado.

          setIsAlreadyConnected(alreadyConnected);
          // Actualiza el estado indicando si ya están conectados.
        }
      }
    };

    checkRequestSent();
    // Llama a la función al iniciar el efecto.
  }, [user, currentUser.id]);
  // Ejecuta este efecto cada vez que `user` o `currentUser.id` cambian.

  const handleSearch = async e => {
    // Función para buscar un usuario basado en su UID.
    e.preventDefault();
    // Previene el comportamiento por defecto del formulario.

    const formData = new FormData(e.target);
    // Obtiene los datos del formulario.

    const uid = formData.get('uid');
    // Extrae el valor del campo `uid`.

    try {
      const userRef = collection(db, 'users');
      // Referencia a la colección de usuarios en Firestore.

      const q = query(userRef, where('uid', '==', uid));
      // Construye una consulta para buscar un usuario por UID.

      const querySnapshot = await getDocs(q);
      // Ejecuta la consulta y obtiene los resultados.

      if (!querySnapshot.empty) {
        // Verifica si se encontró algún usuario.
        const foundUser = querySnapshot.docs[0].data();
        // Obtiene los datos del primer usuario encontrado.

        setUser(foundUser);
        // Almacena los datos del usuario en el estado.
      }
    } catch (err) {
      console.error('Error searching user:', err);
      // Maneja errores en la búsqueda de usuarios.
    }
  };

  const handleSendRequest = async () => {
    // Función para enviar una solicitud de conexión.
    try {
      const requestsRef = doc(db, 'requests', user.id);
      // Referencia al documento de solicitudes del usuario buscado.

      const requestsSnap = await getDoc(requestsRef);
      // Recupera los datos del documento de solicitudes.

      let requests = requestsSnap.exists() ? requestsSnap.data().requests : [];
      // Obtiene el array de solicitudes existentes, o un array vacío si no existen.

      const requestExists = requests.some(
        request => request.senderId === currentUser.id
      );
      // Verifica si ya se envió una solicitud a este usuario.

      if (requestExists) {
        // Si la solicitud ya existe, no hace nada.
        console.log('La solicitud ya ha sido enviada.');
        return;
      }

      requests.push({
        senderId: currentUser.id,
        requestId: new Date().getTime(),
      });
      // Añade una nueva solicitud al array con el ID del remitente y un ID único.

      await setDoc(requestsRef, { requests });
      // Guarda las solicitudes actualizadas en Firestore.

      console.log('Solicitud enviada correctamente.');
      setIsRequestSent(true);
      // Actualiza el estado para indicar que la solicitud fue enviada.
    } catch (err) {
      console.error('Error al enviar la solicitud:', err);
      // Maneja errores al enviar la solicitud.
    }
  };

  const toggleTooltip = () => {
    // Alterna la visibilidad del tooltip de ayuda.
    setTooltipVisible(!tooltipVisible);
  };

  const handleClose = () => {
    // Cierra el componente.
    setIsVisible(false);
    onClose();
    // Llama a la función pasada como prop para cerrar el modal.
  };

  return (
    <>
      {isVisible && (
        // Renderiza el componente solo si está visible.
        <div className="addUser">
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
          {/* Botón para cerrar el componente. */}
          <form onSubmit={handleSearch}>
            {/* Formulario para buscar un usuario por UID. */}
            <span className="uid-code-container">
              Ingresa el UID del contacto que deseas añadir.
              <FaQuestionCircle className="info-icon" onClick={toggleTooltip} />
              {tooltipVisible && (
                <div className="info-tooltip">
                  <p>¿Qué es el UID?</p>
                  <p>
                    Es el User Identifier asignada automáticamente a cada
                    contacto al registrarse, facilitando su búsqueda y gestión.
                  </p>
                  <p>¿Dónde encontrarlo?</p>
                  <p>
                    Está ubicado en el perfil, justo debajo del nombre completo.
                  </p>
                </div>
              )}
            </span>
            <input type="text" placeholder="XXYY0000-ZZ0000-0000" name="uid" />
            {/* Campo para ingresar el UID del usuario. */}
            <button type="submit">Buscar</button>
            {/* Botón para enviar el formulario de búsqueda. */}
          </form>
          {user && (
            <div className="user">
              <div className="detail">
                <img src={user.avatar} alt="Avatar" />
                <span>{user.username}</span>
              </div>
              <button
                onClick={handleSendRequest}
                disabled={isRequestSent || isAlreadyConnected}
                // Deshabilita el botón si ya se envió la solicitud o si los usuarios ya están conectados.
              >
                {isAlreadyConnected
                  ? 'Ya estás conectado'
                  : isRequestSent
                  ? 'Solicitud Enviada'
                  : 'Enviar Solicitud'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AddUser;
// Exporta el componente para que pueda ser utilizado en otros lugares.
