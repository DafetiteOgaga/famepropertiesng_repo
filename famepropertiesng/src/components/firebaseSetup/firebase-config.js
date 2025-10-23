import { useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useAuthFetch } from "../loginSignUpProfile/authFetch";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { toast } from "react-toastify";
import { getPersistentDeviceId } from "./getPersistentDeviceId";


// function getPersistentDeviceId() {
// 	const key = 'fpng-deid';
// 	let deviceId = localStorage.getItem(key);
// 	if (!deviceId) {
// 		const ua = navigator.userAgentData;
// 		const platform = navigator.platform;
// 		const vendor = navigator.vendor;
// 		console.log({
// 			ua,
// 			platform,
// 			vendor
// 		})
// 		// Create a readable + semi-unique hash
// 		deviceId = `${btoa(`${platform}-${vendor}-${ua}`).substring(0, 40)}-pla-${platform.substring(0, 20)}-ven-${vendor.substring(0, 20)}-ua-${ua.substring(0, 40)}`;
// 		localStorage.setItem(key, deviceId);
// 	}
// 	return deviceId;
// }

const firebaseConfig = {
	apiKey: "AIzaSyAwpZzCbM3a4GnOyEWlpp26mnIyNSdlQLs",
	authDomain: "online-store-staff.firebaseapp.com",
	projectId: "online-store-staff",
	storageBucket: "online-store-staff.firebasestorage.app",
	messagingSenderId: "523585178079",
	appId: "1:523585178079:web:ef9d1da66a442f97661c6a",
	measurementId: "G-MFGY2K12KZ"
};
// const firebaseConfig = {
// 	apiKey: "YOUR_API_KEY",
// 	authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
// 	projectId: "YOUR_PROJECT_ID",
// 	messagingSenderId: "YOUR_SENDER_ID",
// 	appId: "YOUR_APP_ID"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

// Ask for permission and get browser token
export function useRequestForFCMToken() {
	const authFetch = useAuthFetch();
	const { createLocal } = useCreateStorage();
	const userInfo = createLocal.getItem('fpng-user');
	console.log({userInfo})
	const hasRun = useRef(false)
	console.log("useRequestForFCMToken hook called...", {staff: userInfo?.is_staff});
	useEffect(() => {
		console.log("useRequestForFCMToken effect triggered...", {staff: userInfo?.is_staff});
		console.log("Has this effect run before?", hasRun.current);
		if (hasRun.current || !userInfo?.is_staff) {
			console.log('-'.repeat(60));
			console.log("User is not staff, skipping FCM token request.");
			console.log('-*'.repeat(30));
			return; // ✅ Skip second StrictMode run
		}
		hasRun.current = true;

		console.log("useRequestForFCMToken effect running...");
		const getfirebasetoken = async () => {
			console.log('+'.repeat(20));
			console.log("Requesting permission for notifications...");
			try {
				// 🚀 Development-only: clear old service worker and token
				// const prevRegistration = await navigator.serviceWorker.getRegistration(
				// 	`${process.env.PUBLIC_URL}/firebase-messaging-sw.js`
				// );
				// console.log("Previous service worker registration:", prevRegistration);
				// if (prevRegistration) {
				// 	console.log("Unregistering previous service worker for fresh permission request...");
				// 	await prevRegistration.unregister();
				// 	console.log("Unregistered old service worker for fresh permission request.");
				// }

				const device_info = await getPersistentDeviceId();
				console.log("Device info ready for backend:", device_info);

				console.log("Registering service worker at:", `${process.env.PUBLIC_URL}/firebase-messaging-sw.js`)
				// ✅ Manually register service worker (works even with HashRouter)
				const registration = await navigator.serviceWorker.register(
					`${process.env.PUBLIC_URL}/firebase-messaging-sw.js`
				);
				console.log("Service worker registered:", registration);

				if (registration) {
					console.log("Getting FCM token...");
					const token = await getToken(messaging, {
						vapidKey: "BBHzD522Fp1RX1_AUdWKbgso0d2U-OfVo1t0590YRoWY8n3ybt38jfWkHtxD03zm2hKrnlvysG9tZ3r7Yh42pzU",
						serviceWorkerRegistration: registration,
					});
					if (!token) {
						console.warn("No registration token available. Request permission to generate one.");
						// toast.info("Please enable notifications to receive updates.");
						return;
					}
					console.log("FCM token received:", {token});
					if (token && device_info) {
						console.log("FCM token available:", token);


						// 🧠 Compare with the previous token
						const oldToken = createLocal.getItem("fpng-fcmt");
						console.log("Old token from localStorage:", oldToken);
						if (token && token !== oldToken) {
							console.log("🆕 New or changed FCM token detected:", token);

							// Save new token locally
							createLocal.setItem("fpng-fcmt", token);

							console.log("Got FCM token:", token);
							console.log("Sending token to firebase for backend...");
							// 🔥 Send to Django backend
							const sentToServer = await authFetch("register-fcm-token/", {
								method: "POST",
								body: {
									fcm_token: token,
									device_info: device_info,
								},
							});
							if (!sentToServer) return; // error already logged in authFetch
							console.log("✅ FCM token sent to backend successfully");
							console.log("Token sent to backend successfully:", sentToServer);

							toast.success("Notifications enabled!");
							console.log("FCM token saved to localStorage.");
						} else {
							console.log("✅ Token unchanged, skipping backend update.");
						}

					} else {
						console.warn("No registration token available. Request permission.");
					}
				}

			} catch (error) {
				console.error("Error getting FCM token:", error);
			}
		}
		if (userInfo?.is_staff) {
			getfirebasetoken();
		} else {
			// console.log('-'.repeat(20));
			// console.log("User is not staff, skipping FCM token request.");
		}
	}, [userInfo]); // Empty dependency array ensures this runs once on mount
}
