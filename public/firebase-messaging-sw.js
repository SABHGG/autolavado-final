importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyB1UonDzlZYuSLGiw5Nv1Jc8xs-V1n33Wc",
  authDomain: "push-notification-la22.firebaseapp.com",
  projectId: "push-notification-la22",
  storageBucket: "push-notification-la22.firebasestorage.app",
  messagingSenderId: "991081106142",
  appId: "1:991081106142:web:41886b7fd43a3dd703d04f",
  measurementId: "G-WFB28N0Q4J",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.webp",
  });
});
