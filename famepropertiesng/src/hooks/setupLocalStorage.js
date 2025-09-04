import { useAuth } from "./allAuth/authContext";

// const localRot = localStorage.getItem("fpng-rot");
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
	// encrypt = localRot ? parseInt(localRot) : 0;
	// decrypt = localRot ? -parseInt(localRot) : 0;
	return {
		setItem(key, value, duration = null) {
			SetAllKeys(storage, key);
			// console.log('#####useStorage setItem called'.repeat(5));
			// console.log('setting key:', key);
			// console.log('Original value:', typeof value);
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
			// console.log('#####useStorage getItem called'.repeat(5));
			// console.log('getting key:', key,);
			const itemStr = storage.getItem(key);
			// console.log('Raw item string from storage:', itemStr);
			if (!itemStr) return null;
			try {
				// console.log('Parsing item string...', itemStr);
				let data = JSON.parse(itemStr);

				// console.log('Parsed item:', data);

				// if (!value&&!expiry) {
				// 	console.log('Item has no value and no expiry, returning raw string');
				// 	value = itemStr;
				// }

				// Decrypt the string and parse it back to array/object/string
				let decryptedVal = null;
				if (data.value) {
					// const ones = '11111'.repeat(3)
					// console.log(ones);
					// console.log('Decrypting value...:', data.value);
					decryptedVal = RotCipher(data.value, decrypt);
					// console.log('Decrypted raw string:', decryptedVal);
					// console.log(ones);

					// only one parse needed
					decryptedVal = JSON.parse(decryptedVal);
				} else {
					decryptedVal = data;
				}

				// console.log('Decrypted value:', decryptedVal);
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
			SetAllKeys(storage, key);

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
			// console.log('Removing item with key:', key);
			storage.removeItem(key);
		},

		removeAllItems() {
			let allAppKeys = storage.getItem("fpng-app-keys");
			if (allAppKeys) {
				// console.log({allAppKeys})
				allAppKeys = JSON.parse(allAppKeys);
				// console.log({allAppKeys})
				for (let i = 0; i < allAppKeys.length; i++) {
					const key = allAppKeys[i];
					// console.log('Removing item with key:', key);
					storage.removeItem(key);
				};
				storage.removeItem("fpng-app-keys");
				// console.log('All app keys removed');
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
	// Your implementation here
	
	// Create two versions
	const createLocal = useStorage(localStorage);
	// export const createSession = useStorage(sessionStorage);
	return { createLocal };
}
export { useCreateStorage };
// Example usage:
// const { createLocal } = useCreateStorage();
// createLocal.setItem('testKey', 'testValue', 5000); // expires in 5 seconds
// console.log(createLocal.getItem('testKey')); // 'testValue'
// setTimeout(() => {
// 	console.log(createLocal.getItem('testKey')); // null (expired)
// }, 6000);
//
// createLocal.extendItem('testKey', 5000); // extend by 5 seconds
// console.log(createLocal.getItem('testKey')); // 'testValue' (if not expired)
// setTimeout(() => {
// 	console.log(createLocal.getItem('testKey')); // null (expired after extension)
// }, 11000);
// createLocal.removeItem('testKey'); // manually remove
// console.log(createLocal.getItem('testKey')); // null
// createLocal.clear(); // clear all items
// console.log(createLocal.length); // number of items
// 			const newAccess = await refreshToken();
// 				if (newAccess) {
// 					options.headers["Authorization"] = `Bearer ${newAccess}`;
// 					const retryResponse = await fetch(url, options);
// 					return retryResponse;
// 				} else {
// 					// Redirect to login or handle as needed
// 					navigate("/login");
// 					return null;
// 				}
// 			}
// 		}
// 		return response;
// 	}
// 	return fetchWithAuth; //return the function
// }
// export { useAuthFetch };
// 			const newAccess = await refreshToken();
// 				if (newAccess) {
// 					options.headers["Authorization"] = `Bearer ${newAccess}`;
// 					const retryResponse = await fetch(url, options);
// 					return retryResponse;
// 				} else {
// 					// Redirect to login or handle as needed
// 					navigate("/login");
// 					return null;
// 				}
// 			}
// 		}
// 		return response;
// 	}
// 	return fetchWithAuth; // return the function
// }
// export { useAuthFetch };
