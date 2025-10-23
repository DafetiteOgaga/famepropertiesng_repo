/* eslint-env serviceworker */
/* global firebase, importScripts, clients */
/* eslint no-restricted-globals: ["off"] */

/*
	firebase-messaging-sw.js
	- Must be placed in `public/` (so it's served at /firebase-messaging-sw.js)
	- This file runs in the Service Worker environment (not in your React window)
	- The top comments tell ESLint: "this is a service worker file and these globals exist"
*/


/* Load the firebase compat libraries into the service worker */
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");
importScripts("./indexDBMethodsSW.js");

/* Initialize Firebase inside the service worker. */
firebase.initializeApp({
	// apiKey: "YOUR_API_KEY",
	// projectId: "YOUR_PROJECT_ID",
	// messagingSenderId: "YOUR_SENDER_ID",
	// appId: "YOUR_APP_ID",
	apiKey: "AIzaSyAwpZzCbM3a4GnOyEWlpp26mnIyNSdlQLs",
	authDomain: "online-store-staff.firebaseapp.com",
	projectId: "online-store-staff",
	storageBucket: "online-store-staff.firebasestorage.app",
	messagingSenderId: "523585178079",
	appId: "1:523585178079:web:ef9d1da66a442f97661c6a",
	measurementId: "G-MFGY2K12KZ"
});

/* Get the messaging object that lets the service worker receive messages */
const messaging = firebase.messaging();

/* Handle background messages */
messaging.onBackgroundMessage(async (payload) => {
	console.log("Received background message:", payload);
	const title = (payload && payload.notification && payload.notification.title) || 'Notification';
	const warmUp = title?.toLowerCase() === "token_warmup";
	const body = (payload && payload.notification && payload.notification.body) || '';
	const status = (payload && payload.data && payload.data.status) || 'pending';
	const id = (payload && payload.data && payload.data.id) || null;
	const shipping_status = (payload && payload.data && payload.data.shipping_status) || null;
	const user = (payload && payload.data && payload.data.user) || null;
	const amount = (payload && payload.data && payload.data.amount) || null;

	if (status === "completed") {
		console.log("Notification status is 'completed', deleting from IndexedDB if exists...", id);
		await self.deleteNotificationById(id);
	}

	if (!warmUp) {
		console.log("Displaying notification...", { title, body, status, id });
		const icon = `${self.location.origin}/famepropertiesng_repo/logo192.png`
		console.log('icon URL:', icon);
		const options = {
			body,
			// icon: '/logo192.png', // optional - change or remove
			icon: icon, // optional - change or remove
			data: { url: '/' } // optional: used to open/focus the dashboard when notification clicked
		};

		console.log("Showing notification with options:", options);
		// Show the notification
		self.registration.showNotification(title, options);

		// try {
		console.log("Saving notification to IndexedDB...", { title, body, status, id });
		await self.saveToIndexedDB({
			title,
			body,
			timestamp: Date.now(),
			seen: false,
			pending: status === "pending",
			id: id,
			shipping_status,
			user,
			amount
		});
		// console.log("Notification saved to IndexedDB!");
		// } catch (err) {
		// 	console.warn("Failed to save notification:", err);
		// }
		console.log("Notification handling complete.");
	}
	console.log("Notification is a warm-up message, not displaying or saving.");
});

/* When the user clicks the notification, focus an open tab or open a new one */
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	// Focus if already open, or open a new tab
	event.waitUntil(
		clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				// If there's a tab with your site, focus it
				if (client.url.includes("/") && "focus" in client) {
					return client.focus();
				}
			}
			// Otherwise, open a new window/tab to your dashboard root
			if (clients.openWindow) {
				return clients.openWindow("/");
			}
			return null;
		})
	);
});
