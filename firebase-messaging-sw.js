// Service worker: nhận thông báo nhắc nhở khi app đang đóng.
// Firebase tự hiển thị thông báo và mở app khi người dùng chạm vào.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
importScripts("./config.js");

firebase.initializeApp(self.APP_CONFIG.firebase);
firebase.messaging();

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
