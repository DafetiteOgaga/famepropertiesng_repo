function toggleDebugOutlines() {
	document.body.classList.toggle('debug-outline');
}

document.addEventListener('keydown', (e) => {
	if (e.altKey && e.key.toLowerCase() === 'o') { // Alt + O
		toggleDebugOutlines();
	}
});