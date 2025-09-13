import { getBaseURL } from "../../hooks/fetchAPIs";
import { toast } from "react-toastify";

const baseURL = getBaseURL();
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
		type: 'number',
		important: true,
		autoComplete: true,
	},
	{
		name: 'discount_price',
		placeholder: 14000,
		type: 'number',
		important: true,
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
		name: 'technical_descriptions',
		placeholder: '1.75-inch AMOLED display, Bluetooth 5.0, GPS, 50m water resistance, 7-day battery life',
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'marketing_descriptions',
		placeholder: 'Stay connected and track your health with an elegant smartwatch built for style and performance',
		type: 'text',
		important: true,
		autoComplete: true,
	},
]

// Check if all required (specified) fields are filled
const isFieldsValid = ({formData}) => {
	// get list of all required fields here
	const isRequiredArr = inputArr.filter(field => field.important);
	// console.log({isRequiredArr})
	// console.log({formData})
	const isFieldValid = isRequiredArr.every((field) => typeof formData?.[field.name]==='string'?formData?.[field.name].trim()!=="":formData?.[field.name]!=='');
	return isFieldValid
};

export {
	inputArr,
	// validateEmail,
	// validatePassword,
	isFieldsValid,
	// checkEmailUniqueness,
	// checkStoreNameUniqueness,
};
