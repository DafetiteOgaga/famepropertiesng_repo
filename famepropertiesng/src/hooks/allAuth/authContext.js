import { createContext, useState, useContext } from "react";

// 1. Create the context
export const AuthContext = createContext();

// 2. Create a provider component
export function AuthProvider({ children }) {
	// ✅ Store access token in state (in-memory only)
	const [accessToken, setAccessToken] = useState(null);

	// 3. Function to update token
	const updateToken = (newToken) => {
		setAccessToken(newToken);  // Replace the old token with the new one
	};

	return (
		<AuthContext.Provider value={{ accessToken, updateToken }}>
			{children}
		</AuthContext.Provider>
	);
}

// 4. Create a custom hook for easy access to context
const useAuth = () => useContext(AuthContext);
export { useAuth };

