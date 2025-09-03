

function titleCase(str) {
	if (typeof str!=='string'||str==='') return
	return str
		.toLowerCase()
		.split(/[\s_]+/) // split by space OR underscore
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function digitSeparator(num) {
	// if (typeof num!=='number') return
	// return num.toLocaleString()
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatPhoneNumber(num) {
	const str = String(num).replace(/\D/g, ""); // remove non-digits
	return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
}

const ignoreArr = [
	'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor',
	'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'
]
function sentenceCase(str) {
	if (typeof str!=='string'||str==='') return

	// Replace underscores and hyphens with spaces, convert to lowercase, and trim whitespaces
	str = str.replace(/[_-]/g, ' ').toLowerCase().trim();

	// Split the string into words
	const words = str.split(/\s+/);

	// Capitalize the first word and any word not in the ignore list
	const capitalizedWords = words.map((word, index) => {
		if (index === 0 || !ignoreArr.includes(word.toLowerCase())) {
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		}
		return word.toLowerCase();
	});

	// Join the words back into a single string
	return capitalizedWords.join(' ');
}

export { digitSeparator, titleCase, formatPhoneNumber, sentenceCase };
