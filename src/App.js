import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebaseConfig';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Chat from './components/chat/chat';
import Detail from './components/detail/detail';
import List from './components/chat/list';
import Notification from './components/notification/notification';
import MainUserInfo from './components/user/mainUserInfo';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Cargando...</div>;

  const toggleRegister = () => setShowRegister(!showRegister);
  const toggleLogin = () => setShowRegister(false);

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId ? <Chat /> : <MainUserInfo />}
          {chatId && <Detail />}
        </>
      ) : (
        showRegister ? <Register toggleLogin={toggleLogin} /> : <Login toggleRegister={toggleRegister} />
      )}
      <Notification />
    </div>
  );
};

export default App;
