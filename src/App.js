import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebaseConfig";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import RegisterNews from "./components/auth/registerNews";
import Chat from "./components/chat/chat";
import Detail from "./components/detail/detail";
import List from "./components/chat/list";
import MainInfo from "./components/user/mainInfo";
import UserDetail from "./components/detail/userDetail";

const App = () => {
  // Estado para gestionar el usuario actual y la carga
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  // Estado para gestionar el ID del chat
  const { chatId } = useChatStore();
  
  // Estados para gestionar la visibilidad de los formularios de registro y detalles del usuario
  const [showRegister, setShowRegister] = useState(false);
  const [showRegisterNews, setShowRegisterNews] = useState(false); // Nuevo estado para el registro de organización
  const [showUserDetail, setShowUserDetail] = useState(false);

  useEffect(() => {
    // Suscripción al estado de autenticación del usuario
    const unSub = onAuthStateChanged(auth, (user) => {
      // Fetch user info cuando el estado de autenticación cambia
      fetchUserInfo(user?.uid);
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  // Mostrar un mensaje de carga mientras se está verificando la autenticación
  if (isLoading) return <div className="loading">Cargando...</div>;

  // Funciones para alternar la visibilidad de los formularios de registro
  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowRegisterNews(false); // Ocultar registro de organización si se muestra el registro estándar
  };

  const toggleRegisterNews = () => {
    setShowRegisterNews(!showRegisterNews);
    setShowRegister(false); // Ocultar registro estándar si se muestra el registro de organización
  };

  // Función para volver a mostrar el formulario de login y ocultar otros formularios
  const toggleLogin = () => {
    setShowRegister(false);
    setShowRegisterNews(false); // Ocultar registro de organización al volver al login
  };

  // Funciones para mostrar y ocultar detalles del usuario
  const handleShowUserDetail = () => {
    setShowUserDetail(true);
  };

  const handleCloseUserDetail = () => {
    setShowUserDetail(false);
  };

  return (
    <div className="container">
      {/* Mostrar la lista de chats solo cuando el usuario esté autenticado */}
      {currentUser && <List />} 

      {showUserDetail ? (
        // Mostrar detalles del usuario si el estado 'showUserDetail' es verdadero
        <UserDetail handleBackToChat={handleCloseUserDetail} />
      ) : (
        <>
          {currentUser ? (
            <>
              {chatId ? (
                <>
                  {/* Mostrar el chat y el detalle cuando el ID del chat está disponible */}
                  <Chat />
                  <Detail onProfileClick={handleShowUserDetail} />
                </>
              ) : (
                // Mostrar información principal del usuario cuando no hay ID de chat
                <MainInfo onProfileClick={handleShowUserDetail} />
              )}
            </>
          ) : (
            showRegisterNews ? (
              // Mostrar el formulario de registro de organización
              <RegisterNews toggleLogin={toggleLogin} />
            ) : showRegister ? (
              // Mostrar el formulario de registro estándar
              <Register toggleLogin={toggleLogin} />
            ) : (
              // Mostrar el formulario de login
              <Login toggleRegister={toggleRegister} toggleRegisterNews={toggleRegisterNews} />
            )
          )}
        </>
      )}
    </div>
  );
};

export default App;
