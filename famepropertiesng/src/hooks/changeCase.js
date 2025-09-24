

function titleCase(str) {
	if (typeof str!=='string'||str==='') return
	return str
		.toLowerCase()
		.split(/[\s_]+/) // split by space OR underscore
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function digitSeparator(num) {
	if (!num) return
	// if (typeof num!=='number') return
	// return num.toLocaleString()
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatPhoneNumber(num) {
	if (!num) return
	const str = String(num).replace(/\D/g, ""); // remove non-digits
	return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
}

// const ignoreArr = [
// 	'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor',
// 	'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'
// ]
function sentenceCase(str) {
	if (typeof str !== 'string' || str.trim() === '') return '';

	// Replace underscores and hyphens with spaces, then lowercase everything
	str = str.replace(/[_-]/g, ' ').toLowerCase().trim();

	// Capitalize the first letter at the start or after a period, exclamation, or question mark
	return str.replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase());
}

export { digitSeparator, titleCase, formatPhoneNumber, sentenceCase };
