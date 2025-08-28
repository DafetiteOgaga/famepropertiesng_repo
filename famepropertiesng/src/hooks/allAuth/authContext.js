import { createContext, useState, useContext, useEffect, useRef } from "react";
// import { useCreateStorage } from "../setupLocalStorage";
import { useRotStorage } from "./storeRot";

// 1. Create the context
export const AuthContext = createContext();

// 2. Create a provider component
export function AuthProvider({ children }) {
	const storedRot = useRef(false);
	// const localRot = useRotStorage();
	// console.log('##### localRot from useRotStorage:', localRot);
	// const { createLocal } = useCreateStorage();
	// ✅ Store access token in state (in-memory only)
	const [accessToken, setAccessToken] = useState(null);
	const [refreshToken, setRefreshToken] = useState(null);
	const [userInfo, setUserInfo] = useState(null);
	const [rotNumber, setRotNumber] = useState(0);
	const [storedChars, setStoredrChars] = useState(null);

	// 3. Function to update token
	const updateToken = (aToken) => {
		setAccessToken(aToken);  // Replace the old token with the new one
	};

	// 4. Function to update refresh token
	const updateRefreshToken = (rToken) => {
		setRefreshToken(rToken);  // Replace the old token with the new one
	};

	// 5. Function to update user information
	const updateUserInfo = (uInfo) => {
		setUserInfo(uInfo);
	};

	if (!storedRot.current) {
		// console.log('Fetching rot number from localStorage...');
		const storedNum = localStorage.getItem("fpng-rot");
		const storedChars = localStorage.getItem("fpng-rchars");
		// console.log('storedRot.current:', storedRot.current);
		// console.log('storedChars:', storedChars);
		// console.log('storedNum:', storedNum);
		storedRot.current = storedNum && storedChars
		if (storedRot.current) {
			// console.log('Found rot in localStorage');
			setRotNumber(parseInt(storedNum));
			setStoredrChars(storedChars);
		}
	}
	const encrypt = 1;
	const decrypt = -1;

	const space = ['¶ ¾', '¾ ¶']
	function RotCipher(text, shift) {
		const cipherShift = rotNumber * shift;
		// console.log(
		// 	'shift:', shift,
		// 	'- rotNumber:', rotNumber,
		// 	'- cipherShift:', cipherShift
		// );
		if (!text) return text;
		// Define the character set

		const charset = "!#$%&*+-¹²³€½ŧ←↓→øþæßðđŋħˀĸł«»µ─¢/0123456789<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz|~";
		// localStorage.setItem("hdChars", charset);
		// const charset = storedChars
		// console.log('storedChars inside RotCipher:', !!storedChars, storedChars.length);

		const len = charset.length;
		// console.log('charset length:', len);

		// Compute the effective cipherShift value
		const effectiveShift = ((cipherShift % len) + len) % len;
		const rotatedCharset = charset.slice(effectiveShift) + charset.slice(0, effectiveShift);

		// Create a map for fast character lookup
		const charMap = {};
		for (let i = 0; i < len; i++) {
			charMap[charset[i]] = rotatedCharset[i];
		}

		// Transform the input text
		// console.log('Original text:', text);
		// console.log('storedRot.current:', storedRot.current);
		try {
			return Array.from(text)
			.map(char => charMap[char] || (char===space[0]?space[1]:char===space[1]?space[0]:char))
			.join('')
		} catch (e) {
			console.log('Error:', e)
		}
	}

	// useEffect(() => {
	// 	// On mount, load tokens from localStorage if they exist
	// 	const storedAccess = createLocal.getItem("fpng-acc");
	// 	const storedRefresh = createLocal.getItem("fpng-ref");
	// 	const storedUser = createLocal.getItem("fpng-user");

	// 	if (storedAccess) {
	// 		setAccessToken(storedAccess);
	// 	}
	// 	if (storedRefresh) {
	// 		setRefreshToken(storedRefresh);
	// 	}
	// 	if (storedUser) {
	// 		try {
	// 			setUserInfo(JSON.parse(storedUser));
	// 		} catch (e) {
	// 			console.error("Error parsing user info from localStorage:", e);
	// 			setUserInfo(null);
	// 		}
	// 	}
	// }, [accessToken, refreshToken, userInfo])

	return (
		<AuthContext.Provider value={{
			accessToken, updateToken,
			refreshToken, updateRefreshToken,
			userInfo, updateUserInfo,
			storedChars, setStoredrChars,
			rotNumber, setRotNumber,
			RotCipher, encrypt, decrypt
			}}>
			{children}
		</AuthContext.Provider>
	);
}

// 4. Create a custom hook for easy access to context
const useAuth = () => useContext(AuthContext);
export { useAuth };

