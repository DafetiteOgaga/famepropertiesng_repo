import { useEffect, useState } from "react";

function getNotificationsFromIndexedDB(filter = null) {
	console.log("[debug] getNotificationsFromIndexedDB type:", filter);
	return new Promise((resolve, reject) => {
		console.log("[debug] opening IndexedDB...");
		const request = indexedDB.open("notificationsDB", 1);
		request.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Error opening DB");
		}

		// 🟢 ADDED: Ensure object store exists even if DB opens for first time
		request.onupgradeneeded = (event) => {
			console.log("[debug] onupgradeneeded triggered");
			const db = event.target.result;
			if (!db.objectStoreNames.contains("notifications")) {
				console.log("[debug] creating object store 'notifications'");
				db.createObjectStore("notifications", { keyPath: "id" });
			}
		};

		request.onsuccess = (event) => {
			console.log("[debug] IndexedDB opened successfully");
			const db = event.target.result;
			const tx = db.transaction("notifications", "readonly");
			const store = tx.objectStore("notifications");
			const getAll = store.getAll();

			getAll.onsuccess = () => {
				console.log("[debug] Retrieved all notifications from IndexedDB");
				let results = getAll.result;
				if (filter === "unseen") {results = results.filter(n => !n.seen)};
				if (filter === "seen") {results = results.filter(n => n.seen)};
				if (filter === "pending") {results = results.filter(n => n.pending)};
				console.log("[debug] All/Filtered results:", results);
				resolve(results);
			};
			getAll.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Error retrieving notifications");
			}
		};
		request.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Error opening DB");
		}
	});
}

function clearNotificationsDB() {
	console.log('[debug] clearing notifications DB')
	return new Promise((resolve, reject) => {
		console.log('[debug] opening IndexedDB for clearing...')
		const request = indexedDB.open("notificationsDB", 1);
		request.onsuccess = (event) => {
			console.log('[debug] opened notifications DB for clearing')
			const db = event.target.result;
			const tx = db.transaction("notifications", "readwrite");
			tx.objectStore("notifications").clear();
			tx.oncomplete = () => resolve();
			tx.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Failed to clear DB");
			}
		};
		request.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Error opening DB");
		}
	});
}

// function markNotificationAsSeen(id) {
// 	console.log('[debug] marking notification as seen:', id)
// 	return new Promise((resolve, reject) => {
// 		const request = indexedDB.open("notificationsDB", 1);
// 		request.onsuccess = (event) => {
// 			console.log('[debug] opened notifications DB for marking as seen')
// 			const db = event.target.result;
// 			const tx = db.transaction("notifications", "readwrite");
// 			const store = tx.objectStore("notifications");
			
// 			// 🟡 CHANGED: Make sure ID is a number to avoid lookup mismatch
// 			const getReq = store.get(id);

// 			getReq.onsuccess = () => {
// 			const notification = getReq.result;
// 				console.log('[debug] fetched notification for marking as seen:', notification)
// 				if (notification) {
// 					console.log('[debug] marking notification seen property to true')
// 					notification.seen = true;
// 					store.put(notification);
// 				}
// 				tx.oncomplete = () => resolve();
// 			};
// 			tx.onerror = (e) => {
// 				console.warn("IndexedDB error:", e.target.error);
// 				reject("Failed to mark as seen");
// 			}
// 		};
// 		request.onerror = (e) => {
// 			console.warn("IndexedDB error:", e.target.error);
// 			reject("Error opening DB");
// 		}
// 	});
// }
function markNotificationsAsSeen(idArr = [], comp=null) {
	console.log('m=a=r=k='.repeat(50));
	console.log('[debug]', comp, 'markNotificationsAsSeen called with IDs:', idArr);
	console.log("[debug] marking multiple notifications as seen:", idArr);
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("notificationsDB", 1);

		request.onsuccess = (event) => {
			const db = event.target.result;
			const tx = db.transaction("notifications", "readwrite");
			const store = tx.objectStore("notifications");
	
			let completed = 0;
  
			idArr.forEach((id) => {
				console.log("[debug] marking notification as seen for id:", id);
				const getReq = store.get(id);
		
				getReq.onsuccess = () => {
					const notification = getReq.result;
					if (notification) {
						notification.seen = true;
						store.put(notification);
					}
					completed++;
	
					
					console.log("[debug] marked id as seen:", id);
				};
	
				getReq.onerror = (e) => {
					console.warn("Failed to fetch notification with id:", id, e.target.error);
					completed++;
				};
				
			});

			// Resolve after all updates complete
			tx.oncomplete = () => {
				console.log("[debug] all notifications marked as seen");
				resolve(true);
			}
	
			tx.onerror = (e) => {
				console.warn("IndexedDB transaction error:", e.target.error);
				reject(false);
			};
		};
  
		request.onerror = (e) => {
			console.warn("IndexedDB open error:", e.target.error);
			reject(false);
		};
	});
}
// usage example:
// markNotificationAsSeen(notification.id);

