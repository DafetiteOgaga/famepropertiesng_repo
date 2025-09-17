import { useEffect, useState, useRef } from "react";
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import 'react-country-state-city/dist/react-country-state-city.css';
import { Breadcrumb } from "../../sections/breadcrumb"
import { useDeviceType } from "../../../hooks/deviceType"
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthButtonAndSetup } from "../../../hooks/allAuth/googleAuthButtonAndSetup";
import { titleCase } from "../../../hooks/changeCase";
import { useAuth } from "../../../hooks/allAuth/authContext";
import { toast } from "react-toastify";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { IKContext, IKUpload, IKImage } from "imagekitio-react";
import { useImageKitAPIs } from "../../../hooks/fetchAPIs";
import { ImageCropAndCompress } from "../../../hooks/fileResizer/ImageCropAndCompress";
import { BouncingDots } from "../../../spinners/spinner";
import { authenticator } from "../dynamicFetchSetup";
import { limitInput } from "../profileSetup/profileMethods";
import {
	inputArr, isFieldsValid, validatePassword,
	checkEmailUniqueness, validateEmail,
} from "./signUpFormInfo";

const baseURL = getBaseURL();

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
	currency: '',
	currencyName: '',
	currencySymbol: '',
	countryEmoji: '',
	city: '',
	hasStates: false,
	hasCities: false,
}

