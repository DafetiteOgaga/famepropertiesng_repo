import { useState, useEffect } from "react";

function useScrollDetection() {
	const [scrollingDown, setScrollingDown] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	// handles display and hiding of the navbars
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
		
			if (currentScrollY > lastScrollY) {
				setScrollingDown(false); // hide when scrolling down
			} else {
				setScrollingDown(true); // show when scrolling up
			}
			setLastScrollY(currentScrollY);
		};
	
		window.addEventListener('scroll', handleScroll);
	
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollY]);

	return { scrollingDown, lastScrollY};
}
export { useScrollDetection };