function deleteNotificationById(id) {
	console.log('[debug] deleting notification by id:', id)
	return new Promise((resolve, reject) => {
		console.log('[debug] opening notifications DB for deletion...')
		const request = indexedDB.open("notificationsDB", 1);
		request.onsuccess = (event) => {
			console.log('[debug] opened notifications DB for deletion')
			const db = event.target.result;
			const tx = db.transaction("notifications", "readwrite");

			// 🟡 CHANGED: Also cast ID to Number here for same reason
			tx.objectStore("notifications").delete(id);

			// tx.objectStore("notifications").delete(id);
			tx.oncomplete = () => {
				console.log("IndexedDB: notification deleted successfully");
				resolve(true);
			}
			tx.onerror = (e) => {
				console.warn("IndexedDB error (Failed to delete notification):", e.target.error);
				reject(false);
			}
		};
		request.onerror = (e) => {
			console.warn("IndexedDB Error opening DB:", e.target.error);
			reject(false);
		}
	});
}

  // --- IndexedDB helper ---
function saveToIndexedDB(data) {
	console.log('[debug] saving notification to IndexedDB:', data)
	return new Promise((resolve, reject) => {
		console.log('[debug] opening notifications DB for saving...')
		const request = indexedDB.open("notificationsDB", 1);

		request.onupgradeneeded = (event) => {
			console.log('[debug] onupgradeneeded triggered for saving')
			const db = event.target.result;
			if (!db.objectStoreNames.contains("notifications")) {
				console.log('[debug] creating object store "notifications" for saving')
				db.createObjectStore("notifications", { keyPath: "id"});
			}
		};
  
		request.onsuccess = (event) => {
			console.log('[debug] opened notifications DB for saving')
			const db = event.target.result;
			const tx = db.transaction("notifications", "readwrite");
			const store = tx.objectStore("notifications");
			// store.add(data);
			const req = store.add(data); // add() fails if same id exists

			req.onsuccess = () => {
				console.log("IndexedDB: notification stored successfully");
				resolve(true);
			};

			req.onerror = (e) => {
				if (e.target.error?.name === "ConstraintError") {
					console.warn("Notification with same ID already exists:", data.id);
					resolve(true); // ignore duplicates but don’t break SW
				} else {
					console.error("IndexedDB add error:", e.target.error);
					reject(false);
				}
			};
			
			tx.oncomplete = () => resolve();
			tx.onerror = (e) => {
				console.warn("IndexedDB transaction error:", e.target.error);
				reject(false);
			}
		};
  
		request.onerror = (e) => {
			console.warn("IndexedDB open error:", e.target.error);
			reject(false);
		}
	});
}

function useAllNotifications({trigger, setTrigger, seen, comp}={}) {
	console.log('ABCD'.repeat(20));
	console.log('[debug] useAllNotifications hook called from', comp, 'as [seen]:', seen, 'with trigger:', trigger);
	const [notifications, setNotifications] = useState([]);

	console.log('[debug] useAllNotifications hook initialized');
	useEffect(() => {
		// console.log('[debug] useEffect checking trigger:', trigger);
		// if (!trigger) {
		// 	console.log('[debug] trigger is false, skipping fetch');
		// 	return;
		// }
		console.log('[debug] useEffect triggered to fetch notifications or on mount');
		let isMounted = true; // prevents setting state after unmount
	  
		const fetchNotifications = async () => {
			console.log('[debug] fetching notifications from IndexedDB...');
			try {
				console.log('[debug] awaiting getNotificationsFromIndexedDB...');
				console.log('[debug] seen filter value:', seen);
				const data = await getNotificationsFromIndexedDB(seen); // wait for IndexedDB to resolve
				if (isMounted && Array.isArray(data)) {
					console.log('[debug] notifications fetched:', data);
					setNotifications(data); // only update state if component is still mounted
					if (setTrigger) {
						console.log('[debug] resetting trigger to false');
						setTrigger(false); // reset trigger after fetch
					}
				}
				
			} catch (error) {
				console.error("Error fetching notifications from IndexedDB:", error);
			}
		};
	  
		// 🔹 Run fetchNotifications() on:
		//    - Component mount (trigger is usually undefined initially)
		//    - Any time trigger becomes true
		if (trigger || trigger === undefined) {
			console.log('[debug] trigger is true or undefined → fetching on mount');
			fetchNotifications();
		} else {
			console.log('WXYZ'.repeat(20));
			console.log('[debug] trigger is false → skipping fetch');
		}
	  
		return () => {
		  isMounted = false; // cleanup flag when unmounted
		};
	}, [trigger]);
	
	console.log('[debug] useAllNotifications returning notifications:', notifications);
	return { notifications, notificationsCount: notifications.length };
}

export {
	getNotificationsFromIndexedDB,
	clearNotificationsDB,
	// markNotificationAsSeen,
	markNotificationsAsSeen,
	deleteNotificationById,
	saveToIndexedDB,
	useAllNotifications,
};