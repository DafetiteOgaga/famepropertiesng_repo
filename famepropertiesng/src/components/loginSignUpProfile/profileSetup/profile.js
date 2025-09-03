import { useEffect, useState, useRef, Fragment } from "react";
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import 'react-country-state-city/dist/react-country-state-city.css';
import { Breadcrumb } from "../../sections/breadcrumb"
import { useDeviceType } from "../../../hooks/deviceType"
import { Link, useNavigate } from 'react-router-dom';
import { formatPhoneNumber, sentenceCase, titleCase } from "../../../hooks/changeCase";
import { toast } from "react-toastify";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { useCreateStorage } from "../../../hooks/setupLocalStorage";
import { useImageKitAPIs } from "../../../hooks/fetchAPIs";
import { ImageCropAndCompress } from "../../../hooks/fileResizer/ImageCropAndCompress";
import { BouncingDots } from "../../../spinners/spinner";
import { authenticator } from "../dynamicFetchSetup";
import { isFieldsValid, validatePassword } from "../signUpSetup/formInfo";
import { reOrderFields, toTextArea } from "./profileMethods";

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
	city: '',
}

// basic format check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Profile() {
	const updatedFieldRef = useRef(null);
	const handleImageProcessingRef = useRef();
	const { createLocal } = useCreateStorage();
	const [loading, setLoading] = useState(false);
	const baseAPIURL = useImageKitAPIs()?.data;
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [country, setCountry] = useState(''); // whole country object
	const [state, setState] = useState('');     // whole state object
	const [city, setCity] = useState('');       // whole city object
	const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null); // local file
	const uploadedImage = useRef(null);
	const [imagePreview, setImagePreview] = useState(false);
	const [formData, setFormData] = useState(initialFormData);
	const deviceType = useDeviceType().width <= 576;
	const [editFields, setEditFields] = useState({});
	const userInfoRef = useRef(false)
	const [imgPreview, setImgPreview] = useState(null);

	// get user info from local storage if any
	const userInfo = createLocal.getItem('fpng-user');


	// Step 1: Load userInfo into state once (so it's stable)
	// const [userInfo] = useState(() => {
	// 	const stored = createLocal.getItem('fpng-user');
	// 	return stored ? stored : null;
	// });
	useEffect(() => {
		if (userInfo&&!userInfoRef.current) {
			// console.log('User info found in local storage:', userInfo);
			setEditFields(prev => ({
				...prev,
				...Object.keys(userInfo).reduce((acc, key) => {
					acc[key] = false;
					return acc;
				}, {})
			}));
			userInfoRef.current = true;
		} else {
		// console.log('No user info found in local storage.');
		}
	}, [userInfo])
	// console.log('userInfo from local storage:', userInfo);
	// console.log('testget from local storage:', testget);

	useEffect(() => {
		if (userInfo) {
			setFormData(prev => ({
				...prev,
				...userInfo,
				email: userInfo.email||'',
				first_name: userInfo.first_name||'',
				last_name: userInfo.last_name||'',
				username: userInfo.username||'',
				address: userInfo.address||'',
				nearest_bus_stop: userInfo.nearest_bus_stop||'',
				mobile_no: userInfo.mobile_no||'',
				country: userInfo.country||'',
				countryId: userInfo.countryId||'',
				state: userInfo.state||'',
				stateId: userInfo.stateId||'',
				stateCode: userInfo.stateCode||'',
				phoneCode: userInfo.phoneCode||'',
				city: userInfo.city||'',
				cityId: userInfo.cityId||'',
			}))
			if (userInfo.country) {
				setCountry({
					name: userInfo.country,
					phone_code: userInfo.phoneCode,
					id: userInfo.countryId,
				})
			}
			if (userInfo.state) {
				setState({
					name: userInfo.state,
					state_code: userInfo.stateCode,
					id: userInfo.stateId,
				})
			}
			if (userInfo.city) {
				setCity({
					name: userInfo.city,
					id: userInfo.cityId,
				})
			}
		}
		// console.log('userInfo effect ran');
	}, [])

	// validate password on change
	useEffect(() => {
		validatePassword({formData, setPasswordErrorMessage})
	}, [formData.password, formData.password_confirmation,
		formData.username, formData.first_name,
		formData.last_name,])

	// handle input changes
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value } = e.target
		// console.log({name})
		setFormData(prev => ({
			...prev,
			[name]: value
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

			// state
			state: country?.hasStates?(state?.name):null,
			stateId: country?.hasStates?(state?.id):null,
			stateCode: country?.hasStates?(state?.state_code):null,

			// city
			city: state?.hasCities?(city?.name):null,
			cityId: state?.hasCities?(city?.id):null,
		}))
		if (uploadedImage.current) {
			const imageDetails = {
				image_url: uploadedImage.current.url,
				fileId: uploadedImage.current.fileId,
			}
			setFormData(prev => ({
				...prev,
				...imageDetails,
			}))
		}
	}, [country, state, city, uploadedImage.current])

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
	const onSubmitHandler = async (e=null) => {
		if (e) e.preventDefault();

		setLoading(true);

		if (!updatedFieldRef.current) {
			console.warn('Empty form is invalid');
			toast.error('Oopsi! No updates made. Please edit a field and try again.');
			setLoading(false);
			return;
		}

		const isImage = updatedFieldRef.current.includes('image_url')
		// console.log('isImage update:', isImage)

		if (updatedFieldRef.current.includes('country')) {
			updatedFieldRef.current.push('countryId', 'phoneCode');
		}
		if (updatedFieldRef.current.includes('state')) {
			updatedFieldRef.current.push('stateId', 'stateCode');
		}
		if (updatedFieldRef.current.includes('city')) {
			updatedFieldRef.current.push('cityId');
		}
		if (isImage) {
			updatedFieldRef.current.push('fileId');
		}

		// check that there is an actual update before proceeding
		// to submit the form to the server
		const len = updatedFieldRef.current.length
		// console.log('checking the length of updatedFieldRef:', len)

		const cleanedData = {};
		if (!isImage) {
			if (len===1) {
				// console.log('updatedField.current:', updatedFieldRef.current)
				// console.log('only one field to update, checking for actual change...')
				const field = updatedFieldRef.current[0]
				const update = formData[field]?.trim()
				const original = userInfo?.[field]
				const isUpdated = update!==original
				// console.log({field, update, original, isUpdated})
				// let [objKey, objValue] = Object.entries(updatedFieldRef.current).pop()
				// objValue = objValue.trim()
				// console.log({objKey}, '\n', {objValue},)
				if (!isUpdated||!update) {
					const errorText = `No changes made to the ${titleCase(field)} field`;
					console.warn(errorText);
					toast.error(errorText);
					setLoading(false);
					return;
				}
			} else if (len>1) {
				// console.log('updatedField.current:', updatedFieldRef.current)
				// console.log('multiple fields to update, checking for actual changes...')
				const updates = updatedFieldRef.current.map(field => ({
					field,
					update: typeof formData[field]==='number'?formData[field]:formData[field]?.trim(),
					original: userInfo?.[field],
					isUpdated: (typeof formData[field]==='number'?formData[field]:formData[field]?.trim())!==userInfo?.[field],
				}))
				const changedFields = updates.filter(item => item.isUpdated)
				// console.log({updates, changedFields})
				if (updates.some(item => (!item.isUpdated||!item.update))) {
					const errorText = `Some of the selected fields were not changed`;
					console.warn(errorText);
					toast.error(errorText);
					setLoading(false);
					return;
				}
				// updatedFieldRef.current = changedFields.map(item => item.field)
				// console.log('final fields to update:', updatedFieldRef.current)
			}
		} else {
			// console.log('new image uploaded:', uploadedImage.current)
			if (uploadedImage.current) {
				const newFileID = uploadedImage.current?.fileId
				const newUrl = uploadedImage.current?.url
				const oldFileID = userInfo?.fileId
				const oldUrl = userInfo?.image_url
				// console.log('processing image update...')
				// console.log('formData before image update:', formData)
				// console.log('image fileid from upload:', newFileID)
				// console.log('previous image fileid:', oldFileID)
				// if (newFileID!==oldFileID) {
				// 	// console.log('previous image:', oldFileID, oldUrl)
				// }
				// console.log('including image details in submission data...')
				cleanedData['old_image_url'] = oldUrl
				cleanedData['old_fileId'] = oldFileID
				cleanedData['image_url'] = newUrl
				cleanedData['fileId'] = newFileID
			}
		}
		// console.log('cleanedData:', cleanedData)

		const exemptArr = [
			'fileId',
			'image_url',
			'stateCode',
			'phoneCode',
			'password',
			'cityId',
			'stateId',
			'countryId',
			'id',
			'is_staff',
		]
		// console.log({isImage}, 'uploadedImage:', uploadedImage.current)
		if (!isImage) {
				Object.entries(formData).forEach(([key, value]) => {
				if (!updatedFieldRef.current.includes(key)) return; // only submit updated fields
				if (key==='password_confirmation') return; // skip password_confirmation from submission
				cleanedData[key] = (exemptArr.includes(key))?value:value?.trim()?.toLowerCase();
			})
		}

		// console.log('submitting form:', cleanedData);
		// Object.entries(formData).forEach(([key, value]) => {
		// 	console.log(key, ":", value);
		// })
		try {
			const response = await fetch(`${baseURL}/users/update-profile/${userInfo.id}/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
					body: JSON.stringify(cleanedData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.warn('Account Update Error:', errorData);
				toast.error(errorData?.error || 'Account Update Error!');
				setLoading(false);
				return;
			}
			const data = await response.json();
			// console.log('Response data from server',data)
			createLocal.setItem("fpng-user", data);
			uploadedImage.current = null; // reset uploaded image
			userInfoRef.current = false; // allow userInfo to be set again if needed
			toast.success('Account Update Successful!');
			return data;
		} catch (error) {
			console.error("Error during update:", error);
			toast.error('Error! Update Failed. Please try again.');
			return null;
		} finally {
			setLoading(false);
		}
	}

	// auto upload when selectedFile changes (i.e when image has been processed)
	useEffect(() => {
		// console.log("generating temporary url:", selectedFile);
		if (selectedFile) {
			const objectUrl = URL.createObjectURL(selectedFile);
			setImgPreview(objectUrl);

			return () => URL.revokeObjectURL(objectUrl); // cleanup
		}
	}, [selectedFile]);

	// handle image upload to cloud then finally submit form after
	const handleUpload = async (e) => {
		e.preventDefault();

		setLoading(true);

		if (!selectedFile) {
			console.warn("No file selected for upload");
			toast.error("Please select a file first");
			setLoading(false);
			return;
		}

		const imageDetails = {
			image_url: userInfo?.image_url,
			fileId: userInfo?.fileId,
			file: selectedFile,
		}
		// console.log({imageDetails});

		if (selectedFile instanceof Blob || selectedFile instanceof File) {
			try {
				// get authentication signature from backend
				const authData = await authenticator();
				if (!authData) {
					setLoading(false);
					throw new Error("Failed to get ImageKit auth data");
				}
				// console.log("Auth data for upload:", authData);
				// console.log({baseAPIURL})

				const imageFormData = new FormData();
				imageFormData.append("file", selectedFile); // actual file
				imageFormData.append("fileName", "profile_photo.jpg");
				imageFormData.append("folder", "profile_photos");

				imageFormData.append("publicKey", baseAPIURL?.IMAGEKIT_PUBLIC_KEY);
				imageFormData.append("signature", authData.signature);
				imageFormData.append("expire", authData.expire);
				imageFormData.append("token", authData.token);

				const replace = userInfo?.image_url?
								"Replacing existing image ...":
								"Uploading new image ...";
				// console.log(replace);

				// for (let [key, value] of imageFormData.entries()) {
				// 	console.log(key, ":", value);
				// }
				// console.log("Uploading image to ImageKit...");

				// upload endpoint
				const uploadUrl = "https://upload.imagekit.io/api/v1/files/upload";
				// console.log("Upload URL:", uploadUrl);

				// upload to imagekit
				const uploadResponse = await fetch(uploadUrl, {
					method: "POST",
					body: imageFormData,
					}
				);

				if (!uploadResponse.ok) {
					const errorText = "Upload failed"
					toast.error(errorText);
					setLoading(false);
					throw new Error(errorText);
				}
				const result = await uploadResponse.json();
				// console.log("Upload successful:", result);
				uploadedImage.current = result; // save response

				// finally submit form after successful image upload
				// and fileID and image_url have been generated
				onSubmitHandler(); // submit form after successful upload
			} catch (err) {
				toast.error('Upload failed. Please try again.');
				// console.error("Upload failed:", err);
				setLoading(false);
				return;
			}
		} else {
			// console.log("Not a valid file:", selectedFile);
			toast.error("Selected file is not valid. Please try again.");
			setLoading(false);
			console.warn("No file selected, skipping upload.");
			return
		}
	};


	// array defining the desired order of the fields
	const reOrderFieldsArr = ["email", "mobile_no", "username", "address", "country", "state", "city", "nearest_bus_stop"];

	// array of fields that should be text areas instead of input fields
	const textAreaFieldsArr = ['address', 'nearest_bus_stop']

	// const switchBool = () => setSwitchState(prev => !prev);
	// console.log({country, state, city})
	// console.log({formData, editFields, userInfo})
	// console.log('updatedFieldRef:', updatedFieldRef.current)
	// console.log({editFields})
	// console.log({imagePreview})
	// console.log({selectedFile})
	// console.log({imgPreview})
	// console.log('uploadedImage:', uploadedImage.current)
	return (
		<>
			<Breadcrumb page={"My Profile"} />

			<span
			className="row px-xl-5"
			style={{
				display: 'flex',
				justifyContent: 'center',
			}}>
				<div className=""
				style={{
					padding: deviceType?'':'0 1rem',
					width: deviceType?'90%':'60%',
				}}>
					<div
					className={`${deviceType?'p-18':'p-30'} mb-5`}
					style={{
						borderRadius: '10px',
						}}
						>
						{userInfo ?
						<>
							<div
							className={`mb-0 d-flex justify-content-center align-items-center ${editFields.image_url?'flex-column':'flex-row'}`}
							>
								{
								(userInfo.image_url||imgPreview)
								// false
								?

									// image view
									<img
									src={imgPreview?imgPreview:userInfo.image_url}
									alt={userInfo.first_name}
									className={`${deviceType?'w-50 h-50':'w-30 h-30'}`}
									style={{
										objectFit: 'cover',
										borderRadius: '50%',
										padding: 2,
										border: '1px solid #475569',
									}}
									/>
									:

									// default icon (image placeholder) view
									<span
									className="fas fa-user-circle mr-2"
									style={{
										fontSize: deviceType?'8.5rem':'12.5rem',
										color: '#475569',
									}}
									/>}

									{/* image dropdown (upload, cancel and submit buttons) */}
									{/* upload image view too */}
									{editFields.image_url ?
									(<>
										<span className="d-flex flex-row align-items-center justify-content-center fadeInDownHalfProfilePic">
											<div className="d-flex flex-column align-items-center justify-content-center">
												<div
												className="col-md-6 mt-2"
												style={{maxWidth: '100%'}}>

													{/* select, preview, crop and compress image file */}
													<ImageCropAndCompress
													onComplete={setSelectedFile}
													type={'changeProfilePhoto'}
													ref={handleImageProcessingRef}
													isImagePreview={setImagePreview} />
												</div>
												{/* cancel and submit button (for image replacement) */}
												<EditFieldButton
												setEditFields={setEditFields}
												userKey={"image_url"}
												editField={editFields["image_url"]}
												onSubmitHandler={onSubmitHandler}
												handleUpload={handleUpload}
												loading={loading} />
											</div>
										</span>
									</>)
									:
									(<span className="align-self-end"
									style={{
										marginLeft: deviceType?'-20%':'-10%',
										backgroundColor: '#F8F6F2',
										borderRadius: '30%',
										}}>
										{/* edit button (image) */}
										<EditFieldButton
											setEditFields={setEditFields}
											userKey={"image_url"}
											editField={editFields["image_url"]}
											onSubmitHandler={onSubmitHandler}
											loading={loading}
											isDisabled={Object.values(editFields)?.some?.(value=>value)||false} />
									</span>)}
							</div>
							<p
							style={{
								fontSize: deviceType?'1.25rem':'2rem',
								justifyContent: 'center',
							}}
							className="profile-control bold-text d-flex align-items-center text-center mt-3 mb-0"
							>
								<span className="d-flex flex-column align-items-center justify-content-between">
									<span className="d-flex flex-row align-items-center justify-content-between">

										{/* first and last name */}
										{titleCase(userInfo.first_name)}
										<span className="d-flex flex-row align-items-center justify-content-between">
											<span style={{whiteSpace: 'pre'}}>{' '}</span>

												{/* last name with edit button */}
												<span>{titleCase(userInfo.last_name||'')}</span>
												{!editFields.last_name&&
												<EditFieldButton
													setEditFields={setEditFields}
													userKey={"last_name"}
													editField={editFields["last_name"]}
													onSubmitHandler={onSubmitHandler}
													loading={loading}
													isDisabled={Object.values(editFields)?.some?.(value=>value)||false} />}
										</span>
									</span>

									{/* last name input and buttons */}
									<>
										{editFields.last_name &&
										<span className={`d-flex ${deviceType?'flex-column':'flex-row'} align-items-center justify-content-center fadeInDownHalfUname`}>

												{/* last name input field */}
												<input
												id={"last_name"}
												name={"last_name"}
												onChange={onChangeHandler}
												value={formData["last_name"]}
												style={{
													borderRadius: '5px',
													width: '40%',
												}}
												className={`form-control ${deviceType?'w-100':''}`}
												type={getInputType("last_name")}
												/>

											{/* last name cancel and submit buttons */}
											<EditFieldButton
											setEditFields={setEditFields}
											userKey={"last_name"}
											editField={editFields["last_name"]}
											onSubmitHandler={onSubmitHandler}
											loading={loading} />
										</span>}
									</>
								</span>
							</p>
							{reOrderFields(Object.entries(userInfo), reOrderFieldsArr).map(([userKey, userValue], index) => {
								const skipArr = [
									'id', 'is_staff', 'image_url', 'fileId', 'phoneCode',
									'stateCode', 'first_name', 'last_name', 'countryId',
									'stateId', 'cityId', 'date_joined', 'last_login',
								]
								if (skipArr.includes(userKey)) return null;
								const mobile = userKey==='mobile_no'
								const isState = userKey==='state'
								const email = userKey==='email'
								const sentence = userKey==='address' || userKey==='nearest_bus_stop'
								const editField = editFields[userKey]
								const fieldSelected = Object.entries(editFields).filter(([key, value])=>value).map(([key])=>key)
								
								const isFieldSelected = !!fieldSelected.length
								const isDisabled = isFieldSelected?!fieldSelected?.includes(userKey):false
								if (isFieldSelected) updatedFieldRef.current = fieldSelected
								const countryStateCity = ['country', 'state', 'city'].every(
									key => key in editFields && Boolean(editFields[key])
								);
								const stateCity = ['state', 'city'].every(
									key => key in editFields && Boolean(editFields[key])
								);
								return (
									<Fragment key={index}>
										<form
										style={{
											...{
												position: 'relative',
												width: '100%',
											},
											}}>
											{
											!editField ?
												// paragraph view (content view)
												<p
												style={{
													minWidth: '6rem',
													textWrap: 'nowrap',
												}}
												className="profile-control mb-0 d-flex flex-column">

													{/* title label */}
													<span
													className="bold-text"
													style={{}}>{titleCase(userKey)}:
													</span>

													{/* paragraph text and phone code span */}
													<span
													className="d-flex flex-row align-items-center justify-content-between">
														<span
														className="profile-control"
															style={{
																fontStyle: email?'italic':'',
																padding: `${0.375*2}rem ${0}rem`,
																textWrap: 'wrap',
															}}>

																{/* all non location paragraphs content */}
																{/* e.g email, mobile no, address,etc */}
																{!userValue?
																	<span className="font-italic">Not Provided.</span>:
																	`
																		${mobile?'+'+userInfo.phoneCode+' ':''}
																		${mobile?formatPhoneNumber(userValue):
																		sentence?sentenceCase(userValue):
																		email?userValue:
																		titleCase(userValue)}
																		${isState?'|'+userInfo.stateCode:''}
																	`
																}
														</span>
														{/* edit button for all (locations inclusive) fields */}
														<EditFieldButton
														setEditFields={setEditFields}
														userKey={userKey}
														editField={editField}
														isDisabled={isDisabled} />
													</span>
												</p>
												:

												// input field view (edit view)
												<div className="d-flex flex-column">

													{/* label for all fields */}
													<label
													htmlFor="userKey"
													className="profile-control mb-0 bold-text"
													style={{
														minWidth: '6rem',
														textWrap: 'nowrap',
													}}
													>
														{titleCase(userKey)}:</label>
														{userKey==='country' ?

														// country select field
														<div
														className={`d-flex ${deviceType?'flex-column':'flex-row'} justify-content-between`}
														>
															<CountrySelect
															id={userKey}
															value={country}
															onChange={(val) => setCountry(val)}
															placeHolder="Select Country"
															/>
															{/* country cancel and submit buttons */}
															<div>
																<EditFieldButton
																setEditFields={setEditFields}
																userKey={userKey}
																editField={editField}
																onSubmitHandler={onSubmitHandler}
																loading={loading} />
															</div>
														</div>
														:
														userKey==='state' ?

															// state select field
															<div
															className={`d-flex ${deviceType?'flex-column':'flex-row'} justify-content-between`}
															>
																<StateSelect
																id={userKey}
																key={country?.id || "no-country"}
																countryid={country?.id}
																value={state}
																onChange={(val) => {
																	setState(val);
																	// console.log('State changed to:', val);
																}}
																placeHolder="Select State"
																/>
																{/* state cancel and submit buttons */}
																<div>
																	{!countryStateCity&&<EditFieldButton
																	setEditFields={setEditFields}
																	userKey={userKey}
																	editField={editField}
																	onSubmitHandler={onSubmitHandler}
																	loading={loading} />}
																</div>
															</div>
															:
															userKey==='city' ?

																// city select field
																<div
																className={`d-flex ${deviceType?'flex-column':'flex-row'} justify-content-between`}
																>
																	<CitySelect
																	id={userKey}
																	key={`${country?.id ?? "no-country"}-${state?.id ?? "no-state"}`}
																	countryid={country?.id}
																	stateid={state?.id}
																	value={city}
																	onChange={(val) => setCity(val)}
																	placeHolder="Select City"
																	/>
																	{/* city cancel and submit buttons */}
																	<div>
																		{(!countryStateCity&&!stateCity)&&<EditFieldButton
																		setEditFields={setEditFields}
																		userKey={userKey}
																		editField={editField}
																		onSubmitHandler={onSubmitHandler}
																		loading={loading} />}
																	</div>
																</div>
																:

																// all other fields (input and textarea fields)
																<>
																	<div className={`d-flex flex-${(toTextArea(userKey, textAreaFieldsArr)||deviceType)?'column':'row'} justify-content-between`}>

																		<span className={`d-flex ${deviceType?'':'w-100'} flex-row align-items-center`}>
																			{userKey==='mobile_no'&&

																			// phone code prefix for mobile number
																			<span
																			style={{
																				paddingRight: '0.5rem',
																			}}>{'+'+userInfo.phoneCode}</span>}

																				{toTextArea(userKey, textAreaFieldsArr)?
																				// text area field
																				<textarea
																				id={userKey}
																				name={userKey}
																				onChange={onChangeHandler}
																				value={formData[userKey]}
																				style={{
																				borderRadius: '5px',
																				width: '100%',
																				}}
																				className="form-control"
																				rows={4}
																				/>
																				:

																				// input field
																				<input
																				id={userKey}
																				name={userKey}
																				onChange={onChangeHandler}
																				value={formData[userKey]}
																				style={{
																					borderRadius: '5px', width: '100%',
																				}}
																				className="form-control"
																				type={getInputType(userKey)}
																				/>}
																		</span>
																				{/* cancel and submit buttons for all non location fields (input and textarea) */}
																				<EditFieldButton
																				setEditFields={setEditFields}
																				userKey={userKey}
																				editField={editField}
																				onSubmitHandler={onSubmitHandler}
																				loading={loading} />
																		{/* </> */}
																	</div>
																</>
														}
												</div>
												// /</div>
											}
										</form>
										<hr
										style={{
											marginTop: '0.8rem',
											marginBottom: '0.8rem',
											}} />
									</Fragment>
								)}
							)}
						</>
						:
						<BouncingDots size="lg" color="#475569" p="8" />}
					</div>
				</div>
			</span>
		</>
	)
}

function EditFieldButton({
	userKey, editField, setEditFields, isDisabled,
	onSubmitHandler, loading, handleUpload}) {
	const deviceType = useDeviceType().width <= 576;
	if (!userKey) return null;
	if (userKey==='email') return null; // can't edit email for now
	return (
		<span
		className="d-flex align-items-center justify-content-center flex-row">
			<button
			type="button"
			className={`btn btn-profile ${(deviceType&&userKey==='image_url')?'':(deviceType?'ml-1':'')}`}
			disabled={isDisabled}
			style={{
				padding: (deviceType&&userKey==='image_url')?'0.2rem 0.7rem':'0.25rem 0.7rem',
				// borderRadius: (deviceType&&userKey==='image_url')?'30%':'5px',
			}}
			onClick={()=>setEditFields(prev=>{
				if (userKey==='country') {
					return ({
						// ...prev,
						country: !prev[userKey],
						state: !prev[userKey],
						city: !prev[userKey],
					})
				} else if (userKey==='state') {
					return ({
						// ...prev,
						state: !prev[userKey],
						city: !prev[userKey],
					})
				} else {
				return ({
				// ...prev,
				[userKey]: !prev[userKey]
				})
			}})}>
				{editField?'Cancel':'Edit'}
			</button>


			{editField &&
			<button
			type="button"
			className="btn btn-profile ml-2"
			style={{
				padding: '0.2.5rem 0.7rem'
			}}
			onClick={(e)=> {
				if (userKey==='image_url') handleUpload(e);
				else onSubmitHandler(e);
			}}
			disabled={loading}>
				{loading?<BouncingDots size="ts" color="#475569" p="0" />:'Submit'}
			</button>}
		</span>
	)
}
export { Profile }
