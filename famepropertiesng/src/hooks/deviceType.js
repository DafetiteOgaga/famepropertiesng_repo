import { useState, useEffect } from "react";

const deviceLabels = {
	mobile: false,
	smallTablet: false,
	tablet: false,
	laptop: false,
	desktop: false,
};

const useDeviceType = () => {
	const [deviceType, setDeviceType] = useState(deviceLabels);

	useEffect(() => {
		// console.log("useDeviceType hook initialized");
		const getType = () => {
			// console.log("Detecting device type...");
			// Reset all values to false
			let resetAndcleanTypes = Object.fromEntries(
				Object.keys(deviceLabels).map(key => [key, false])
			);

			const width = window.innerWidth;

			if (width < 576) {
				// console.log("Device type: Mobile");
				resetAndcleanTypes = { ...resetAndcleanTypes, mobile: true };
			} else if (width < 768) {
				// console.log("Device type: Small Tablet");
				resetAndcleanTypes = { ...resetAndcleanTypes, smallTablet: true };
			} else if (width < 992) {
				// console.log("Device type: Tablet");
				resetAndcleanTypes = { ...resetAndcleanTypes, tablet: true };
			} else if (width < 1200) {
				// console.log("Device type: Laptop");
				resetAndcleanTypes = { ...resetAndcleanTypes, laptop: true };
			} else {
				// console.log("Device type: Desktop");
				resetAndcleanTypes = { ...resetAndcleanTypes, desktop: true };
			}
			resetAndcleanTypes = { ...resetAndcleanTypes, width: width };
			const label = Object.entries(resetAndcleanTypes).find(([key, value]) => value? key : null)?.[0] || "Unknown";
			console.log(`${label}: ${width}px`);
			setDeviceType(resetAndcleanTypes);
		};

		// Run once on mount
		getType();

		// Listen for resizes
		window.addEventListener("resize", getType);

		// Cleanup listener on unmount
		return () => window.removeEventListener("resize", getType);
	}, []);
	// console.log("Device Type:", deviceType);
	return deviceType;
};

export { useDeviceType };
