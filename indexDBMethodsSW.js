/* eslint no-restricted-globals: ["off"] */

let dbPromise = null;

self.getDB = function() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open("notificationsDB", 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("notifications")) {
			console.log("[debug] creating object store 'notifications'");
			db.createObjectStore("notifications", { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => {
		console.warn("IndexedDB error:", e.target.error);
		reject("Failed to open DB");
	  }
    });
  }
  return dbPromise;
};

// This wraps any function and retries it a few times if it fails
self.withRetry = async function (fn, retries = 3, delay = 200) {
	console.log("debug withRetry called");
	for (let i = 0; i < retries; i++) {
		console.log("debug withRetry loop iteration:", i + 1);
	  try {
		console.log("debug withRetry attempt:", i + 1);
		const result = await fn(); // 🟢 run DB logic
		console.log(`✅ Success on attempt ${i + 1}`);
		return result; // ✅ success
	  } catch (err) {
		console.log("debug withRetry caught error:", err);
		console.warn(`[Retry ${i + 1}/${retries}]`, err);
		if (i === retries - 1) throw err; // ❌ stop after last retry
		await new Promise((res) => {
			console.log("debug withRetry waiting before next attempt");
			setTimeout(res, delay)
		}); // ⏱ wait before retry
	  }
	}
  };


self.getNotificationsFromIndexedDB = async function (filter = null) {
	return self.withRetry(async () => {
		console.log("debug getNotificationsFromIndexedDB type:", filter);
		const db = await self.getDB();
		return new Promise((resolve, reject) => {

			const tx = db.transaction("notifications", "readonly");
			const store = tx.objectStore("notifications");
			const getAll = store.getAll();
	
			getAll.onsuccess = () => {
				let results = getAll.result;
				if (filter === "unseen") results = results.filter(n => !n.seen);
				if (filter === "seen") results = results.filter(n => n.seen);
				if (filter === "pending") results = results.filter(n => n.pending);
				resolve(results);
			
			};
			getAll.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Error retrieving notifications");
			}
			tx.oncomplete = () => {
				console.log("IndexedDB transaction fetch completed");
			};
		//   };
		});
	});
  }

  self.clearNotificationsDB = async function () {
	return self.withRetry(async () => {
		console.log("debug clearNotificationsDB called");
		const db = await self.getDB();
		return new Promise((resolve, reject) => {

			const tx = db.transaction("notifications", "readwrite");
			tx.objectStore("notifications").clear();

			// ✅ Close DB once done
			tx.oncomplete = () => {
				console.log("IndexedDB cleared successfully");
				resolve();
			};
			tx.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Failed to store notification");
			}
		//   };
		});
	})
  }

self.markNotificationAsSeen = async function (id) {
	return self.withRetry(async () => {
		console.log("debug markNotificationAsSeen called for id:", id);
		const db = await self.getDB();
		return new Promise((resolve, reject) => {

			const tx = db.transaction("notifications", "readwrite");
			const store = tx.objectStore("notifications");
			const getReq = store.get(id);
			getReq.onsuccess = () => {
			const notification = getReq.result;
			if (notification) {
				notification.seen = true;
				store.put(notification);
			}

			tx.oncomplete = () => {
				console.log("Notification marked as seen for id:", id);
				resolve();
			};
			// };
			tx.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Failed to mark as seen");
			}
		};
		});
	})
  }

self.markNotificationAsShipped = async function (idArr = []) {
	return self.withRetry(async () => {
		console.log('o=f=f=l=i=n=e=+=s=h=i=p=p=e=d='.repeat(10));
		console.log("debug markNotificationAsShipped called for id:", idArr);
		const db = await self.getDB();
		return new Promise((resolve, reject) => {

			const tx = db.transaction("notifications", "readwrite");
			const store = tx.objectStore("notifications");

			let completed = 0;

			idArr.forEach(id => {
				console.log("[debug] marking notification as shipped for id:", id);
				const getReq = store.get(id);

				getReq.onsuccess = () => {
					console.log("[debug] fetched notification for id:", id);
					const notification = getReq.result;
					console.log("[debug] notification data:", notification);
					if (notification) {
						console.log("[debug] found id and marking as shipped:", id);
						notification.shipping_status = 'shipped';
						store.put(notification);
						console.log("[debug] updated notification stored for id:", id);
					}
					completed++;
					console.log("[debug] completed for id:", id);
				};

				getReq.onerror = (e) => {
					console.warn("Failed to fetch notification with id:", id, e.target.error);
					completed++;
				};
			});

			// Resolve after all updates complete
			tx.oncomplete = () => {
				console.log("All mark as shipped operations complete");
				console.log("[debug]", completed, "notifications marked as shipped");
				resolve();
			};
			// };
			tx.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Failed to mark as shipped");
			}
		})
	})
};
// usage example:
// markNotificationAsSeen(notification.id);

self.deleteNotificationById = async function (id) {
	return self.withRetry(async () => {
		console.log("debug deleteNotificationById called for id:", id);
		const db = await self.getDB();
		return new Promise((resolve, reject) => {

			const tx = db.transaction("notifications", "readwrite");
			tx.objectStore("notifications").delete(id);

			tx.oncomplete = () => {
				console.log("Notification deleted successfully for id:", id);
				resolve();
			};
			tx.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Failed to delete notification");
			}
		//   };
		});
	})
  }

  // --- IndexedDB helper ---
self.saveToIndexedDB = async function (data) {
	return self.withRetry(async () => {
		console.log("debug saveToIndexedDB called with data:", data);
		const db = await self.getDB();
		return new Promise((resolve, reject) => {

			const tx = db.transaction("notifications", "readwrite");
			const store = tx.objectStore("notifications");
			// store.add(data);
			const req = store.add(data); // add() fails if same id exists

			req.onsuccess = () => {
				console.log("IndexedDB: notification stored successfully");
			};

			req.onerror = (e) => {
				if (e.target.error?.name === "ConstraintError") {
					console.warn("Notification with same ID already exists:", data.id);
					resolve(); // ignore duplicates but don’t break SW
				} else {
					console.error("IndexedDB add error:", e.target.error);
					reject(e.target.error);
				}
			};

			// ✅ Close DB once done
			tx.oncomplete = () => {
				console.log("IndexedDB transaction saved and completed");
				resolve();
			};
			tx.onerror = (e) => {
				console.warn("IndexedDB error:", e.target.error);
				reject("Failed to store notification");
			}
		});
	})
  }
