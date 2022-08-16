// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
    apiKey: 'AIzaSyCqIs6wZNEF3cO8zyYNxh2OB7JfBMUgqt8',
    authDomain: 'doutor-tech.firebaseapp.com',
    databaseURL: 'https://doutor-tech-default-rtdb.firebaseio.com',
    projectId: 'doutor-tech',
    storageBucket: 'doutor-tech.appspot.com',
    messagingSenderId: '368043012835',
    appId: '1:368043012835:web:35296a9f417809d9e24bd6'
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('onBackgroundMessage', payload);

    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});