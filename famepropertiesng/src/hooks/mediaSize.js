import { useEffect } from "react";

function useLogMediaSize() {
	useEffect(() => {
		const logSize = () => {
			const width = window.innerWidth;
			let label = "";

			if (width < 576) {
				label = "Mobile";
			} else if (width < 768) {
				label = "Small Tablet";
			} else if (width < 992) {
				label = "Tablet";
			} else if (width < 1200) {
				label = "Laptop";
			} else {
				label = "Desktop";
			}

			console.log(`${label}: ${width}px`);
		};

		// Log once immediately
		logSize();

		// Listen for resizes
		window.addEventListener("resize", logSize);

		// Cleanup on unmount
		return () => window.removeEventListener("resize", logSize);
	}, []);
}
export { useLogMediaSize };
