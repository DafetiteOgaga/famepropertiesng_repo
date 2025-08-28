import { useEffect, useState } from "react";
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import 'react-country-state-city/dist/react-country-state-city.css';
import { Breadcrumb } from "./sections/breadcrumb"
import { useDeviceType } from "../hooks/deviceType"
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthButtonAndSetup } from "../hooks/allAuth/googleAuthButtonAndSetup";
import { titleCase } from "../hooks/changeCase";
import { useAuth } from "../hooks/allAuth/authContext";
import { toast } from "react-toastify";
import { getBaseURL } from "../hooks/fetchAPIs";

const baseURL = getBaseURL();

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
	// {
	// 	name: 'middle_name',
	// 	placeholder: 'Dolly',
	// 	type: 'text',
	// 	important: false,
	// 	autoComplete: 'additional-name', // middle name
	// },
	{
		name: 'username',
		placeholder: 'Dols',
		type: 'text',
		important: false,
		autoComplete: 'username', // username
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
	{
		name: 'email',
		placeholder: 'example@email.com',
		type: 'email',
		important: true,
		autoComplete: 'email', // email
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
		name: 'password',
		placeholder: 'password',
		type: 'password',
		important: true,
		autoComplete: 'new-password', // for signup, use "current-password" for login
	},
	{
		name: 'password_confirmation',
		placeholder: 'password confirmation',
		type: 'password',
		important: true,
		autoComplete: 'new-password', // confirmation uses same as password
	},
]
const initialFormData = {
	first_name: '',
	last_name: '',
	// middle_name: '',
	username: '',
	address: '',
	nearest_bus_stop: '',
	mobile_no: '',
	email: '',
	password: '',
	country: '',
	state: '',
	stateCode: '',
	phoneCode: '',
	city: '',
}

