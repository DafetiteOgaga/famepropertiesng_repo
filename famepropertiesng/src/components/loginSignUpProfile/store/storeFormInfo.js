import { getBaseURL } from "../../../hooks/fetchAPIs";
import { toast } from "react-toastify";
import { emailRegex } from "../../../hooks/formMethods/formMethods";

const baseURL = getBaseURL();
const inputArr = [
	{
		name: 'store_name',
		placeholder: "Chi's Boutique",
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'description',
		placeholder: 'We sell quality clothes and accessories',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'business_registration_number',
		placeholder: 'RC123456',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'tax_identification_number',
		placeholder: '12345678901',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	// {
	// 	name: 'country',
	// 	important: true,
	// 	autoComplete: 'country', // country code / name
	// },
	// {
	// 	name: 'state',
	// 	important: true,
	// 	autoComplete: 'address-level1', // state / province
	// },
	// {
	// 	name: 'city',
	// 	important: true,
	// 	autoComplete: 'address-level2', // city / locality
	// },
	{
		name: 'store_address',
		placeholder: 'Shop 3, 123 bake plaza, Addo, Ajah',
		type: 'text',
		important: false,
		autoComplete: true,
	},
	{
		name: 'nearest_bus_stop',
		placeholder: 'addo roundabout, opposite uba bank',
		type: 'text',
		important: true,
		autoComplete: true,
	},
	{
		name: 'store_email_address',
		placeholder: 'chisuperstore@email.com',
		type: 'email',
		important: false,
		autoComplete: false,
	},
	{
		name: 'store_phone_number',
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
	// {
	// 	name: 'password',
	// 	placeholder: 'password',
	// 	type: 'password',
	// 	important: true,
	// 	autoComplete: 'new-password', // for signup, use "current-password" for login
	// },
	// {
	// 	name: 'password_confirmation',
	// 	placeholder: 'password confirmation',
	// 	type: 'password',
	// 	important: true,
	// 	autoComplete: 'new-password', // confirmation uses same as password
	// },
]

// check passwords
const validatePassword = ({formData, setPasswordErrorMessage}) => {
	// validate password field whenever it or confirmation changes
	if (formData.password_confirmation) {
		if (formData.password !== formData.password_confirmation) {
			setPasswordErrorMessage('Passwords do not match')
		} else if (formData.password.length < 8) {
			setPasswordErrorMessage('Password must be at least 8 characters long')
		} else if (!/[A-Z]/.test(formData.password)) {
			setPasswordErrorMessage('Password must contain at least one uppercase letter')
		} else if (!/[a-z]/.test(formData.password)) {
			setPasswordErrorMessage('Password must contain at least one lowercase letter')
		} else if (!/[0-9]/.test(formData.password)) {
			setPasswordErrorMessage('Password must contain at least one number')
		}
		// else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
		// 	setPasswordErrorMessage('Password must contain at least one special character')
		// }
		else if (formData.password.length > 64) {
			setPasswordErrorMessage('Password must be less than 64 characters long')
		} else if (formData.username && (formData.password.toLowerCase().includes(formData.username.toLowerCase())||
			formData.username.toLowerCase().includes(formData.password.toLowerCase()))) {
			setPasswordErrorMessage('Password must not be the same as the username')
		} else if (formData.password.includes(' ')) {
			setPasswordErrorMessage('Password must not contain spaces')
		} else if (formData.first_name && (formData.password.toLowerCase().includes(formData.first_name.toLowerCase())||
			formData.first_name.toLowerCase().includes(formData.password.toLowerCase()))) {
			setPasswordErrorMessage('Password must not contain your first name')
		} else if (formData.last_name && (formData.password.toLowerCase().includes(formData.last_name.toLowerCase())||
			formData.last_name.toLowerCase().includes(formData.password.toLowerCase()))) {
			setPasswordErrorMessage('Password must not contain your last name')
		} else if (formData.password.toLowerCase().includes('password')) {
			setPasswordErrorMessage('Password must not contain the word "password"')
		} else {
			setPasswordErrorMessage(null)
		}
	}
}

const validateEmail = ({email, setIsEmailLoading}) => {
	// console.log('Email changed:', email);
	// validate email field whenever it changes
	// console.log('Validating email:', email);
	if (email) {
		if (emailRegex.test(email)) {
			// console.log('Email format is valid');
			setIsEmailLoading(true)
		} else {
			setIsEmailLoading(false)
		}
	}
}

// Check if all required (specified) fields are filled
const isFieldsValid = ({formData}) => {
	// get list of all required fields here
	const isRequiredArr = inputArr.filter(field => field.important);
	// console.log({isRequiredArr})
	const isFieldValid = isRequiredArr.every((field) => formData[field.name].trim() !== "");
	return isFieldValid
};

// check email uniqueness from server
const checkEmailUniqueness = async ({
	email, setIsEmailLoading,
	setIsEmailValid,
		}) => {
	try {
		// setIsEmailLoading(true)
		const response = await fetch(`${baseURL}/store/check-store-email/${email}/`);
		const data = await response.json();
		// console.log("Server says:", data);
		setIsEmailValid(data)
		// toast.success(
		// 	<div>
		// 		Registration Successful.<br />
		// 		Welcome, <strong>{data.message}!</strong>
		// 	</div>
		// );
		return data
	} catch (error) {
		setIsEmailValid(null)
		// toast.error('Error checking email. Please try again.');
		console.error("Error checking email:", error);
	} finally {
		setIsEmailLoading(false)
	}
};

// check email uniqueness from server
const checkStoreNameUniqueness = async ({
	name, setIsStoreLoading,
	setIsStoreNameAvailable,
		}) => {
	try {
		// setIsEmailLoading(true)
		const response = await fetch(`${baseURL}/store/check-store-name/${name}/`);
		const data = await response.json();
		// console.log("Server says:", data);
		setIsStoreNameAvailable(data)
		// toast.success(
		// 	<div>
		// 		Registration Successful.<br />
		// 		Welcome, <strong>{data.message}!</strong>
		// 	</div>
		// );
		return data
	} catch (error) {
		setIsStoreNameAvailable(null)
		// toast.error('Error checking email. Please try again.');
		console.error("Error checking store name:", error);
	} finally {
		setIsStoreLoading(false)
	}
};

export {
	inputArr,
	validateEmail,
	validatePassword,
	isFieldsValid,
	checkEmailUniqueness,
	checkStoreNameUniqueness,
};






// // handle file selection
// const handleFileChange = (e) => {
// 	const file = e.target.files[0];
// 	if (file) {
// 		setSelectedFile(file);
// 		setPreviewURL(URL.createObjectURL(file)); // create local preview
// 	}
// };

// {/* <div> */}
// 	{/* Local Preview */}
// 	{/* {previewURL && (
// 		<div className="mt-2">
// 			<img
// 				src={previewURL}
// 				alt="Local preview"
// 				className="w-24 h-24 rounded object-cover"
// 				style={{
// 					width: '100px',
// 					height: '100px',
// 					borderRadius: '8px',
// 					objectFit: 'cover',
// 				}}
// 			/>
// 		</div>
// 	)} */}

// 	{/* Upload Button */}
// 	{/* <button
// 		onClick={handleUpload}
// 		className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
// 		style={{
// 			backgroundColor: '#475569',
// 		}}
// 	>
// 		Upload to ImageKit
// 	</button> */}
// {/* </div> */}