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
		const getType = () => {
			// Reset all values to false
			let resetAndcleanTypes = Object.fromEntries(
				Object.keys(deviceLabels).map(key => [key, false])
			);

			const width = window.innerWidth;

			if (width < 576) {
				resetAndcleanTypes = { ...resetAndcleanTypes, mobile: true };
			} else if (width < 768) {
				resetAndcleanTypes = { ...resetAndcleanTypes, smallTablet: true };
			} else if (width < 992) {
				resetAndcleanTypes = { ...resetAndcleanTypes, tablet: true };
			} else if (width < 1200) {
				resetAndcleanTypes = { ...resetAndcleanTypes, laptop: true };
			} else {
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
	return deviceType;
};

const useDeviceInfo = () => {
	const deviceInfoObject = useDeviceType();
	// extract the width
	const { width, ...rest } = deviceInfoObject;
	// extract the device with value true (the current device used by the client)
	const deviceInfo = Object.entries(deviceInfoObject).find(([key, value]) => value === true)?.[0] || "unknown";
	return { deviceInfo, width };
};

export { useDeviceType, useDeviceInfo };