// basic format check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignUp() {
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	// const emailRef = useRef();
	const handleImageProcessingRef = useRef();
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
	const [imagePreview, setImagePreview] = useState(false);
	const [formData, setFormData] = useState(initialFormData);
	const [isEmailValid, setIsEmailValid] = useState(null);
	const [isEmailLoading, setIsEmailLoading] = useState(false);
	const [fieldStats, setFieldStats] = useState({})
	const [isMounting, setIsMounting] = useState(true);
	const deviceType = useDeviceType().width <= 576;

	// validate password on change
	useEffect(() => {
		validatePassword({formData, setPasswordErrorMessage})
	}, [formData.password, formData.password_confirmation,
		formData.username, formData.first_name,
		formData.last_name,])

	// validate email on change
	useEffect(() => {
			validateEmail({
				email: formData.email,
				setIsEmailLoading})
	}, [formData.email])

	// handle input changes
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value, tagName } = e.target

		let maxChars;
		if (name==='first_name'||name==='last_name'||name==='username') {
			maxChars = 50;
		} else if (name==='email') {
			maxChars = 100;
		} else if (name==='mobile_no') {
			maxChars = 20;
		} else if (name==='password'||name==='password_confirmation') {
			maxChars = 64;
		} else if (name==='address'||name==='nearest_bus_stop') {
			maxChars = 150;
		}

		// auto-detect textarea
		const isTextArea = String(tagName).toUpperCase() === 'TEXTAREA';

		// pass explicit limits so behavior is clear
		const {
			value: limitedValue,
			charCount,
			wordCount,
			colorIndicator,
			maxCharsLimit,
			maxWords,
		} =
			limitInput(value, maxChars, undefined, isTextArea);
		setFormData(prev => ({
			...prev,
			[name]: limitedValue
		}))
		setFieldStats(prev => ({
			...prev,
			[name]: { charCount, wordCount, colorIndicator,
						maxCharsLimit, maxWords,
					},
		}))
	}

	// updates country, state, city and image details in formData whenever they change
	useEffect(() => {
		setFormData(prev => ({
			...prev,

			// country
			country: country?.name||null,
			countryId: country?.id||null,
			phoneCode: country?.phone_code||null,
			currency: country?.currency||null,
			currencyName: country?.currency_name||null,
			currencySymbol: country?.currency_symbol||null,
			countryEmoji: country?.emoji||null,
			hasStates: country?.hasStates||false,

			// state
			state: country?.hasStates?(state?.name):null,
			stateId: country?.hasStates?(state?.id):null,
			stateCode: country?.hasStates?(state?.state_code):null,
			hasCities: state?.hasCities||false,

			// city
			city: state?.hasCities?(city?.name):null,
			cityId: state?.hasCities?(city?.id):null,
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
			setUploadedImage(null);
		}
	}, [country, state, city, uploadedImage])

	// watches if type is password handles switching between text and password types
	const getInputType = (input) => {
		if (input.type !== "password") return input.type;
		if (input.name === "password") return showPassword ? "text" : "password";
		if (input.name === "password_confirmation") return showConfirmPassword ? "text" : "password";
		return "password"; // default fallback
	};

	// check if all required fields are filled
	const checkFields = isFieldsValid({formData, passwordErrorMessage});

	// handles final form submission
	const onSubmitToServerHandler = async (e=null) => {
		if (e) e.preventDefault();

		setLoading(true);

		if (!checkFields) {
			console.warn('Form is invalid');
			toast.error('Error! All fields with * are required');
			return;
		}
		const cleanedData = {};
		Object.entries(formData).forEach(([key, value]) => {
			if (key==='password_confirmation') return; // skip password_confirmation from submission
			cleanedData[key] = (
				key==='fileId'||
				key==='image_url'||
				key==='stateCode'||
				key==='phoneCode'||
				key==='currency'||
				key==='currencyName'||
				key==='currencySymbol'||
				key==='countryEmoji'||
				key==='password' ||
				key==='hasStates'||
				key==='hasCities' ||
				key==='email' ||
				typeof value === 'number'
			)?value:value.trim().toLowerCase();
			if (key==='email') cleanedData[key] = value.trim()
		})
		// console.log('submitting form:', cleanedData);
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
				setIsError(errorData?.error)
				setLoading(false);
				console.warn('Registration Error:', errorData);
				toast.error(errorData?.error || 'Registration Error!');
				return;
			}
			const data = await response.json();
			// console.log('Response data from server',data)
			toast.success(
				<div>
					Registration Successful.<br />
					Welcome, <strong>{titleCase(data.first_name)}!</strong>
				</div>
			);
			// toast.success(`Registration Successful.\nWelcome, ${data.first_name}!`);
			setFormData(initialFormData); // reset form
			// navigate('/welcome')
			navigate('/login') // go to login page after signup
			return data;
		} catch (error) {
			console.error("Error during registration:", error);
			toast.error('Error! Registration Failed. Please try again.');
			return null;
		} finally {
			setLoading(false);
		}
	}

	// auto upload when selectedFile changes (i.e when image has been processed)
	// useEffect(() => {
	// 	console.log("Selected file changed:", selectedFile);
	// 	if (selectedFile) handleImageUploadToCloud(); // auto upload on file select
	// }, [selectedFile]);

	// auto submit form when formData has url and fileID filled (i.e when image has been uploded to cloud)
	useEffect(() => {
		// console.log('formData.image_url or formData.fileId changed:', formData.image_url, formData.fileId);
		if (formData.image_url&&formData.fileId) onSubmitToServerHandler(); // auto submit on image upload
	}, [formData.image_url, formData.fileId]);

	// handle start of form submission, trigger child to process image first if any
	// const handleSubmitOkayFromChild = (e) => {
	// 	e.preventDefault();
	// 	setLoading(true);
	// 	if (handleImageProcessingRef.current&&imagePreview) {
	// 		console.log("Triggering child handleImageProcessing function...");
	// 		console.log('selectedFile before child processing:', selectedFile);
	// 		handleImageProcessingRef.current.handleImageProcessing(); // parent directly triggers child’s function
	// 		console.log('selectedFile after child processing:', selectedFile);
	// 		// handleImageUploadToCloud(e); // then upload
	// 	} else if (!imagePreview) {
	// 		console.log("No image selected, skipping processing...");
	// 		handleImageUploadToCloud(e); // no image to process, just upload
	// 	} else {
	// 		console.warn("Child handleImageProcessing function not available");
	// 		toast.error("Image processing not ready. Please try again.");
	// 		return;
	// 	}
	// }

	// handle image upload to cloud then finally submit form after
	const handleImageUploadToCloud = async (e=null) => {
		if (e) e.preventDefault();

		setLoading(true);

		// if (!selectedFile) {
		// 	toast.error("Please select a file first");
		// 	return;
		// }

		// console.log("Uploading file:", selectedFile);
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
				// console.log("Auth data for upload:", authData);
				// console.log({baseAPIURL})
			
				// if (authData&&baseAPIURL) {
				imageFormData.append("publicKey", baseAPIURL?.IMAGEKIT_PUBLIC_KEY);
				imageFormData.append("signature", authData.signature);
				imageFormData.append("expire", authData.expire);
				imageFormData.append("token", authData.token);
				// }
				// return
			
				// for (let [key, value] of imageFormData.entries()) {
				// 	console.log(key, ":", value);
				// }
				// console.log("Uploading image to ImageKit...");

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
					setLoading(false);
					throw new Error(errorText);
					// return;
				}
				const result = await uploadResponse.json();
				// console.log("Upload successful:", result);
				setUploadedImage(result); // save response

				// finally submit form
				// onSubmitToServerHandler(); // submit form after successful upload
			} catch (err) {
				toast.error('Upload failed. Please try again.');
				console.error("Upload failed:", err);
				return;
			} finally {
				setLoading(false);
			}
		} else {
			// just submit if no file to upload
			onSubmitToServerHandler(); // submit form after successful upload
		}
	};

	// check email uniqueness with debounce
	useEffect(() => {
		// don't run if empty or invalid format
		if (!formData.email||!emailRegex.test(formData.email)) {
			setIsEmailValid(null)
			setIsEmailLoading(false)
			return;
		}

		// set a timer to detect "pause"
		const timer = setTimeout(() => {
			// Make server request here
			checkEmailUniqueness({
				email: formData.email,
				setIsEmailLoading, setIsEmailValid
			});
		}, 2000); // waits Xs after last keystroke

		// cleanup old timer if user types again quickly
		return () => clearTimeout(timer);
	}, [formData.email]);

	// clear error message after 3s
	useEffect(() => {
		if (isError) {
			const delay = setTimeout(() => {
				setIsError(null)
			}, 3000);
			return ()=>clearTimeout(delay)
		}
	}, [isError])

	useEffect(() => {
		// flip loading off immediately after mount
		setIsMounting(false);
	}, []);

	console.log({country, state, city})
	// console.log({formData})
	console.log({selectedFile})
	return (
		<>
			{!isMounting ?
			<form onSubmit={handleImageUploadToCloud}
			// onSubmit={handleSubmitOkayFromChild}
			className="row px-xl-5"
			style={{
				display: 'flex',
				justifyContent: 'center',
			}}>
				<div className=""
				style={{
					padding: deviceType?'0 1rem':'0 1rem',
					width: deviceType?'':'60%',
				}}>
					<h5 className="text-uppercase mb-3">
						<span className="bg-secondary pr-3"
						style={{color: '#475569'}}>
							Sign Up
						</span>
					</h5>
					<div className={`bg-light ${deviceType?'p-18':'p-30'} mb-5`}
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

													{/* password error messages */}
													{input.type==='password'&&
													<PasswordErrorMessage
													passwordErrorMessage={passwordErrorMessage} />}

													{/* email validity messages */}
													{(input.type==='email')&&
													<EmailValidText
													isEmailValid={isEmailValid}
													isEmailLoading={isEmailLoading} />}

													{/* email loading spinner */}
													{/* {(input.type==='email'&&isEmailLoading)&&
													<BouncingSpinner />} */}
												</>}
												<>
													{!['email','password', 'password_confirmation', 'mobile_no'].includes(input.name)&&
													<span
													style={{
														fontSize: '0.625rem',
														color: fieldStats[input.name]?.colorIndicator
													}}
													className={`justify-content-end d-flex font-italic`}>
													{
													// (
														fieldStats[input.name]?.charCount ?
													// ||
													// 	fieldStats[input.name]?.wordCount) ?
													// 		(isTextArea ?
													// 		<>
													// 			{`${fieldStats[input.name]?.charCount} chars • ${fieldStats[input.name]?.wordCount}/${fieldStats[input.name]?.maxWords} words`}
													// 		</>
													// 		:
															<>
																{`${fieldStats[input.name]?.charCount}/${fieldStats[input.name]?.maxCharsLimit} chars`}
															</>:null}
													
													</span>}
												</>
									</div>
								)
							})}
							<div>
								<div
								className="col-md-6 form-group">
									{/* File Picker */}
									{/* <input type="file" accept="image/*" onChange={handleFileChange} /> */}

									{/* select, crop and compress file */}
									<ImageCropAndCompress
									buttonText={'profile picture'}
									onComplete={setSelectedFile}
									type={'profilePhoto'}
									ref={handleImageProcessingRef}
									isImagePreview={setImagePreview} />

									{/* <button
									type="button"
									onClick={() => {
										setSelectedFile(null);
										setPreviewURL(null);
										setFormData(prev => ({
											...prev,
											previewURL: ''
										}))
									}}
									className="btn btn-sm btn-danger d-block mt-2"
									>
										Remove
									</button> */}
								</div>
							</div>
						</div>

						{/* sign up button */}
						<button
						type="submit"
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={!checkFields||isEmailValid?.color!=='green'||loading}
						>
							{!loading?'Sign Up':<BouncingDots size="sm" color="#fff" p="1" />}
						</button>

						{/* link to login page */}
						<LinkToLogin />

						{/* show error response message */}
						{isError && <ShowErrorFromServer isError={isError} />}


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
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"14"} />}
		</>
	)
}

