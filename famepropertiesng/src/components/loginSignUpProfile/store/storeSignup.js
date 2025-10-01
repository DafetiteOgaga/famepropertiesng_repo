import { useEffect, useState, useRef } from "react";
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
import { useCreateStorage } from "../../../hooks/setupLocalStorage";
import { limitInput, useCountryStateCity } from "../profileSetup/formsMethods";
// import { inputArr } from "../signUpSetup/formInfo";
import {
	inputArr, isFieldsValid,
	checkEmailUniqueness, validateEmail,
	checkStoreNameUniqueness,
} from "./storeFormInfo";

const baseURL = getBaseURL();

const initialFormData = {
	store_name: '',
	description: '',
	business_registration_number: '',
	tax_identification_number: '',
	store_address: '',
	nearest_bus_stop: '',
	store_email_address: '',
	store_phone_number: '',
	previewURL: '',
	// image_url: '',
	// password: '',
	// password_confirmation: '',
	// country: '',
	// state: '',
	// stateCode: '',
	// phoneCode: '',
	// city: '',
	// hasStates: false,
	// hasCities: false,
}

// basic format check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StoreSignUp() {
	const { cscFormData, CountryCompSelect, StateCompSelect, CityCompSelect } = useCountryStateCity();
	// const [sellerValue, setSellerValue] = useState(null);
	const { createLocal } = useCreateStorage()
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	// const emailRef = useRef();
	const handleImageProcessingRef = useRef();
	const baseAPIURL = useImageKitAPIs()?.data;
	const navigate = useNavigate();
	// const [showPassword, setShowPassword] = useState(false);
	// const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	// const [country, setCountry] = useState(''); // whole country object
	// const [state, setState] = useState('');     // whole state object
	// const [city, setCity] = useState('');       // whole city object
	// const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
	// const [selectedProfilePhoto, setSelectedProfilePhoto] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null); // local file
	const [previewURL, setPreviewURL] = useState(null);     // local preview
	const [uploadedImage, setUploadedImage] = useState(null); // imagekit response like {image_url, fileId}
	const [fileName, setFileName] = useState('No file chosen');
	// const [returnedFile, setReturnedFile] = useState(null);
	// const [imagePreview, setImagePreview] = useState(false);
	const [formData, setFormData] = useState(initialFormData);
	const [isEmailValid, setIsEmailValid] = useState(null);
	const [isStoreNameAvailable, setIsStoreNameAvailable] = useState(null);
	const [isEmailLoading, setIsEmailLoading] = useState(false);
	const [isStoreLoading, setIsStoreLoading] = useState(false);
	const [isMounting, setIsMounting] = useState(true);
	const [fieldStats, setFieldStats] = useState({})
	const deviceType = useDeviceType().width <= 576;

	const {country, state, city, hasStates, hasCities, phoneCode: countryPhoneCode } = cscFormData;

	const userInfo = createLocal.getItem('fpng-user')
	// validate password on change
	// useEffect(() => {
	// 	validatePassword({formData, setPasswordErrorMessage})
	// }, [formData.password, formData.password_confirmation,
	// 	formData.username, formData.first_name,
	// 	formData.last_name,])

	// validate email on change
	useEffect(() => {
		// console.log('Email changed, validating format:', formData.store_email_address);
			validateEmail({
				email: formData.store_email_address,
				setIsEmailLoading})
	}, [formData.store_email_address])

	// start store name check on change
	useEffect(() => {
		if (formData.store_name) {
			setIsStoreLoading(true)
		}
	}, [formData.store_name])

	// handle input changes
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value, tagName } = e.target
		let maxChars;
		if (name==='store_name'||name==='store_email_address') {
			maxChars = 100;
		} else if (name==='store_phone_number') {
			maxChars = 20;
		} else if (name==='description') {
			maxChars = 200;
		} else if (name==='business_registration_number'||name==='tax_identification_number') {
			maxChars = 50;
		} else if (name==='store_address'||name==='nearest_bus_stop') {
			maxChars = 150;
		}
		// if (name==='store_name') setIsStoreLoading(true)
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
		// console.log({name})
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
		// setFormData(prev => ({
		// 	...prev,
		// ...cscFormData,
		// }))
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
	}, [
		// cscFormData,
		uploadedImage])

	// watches if type is password handles switching between text and password types
	// const getInputType = (input) => {
	// 	if (input.type !== "password") return input.type;
	// 	if (input.name === "password") return showPassword ? "text" : "password";
	// 	if (input.name === "password_confirmation") return showConfirmPassword ? "text" : "password";
	// 	return "password"; // default fallback
	// };

	// check if all required fields are filled
	const checkFields = isFieldsValid({formData});

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
			if (key==='previewURL') return; // skip password_confirmation from submission
			cleanedData[key] = (
				key==='fileId'||
				key==='image_url'||
				key==='business_registration_number'||
				key==='tax_identification_number'||
				key==='store_email_address'||
				key==='stateCode'||
				key==='phoneCode'||
				key==='hasStates'||
				key==='hasCities' ||
				key==='store_name'||
				typeof value === 'number'
			)?value:value.trim().toLowerCase();
			if (key==='store_email_address'||key==='store_name') cleanedData[key] = value.trim();
		})
		// add user ID to data
		cleanedData['userID'] = userInfo.id; // add user ID to data

		// console.log('submitting form:', cleanedData);
		// toast.success('Registration Successful!');
		try {
			const response = await fetch(`${baseURL}/store/${userInfo.id}/`, {
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
			const updateUserInfo = {
				...userInfo,
				is_seller: data?.user?.id === userInfo?.id,
				store: [...userInfo.store, data]
			};
			createLocal.setItem('fpng-user', updateUserInfo);
			console.log('Response data from server',data)
			toast.success(
				<div>
					Successful.<br />
					<strong>{titleCase(data.store_name)} Registered!</strong>
				</div>
			);
			setFormData(initialFormData); // reset form
			navigate('/profile') // go to home page after registration
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

		// prevent multiple store registration
		// if (userInfo?.is_seller) {
		// 	const errText = 'You already have a store registered'
		// 	toast.error(errText);
		// 	setIsError(errText);
		// 	return;
		// }

		setLoading(true);

		// if (!selectedFile) {
		// 	toast.error("Please select a file first");
		// 	return;
		// }

		// console.log("Uploading file:", selectedFile);
		if (selectedFile instanceof Blob || selectedFile instanceof File) {
			// console.log("File ready for upload:", selectedFile);
			try {
				const imageFormData = new FormData();
				imageFormData.append("file", selectedFile); // actual file
				imageFormData.append("fileName", "store_credential.jpg");
				imageFormData.append("folder", "store_credentials");
			
				// get authentication signature from backend
				const authData = await authenticator();
				if (!authData) throw new Error("Failed to get ImageKit auth data");
				// console.log("Auth data for upload:", authData);
				// console.log({baseAPIURL})
			
				// if (authData&&baseAPIURL) {
				imageFormData.append("publicKey", baseAPIURL?.IMAGEKIT_PUBLIC_KEY);
				imageFormData.append("signature", authData.signature);
				imageFormData.append("expire", authData.expire);
				imageFormData.append("token", authData.token);

				// upload to imagekit
				// console.log("Uploading to ImageKit...");
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
					console.warn(errorText, uploadResponse);
					toast.error(errorText);
					setLoading(false);
					throw new Error(errorText);
					// return;
				}
				const result = await uploadResponse.json();
				// console.log("Upload successful:", result);
				setUploadedImage(result); // save response
				// added image_url and fileId to formdata and finally submit form
				// this is setup in a useEffect above
			} catch (err) {
				toast.error('Upload failed. Please try again.');
				console.error("Upload failed:", err);
				return;
			}
			// finally {
			// 	setLoading(false);
			// }
		} else {
			// just submit if no file to upload
			// console.log("No file selected, skipping upload.");
			onSubmitToServerHandler(); // submit form after successful upload
		}
	};

	// check email uniqueness with debounce
	useEffect(() => {
		// don't run if empty or invalid format
		if (!formData.store_email_address||
			!emailRegex.test(formData.store_email_address)) {
			setIsEmailValid(null)
			setIsEmailLoading(false)
			return;
		}

		// set a timer to detect "pause"
		const timer = setTimeout(() => {
			// Make server request here
			checkEmailUniqueness({
				email: formData.store_email_address,
				setIsEmailLoading, setIsEmailValid
			});
		}, 2000); // waits Xs after last keystroke

		// cleanup old timer if user types again quickly
		return () => clearTimeout(timer);
	}, [formData.store_email_address]);

	// check store name uniqueness with debounce
	useEffect(() => {
		// don't run if empty or invalid format
		if (!formData.store_name) {
			setIsStoreNameAvailable(null)
			setIsStoreLoading(false)
			return;
		}

		// set a timer to detect "pause"
		const timer = setTimeout(() => {
			// Make server request here
			checkStoreNameUniqueness({
				name: formData.store_name,
				setIsStoreLoading, setIsStoreNameAvailable
			});
		}, 2000); // waits Xs after last keystroke

		// cleanup old timer if user types again quickly
		return () => clearTimeout(timer);
	}, [formData.store_name]);

	// clear error message after 3s
	useEffect(() => {
		if (isError) {
			const delay = setTimeout(() => {
				setIsError(null)
			}, 3000);
			return ()=>clearTimeout(delay)
		}
	}, [isError])

	const handleFileChange = (e) => {
		const file = e.target.files[0]; // get first selected file
		if (file) {
			setSelectedFile(file); // save file
			setFileName(file.name); // save file name
			const prevUrl = URL.createObjectURL(file);
			setPreviewURL(prevUrl); // generate preview URL
			setFormData(prev => ({
				...prev,
				previewURL: prevUrl,
			}))
		}
	};

	// console.log({country, state, city})
	// console.log({userInfo})
	// console.log({store:userInfo?.store})
	// console.log({seller:userInfo?.is_seller})
	// const userInfoSeller = userInfo?.is_seller;
	// console.log({userInfoSeller})
	// console.log({sellerValue})
	// const updatedSeller = sellerValue?.user?.is_seller
	// console.log({updatedSeller})
	// console.log({formData})
	// console.log({checkFields})
	// console.log({selectedFile}, 'is and instance of blob, file:', selectedFile instanceof Blob, selectedFile instanceof File)
	// console.log({previewURL})
	// console.log({isEmailLoading})
	useEffect(() => {
		// flip loading off immediately after mount
		setIsMounting(false);
	}, []);
	// console.log('csc =', {country, state, city, hasStates, hasCities})
	// console.log({cscFormData})
	return (
		<>
			<Breadcrumb page={'Register Store'} />

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
					width: deviceType?'':'70%',
				}}>
					{/* <div className=""> */}
					<h2 className="section-title position-relative text-uppercase mt-3 text-uppercase">
						<span className="bg-secondary"
						style={{color: '#475569'}}>
							Become a seller
						</span>
					</h2>
					{/* </div> */}
					<div className={`bg-light ${deviceType?'p-18':'p-30'} mb-5`}
					style={{borderRadius: '10px'}}>
						<div className="row">
							{inputArr.map((input, index) => {
								const phone = input.name==='store_phone_number';
								// console.log(input.name, '-', {phone})
								return (
									<div key={index}
									className="col-md-6 form-group">
										<label
										htmlFor={input.name}>{titleCase(input.name)}<span>{`${input.important?'*':''}`}</span></label>
										{input.name==='country' ?
										CountryCompSelect
										// <CountrySelect
										// id={input.name}
										// value={country}
										// onChange={(val) => setCountry(val)}
										// placeHolder="Select Country"
										// />
										:
										input.name==='state' ?
											StateCompSelect
											// <StateSelect
											// id={input.name}
											// key={country?.id || "no-country"} // to reset when country changes
											// countryid={country?.id}
											// value={state}
											// onChange={(val) => setState(val)}
											// placeHolder="Select State"
											// />
											:
											input.name==='city' ?
												CityCompSelect
												// <CitySelect
												// id={input.name}
												// key={`${country?.id || "no-country"}-${state?.id || "no-state"}`}
												// countryid={country?.id}
												// stateid={state?.id}
												// value={city}
												// onChange={(val) => setCity(val)}
												// placeHolder="Select City"
												// />
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
														}}>+{userInfo.phoneCode}</p>}
														<input
														// ref={input.type==='email'?emailRef:null}
														id={input.name}
														name={input.name}
														onChange={onChangeHandler}
														value={formData[input.name]}
														style={{borderRadius: '5px'}}
														className="form-control"
														type={input}
														required={input.important}
														disabled={!input.important&&input.name!=='description'}
														// autoComplete={input.autoComplete}
														{...input.phoneProps}
														placeholder={input.placeholder}/>
													</div>

													{/* Store name note and check */}
													{(input.name==='store_name')&&
													<StoreNameAndNoteValidText
													isStoreNameAvailable={isStoreNameAvailable}
													isStoreLoading={isStoreLoading} />}

													{/* email validity messages */}
													{(input.type==='email')&&
													<EmailValidText
													isEmailValid={isEmailValid}
													isEmailLoading={isEmailLoading} />}

													{/* email loading spinner */}
													{/* {(input.type==='email'&&isEmailLoading)&&
													<BouncingSpinner />} */}
												</>}

												<span
												style={{
													fontSize: '0.625rem',
													color: fieldStats[input.name]?.colorIndicator
												}}
												className={`justify-content-end d-flex font-italic`}>
												{fieldStats[input.name]?.charCount ?
													<>
														{`${fieldStats[input.name]?.charCount}/${fieldStats[input.name]?.maxCharsLimit} chars`}
													</>
													:null}
												
												</span>
									</div>
								)
							})}
							<div className="d-flex align-items-start justify-content-center flex-column col-md-6 form-group">
								{/* File Picker */}
								<>
									<label
									htmlFor="localFileUpload"
									className="custom-upload-btn bg-dark"
									style={{
										marginBottom: 0,
									}}>
										{previewURL?'Change':'Select'} Store Credential
									</label>
									<span
									className="ml-2"
									style={{
										fontSize: '0.9rem',
										textWrap: 'nowrap',
									}}>
										{fileName.length>15?fileName.slice(0, 15)+'... '+fileName.slice(fileName.lastIndexOf('.')):fileName}
									</span>
								</>
								<input
								type="file"
								id={`localFileUpload`}
								style={{display: 'none'}}
								accept="image/*"
								onChange={handleFileChange} />

								{/* Image Preview */}
								{previewURL && (
									<div style={{ marginTop: "3px" }}>
										<img
											src={previewURL}
											alt="Preview"
											style={{ width: "200px", height: "auto", borderRadius: "8px" }}
										/>
										<button
										type="button"
										onClick={() => {
											setSelectedFile(null);
											setPreviewURL(null);
											setFileName('No file chosen');
											setFormData(prev => ({
												...prev,
												previewURL: ''
											}))
										}}
										className="btn btn-sm btn-danger d-block mt-2"
										>
											Remove
										</button>
									</div>
								)}

								{/* select, crop and compress file */}
								{/* <ImageCropAndCompress
								onComplete={setSelectedFile}
								type={'profilePhoto'}
								ref={handleImageProcessingRef}
								isImagePreview={setImagePreview} /> */}

							</div>
						</div>

						{/* sign up button */}
						<button
						type="submit"
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={
							!checkFields||
							// isEmailValid?.color!=='green'||
							loading||
							!previewURL||
							isStoreNameAvailable?.color!=='green'
						}
						>
							{!loading?'Register Store':<BouncingDots size="sm" color="#fff" p="1" />}
						</button>

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

function StoreNameAndNoteValidText({
	isStoreNameAvailable, isStoreLoading}) {
	return (
		<>
			{isStoreLoading ?
			<BouncingSpinner />
			:
			<span
			style={{
				color: isStoreNameAvailable?.color||'',
				fontSize: (isStoreNameAvailable?.color)?'0.75rem':'0.6rem',
				display: 'inline-block',
				transform: 'skewX(-17deg)',
			}}>{isStoreNameAvailable?.message||`Note: Store name is case sensitive and must be unique`}</span>}
		</>
	)
}
function EmailValidText({
	isEmailValid, isEmailLoading}) {
		// console.log({isEmailLoading})
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
export { StoreSignUp }
