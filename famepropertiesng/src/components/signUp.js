import { useEffect, useState, useRef } from "react";
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
import { IKContext, IKUpload, IKImage } from "imagekitio-react";
import { useImageKitAPIs } from "../hooks/fetchAPIs";
import { ImageCropAndCompress } from "../hooks/fileResizer/ImageCropAndCompress";

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
	password_confirmation: '',
	country: '',
	state: '',
	stateCode: '',
	phoneCode: '',
	city: '',
}

function SignUp() {
	// const emailRef = useRef();
	const handleDoneRef = useRef();
	const baseAPIURL = useImageKitAPIs()?.data;
	const navigate = useNavigate();
	const { accessToken, updateToken, userInfo, updateUserInfo, RotCipher, encrypt, decrypt, } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [country, setCountry] = useState(''); // whole country object
	const [state, setState] = useState('');     // whole state object
	const [city, setCity] = useState('');       // whole city object
	const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
	const [selectedProfilePhoto, setSelectedProfilePhoto] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null); // local file
	const [previewURL, setPreviewURL] = useState(null);     // local preview
	const [uploadedImage, setUploadedImage] = useState(null); // imagekit response like {image_url, fileId}
	const [returnedFile, setReturnedFile] = useState(null);
	// const [animate, setAnimate] = useState(false);
	// const [getHandleDoneFromChild, setGetHandleDoneFromChild] = useState(null);
	const [imagePreview, setImagePreview] = useState(false);
	// const initWithLocation = {
	// 	...initialFormData,
	// 	...{
	// 		country: country?.name||'',
	// 		state: state?`${state?.name}|${state?.state_code}`:'',
	// 		city: city?.name||'',
	// 	}}
	const [formData, setFormData] = useState(initialFormData);
	const [isEmailValid, setIsEmailValid] = useState(null);

	// const testText = "Hello World! 123";
	// const encrypcipher = RotCipher(testText, encrypt);
	// const decryptcipher = RotCipher(encrypcipher, decrypt);
	// console.log({testText})
	// console.log({encrypcipher})
	// console.log({decryptcipher})
	// console.log(`Are they equal?`, testText === decryptcipher)

	// const passwordsConform = !passwordErrorMessage;
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
			} else {
				setPasswordErrorMessage(null)
			}
		}
	}, [formData.password, formData.password_confirmation,
		formData.username, formData.first_name,
		formData.last_name])

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
		if (uploadedImage) {
			const imageDetails = {
				image_url: uploadedImage.url,
				fileId: uploadedImage.fileId,
			}
			setFormData(prev => ({
				...prev,
				...imageDetails,
			}))
			// setSelectedProfilePhoto(imageDetails);
			console.log('Image details added to formData:', imageDetails);
			setUploadedImage(null);
		}
	}, [country, state, city, uploadedImage])
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
			'password_confirmation',
			'country',
			'state',
			'stateCode',
			'phoneCode',
			'city',
		];
		const isFieldValid = requiredFields.every((field) => formData[field].trim() !== "");
		return isFieldValid && !passwordErrorMessage
	};

	const onSubmitHandler = async () => {
		// e.preventDefault();
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
				key==='fileId'||
				key==='image_url'||
				key==='stateCode'||
				key==='phoneCode'||
				key==='password'
			)?value:value.trim().toLowerCase();
		})
		console.log('Form submitted:', cleanedData);
		// toast.success('Registration Successful!');
		try {
			const response = await fetch(`${baseURL}/users/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cleanedData),
			});

			if (!response.ok) {
				// Handle non-2xx HTTP responses
				const errorData = await response.json();
				console.warn('Registration Error:', errorData);
				toast.error(errorData?.error || 'Registration Error!');
				return;
			}
			const data = await response.json();
			console.log('Response data from server',data)
			toast.success('Registration Successful!');
			// setFormData(initialFormData);
			// navigate('/welcome')
			return data;
		} catch (error) {
			console.error("Error during login:", error);
			toast.error('Error! Login Failed. Please try again.');
			return null;
		}
	}

	const authenticator = async () => {
		try {
			const response = await fetch(`${baseURL}/imagekit-auth/`);
			if (!response.ok) {
				const errorText = "Failed to authenticate with ImageKit"
				toast.error(errorText);
				throw new Error(errorText);
			}
			const data = await response.json();
			console.log("Authentication data received");
			// console.log("Authentication data:", data);
			return data;
		} catch (error) {
			throw new Error(`Authentication failed: ${error.message}`);
		}
	};
	// // handle file selection
	// const handleFileChange = (e) => {
	// 	const file = e.target.files[0];
	// 	if (file) {
	// 		setSelectedFile(file);
	// 		setPreviewURL(URL.createObjectURL(file)); // create local preview
	// 	}
	// };

	useEffect(() => {
		if (selectedFile) handleUpload(); // auto upload on file select
	}, [selectedFile]);

	const handleSubmitOkayFromChild = (e) => {
		e.preventDefault();
		if (handleDoneRef.current&&imagePreview) {
			handleDoneRef.current.handleDone(); // parent directly triggers child’s function
			// handleUpload(e); // then upload
		} else if (!imagePreview) {
			handleUpload(e); // no image to process, just upload
		} else {
			console.warn("Child handleDone function not available");
			toast.error("Image processing not ready. Please try again.");
			return;
		}
	}
	// handle image upload first on button click then submit form after
	const handleUpload = async (e=null) => {
		if (e) e.preventDefault();

		console.log('Starting upload process...');
		console.log({selectedFile})
		// return

		// if (!selectedFile) {
		// 	toast.error("Please select a file first");
		// 	return;
		// }

		if (selectedFile instanceof Blob || selectedFile instanceof File) {
			try {
				const imageFormData = new FormData();
				imageFormData.append("file", selectedFile); // actual file
				imageFormData.append("fileName", "profile_photo.jpg");
				imageFormData.append("folder", "profile_photos");
			
				// get authentication signature from backend
				// const authResponse = await fetch(`${baseAPIURL}/imagekit-auth/`);
				const authData = await authenticator();
				if (!authData) throw new Error("Failed to get ImageKit auth data");
				console.log("Auth data for upload:", authData);
				console.log({baseAPIURL})
			
				// if (authData&&baseAPIURL) {
				imageFormData.append("publicKey", baseAPIURL?.IMAGEKIT_PUBLIC_KEY);
				imageFormData.append("signature", authData.signature);
				imageFormData.append("expire", authData.expire);
				imageFormData.append("token", authData.token);
				// }
				// return
			
				for (let [key, value] of imageFormData.entries()) {
					console.log(key, ":", value);
				}
				console.log("Uploading image to ImageKit...");

				// return

				// upload to imagekit
				const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
					method: "POST",
					// headers: {
					// 	Authorization: `Basic ${baseAPIURL.IMAGEKIT_PUBLIC_KEY + ":"}`,
					// 	// Public key only, followed by ":" (empty password)
					// },
					body: imageFormData,
					}
				);
		
				if (!uploadResponse.ok) {
					const errorText = "Upload failed"
					toast.error(errorText);
					throw new Error(errorText);
					// return;
				}
				const result = await uploadResponse.json();
				setUploadedImage(result); // save response
				console.log("Upload success:", result);
				onSubmitHandler(); // submit form after successful upload
			} catch (err) {
				toast.error('Upload failed. Please try again.');
				console.error("Upload failed:", err);
				return;
			}
		} else {
			// return
			onSubmitHandler(); // submit form after successful upload
		}
	};
	// useEffect(() => {
	// 	if (passwordErrorMessage) {
	// 		setAnimate(true);
	// 		const timer = setTimeout(() => setAnimate(false), 1000); // remove class after animation
	// 		return () => clearTimeout(timer);
	// 	}
	// }, [passwordErrorMessage]);

	console.log({country, state, city})
	console.log({formData})
	console.log('passwordErrorMessage', !!passwordErrorMessage, passwordErrorMessage)
	console.log({selectedFile})
	console.log({imagePreview})
	// console.log('handleDoneRef.current', handleDoneRef.current)

	useEffect(() => {
		if (!formData.email) {
			setIsEmailValid(null)
			return; // don't run if empty
		}

		// set a timer to detect "pause"
		const timer = setTimeout(() => {
			// Make server request here
			checkEmailUniqueness(formData.email);
		}, 1000); // waits 1s after last keystroke

		// cleanup old timer if user types again quickly
		return () => clearTimeout(timer);
	}, [formData.email]);

	const checkEmailUniqueness = async (email) => {
		try {
			const response = await fetch(`${baseURL}/check-email/${email}/`);
			const data = await response.json();
			console.log("Server says:", data);
			setIsEmailValid(data)
			return data
		} catch (error) {
			setIsEmailValid(null)
			// toast.error('Error checking email. Please try again.');
			console.error("Error checking email:", error);
		}
	};
	console.log({isEmailValid})
	console.log("not 'green", isEmailValid?.color!=='green')
	return (
		<>
			<form onSubmit={handleSubmitOkayFromChild}
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
														// ref={input.type==='email'?emailRef:null}
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
													// key={passwordErrorMessage}
													// className={animate ? "slideOutRight" : ""}
													style={{
														color: '#BC4B51',
														fontSize: '0.75rem',
														fontStyle: 'italic',
														// display: 'inline-block',
														// transform: 'skewX(-17deg)',
													}}>{passwordErrorMessage}</span>}
													{(input.type==='email'&&isEmailValid?.boolValue)&&
													<span
													// key={passwordErrorMessage}
													// className={animate ? "slideOutRight" : ""}
													style={{
														color: isEmailValid.color,
														fontSize: '0.75rem',
														// fontStyle: 'italic',
														display: 'inline-block',
														transform: 'skewX(-17deg)',
													}}>{isEmailValid?.message}</span>}
												</>}
									</div>
								)
							})}
							<div
							
							>
								<div
								className="col-md-6 form-group">
									{/* File Picker */}
									{/* <input type="file" accept="image/*" onChange={handleFileChange} /> */}

									{/* select, crop and compress file */}
									<ImageCropAndCompress
									onComplete={setSelectedFile}
									type={'profilePhoto'}
									ref={handleDoneRef}
									isImagePreview={setImagePreview} />

									{/* <div> */}
										{/* Local Preview */}
										{/* {previewURL && (
											<div className="mt-2">
												<img
													src={previewURL}
													alt="Local preview"
													className="w-24 h-24 rounded object-cover"
													style={{
														width: '100px',
														height: '100px',
														borderRadius: '8px',
														objectFit: 'cover',
													}}
												/>
											</div>
										)} */}

										{/* Upload Button */}
										{/* <button
											onClick={handleUpload}
											className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
											style={{
												backgroundColor: '#475569',
											}}
										>
											Upload to ImageKit
										</button> */}
									{/* </div> */}
								</div>
							</div>
							{/* <IKContext
								publicKey={baseAPIURL?.IMAGEKIT_PUBLIC_KEY}
								urlEndpoint={baseAPIURL?.IMAGEKIT_URL_ENDPOINT}
								authenticator={authenticator}
								>
									<IKUpload
									fileName={`profile_photo.jpg`}
									folder={`profile_photos`}
									onSuccess={handleUploadSuccess}
									onError={(err) => console.error("Upload error:", err)}
									className="p-2 border rounded cursor-pointer"
									/>
							</IKContext> */}
							{/* {selectedProfilePhoto && (
								<div className="mt-1">
								<p className="font-medium mb-0">Upload Success:</p>
								<IKImage
									src={selectedProfilePhoto.image_url}
									alt="Uploaded"
									urlEndpoint={baseAPIURL?.IMAGEKIT_URL_ENDPOINT}
									transformation={[
									{ width: 100, height: 100, crop: "fill" },
									{ quality: 80 },
									{ format: "webp" }
									]}
								/>
								</div>
							)} */}

						</div>
						<button
						type="submit"
						className="btn btn-block btn-auth font-weight-bold py-3"
						disabled={!isFieldsValid()||isEmailValid?.color!=='green'}
						>
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
				</div>
			</form>
		</>
	)
}
export { SignUp }
