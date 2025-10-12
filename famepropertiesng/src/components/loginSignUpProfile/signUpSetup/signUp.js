import { useEffect, useState, useRef } from "react";
import { Breadcrumb } from "../../sections/breadcrumb"
import { useDeviceType } from "../../../hooks/deviceType"
import { Link, useNavigate } from 'react-router-dom';
import { titleCase } from "../../../hooks/changeCase";
import { toast } from "react-toastify";
import { useAuthFetch } from "../authFetch";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { ImageCropAndCompress } from "../../../hooks/fileResizer/ImageCropAndCompress";
import { BouncingDots } from "../../../spinners/spinner";
import { limitInput, useCountryStateCity, onlyNumbers,
			emailRegex
} from "../../../hooks/formMethods/formMethods";
import {
	inputArr, isFieldsValid, validatePassword,
	checkEmailUniqueness, validateEmail,
} from "./signUpFormInfo";
import { useUploadToImagekit } from "../../imageServer/uploadToImageKit";

const baseURL = getBaseURL();

const initialFormData = {
	first_name: '',
	last_name: '',
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

function SignUp() {
	const postToImagekit = useUploadToImagekit()
	const authFetch = useAuthFetch();
	const { cscFormData, cscRequiredFieldsGood, CountryCompSelect, StateCompSelect, CityCompSelect } = useCountryStateCity();
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const handleImageProcessingRef = useRef();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null); // local file
	const [uploadedImage, setUploadedImage] = useState(null); // imagekit response like {image_url, fileId}
	const [imagePreview, setImagePreview] = useState(false);
	const [formData, setFormData] = useState(initialFormData);
	const [isEmailValid, setIsEmailValid] = useState(null);
	const [isEmailLoading, setIsEmailLoading] = useState(false);
	const [fieldStats, setFieldStats] = useState({})
	const [isMounting, setIsMounting] = useState(true);
	const deviceType = useDeviceType().width <= 576;

	const {country, state, city, hasStates, hasCities, phoneCode: countryPhoneCode } = cscFormData;

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

		let cleanedValue = value;
		let maxChars;
		if (name==='first_name'||name==='last_name'||name==='username') {
			maxChars = 50;
		} else if (name==='email') {
			maxChars = 100;
		} else if (name==='mobile_no') {
			cleanedValue = onlyNumbers(value);
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
			limitInput(cleanedValue, maxChars, undefined, isTextArea);
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
			...cscFormData,
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
	}, [cscFormData, uploadedImage])

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
				key==='country' ||
				key==='state' ||
				key==='city' ||
				key==='cityId' ||
				key==='stateId' ||
				typeof value === 'number'
			)?value:value.trim().toLowerCase();
			if (key==='email') cleanedData[key] = value.trim()
		})
		try {
			const response = await authFetch(`${baseURL}/users/`, {
				method: "POST",
				headers: 'no-header',
				body: cleanedData,
			});

			const data = await response // .json();
			if (!data) return
			console.log('Response data from server',data)
			toast.success(
				<div>
					Registration Successful.<br />
					Welcome, <strong>{titleCase(data.first_name)}!</strong>
				</div>
			);
			setFormData(initialFormData); // reset form
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

	// auto submit form when formData has url and fileID filled (i.e when image has been uploded to cloud)
	useEffect(() => {
		if (formData.image_url&&formData.fileId) onSubmitToServerHandler(); // auto submit on image upload
	}, [formData.image_url, formData.fileId]);

	// handle image upload to cloud then finally submit form after
	const handleImageUploadToCloud = async (e=null) => {
		if (e) e.preventDefault();

		setLoading(true);

		if (selectedFile instanceof Blob || selectedFile instanceof File) {
			const imageKitResponse = await postToImagekit({
				selectedFile,
				fileName: "profile_photo.jpg",
				folder: "profile_photos"
			});
			if (!imageKitResponse) {
				setLoading(false);
				return; // upload failed, stop here.
			}
			setUploadedImage(imageKitResponse); // save response
			setLoading(false);
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
		setIsMounting(false);
	}, []);

	return (
		<>
			{!isMounting ?
			<form onSubmit={handleImageUploadToCloud}
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
								if ((input?.name.toLowerCase()==='state'||
									input?.name.toLowerCase()==='city')&&
									hasStates===false) return null;
								if (input?.name.toLowerCase()==='city'&&
									(hasCities)===false) return null;
								if ((input?.name.toLowerCase()==='state'||
									input?.name.toLowerCase()==='city')&&
									country==='') return null;
								if (input?.name.toLowerCase()==='city'&&
									state==='') return null;
								return (
									<div key={index}
									className="col-md-6 form-group">
										<label
										htmlFor={input.name}>{titleCase(input.name)}<span>{`${input.important?'*':''}`}</span></label>
										{input.name==='country' ?
										CountryCompSelect
										:
										input.name==='state' ?
											StateCompSelect
											:
											input.name==='city' ?
												CityCompSelect
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
														}}>{countryPhoneCode}</p>}
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

													{/* password error messages */}
													{input.type==='password'&&
													<PasswordErrorMessage
													passwordErrorMessage={passwordErrorMessage} />}

													{/* email validity messages */}
													{(input.type==='email')&&
													<EmailValidText
													isEmailValid={isEmailValid}
													isEmailLoading={isEmailLoading} />}

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
														fieldStats[input.name]?.charCount ?
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

									{/* select, crop and compress file */}
									<ImageCropAndCompress
									buttonText={'profile picture'}
									onComplete={setSelectedFile}
									type={'profilePhoto'}
									ref={handleImageProcessingRef}
									isImagePreview={setImagePreview} />
								</div>
							</div>
						</div>

						{/* sign up button */}
						<button
						type="submit"
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={
							!checkFields||
							isEmailValid?.color!=='green'||
							loading||
							!cscRequiredFieldsGood
						}
						>
							{!loading?'Sign Up':<BouncingDots size="sm" color="#fff" p="1" />}
						</button>

						{/* link to login page */}
						<LinkToLogin />

						{/* show error response message */}
						{isError && <ShowErrorFromServer isError={isError} />}
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
