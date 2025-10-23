async function getPersistentDeviceId() {
	const key = 'fpng-deid';
	let device_id = localStorage.getItem(key);

	// If already exists, return early
	if (device_id) {
		const details = JSON.parse(localStorage.getItem(`${key}-details`) || "{}");
		console.log("Existing device ID found:", {device_id, ...details});
		return { device_id, ...details };
	}

	let platform = navigator.platform || "unknown";
	let vendor = navigator.vendor || "unknown";
	let mobile = "unknown";
	let architecture = "unknown";
	let platformVersion = "unknown";
	let browserName = "unknown";
	let browserVersion = "unknown";
	let readableSummary = "";
	let hashSource = "";

	try {
		if (navigator.userAgentData) {
			// ✅ Use modern User-Agent Client Hints (Chrome, Edge, Brave, Opera)
			const uaData = await navigator.userAgentData.getHighEntropyValues([
				"architecture",
				"model",
				"platform",
				"platformVersion",
				"uaFullVersion"
			]);

			mobile = navigator.userAgentData.mobile ? "mobile" : "desktop";
			architecture = uaData.architecture || "unknown";
			platformVersion = uaData.platformVersion || "unknown";

			// Extract browser info from brands
			const brandInfo = navigator.userAgentData.brands?.find(
			b => b.brand && !b.brand.includes("Not")
			);
			browserName = brandInfo?.brand || "unknown";
			browserVersion = brandInfo?.version || uaData.uaFullVersion || "unknown";

			readableSummary = `${browserName} ${browserVersion} on ${uaData.platform} (${architecture}, ${mobile})`;
			hashSource = `${uaData.platform}-${architecture}-${mobile}-${browserName}-${browserVersion}-${vendor}`;
		} else {
			// 🧩 Fallback for Safari, Firefox
			const ua = navigator.userAgent;
			mobile = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";

			// Simple browser detection (not perfect, but fine for ID uniqueness)
			if (ua.includes("Firefox")) browserName = "Firefox";
			else if (ua.includes("Safari") && !ua.includes("Chrome")) browserName = "Safari";
			else if (ua.includes("Chrome")) browserName = "Chrome";
			else browserName = "Other";

			browserVersion = (ua.match(/(Chrome|Firefox|Version)\/([\d.]+)/) || [])[2] || "unknown";

			readableSummary = `${browserName} ${browserVersion} on ${platform} (${mobile})`;
			hashSource = `${platform}-${vendor}-${browserName}-${browserVersion}-${mobile}-${ua}`;
		}

		// ✅ Generate a persistent hash (unique per browser + device)
		const hash = btoa(hashSource).substring(0, 30);
		device_id = `${hash}::${browserName}-${platform}-${mobile}`;

		// ✅ Store ID + details persistently
		const details = {
			platform,
			vendor,
			mobile,
			architecture,
			platformVersion,
			browserName,
			browserVersion,
			readableSummary
		};

		localStorage.setItem(key, device_id);
		localStorage.setItem(`${key}-details`, JSON.stringify(details));

		console.log("Generated new device ID:", {device_id, ...details});
		return { device_id, ...details };
	} catch (err) {
		console.error("Error generating device ID:", err);
		return { device_id: "unknown-device", details: {} };
	}
}
export { getPersistentDeviceId };
