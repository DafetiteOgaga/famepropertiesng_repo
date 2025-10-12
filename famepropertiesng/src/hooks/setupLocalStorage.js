import { useAuth } from "./allAuth/authContext";

const addRotKeys = (storage) => {
	const allAppKeys = storage.getItem("fpng-app-keys");
	if (allAppKeys) {
		const parsedKeys = JSON.parse(allAppKeys);
		const rotArr = ["fpng-rot", "fpng-rchars"];
		for (let i=0; i < rotArr.length; i++) {
			const key = rotArr[i];
			if (!parsedKeys.includes(key)) {
				parsedKeys.push(key);
			}
		}
		storage.setItem("fpng-app-keys", JSON.stringify(parsedKeys));
	}
}
function SetAllKeys(storage, key) {
	if (key.startsWith("fpng-cart")) return; // skip cart key
	const allAppKeys = storage.getItem("fpng-app-keys");
	if (allAppKeys) {
		const parsedKeys = JSON.parse(allAppKeys);
		if (!parsedKeys.includes(key)) {
			parsedKeys.push(key);
			storage.setItem("fpng-app-keys", JSON.stringify(parsedKeys));
		}
	} else {
		storage.setItem("fpng-app-keys", JSON.stringify([key]));
	}
	addRotKeys(storage);
}
function useStorage(storage) {
	const { RotCipher, encrypt, decrypt, } = useAuth() || {};
	return {
		setItem(key, value, duration = null) {
			if (storage === localStorage) {
				SetAllKeys(storage, key);
			} else if (storage === sessionStorage && key === 'fpng-pspk') {
				// Optionally handle sessionStorage keys if needed
				SetAllKeys(storage, key);
			}
			const now = Date.now();

			// Step 1: Convert any type (string, array, object, etc.) into JSON string
			const serializedVal = JSON.stringify(value);

			// Step 2: Encrypt the serialized string
			const encryptVal = RotCipher(serializedVal, encrypt);

			const item = {
				value: encryptVal, // store the encrypted value
				expiry: duration ? now + duration : null, // duration in ms
			};
			storage.setItem(key, JSON.stringify(item));
		},

		getItem(key) {
			const itemStr = storage.getItem(key);

			if (!itemStr) return null;
			try {
				let data = JSON.parse(itemStr);

				// Decrypt the string and parse it back to array/object/string
				let decryptedVal = null;
				if (data.value) {
					decryptedVal = RotCipher(data.value, decrypt);

					// only one parse needed
					decryptedVal = JSON.parse(decryptedVal);
				} else {
					decryptedVal = data;
				}

				// No expiry → return value
				if (!data.expiry) return decryptedVal;

				// Expired → remove and return null
				if (Date.now() > data.expiry) {
					storage.removeItem(key);
					return null;
				}
				return decryptedVal; // return the valid value
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

		setItemRaw(key, value) {
			if (storage === localStorage) {
				SetAllKeys(storage, key);
			}

			// Step 1: store as JSON string
			const storeStr = JSON.stringify(value);
			storage.setItem(key, storeStr);
		},

		getItemRaw(key) {
			// 1: get string from storage
			const value = storage.getItem(key);

			// 2: if no string, return null
			if (!value) return null;

			// 3: parse the string
			try {
				const item = JSON.parse(value);
				return item;
			} catch {
				return null; // if parsing fails
			}
		},

		removeItem(key) {
			storage.removeItem(key);
		},

		removeAllItems() {
			let allAppKeys = storage.getItem("fpng-app-keys");
			if (allAppKeys) {
				allAppKeys = JSON.parse(allAppKeys);
				for (let i = 0; i < allAppKeys.length; i++) {
					const key = allAppKeys[i];
					// storage.removeItem(key); use this preferrably
					localStorage.removeItem(key); // hardcoded localStorage
					sessionStorage.removeItem(key); // hardcoded sessionStorage
				};
				// storage.removeItem("fpng-app-keys"); use this preferrably
				localStorage.removeItem("fpng-app-keys"); // hardcoded localStorage
				sessionStorage.removeItem("fpng-app-keys"); // hardcoded sessionStorage
			}
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

const useCreateStorage = () => {
	// implementation goes here
	
	// Create two versions
	const createLocal = useStorage(localStorage);
	const createSession = useStorage(sessionStorage); // not used yet
	return { createLocal, createSession };
}
export { useCreateStorage };
