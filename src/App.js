import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebaseConfig";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import RegisterNews from "./components/auth/registerNews"; // Importa el nuevo componente
import Chat from "./components/chat/chat";
import Detail from "./components/detail/detail";
import List from "./components/chat/list";
import Notification from "./components/notification/notification";
import MainInfo from "./components/user/mainInfo";
import UserDetail from "./components/detail/userDetail";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [showRegister, setShowRegister] = useState(false);
  const [showRegisterNews, setShowRegisterNews] = useState(false); // Nuevo estado para el registro de organización
  const [showUserDetail, setShowUserDetail] = useState(false);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Cargando...</div>;

  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowRegisterNews(false); // Ocultar registro de organización si se muestra el registro estándar
  };

  const toggleRegisterNews = () => {
    setShowRegisterNews(!showRegisterNews);
    setShowRegister(false); // Ocultar registro estándar si se muestra el registro de organización
  };

  const toggleLogin = () => {
    setShowRegister(false);
    setShowRegisterNews(false); // Ocultar registro de organización al volver al login
  };

  const handleShowUserDetail = () => {
    setShowUserDetail(true);
  };

  const handleCloseUserDetail = () => {
    setShowUserDetail(false);
  };

  return (
    <div className="container">
      {currentUser && <List />} {/* Siempre visible cuando el usuario esté autenticado */}

      {showUserDetail ? (
        <UserDetail handleBackToChat={handleCloseUserDetail} />
      ) : (
        <>
          {currentUser ? (
            <>
              {chatId ? (
                <>
                  <Chat />
                  <Detail onProfileClick={handleShowUserDetail} />
                </>
              ) : (
                <MainInfo onProfileClick={handleShowUserDetail} />
              )}
            </>
          ) : (
            showRegisterNews ? (
              <RegisterNews toggleLogin={toggleLogin} />
            ) : showRegister ? (
              <Register toggleLogin={toggleLogin} />
            ) : (
              <Login toggleRegister={toggleRegister} toggleRegisterNews={toggleRegisterNews} />
            )
          )}

          <Notification />
        </>
      )}
    </div>
  );
};

export default App;
