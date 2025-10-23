import { emailRegex } from "../../hooks/formMethods/formMethods"

const inputArr = [
	{
		name: 'first_name',
		placeholder: 'John',
		type: 'text',
		important: true,
		autoComplete: 'given-name', // first name
	},
	{
		name: 'last_name',
		placeholder: 'Doe',
		type: 'text',
		important: false,
		autoComplete: 'family-name', // last name
	},
	{
		name: 'country',
		important: true,
		autoComplete: 'country', // country code / name
	},
	{
		name: 'state',
		important: true,
		autoComplete: 'address-level1', // state / province
	},
	{
		name: 'city',
		important: true,
		autoComplete: 'address-level2', // city / locality
	},
	{
		name: 'lga',
		important: true,
		autoComplete: 'address-level2', // city / locality
	},
	{
		name: 'sub_area',
		important: true,
		autoComplete: 'address-level2', // city / locality
	},
	{
		name: 'mobile_no',
		placeholder: '806 000 1111',
		type: 'tel',
		important: true,
		autoComplete: 'tel-national', // phone number (local format)
		phoneProps: {
			inputMode: 'numeric',   // <!-- brings up number keypad on mobile -->
			minLength: '7',
			maxLength: '10',
			pattern: '[0-9]{7,10}', // allows only numbers and between 7 and 14 characters
		}
	},
	{
		name: 'email',
		placeholder: 'example@email.com',
		type: 'email',
		important: true,
		autoComplete: 'email', // email
	},
	{
		name: 'address',
		placeholder: 'No.3, 123 crescent, Addo, Ajah',
		type: 'text',
		important: true,
		autoComplete: 'street-address', // full street address
	},
	{
		name: 'nearest_bus_stop',
		placeholder: 'addo roundabout, opposite uba bank',
		type: 'text',
		important: true,
		autoComplete: 'on', // no standard autocomplete, disable it
	},
]

const validateEmail = ({email, setIsEmailLoading}) => {
	// validate email field whenever it changes
	if (email) {
		if (emailRegex.test(email)) {
			setIsEmailLoading(true)
		} else {
			setIsEmailLoading(false)
		}
	}
}

// Check if all required (specified) fields are filled
const isFieldsValid = ({formData}) => {
	// get list of all required fields
	const isRequiredArr = inputArr.filter(field => field.important);
	// console.log({isRequiredArr})
	const isFieldValid = isRequiredArr.every((field) => {
		// console.log({formData})
		// console.log({field: field.name, value: formData[field.name]})
		// const formDataKey = formData[field.name]
		// const fieldValueIsStr = typeof(formData[field.name])==='string'
		// console.log({formDataKey, fieldValueIsStr})
		return typeof(formData[field.name])==='string'?formData[field.name].trim()!=="":formData[field.name]!==""
	});
	// console.log({isFieldValid})
	return isFieldValid
};

export {
	inputArr,
	validateEmail,
	isFieldsValid,
};
