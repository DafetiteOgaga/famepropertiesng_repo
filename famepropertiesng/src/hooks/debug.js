function toggleDebugOutlines() {
	document.body.classList.toggle('debug-outline');
}

document.addEventListener('keydown', (e) => {
	if (e.ctrlKey && e.key.toLowerCase() === '.') { // Alt + O
		toggleDebugOutlines();
	}
});