import React from 'react';

import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { getMessaging, getToken } from "firebase/messaging";
import firebaseConfig from './firebaseConfig';
import fcmToken from './fcmToken';

import Login from './components/Login';
import Dashboard from './components/Dashboard';

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

let clientFcmToken: string; 

function App() {
  const [isAuth, setIsAuth] = React.useState(false);

  onAuthStateChanged(auth, user => { 
    setIsAuth(user !== null);
    
    if (user)
      requestFcmToken(user);
  });

  function requestFcmToken(user: User) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        getToken(messaging, {
          vapidKey: fcmToken,
        })
        .then(token => {
          if (!token)
            return;

          clientFcmToken = token;
          setClientFcmToken(user);
        });
      }
    });
  }

  function setClientFcmToken(user: User) {
    const reference = doc(firestore, 'fcm/', user.uid);
    setDoc(reference, { token: clientFcmToken });
  }

  return (
    <div className="App">
      <header className="App-header">
        { !isAuth ? <Login/> : <Dashboard/> }
      </header>
    </div>
  );
}

export default App;