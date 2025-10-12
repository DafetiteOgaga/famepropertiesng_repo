

const inputArr = [
	{
		name: 'product_name',
		placeholder: "Apple Wrist Watch",
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'product_description',
		placeholder: 'Digital and analog smartwatch with customizable features',
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'market_price',
		placeholder: 17000,
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'discount_price',
		placeholder: 14000,
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'number_of_items_available',
		placeholder: 200,
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'technical_feature_1',
		placeholder: '1.75-inch AMOLED always-on display',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'technical_feature_2',
		placeholder: 'Bluetooth 5.3 with low-energy support',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'technical_feature_3',
		placeholder: 'Built-in GPS with GLONASS & Galileo',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'technical_feature_4',
		placeholder: 'Water resistance up to 50m (5 atm)',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'technical_feature_5',
		placeholder: '7-day battery life with fast charging',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'full_descriptions',
		placeholder: 'Includes heart rate monitor, GPS, water resistance, and 7-day battery life',
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'marketing_descriptions',
		placeholder: 'Stay connected and track your health with an elegant smartwatch built for style and performance',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'technical_descriptions',
		placeholder: '1.75-inch AMOLED display, Bluetooth 5.0, GPS, 50m water resistance, 7-day battery life',
		type: 'text',
		important: false,
		autoComplete: true,
	},
]

// Check if all required (specified) fields are filled
const isFieldsValid = ({formData}) => {
	// get list of all required fields here
	const isRequiredArr = inputArr.filter(field => field.important);
	const isFieldValid = isRequiredArr.every((field) => typeof formData?.[field.name]==='string'?formData?.[field.name].trim()!=="":formData?.[field.name]!=='');
	return isFieldValid
};

export {
	inputArr,
	isFieldsValid,
};
