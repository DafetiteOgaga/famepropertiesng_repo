
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
		autoComplete: 'off', // no standard autocomplete, disable it
	},
]

// basic format check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
	console.log({formData})
	const isRequiredArr = inputArr.filter(field => field.important);
	console.log({isRequiredArr})
	const isFieldValid = isRequiredArr.every((field) => {
		console.log('for', field.name, ':', formData[field.name])
		return typeof formData[field?.name]==='string'?formData[field.name].trim()!=="":formData[field.name]!==""
	});
	const someFieldsInvalid = isRequiredArr.some((field) => typeof formData[field.name]==='string'?formData[field.name].trim()==="":formData[field.name]==="");
	return {isFieldValid, someFieldsInvalid};
};

export {
	inputArr,
	validateEmail,
	// validatePassword,
	isFieldsValid,
	// checkEmailUniqueness,
};
