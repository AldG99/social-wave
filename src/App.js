import React, { useState, useEffect } from 'react'; // Importación de React y hooks necesarios
import { onAuthStateChanged } from 'firebase/auth'; // Importación de la función para observar cambios en el estado de autenticación
import { auth } from './lib/firebaseConfig'; // Importación de la configuración de Firebase
import { useUserStore } from './lib/userStore'; // Importación del hook para gestionar el estado del usuario
import { useChatStore } from './lib/chatStore'; // Importación del hook para gestionar el estado del chat
import Login from './components/auth/login';
import Register from './components/auth/register';
import RegisterNews from './components/auth/registerNews';
import Chat from './components/chat/chat';
import Detail from './components/detail/detail';
import List from './components/chat/list';
import MainInfo from './components/user/mainInfo';
import UserDetail from './components/detail/userDetail';

const App = () => {
  // Estado para gestionar el usuario actual y la carga
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  // Estado para gestionar el ID del chat
  const { chatId } = useChatStore();

  // Estados para gestionar la visibilidad de los formularios de registro y detalles del usuario
  const [showRegister, setShowRegister] = useState(false); // Para mostrar el formulario de registro estándar
  const [showRegisterNews, setShowRegisterNews] = useState(false); // Para mostrar el formulario de registro de organización
  const [showUserDetail, setShowUserDetail] = useState(false); // Para mostrar los detalles del usuario

  useEffect(() => {
    // Suscripción al estado de autenticación del usuario
    const unSub = onAuthStateChanged(auth, user => {
      // Llamada para obtener la información del usuario cuando cambia el estado de autenticación
      fetchUserInfo(user?.uid);
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  // Si está cargando, muestra un mensaje de carga
  if (isLoading) return <div className="loading">Cargando...</div>;

  // Funciones para alternar entre los formularios de registro
  const toggleRegister = () => {
    setShowRegister(!showRegister); // Cambiar el estado para mostrar/ocultar el formulario de registro
    setShowRegisterNews(false); // Asegurarse de que el formulario de registro de organización esté oculto
  };

  const toggleRegisterNews = () => {
    setShowRegisterNews(!showRegisterNews); // Cambiar el estado para mostrar/ocultar el formulario de registro de organización
    setShowRegister(false); // Asegurarse de que el formulario de registro estándar esté oculto
  };

  // Función para volver al formulario de login y ocultar los formularios de registro
  const toggleLogin = () => {
    setShowRegister(false); // Ocultar formulario de registro estándar
    setShowRegisterNews(false); // Ocultar formulario de registro de organización
  };

  // Funciones para mostrar/ocultar los detalles del usuario
  const handleShowUserDetail = () => {
    setShowUserDetail(true); // Mostrar los detalles del usuario
  };

  const handleCloseUserDetail = () => {
    setShowUserDetail(false); // Ocultar los detalles del usuario
  };

  return (
    <div className="container">
      {/* Mostrar la lista de chats solo cuando el usuario esté autenticado */}
      {currentUser && <List />}

      {showUserDetail ? (
        // Mostrar los detalles del usuario si 'showUserDetail' es verdadero
        <UserDetail handleBackToChat={handleCloseUserDetail} />
      ) : (
        <>
          {currentUser ? (
            <>
              {chatId ? (
                <>
                  {/* Mostrar el chat y los detalles cuando el ID del chat esté disponible */}
                  <Chat />
                  <Detail onProfileClick={handleShowUserDetail} />
                </>
              ) : (
                // Mostrar la información principal del usuario cuando no hay un chat activo
                <MainInfo onProfileClick={handleShowUserDetail} />
              )}
            </>
          ) : showRegisterNews ? (
            // Mostrar el formulario de registro de organización si 'showRegisterNews' es verdadero
            <RegisterNews toggleLogin={toggleLogin} />
          ) : showRegister ? (
            // Mostrar el formulario de registro estándar si 'showRegister' es verdadero
            <Register toggleLogin={toggleLogin} />
          ) : (
            // Mostrar el formulario de login si no hay ninguno de los formularios de registro activos
            <Login
              toggleRegister={toggleRegister}
              toggleRegisterNews={toggleRegisterNews}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
