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


self.getNotificationsFromIndexedDB = async function (filter = null) {
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
		tx.oncomplete = () => db.close();
	//   };
	});
  }

  self.clearNotificationsDB = async function () {
	console.log("debug clearNotificationsDB called");
	const db = await self.getDB();
	return new Promise((resolve, reject) => {

		const tx = db.transaction("notifications", "readwrite");
		tx.objectStore("notifications").clear();

		// ✅ Close DB once done
		tx.oncomplete = () => {
			db.close();
			resolve();
		  };
		  tx.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Failed to store notification");
		  }
	//   };
	});
  }

self.markNotificationAsSeen = async function (id) {
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
			db.close();
			resolve();
		  };
		// };
		tx.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Failed to mark as seen");
		}
	  };
	});
  }

self.markNotificationAsShipped = async function (id) {
	console.log("debug markNotificationAsShipped called for id:", id);
	const db = await self.getDB();
	return new Promise((resolve, reject) => {

		const tx = db.transaction("notifications", "readwrite");
		const store = tx.objectStore("notifications");
		const getReq = store.get(id);
		getReq.onsuccess = () => {
		  const notification = getReq.result;
		  if (notification) {
			notification.shipping_status = 'shipped';
			store.put(notification);
		  }

		tx.oncomplete = () => {
			db.close();
			resolve();
		  };
		// };
		tx.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Failed to mark as shipped");
		}
	  };
	});
  }
// usage example:
// markNotificationAsSeen(notification.id);

self.deleteNotificationById = async function (id) {
	console.log("debug deleteNotificationById called for id:", id);
	const db = await self.getDB();
	return new Promise((resolve, reject) => {

		const tx = db.transaction("notifications", "readwrite");
		tx.objectStore("notifications").delete(id);

		tx.oncomplete = () => {
			db.close();
			resolve();
		  };
		  tx.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Failed to delete notification");
		  }
	//   };
	});
  }

  // --- IndexedDB helper ---
self.saveToIndexedDB = async function (data) {
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
			db.close();
			resolve();
		  };
		  tx.onerror = (e) => {
			console.warn("IndexedDB error:", e.target.error);
			reject("Failed to store notification");
		  }
	});
  }
