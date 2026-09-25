importScripts(
"https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
"https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
apiKey: "AIzaSyApoPuwsC7bD_aa2T23RkaWIrUYsdaIuFc",
authDomain: "aerion-4e2f3.firebaseapp.com",
projectId: "aerion-4e2f3",
storageBucket: "aerion-4e2f3.firebasestorage.app",
messagingSenderId: "619863206912",
appId: "1:619863206912:web:407adf03691155dab33ce5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
console.log(
"[firebase-messaging-sw.js] Background message:",
payload
);

const notificationTitle =
payload.notification?.title ||
"Wind Turbine Alert";

const notificationOptions = {
body:
payload.notification?.body ||
"A turbine condition alert has been detected.",
icon: "/vite.svg"
};

self.registration.showNotification(
notificationTitle,
notificationOptions
);
});