function SignUp() {
	const navigate = useNavigate();
	const { accessToken, updateToken, userInfo, updateUserInfo, RotCipher, encrypt, decrypt, } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [country, setCountry] = useState(''); // whole country object
	const [state, setState] = useState('');     // whole state object
	const [city, setCity] = useState('');       // whole city object
	const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
	// const initWithLocation = {
	// 	...initialFormData,
	// 	...{
	// 		country: country?.name||'',
	// 		state: state?`${state?.name}|${state?.state_code}`:'',
	// 		city: city?.name||'',
	// 	}}
	const [formData, setFormData] = useState(initialFormData);

	const testText = "Hello World! 123";
	const encrypcipher = RotCipher(testText, encrypt);
	const decryptcipher = RotCipher(encrypcipher, decrypt);
	console.log({testText})
	console.log({encrypcipher})
	console.log({decryptcipher})
	console.log(`Are they equal?`, testText === decryptcipher)

	const passwordsConform = formData.password&&
								formData.password_confirmation&&
								(formData.password === formData.password_confirmation);
	useEffect(() => {
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
			} else if (passwordsConform) {
				setPasswordErrorMessage(null)
			}
		}
	}, [formData.password, formData.password_confirmation,
		formData.username, formData.first_name,
		formData.last_name, passwordsConform])

	const onChangeHandler = (e) => {
		e.preventDefault();
		let { name, value } = e.target
		// if (name !== 'mobile_no') {
		// 	value = value.trim().toLowerCase();
		// }
		// name!=='mobile_no' ? value = value.trimStart() : null; // trim only starting spaces for mobile no
		// console.log({name})
		// console.log({value})
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}
	useEffect(() => {
		setFormData(prev => ({
			...prev,
			country: country?.name||'',
			state: state?.name||'',
			stateCode: state?.state_code||'',
			phoneCode: country?.phone_code||'',
			city: city?.name||'',
		}))
	}, [country, state, city])
	const deviceType = useDeviceType().width <= 576;
	const getInputType = (input) => {
		if (input.type !== "password") return input.type;
		if (input.name === "password") {
			return showPassword ? "text" : "password";
		}
		if (input.name === "password_confirmation") {
			return showConfirmPassword ? "text" : "password";
		}
		return "password"; // default fallback
	};

	// Check if all required fields are filled
	const isFieldsValid = () => {
		const requiredFields = [
			'first_name',
			'address',
			'nearest_bus_stop',
			'mobile_no',
			'email',
			'password',
			'country',
			'state',
			'stateCode',
			'phoneCode',
			'city',
		];
		const isFieldValid = requiredFields.every((field) => formData[field].trim() !== "");
		return isFieldValid && passwordsConform
	};

	const onSubmitHandler = async (e) => {
		e.preventDefault();
		// console.log('Submitting form with data:');
		if (!isFieldsValid()) {
			console.warn('Form is invalid');
			toast.error('Error! Login Failed. Invalid form data');
			return;
		}
		const cleanedData = {};
		Object.entries(formData).forEach(([key, value]) => {
			// if (key==='stateCode') return; // skip stateCode from submission
			if (key==='password_confirmation') return; // skip password_confirmation from submission
			cleanedData[key] = (
				key==='stateCode'||
				key==='phoneCode'||
				key==='password'
			)?value:value.trim().toLowerCase();
		})
		// try {
		// 	const response = await fetch(`${baseURL}/api/token/`, {
		// 		method: "POST",
		// 		headers: { "Content-Type": "application/json" },
		// 		body: JSON.stringify(formData),
		// 	});

		// 	if (!response.ok) {
		// 		// Handle non-2xx HTTP responses
		// 		const errorData = await response.json();
		// 		console.warn('Registration Error:', errorData);
		// 		toast.error(errorData?.error || 'Registration Error!');
		// 		return;
		// 	}
		// 	const data = await response();
		// 	// console.log({data})
		// 	// if (data === "/login/") {
		// 	// 	console.log("you need to sign in again")
		// 	// 	navigate('/welcome');
		// 	// 	return;
		// 	// }
		// 	// console.log("Login Response:", data);

		// 	// if (data) {
		// 		// Store tokens
		// 		// createLocal.setItem('fpng-status', formData.email, 1000*60);
		// 		// createLocal.setItem('fpng-access', data.access);
		// 		// updateToken(data.access);
		// 		// createLocal.setItem('fpng-refresh', data.refresh);
		// 		// localStorage.setItem("access", data.access);
		// 		// localStorage.setItem("refresh", data.refresh);
		// 	setFormData(initialFormData);
		// 	toast.success('Registration Successful!');
		// 	navigate('/welcome')
		// 	// } else {
		// 	// 	console.warn('Registration Error:', data?.error)
		// 	// 	// setIsError(data?.error)
		// 	// 	toast.error(data?.error||'Registration Error!');
		// 	// 	return;
		// 	// }

		// 	return data;
		// } catch (error) {
		// 	console.error("Error during login:", error);
		// 	toast.error('Error! Login Failed. Please try again.');
		// 	return null;
		// }
		// console.log('Form submitted:', formData);
		// createLocal.setItem('fpng-status', formData.email, 1000*60);
		// Here you can handle the login logic, e.g., API call
		// Reset form after submission
		console.log('Form submitted:', cleanedData);
		toast.success('Registration Successful!');
	}
	console.log({country, state, city})
	console.log({formData})
	console.log(
		'passwordErrorMessage', !!passwordErrorMessage, passwordErrorMessage,
		'\npasswordsConform', passwordsConform,
	)
	return (
		<>
			<form onSubmit={onSubmitHandler}
			className="row px-xl-5"
			style={{
				display: 'flex',
				justifyContent: 'center',
			}}>
				<div className=""
				style={{
					padding: '0 2rem',
					width: deviceType?'':'60%',
				}}>
					<h5 className="text-uppercase mb-3">
						<span className="bg-secondary pr-3"
						style={{color: '#475569'}}>
							Sign Up
						</span>
					</h5>
					<div className="bg-light p-30 mb-5"
					style={{borderRadius: '10px'}}>
						<div className="row">
							{inputArr.map((input, index) => {
								const phone = input.name==='mobile_no' && country;
								// console.log(input.name, '-', {phone})
								return (
									<div key={index}
									className="col-md-6 form-group">
										<label
										htmlFor={input.name}>{titleCase(input.name)}<span>{`${input.important?'*':''}`}</span></label>
										{input.name==='country' ?
										<CountrySelect
										id={input.name}
										value={country}
										onChange={(val) => setCountry(val)}
										placeHolder="Select Country"
										/>
										:
										input.name==='state' ?
											<StateSelect
											id={input.name}
											key={country?.id || "no-country"} // to reset when country changes
											countryid={country?.id}
											value={state}
											onChange={(val) => setState(val)}
											placeHolder="Select State"
											/>
											:
											input.name==='city' ?
												<CitySelect
												id={input.name}
												key={`${country?.id || "no-country"}-${state?.id || "no-state"}`}
												countryid={country?.id}
												stateid={state?.id}
												value={city}
												onChange={(val) => setCity(val)}
												placeHolder="Select City"
												/>
												:
												<>
													<div
													style={{
														display: 'flex',
														flexDirection: 'row',
														alignItems: 'baseline',
														position: 'relative',
														width: '100%',
													}}>
														{phone && <p
														style={{
															marginRight: '0.5rem',
														}}>+{country.phone_code}</p>}
														<input
														id={input.name}
														name={input.name}
														onChange={onChangeHandler}
														value={formData[input.name]}
														style={{borderRadius: '5px'}}
														className="form-control"
														type={getInputType(input)}
														required={input.important}
														autoComplete={input.autoComplete}
														{...input.phoneProps}
														placeholder={input.placeholder}/>
														{(input.name === "password"||input.name === "password_confirmation") && (
															(input.name==="password" ?
															<span
															className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
															onClick={() => setShowPassword((prev) => !prev)} // toggle state
															style={{
																position: "absolute",
																top: "50%",
																right: "10px",
																transform: "translateY(-50%)",
																cursor: "pointer",
															}}
															/>
															:
															<span
															className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`}
															onClick={() => setShowConfirmPassword((prev) => !prev)} // toggle state
															style={{
																position: "absolute",
																top: "50%",
																right: "10px",
																transform: "translateY(-50%)",
																cursor: "pointer",
															}}
															/>)
														)}
													</div>
													{input.type==='password'&&
													<span
													style={{
														color: '#BC4B51',
														fontSize: '0.75rem',
														fontStyle: 'italic',
														// display: 'inline-block',
														// transform: 'skewX(-17deg)',
													}}>{passwordErrorMessage}</span>}
												</>}
									</div>
								)
							})}
							{/* <div className="col-md-6 form-group">
								<label>First Name<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="text"
								placeholder="John"/>
							</div>
							<div className="col-md-6 form-group">
								<label>Last Name<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="text"
								placeholder="Doe"/>
							</div>
							<div className="col-md-6 form-group">
								<label>Middle Name</label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="text"
								placeholder="Dolly"/>
							</div>
							<div className="col-md-6 form-group">
								<label>Username<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="text"
								placeholder="Dols"/>
							</div>
							<div className="col-md-6 form-group">
								<label>Address<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="text"
								placeholder="No.3, 123 crescent, Addo, Ajah"/>
							</div>
							<div className="col-md-6 form-group">
								<label>City</label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="text"
								placeholder="Ajah"/>
							</div>
							<div className="col-md-6 form-group">
								<label>State<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="text"
								placeholder="Lagos"/>
							</div>
							<div
							className="col-md-6 form-group">
								<label>Country<span>*</span></label>
								<select
								style={{borderRadius: '5px'}}
								className="custom-select">
									<option selected>Nigeria</option>
									<option>Ghana</option>
									<option>Cameroon</option>
									<option>Algeria</option>
								</select>
							</div>
							<div className="col-md-6 form-group">
								<label>Email<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="email"
								placeholder="example@email.com"/>
							</div>
							<div className="col-md-6 form-group">
								<label>Mobile No<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="tel"
								inputmode="numeric"   // <!-- brings up number keypad on mobile -->
								// pattern="[0-9]{7,11}" <!-- only numbers, length 7 to 11 -->
								minlength="7"
								maxlength="14"
								pattern="[0-9]{7,14}" // allows only numbers and between 7 and 14 characters
								placeholder="+234 806 000 1111"/>
							</div>
							<div className="col-md-6 form-group">
								<label>Password<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="password"
								placeholder="password"/>
							</div>
							<div className="col-md-6 form-group">
								<label>Password Confirmation<span>*</span></label>
								<input
								style={{borderRadius: '5px'}}
								className="form-control"
								type="password"
								placeholder="password confirmation"/>
							</div> */}
						</div>
						<button
						className="btn btn-block btn-auth font-weight-bold py-3"
						disabled={!isFieldsValid()}>
							Sign Up
						</button>
						{/* <span
						style={{
							fontSize: '0.7rem',
						}}>Labels marked with * must be filled</span> */}
						<p className="pt-3"
						style={{
							display: 'flex',
							justifyContent: 'center',
							color: '#475569',
						}}>Have an account?
							<Link
							to="/login"
							style={{
								paddingLeft: '0.5rem',
								color: '#475569',
							}}>
								Log in
							</Link>
						</p>
						{/* <div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							marginTop: '1rem',
						}}>
							<GoogleAuthButtonAndSetup />
						</div> */}
					</div>
					
					{/* <div className="collapse mb-5" id="shipping-address">
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Shipping Address
							</span>
						</h5>
						<div className="bg-light p-30">
							<div className="row">
								<div className="col-md-6 form-group">
									<label>First Name</label>
									<input className="form-control" type="text" placeholder="John"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Last Name</label>
									<input className="form-control" type="text" placeholder="Doe"/>
								</div>
								<div className="col-md-6 form-group">
									<label>E-mail</label>
									<input className="form-control" type="text" placeholder="example@email.com"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Mobile No</label>
									<input className="form-control" type="text" placeholder="+123 456 789"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Address Line 1</label>
									<input className="form-control" type="text" placeholder="123 Street"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Address Line 2</label>
									<input className="form-control" type="text" placeholder="123 Street"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Country</label>
									<select className="custom-select">
										<option selected>United States</option>
										<option>Afghanistan</option>
										<option>Albania</option>
										<option>Algeria</option>
									</select>
								</div>
								<div className="col-md-6 form-group">
									<label>City</label>
									<input className="form-control" type="text" placeholder="New York"/>
								</div>
								<div className="col-md-6 form-group">
									<label>State</label>
									<input className="form-control" type="text" placeholder="New York"/>
								</div>
								<div className="col-md-6 form-group">
									<label>ZIP Code</label>
									<input className="form-control" type="text" placeholder="123"/>
								</div>
							</div>
						</div>
						
					</div> */}
					
				</div>
				
				{/* <div className="col-lg-4">
					<h5 className="section-title position-relative text-uppercase mb-3">
						<span className="bg-secondary pr-3"
						style={{color: '#475569'}}>
							Order Total
						</span>
					</h5>
					<div className="bg-light p-30 mb-5">
						<div className="border-bottom">
							<h6 className="mb-3">Products</h6>
							<div className="d-flex justify-content-between">
								<p>Product Name 1</p>
								<p>₦150</p>
							</div>
							<div className="d-flex justify-content-between">
								<p>Product Name 2</p>
								<p>₦150</p>
							</div>
							<div className="d-flex justify-content-between">
								<p>Product Name 3</p>
								<p>₦150</p>
							</div>
						</div>
						<div className="border-bottom pt-3 pb-2">
							<div className="d-flex justify-content-between mb-3">
								<h6>Subtotal</h6>
								<h6>₦150</h6>
							</div>
							<div className="d-flex justify-content-between">
								<h6 className="font-weight-medium">Shipping</h6>
								<h6 className="font-weight-medium">₦10</h6>
							</div>
						</div>
						<div className="pt-2">
							<div className="d-flex justify-content-between mt-2">
								<h5>Total</h5>
								<h5>₦160</h5>
							</div>
						</div>
					</div>
					<div className="mb-5">
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Payment
							</span>
						</h5>
						<div className="bg-light p-30">
							<div className="form-group mb-4">
								<div className="custom-control custom-radio">
									<input type="radio" className="custom-control-input" name="payment" id="banktransfer"/>
									<label className="custom-control-label" htmlFor="banktransfer">Bank Transfer</label>
								</div>
							</div>
							<div className="form-group">
								<div className="custom-control custom-radio">
									<input type="radio" className="custom-control-input" name="payment" id="directcheck"/>
									<label className="custom-control-label" htmlFor="directcheck">Pay on Delivery</label>
								</div>
							</div>
							<button className="btn-block btn-auth font-weight-bold py-3">Place Order</button>
						</div>
					</div>
				</div> */}
			</form>
		</>
	)
}
export { SignUp }
