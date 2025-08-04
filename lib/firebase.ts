import { initializeApp, getApps } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB1UonDzlZYuSLGiw5Nv1Jc8xs-V1n33Wc",
  authDomain: "push-notification-la22.firebaseapp.com",
  projectId: "push-notification-la22",
  storageBucket: "push-notification-la22.firebasestorage.app",
  messagingSenderId: "991081106142",
  appId: "1:991081106142:web:41886b7fd43a3dd703d04f",
  measurementId: "G-WFB28N0Q4J",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export { app };
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;
