

// Reorder fields based on a predefined order array
const reOrderFields = (entries, reOrderFieldsArr) => {
	// Create a mapping of index for location keys
	const orderMap = Object.fromEntries(
		reOrderFieldsArr.map((key, i) => [key, i])
	);

	return entries.slice().sort(([keyA], [keyB]) => {
		const indexA = orderMap[keyA] ?? Infinity; // non-location = Infinity
		const indexB = orderMap[keyB] ?? Infinity;

		// Compare by location order if both are location keys
		if (indexA !== indexB) {
			return indexA - indexB;
		}

		// Otherwise, preserve original order (stable sort)
		return 0;
	});
};

// Determine if a field should be a textarea based on its name
const toTextArea = (str, textAreaFieldsArr) => {
	return textAreaFieldsArr.includes(str)
}
export { reOrderFields, toTextArea };
