import { createLocal } from "./setupLocalStorage";
import { useAuth } from "./allAuth/authContext";
import { getBaseURL } from "./fetchAPIs";
// import { useNavigate } from 'react-router-dom';

const baseURL = getBaseURL();

async function refreshToken({updateToken, updateUserInfo}) {
	// const refresh = createLocal.getItem("fpng-refresh");
	const response = await fetch(`${baseURL}/api/token/refresh/`, {
		method: "POST",
		credentials: "include", // Include cookies in the request
	});

	const data = await response.json();

	if (response.ok) {
		createLocal.setItem("fpng-access", data.access); // update access token
		// console.log("set new access token in memory");
		updateToken(data.access); // update context
		updateUserInfo(data.user); // update context
		return data.access;
	} else {
	  	// refresh expired too → user must log in again
		createLocal.removeItem("fpng-access");
		updateToken(null);
		// createLocal.removeItem("fpng-refresh");
		return null;
	}
}

function useAuthFetch() {
	const { accessToken, updateToken, userInfo, updateUserInfo } = useAuth(); // ✅ hook is called inside another hook
	async function fetchWithAuth(url, options={}) {
		let access = accessToken
		// createLocal.getItem("fpng-access");


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
			access = await refreshToken({updateToken, updateUserInfo});

			if (access) {
				options.headers["Authorization"] = `Bearer ${access}`;
				response = await fetch(url, options); // retry
			} else {
				// 🔴 Refresh failed → log out
				createLocal.removeItem("fpng-access");
				updateToken(null);
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
		updateToken(data.access); // update context
		updateUserInfo(data.user); // update context
		return data;
	}
	return fetchWithAuth; // ✅ return the function
}
export { useAuthFetch };
