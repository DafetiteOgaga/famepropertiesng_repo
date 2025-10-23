import { useEffect, useState } from "react";
import { Breadcrumb } from "../../sections/breadcrumb"
import { useDeviceType } from "../../../hooks/deviceType"
import { useNavigate } from 'react-router-dom';
import { titleCase } from "../../../hooks/changeCase";
import { useAuthFetch } from "../authFetch";
import { toast } from "react-toastify";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { BouncingDots } from "../../../spinners/spinner";
import { useCreateStorage } from "../../../hooks/setupLocalStorage";
import { limitInput, useCountryStateCity, onlyNumbers,
			emailRegex,
} from "../../../hooks/formMethods/formMethods";
import {
	inputArr, isFieldsValid,
	checkEmailUniqueness, validateEmail,
	checkStoreNameUniqueness,
} from "./storeFormInfo";
import { useUploadToImagekit } from "../../imageServer/uploadToImageKit";

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
}

function StoreSignUp() {
	const postToImagekit = useUploadToImagekit();
	const authFetch = useAuthFetch();
	const { cscFormData, CountryCompSelect, StateCompSelect, CityCompSelect } = useCountryStateCity();
	const { createLocal } = useCreateStorage()
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const navigate = useNavigate();
	const [selectedFile, setSelectedFile] = useState(null); // local file
	const [previewURL, setPreviewURL] = useState(null);     // local preview
	const [uploadedImage, setUploadedImage] = useState(null); // imagekit response like {image_url, fileId}
	const [fileName, setFileName] = useState('No file chosen');
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

	// validate email on change
	useEffect(() => {
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
		let cleanedValue = value;
		let maxChars;
		if (name==='store_name'||name==='store_email_address') {
			maxChars = 100;
		} else if (name==='store_phone_number') {
			cleanedValue = onlyNumbers(value);
			maxChars = 20;
		} else if (name==='description') {
			maxChars = 200;
		} else if (name==='business_registration_number'||name==='tax_identification_number') {
			maxChars = 50;
		} else if (name==='store_address'||name==='nearest_bus_stop') {
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
	}, [uploadedImage])

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

		try {
			const response = await authFetch(`store/${userInfo.id}/`, {
				method: "POST",
				body: cleanedData,
			});
			const data = await response // .json();
			if (!data) return
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

	// auto submit form when formData has url and fileID filled (i.e when image has been uploded to cloud)
	useEffect(() => {
		if (formData.image_url&&formData.fileId) onSubmitToServerHandler(); // auto submit on image upload
	}, [formData.image_url, formData.fileId]);

	// handle image upload to cloud then finally submit form after
	const handleImageUploadToCloud = async (e=null) => {
		if (e) e.preventDefault();

		setLoading(true);

		// console.log("Uploading file:", selectedFile);
		if (selectedFile instanceof Blob || selectedFile instanceof File) {
			const imageKitResponse = await postToImagekit({
				selectedFile,
				fileName: "store_credential.jpg",
				folder: "store_credentials"
			});
			if (!imageKitResponse) {
				setLoading(false);
				return; // upload failed, stop here.
			}
			setUploadedImage(imageKitResponse); // save response
			// setLoading(false);
		} else {
			// just submit if no file to upload
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
	useEffect(() => {
		setIsMounting(false);
	}, []);
	return (
		<>
			<Breadcrumb page={'Register Store'} />

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
					width: deviceType?'':'70%',
				}}>
					<h2 className="section-title position-relative text-uppercase mt-3 text-uppercase">
						<span className="bg-secondary"
						style={{color: '#475569'}}>
							Become a seller
						</span>
					</h2>
					<div className={`bg-light ${deviceType?'p-18':'p-30'} mb-5`}
					style={{borderRadius: '10px'}}>
						<div className="row">
							{inputArr.map((input, index) => {
								const phone = input.name==='store_phone_number';
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
														}}>+{userInfo.phoneCode}</p>}
														<input
														id={input.name}
														name={input.name}
														onChange={onChangeHandler}
														value={formData[input.name]}
														style={{borderRadius: '5px'}}
														className="form-control"
														type={input}
														required={input.important}
														disabled={!input.important&&input.name!=='description'}
														autoComplete={input.autoComplete}
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
							</div>
						</div>

						{/* sign up button */}
						<button
						type="submit"
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={
							!checkFields||
							loading||
							!previewURL||
							isStoreNameAvailable?.color!=='green'
						}
						>
							{!loading?'Register Store':<BouncingDots size="sm" color="#fff" p="1" />}
						</button>

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
