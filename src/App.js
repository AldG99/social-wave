import Login from './components/login/login';
import Chat from './components/chat/chat';
import Detail from './components/detail/detail';
import List from './components/list/list';
import Notification from './components/notification/notification';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebaseConfig';

const App = () => {

  const user = false;

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      console.log(user)
    });

    return () => {
      unSub();
    }
  },[])

  return (
    <div className="container">
      {user ? (
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
