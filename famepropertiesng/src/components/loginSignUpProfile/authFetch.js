// import { createLocal } from "./setupLocalStorage";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { useAuth } from "../../hooks/allAuth/authContext";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useEffect, useRef } from "react";
// import { useNavigate } from 'react-router-dom';

const baseURL = getBaseURL();
const apiBaseUrl = getBaseURL(true);
function base64ToUtf8(str) {
	return decodeURIComponent(escape(atob(str)));
  }

async function getRandom(setRotNumber, setStoredrChars) {
	// Check if rot number exists in localStorage
	const storedRot = localStorage.getItem("fpng-rot");
	const storedrChars = localStorage.getItem("fpng-rchars");
	if (storedRot&&storedrChars) {
		const rotNum = parseInt(storedRot);
		const rotChars = storedrChars;
		setRotNumber(rotNum);
		setStoredrChars(rotChars)
		return rotNum;
	}

	// If not in localStorage, fetch from API
	const response = await fetch(`${apiBaseUrl}/get-random-number/`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}

	const data = await response.json();
	const rotNum = data.randomNumber;
	const rotChars = base64ToUtf8(data.randChars);;  // back to original chars

	// 3️⃣ Save to localStorage and state
	localStorage.setItem("fpng-rot", rotNum);
	localStorage.setItem("fpng-rchars", JSON.stringify(rotChars));
	setRotNumber(rotNum);
	setStoredrChars(rotChars)

	// console.log("Got new rot number from API:", rotNum);
	return rotNum;
};

async function refreshToken(
	// {updateToken,
	// updateRefreshToken,
	createLocal,
	refreshTken
	// ,}
	) {
	// const refresh = createLocal.getItem("fpng-refresh");
	const response = await fetch(`${baseURL}/api/token/refresh/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ refreshTken }), // send refresh token in body
	});

	const data = await response.json();

	if (response.ok) {
		createLocal.setItem("fpng-acc", data.access); // update access token
		createLocal.setItem("fpng-ref", data.refresh); // update refresh token
		return data.access;
	} else {
	  	// refresh expired too → user must log in again
		createLocal.removeItem("fpng-acc");
		createLocal.removeItem("fpng-ref");
		// updateToken(null);
		// updateRefreshToken(null);
		// createLocal.removeItem("fpng-refresh");
		return null;
	}
}

function useAuthFetch() {
	const randomRef = useRef(null);
	const { createLocal } = useCreateStorage();
	const {
		// accessToken, updateToken,
		// userInfo, updateUserInfo,
		// refreshTken:refreshTken, updateRefreshToken,
		storedChars, setStoredrChars,
		rotNumber, setRotNumber,
	} = useAuth(); // ✅ hook is called inside another hook

	useEffect(() => {
		async function fetchRot() {
			try {
				const rot = await getRandom(setRotNumber, setStoredrChars); // ✅ async call
				// console.log("Rot number ready:", rot);
			} catch (e) {
				console.error("Failed to fetch rot number:", e);
			}
		}
		fetchRot();
	  }, []); // empty dependency → run once on mount

	async function fetchWithAuth(url, options={}) {
		let access = createLocal.getItem("fpng-acc")
		// console.log("Using access token from localStorage:", access);
		// accessToken
		// Add token to headers
		options.headers = {
			...options.headers,
			"Authorization": `Bearer ${access}`,
		};

		if (options.method!=='GET') {
			options.method = options.method || "POST";
			options.headers["Content-Type"] = "application/json";
			if (options.body) {
				const trimmedBody = Object.fromEntries(
					Object.entries(options.body).map(([key, value]) => [
						key,
						typeof value === "string" ? value.trim() : value
					])
				);
				options.body = JSON.stringify(trimmedBody);
			} else {
				options.body = JSON.stringify({});
			}
		} else {
			options.method = "GET";
			// ✅ Attach query params if `data.body` exists
			if (options.body) {
				const params = new URLSearchParams(options.body).toString();
				url += "?" + params;
			}
		}

		let response = await fetch(url, options);

		if (response.status === 401) {
			// Token expired → get a new one
			const refreshTken = createLocal.getItem("fpng-ref")
			access = await refreshToken(
				// {updateToken, updateRefreshToken,
				refreshTken,
				createLocal,
			// }
			);

			if (access) {
				options.headers["Authorization"] = `Bearer ${access}`;
				response = await fetch(url, options); // retry
			} else {
				// 🔴 Refresh failed → log out
				createLocal.removeItem("fpng-acc");
				createLocal.removeItem("fpng-ref");
				// createLocal.removeItem("fpng-rot");
				createLocal.removeItem("fpng-user");
				// updateToken(null);
				// updateRefreshToken(null);
				// updateUserInfo(null);
				setRotNumber(0)
				setStoredrChars(null)
				// createLocal.removeItem("fpng-refresh");
			
				return "/login"
				// // Redirect to login page (example)
				// navigate("/login");
			
				// // Or just throw an error for the caller to handle
				// throw new Error("Session expired. Please log in again.");
			}
		}
		// console.log("Response:", response);
		const data = await response.json()
		// console.log("Got new access token from response:", data);
		if (!data?.error) {
			// console.log("2222222222".repeat(10), data);
			createLocal.setItem("fpng-acc", data.access);
			createLocal.setItem("fpng-ref", data.refresh);
			createLocal.setItem("fpng-user", data.user);
		} else if (data?.error) {
			// createLocal.removeItem("fpng-rot");
		}
		return data;
	}
	return fetchWithAuth; // ✅ return the function
}
export { useAuthFetch };
