importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "這裡填入你 Firebase 的 apiKey",
  projectId: "dandelion-chat-fd524",
  messagingSenderId: "825170651326",
  appId: "這裡填入你 Firebase 的 appId"
});

const messaging = firebase.messaging();

// 當網頁關掉，但收到訊息時，跳出通知
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: 'favicon.png'
  });
});
