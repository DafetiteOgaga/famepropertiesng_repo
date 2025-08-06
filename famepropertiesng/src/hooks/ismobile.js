import { useState, useEffect } from "react";

const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 767.98px)").matches);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(max-width: 767.98px)");
		const handleResize = () => setIsMobile(mediaQuery.matches);

		mediaQuery.addEventListener("change", handleResize);
		return () => mediaQuery.removeEventListener("change", handleResize);
	}, []);

	return isMobile;
};
export { useIsMobile };
