import { useState, useEffect } from 'react';

const getBaseURL = (api=false) => {
	if (api) {
		return 'https://dafetiteapiendpoint.pythonanywhere.com';
	}

	const host = window.location.hostname;
	if (host === 'localhost' || host === '127.0.0.1') {
		console.log('Running in development mode');
		// /dafetite_brevo_api_key/dafetite_brevo_api
		return 'http://127.0.0.1:8000';
	}
	console.log('Running in production mode');
	return 'https://dafetitetemp.pythonanywhere.com/';
};

function useImageKitAPIs() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const getAPIs = async () => {
		try {
			const apiURL = getBaseURL(true) + "/get-imagekit-apis/";
			// console.log("Fetching APIs from:", apiURL);

			const apiResponse = await fetch(apiURL);
			if (!apiResponse.ok) {
				throw new Error("Network response was not ok");
			}

			const apiData = await apiResponse.json();
			// console.log("API data fetched successfully:", apiData);
			setData(apiData);
		} catch (err) {
			console.error("Error fetching data:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getAPIs();
	}, []);

  	return { data, loading, error };  // ✅ return something usable
}

export { getBaseURL, useImageKitAPIs }
