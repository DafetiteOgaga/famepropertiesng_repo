import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { useAuth } from "../../hooks/allAuth/authContext";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { toast as htoast } from "react-hot-toast";

const baseURL = getBaseURL();
const apiBaseUrl = getBaseURL(true);
function base64ToUtf8(str) {
	return decodeURIComponent(escape(atob(str)));
}

const trimmedBody = (dataObj) => {
	if (Array.isArray(dataObj)) {
		return dataObj
	} else {
		return Object.fromEntries(
			Object.entries(dataObj).map(([key, value]) => [
				key,
				typeof value === "string" ? value.trim() : value
				])
			)
		}
};

// const deepTrim = (data) => {
// 	if (typeof data === "string") {
// 		return data.trim();
// 	} else if (Array.isArray(data)) {
// 		return data.map(deepTrim);
// 	} else if (data && typeof data === "object") {
// 		return Object.fromEntries(
// 			Object.entries(data).map(([key, value]) => [key, deepTrim(value)])
// 		);
// 	}
// 	return data; // numbers, booleans, null, undefined
// };

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

	// Save to localStorage and state
	localStorage.setItem("fpng-rot", rotNum);
	localStorage.setItem("fpng-rchars", JSON.stringify(rotChars));
	setRotNumber(rotNum);
	setStoredrChars(rotChars)

	return rotNum;
};

async function refreshToken(
	createLocal, createSession
	) {
	const refreshTken = createLocal.getItem("fpng-ref")
	console.log("Access token expired, refreshing it...");
	// console.log({refreshTken})
	const response = await fetch(`${baseURL}/api/token/refresh/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ refresh: refreshTken }), // send refresh token in body
	});

	const data = await response.json();
	console.log("refreshed")

	if (response.ok) {
		createLocal.setItem("fpng-acc", data.access); // update access token
		createLocal.setItem("fpng-ref", data.refresh); // update refresh token
		return data.access;
	} else {
	  	// refresh expired too → user must log in again
		createLocal.removeItem("fpng-acc");
		createLocal.removeItem("fpng-ref");
		createSession.removeItem("fpng-pspk");
		createLocal.removeAllItems();
		return null;
	}
}

function useAuthFetch() {
	const refreshingPromiseRef = useRef(null);
	const { createLocal, createSession } = useCreateStorage();
	const {
		setStoredrChars,
		setRotNumber,
	} = useAuth(); // hook is called inside another hook

	// rot returned not used
	useEffect(() => {
		async function fetchRot() {
			try {
				await getRandom(setRotNumber, setStoredrChars); // async call
			} catch (e) {
				console.error("Failed to fetch rot number:", e);
			}
		}
		fetchRot();
	  }, []); // empty dependency → run once on mount

	async function authorizedFetch(url, options={}, login=false) {
		console.log('requesting for:', '\n',{url}, '\n', {method: options?.method||'GET'})
		let access = createLocal.getItem("fpng-acc")

		if (!options?.method||options?.method==='GET') {
			options.method = "GET";
			// Attach query params if `data.body` exists
			if (options.body) {
				const params = new URLSearchParams(options.body).toString();
				url += "?" + params;
			}
		} else {
			// Add token to headers
			const noHeader = options.headers === 'no-header'
			if (noHeader) {
				delete options.headers
			}
			// console.log('adding token...')
			options.headers = {
				...options.headers,
				...(noHeader ? {} : { Authorization: `Bearer ${access}` }),
			};
			options.method = options.method || "POST";
			options.headers["Content-Type"] = "application/json";
			if (options.body) {
				options.body = JSON.stringify(trimmedBody(options.body));
			} else {
				options.body = JSON.stringify({});
			}
		}

		// console.log("Fetching ...");
		let response = await fetch(url, options);

		// console.log("Initial response:", response.status);
		if (response.status === 401) {
			// Token expired → get a new one
			if (!refreshingPromiseRef.current) {
				refreshingPromiseRef.current = refreshToken(createLocal, createSession)
					.finally(() => {
						refreshingPromiseRef.current = null; // reset after done
					});
			}
			// others wait for whichever one that triggeres refresh token finishes and they all use it
			// access = await refreshingPromise;
			const access = await refreshingPromiseRef.current;

			if (access) {
				options.headers["Authorization"] = `Bearer ${access}`;
				response = await fetch(url, options); // retry
				console.log("Re-try status:", response.status);
			} else {
				if (login) {
					console.log("Login attempt failed due to invalid refresh token");
					// if Refresh failed → log out
					createLocal.removeItem("fpng-acc");
					createLocal.removeItem("fpng-ref");
					createSession.removeItem("fpng-pspk");
					createLocal.removeAllItems();
					setRotNumber(0)
					setStoredrChars(null)
					toast.error("Session expired. Please log in again.");
					console.log("Redirecting to login page");
					return "/login"
				} else {
					console.log("Non-login request failed due to invalid refresh token");
					console.warn(response)
					toast.error("Session expired. Please log in again.");
					return null
				}
			}
		}
		console.log("Final response status:", response.status);
		const data = await response.json()
		if (!data?.error&&login) {
			createLocal.setItem("fpng-acc", data.access);
			createLocal.setItem("fpng-ref", data.refresh);
			createLocal.setItem("fpng-user", data.user);
			createLocal.setItem("fpng-stor", data.user.store);
			createLocal.setItem("fpng-ctdw", Date.now());
		} else if (data?.error||data?.status==='error') {
			const errorText = data.error||
								data.detail||
								data.message||
								"Error occurred. Please try again."
			console.warn(errorText)
			toast.error(errorText);
			// htoast.success(errorText);
			return null
		}
		return data;
	}
	return authorizedFetch; // return the function
}
export { useAuthFetch };