function PasswordErrorMessage({passwordErrorMessage}) {
	return (
		<>
			<span
			style={{
				color: '#BC4B51',
				fontSize: '0.75rem',
				fontStyle: 'italic',
			}}>{passwordErrorMessage}</span>
		</>
	)
}
function EmailValidText({
	isEmailValid, isEmailLoading}) {
	return (
		<>
			{isEmailLoading ?
			<BouncingSpinner />
			:
			<span
			style={{
				color: isEmailValid?.color,
				fontSize: '0.75rem',
				display: 'inline-block',
				transform: 'skewX(-17deg)',
			}}>{isEmailValid?.message}</span>}
		</>
	)
}
function BouncingSpinner() {
	return (
		<>
			<span
			style={{
				display: 'inline-block',
				marginLeft: '0.5rem',
			}}>
				<BouncingDots size="vm" color="#475569" p="0" />
			</span>
		</>
	)
}
function ShowErrorFromServer({isError}) {
	return (
		<>
			<p
			style={{
				color: '#BC4B51',
				textAlign: 'center',
				fontWeight: "bold",
				fontStyle: 'italic',
				fontSize: '0.9rem',
			}}>
				{isError}
			</p>
		</>
	)
}
function LinkToLogin() {
	return (
		<>
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
		</>
	)
}
export { SignUp }
