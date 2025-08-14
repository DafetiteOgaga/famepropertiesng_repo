function createStorage(storage) {
		return {
			setItem(key, value, duration = null) {
				const now = Date.now();
				const item = {
					value,
					expiry: duration ? now + duration : null // duration in ms
				};
				storage.setItem(key, JSON.stringify(item));
			},

			getItem(key) {
				const itemStr = storage.getItem(key);
				if (!itemStr) return null;
				try {
					const item = JSON.parse(itemStr);

					// No expiry → return value
					if (!item.expiry) return item.value;

					// Expired → remove and return null
					if (Date.now() > item.expiry) {
						storage.removeItem(key);
						return null;
					}
					return item.value;
				} catch {
					return null; // if parsing fails
				}
			},

			extendItem(key, extraDuration) {
				const itemStr = storage.getItem(key);
				if (!itemStr) return false; // Item doesn't exist
				try {
					const item = JSON.parse(itemStr);

					// If already expired → remove & return false
					if (item.expiry && Date.now() > item.expiry) {
						storage.removeItem(key);
						return false;
					}
					const now = Date.now();

					// If item has expiry, extend it
					if (item.expiry) {
						item.expiry += extraDuration; // add extra ms
					} else {
						// If no expiry, start from now
						item.expiry = now + extraDuration;
					}
					storage.setItem(key, JSON.stringify(item));
					return true;
				} catch {
					return false;
				}
			},

			removeItem(key) {
				storage.removeItem(key);
			},

			clear() {
				storage.clear();
			},

			key(index) {
				return storage.key(index);
			},

			get length() {
				return storage.length;
			}
		};
	}

// Create two versions
// export const createLocal = createStorage(localStorage);
export const createSession = createStorage(sessionStorage);
