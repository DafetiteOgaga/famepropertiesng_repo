

function titleCase(str) {
	if (typeof str!=='string'||str==='') return
	return str
		.toLowerCase()
		.split(/[\s_]+/) // split by space OR underscore
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
export { titleCase };

function digitSeparator(num) {
	// if (typeof num!=='number') return
	// return num.toLocaleString()
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export { digitSeparator };
