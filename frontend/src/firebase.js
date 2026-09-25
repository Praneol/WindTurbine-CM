import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyApoPuwsC7bD_aa2T23RkaWIrUYsdaIuFc",
  authDomain: "aerion-4e2f3.firebaseapp.com",
  projectId: "aerion-4e2f3",
  storageBucket: "aerion-4e2f3.firebasestorage.app",
  messagingSenderId: "619863206912",
  appId: "1:619863206912:web:407adf03691155dab33ce5",
  measurementId: "G-TDHTNF2HD5"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey:
        "BD9ICI_nPv5Dl4YxTucm5WR524EPLv3zVxdEBz-ng0REuUkkzzdHWCyP2sKmmxf_wLXN1o4QKuWPQmYCtmSd4ec",
      serviceWorkerRegistration: registration
    });

    console.log("FCM TOKEN:", token);

    return token;
  } catch (error) {
    console.error("Notification setup error:", error);
    return null;
  }
};

export default app;