import { createContext, useState, useContext, useEffect, useRef } from "react";

// 1. Create the context
export const AuthContext = createContext();

// 2. Create a provider component
export function AuthProvider({ children }) {
	const storedRot = useRef(false);

	// Store access token in state (in-memory only)
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
		const storedNum = localStorage.getItem("fpng-rot");
		const storedChars = localStorage.getItem("fpng-rchars");
		storedRot.current = storedNum && storedChars
		if (storedRot.current) {
			setRotNumber(parseInt(storedNum));
			setStoredrChars(storedChars);
		}
	}
	const encrypt = 1;
	const decrypt = -1;

	const space = ['¶ ¾', '¾ ¶']
	function RotCipher(text, shift) {
		const cipherShift = rotNumber * shift;

		if (!text) return text;
		// Define the character set
		const charset = "!#$%&*+-¹²³€½ŧ←↓→øþæßðđŋħˀĸł«»µ─¢/0123456789<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz|~";
		const len = charset.length;

		// Compute the effective cipherShift value
		const effectiveShift = ((cipherShift % len) + len) % len;
		const rotatedCharset = charset.slice(effectiveShift) + charset.slice(0, effectiveShift);

		// Create a map for fast character lookup
		const charMap = {};
		for (let i = 0; i < len; i++) {
			charMap[charset[i]] = rotatedCharset[i];
		}

		// Transform the input text
		try {
			return Array.from(text)
			.map(char => charMap[char] || (char===space[0]?space[1]:char===space[1]?space[0]:char))
			.join('')
		} catch (e) {
			console.log('Error:', e)
		}
	}

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

