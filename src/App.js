import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebaseConfig';
import { useUserStore } from './lib/userStore';

import Login from './components/login/login';
import Chat from './components/chat/chat';
import Detail from './components/detail/detail';
import List from './components/list/list';
import Notification from './components/notification/notification';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Cargando...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
