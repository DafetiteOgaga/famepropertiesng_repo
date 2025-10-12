import { useEffect, useState, useRef, Fragment } from "react";
import { Breadcrumb } from "../../sections/breadcrumb"
import { useDeviceType } from "../../../hooks/deviceType"
import { Link, useNavigate } from 'react-router-dom';
import { formatPhoneNumber, sentenceCase, titleCase } from "../../../hooks/changeCase";
import { toast } from "react-toastify";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { useCreateStorage } from "../../../hooks/setupLocalStorage";
import { ImageCropAndCompress } from "../../../hooks/fileResizer/ImageCropAndCompress";
import { BouncingDots } from "../../../spinners/spinner";
import { validatePassword } from "../signUpSetup/signUpFormInfo";
import { reOrderFields, toTextArea } from "../../../hooks/formMethods/formMethods";
import { limitInput, useCountryStateCity, onlyNumbers } from "../../../hooks/formMethods/formMethods";
import { ToggleButton } from "../../../hooks/buttons";
import { useAuthFetch } from "../authFetch";
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

function Profile() {
	const firstStoreRef = useRef(true);
	const postToImagekit = useUploadToImagekit();
	const authFetch = useAuthFetch();
	const [editStore, setEditStore] = useState({});
	const { cscFormData, setCSC, CountryCompSelect, StateCompSelect, CityCompSelect } = useCountryStateCity();
	const updatedFieldRef = useRef(null);
	const updatedStoreFieldRef = useRef({});
	const handleImageProcessingRef = useRef();
	const { createLocal } = useCreateStorage();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null); // local file
	const uploadedImage = useRef(null);
	const [imagePreview, setImagePreview] = useState(false);
	const [formData, setFormData] = useState(initialFormData);
	const [storeFormData, setStoreFormData] = useState({});
	const deviceType = useDeviceType().width <= 576;
	const [editFields, setEditFields] = useState({});
	const userInfoRef = useRef(false)
	const [imgPreview, setImgPreview] = useState(null);
	const [fieldStats, setFieldStats] = useState({})
	const [isMounting, setIsMounting] = useState(true);
	const [showStores, setShowStores] = useState(false);
	const [showSelectedStore, setShowSelectedStore] = useState(null);
	const [animating, setAnimating] = useState("slideUp");
	const [animatingThisStore, setAnimatingThisStore] = useState('slideDownSpecificStore');
	// const [hasUnfulfilledInstallments, setHasUnfulfilledInstallments] = useState(false);
	const navigate = useNavigate();
	const {country, state, city, hasStates, hasCities, phoneCode: countryPhoneCode } = cscFormData;

	const toggleStores = () => {
		console.log('Toggling stores dropdown');
		if (showStores) {
			console.log('Hiding stores dropdown');
			setAnimating("slideUp");
			setTimeout(() => setShowStores(false), 400); // wait for animation
		} else {
			console.log('Showing stores dropdown');
			setShowStores(true);
			setAnimating("slideDown");
		}
	};

	const toggleSelectedStore = (id) => {
		if (showSelectedStore === id) {
			// close current
			setAnimatingThisStore("slideUpSpecificStore");
			setTimeout(() => setShowSelectedStore(null), 400);
		} else {
			// open another
			setAnimatingThisStore("slideDownSpecificStore");
			setShowSelectedStore(id);
		}
	};

	// get user info from local storage if any
	const userInfo = createLocal.getItem('fpng-user');

	// redirect to home if no user info found (i.e user is logged out)
	useEffect(() => {
		if (!userInfo)	{
				const isLogout = setTimeout(() => {
				if (!userInfo) {
					navigate('/')
				}
			}, 1000);
			return () => clearTimeout(isLogout);
		}
		if (userInfo?.id&&firstStoreRef.current) {
			console.log('setting first store as selected store by default...')
			// check if user is a seller with stores
			if (userInfo.is_seller && userInfo?.store?.length > 0) {
				setShowSelectedStore(userInfo.store[0].id) // show first store by default
			}
			firstStoreRef.current = false;
		}
	}, [userInfo])

	useEffect(() => {
		if (userInfo?.id) {
			const fetchCheckoutIDs = async () => {
				setLoading(true);
				try {
					const response = await authFetch(`${baseURL}/has-unfulfilled-installments/${userInfo?.id}/`);

					const data = await response // .json();
					if (!data) return
					console.log('Response data from server',data)
					console.log('has_unfulfilled_installments:', data)
					console.log('updating user info in local storage...')
					const updateUser = {...userInfo, has_unfulfilled_installments: data};
					createLocal.setItem('fpng-user', updateUser);
					console.log('updated user info:', updateUser)
					// setHasUnfulfilledInstallments(data);
					setLoading(false);
					return data;
				} catch (error) {
					console.error("catch error:", error);
					toast.error('catch error! Failed. Please try again.');
					return null;
				} finally {
					setLoading(false);
				}
			}
			fetchCheckoutIDs()
		}
	}, [])

	// Step 1: Load userInfo into state once (so it's stable)
	const storeVariables = [
		'nearest_bus_stop',
		'store_phone_number',
		'store_address',
		'description',
	]
	const storeVariablesMobileNoPad = [
		'nearest_bus_stop',
		'store_address',
		'description',
	]
	useEffect(() => {
		if (userInfo&&!userInfoRef.current) {
			setEditFields(prev => ({
				...prev,
				...Object.keys(userInfo).reduce((acc, key) => {
					acc[key] = false;
					return acc;
				}, {})
			}));
			if (userInfo.is_seller && userInfo?.store?.length > 0) {
				setEditStore(prev => ({
					...prev,
					...userInfo.store.reduce((acc, store) => {
						acc[store.id] = storeVariables.reduce((obj, key) => {
							obj[key] = false; // assign each variable a default value of false
							return obj;
						}, {});
						return acc;
					}, {})
				}));
			}
			userInfoRef.current = true;
		} else {
		}
	}, [userInfo])

	useEffect(() => {
		setFormData(prev => ({
			...prev,
			...cscFormData,
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
	}, [cscFormData, uploadedImage.current])

	// Step 2: Populate formData from userInfo once userInfo is available
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
				currency: userInfo?.currency||null,
				currencyName: userInfo?.currencyName||null,
				currencySymbol: userInfo?.currencySymbol||null,
				countryEmoji: userInfo?.countryEmoji||null,
				city: userInfo.city||'',
				cityId: userInfo.cityId||'',
				hasStates: userInfo.hasStates,
				hasCities: userInfo.hasCities,
			}))
			setCSC(userInfo)
			setStoreFormData(prev => {
				if (userInfo.is_seller && userInfo?.store?.length > 0) {
					return userInfo.store.reduce((acc, store) => {
						acc[store.id] = {
							...prev[store.id], // keep existing values if already present
							...storeVariables.reduce((fieldAcc, field) => {
								fieldAcc[field] = store[field] || '';
								return fieldAcc;
							}, {})
						};
						return acc;
					}, { ...prev });
				}
				return prev;
			});
		}

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

	// handle input changes
	const onChangeStoreHandler = (e, storeID) => {
		e.preventDefault();
		const { name, value, tagName } = e.target
		let cleanedValue = value;
		let maxChars;
		if (name==='store_phone_number') {
			cleanedValue = onlyNumbers(value);
			maxChars = 20;
		}
		else if (name==='store_address'||name==='nearest_bus_stop') {
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
		setStoreFormData(prev => ({
			...prev,
			[storeID]: {
			  ...prev[storeID],     // keep other fields for this store
			  [name]: limitedValue  // set dynamic field
			}
		}))
		setFieldStats(prev => ({
			...prev,
			[storeID]: {
				...prev[storeID], // keep other fields for this store
					[name]: {
						charCount,
						wordCount,
						colorIndicator,
						maxCharsLimit,
						maxWords,
					}
				}
			}
		))
	}

	// watches if type is password handles switching between text and password types
	const getInputType = (input) => {
		if (input.type !== "password") return input.type;
		if (input.name === "password") return showPassword ? "text" : "password";
		if (input.name === "password_confirmation") return showConfirmPassword ? "text" : "password";
		return "password"; // default fallback
	};

	const countryStateCityArr = ['country', 'state', 'city', 'store']

	// handles final form submission
	const onSubmitHandler = async (e=null, store=false) => {
		if (e) e.preventDefault();

		setLoading(true);

		if (!updatedFieldRef.current&&!updatedStoreFieldRef.current) {
			console.warn('Empty form is invalid');
			toast.error('Oopsi! No updates made. Please edit a field and try again.');
			setLoading(false);
			return;
		}

		const exemptArr = [
			'fileId',
			'image_url',
			'stateCode',
			'phoneCode',
			'currency',
			'currencyName',
			'currencySymbol',
			'countryEmoji',
			'password',
			'cityId',
			'stateId',
			'countryId',
			'id',
			'is_staff',
			'hasStates',
			'hasCities',
			'country',
			'state',
			'city',
			'store_phone_number'
		]

		// let finalFormData
		let cleanedData = {};
		let isImage
		let url
		if (!store) {
			url = 'users/update-profile'
			isImage = updatedFieldRef.current.includes('image_url')

			if (isImage) {
				updatedFieldRef.current.push('fileId');
			}

			// check that there is an actual update before proceeding
			// to submit the form to the server
			const len = updatedFieldRef.current.length

			if (!isImage) {
				if (len===1) {
					const field = updatedFieldRef.current[0]
					const update = formData[field]?.trim()
					const original = userInfo?.[field]
					const isUpdated = update!==original
					if (!isUpdated||!update) {
						const errorText = `No changes made to the ${titleCase(field)} field`;
						console.warn(errorText);
						toast.error(errorText);
						setLoading(false);
						return;
					}
				} else if (len>1) {
					const updates = updatedFieldRef.current.map(field => {
						if (countryStateCityArr.includes(field)) return null
						return ({
						field,
						update: (typeof formData[field]==='number'||typeof formData[field]==='boolean')?formData[field]:formData[field]?.trim(),
						original: userInfo?.[field],
						isUpdated: ((typeof formData[field]==='number'||typeof formData[field]==='boolean')?formData[field]:formData[field]?.trim())!==userInfo?.[field],
					})}).filter(item => item)
					console.log({updates})
					const changedFields = updates.filter(item => item?.isUpdated)
					console.log({updates, changedFields})
					if (updates.some(item => (!item?.isUpdated||!item?.update))) {
						const errorText = `Some of the selected fields were not changed`;
						console.warn(errorText);
						toast.error(errorText);
						setLoading(false);
						return;
					}
				}
			} else {
				if (uploadedImage.current) {
					const newFileID = uploadedImage.current?.fileId
					const newUrl = uploadedImage.current?.url
					const oldFileID = userInfo?.fileId
					const oldUrl = userInfo?.image_url
					cleanedData['old_image_url'] = oldUrl
					cleanedData['old_fileId'] = oldFileID
					cleanedData['image_url'] = newUrl
					cleanedData['fileId'] = newFileID
				}
			}

			// add more metadata to country, state, city if they are being updated
			if (updatedFieldRef.current.includes('country')) {
				updatedFieldRef.current.push(
					'countryId', 'phoneCode', 'currency',
					'currencyName', 'currencySymbol', 'countryEmoji'
				);
			}
			if (updatedFieldRef.current.includes('state')) {
				updatedFieldRef.current.push('stateId', 'stateCode',
					'hasStates',
				);
			}
			if (updatedFieldRef.current.includes('city')) {
				updatedFieldRef.current.push('cityId', 'hasCities');
			}

			if (!isImage) {
				Object.entries(formData).forEach(([key, value]) => {
				if (!updatedFieldRef.current.includes(key)) return; // only submit updated fields
				if (key==='password_confirmation') return; // skip password_confirmation from submission
					cleanedData[key] = (exemptArr.includes(key))?value:value?.trim()?.toLowerCase();
				})
			}

		} else {
			url = 'store/update-store'
			const storeID = updatedStoreFieldRef.current?.id
			const storeField = updatedStoreFieldRef.current?.field
			let prevVal = userInfo?.store?.find(store => store.id.toString() === storeID.toString())
			prevVal = storeField==='store_phone_number'?prevVal?.[storeField] : prevVal?.[storeField].trim()
			let newVal = storeFormData?.[storeID]?.[storeField]?.trim()
			newVal = storeField==='store_phone_number'?newVal : newVal?.trim()
			console.log({storeID, storeField, prevVal, newVal})
			if (prevVal === newVal || !newVal) {
				const errorText = `No changes detected in ${titleCase(storeField)} Field`;
				console.warn(errorText);
				toast.error(errorText);
				setLoading(false);
				return;
			}
			cleanedData = { storeID: storeID, [storeField]: newVal }
		}
		console.log('submitting form:', cleanedData);
		try {
			const response = await authFetch(`${baseURL}/${url}/${userInfo.id}/`, {
				method: "POST",
				body: cleanedData,
			});

			const data = await response // .json();
			if (!data) return
			if (!store) {
				createLocal.setItem("fpng-user", data);
				uploadedImage.current = null; // reset uploaded image
				toast.success('Account Update Successful!');
				updatedFieldRef.current = null; // reset
			} else {
				console.log('Store update response:', data)
				// update store info in local storage too
				const updatedUser = {
					...userInfo,
					store: data.store   // overwrite with the new array
				};
				createLocal.setItem("fpng-user", updatedUser);
				toast.success('Store Update Successful!');
				updatedStoreFieldRef.current = {}; // reset
			}
			userInfoRef.current = false; // allow userInfo to be set again if needed
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
			uploadedImage.current = imageKitResponse; // save response
			onSubmitHandler();
			setLoading(false);
		} else {
			toast.error("Selected file is not valid. Please try again.");
			setLoading(false);
			console.warn("No file selected, skipping upload.");
			return
		}
	};

	// array defining the desired order of the fields
	const reOrderFieldsArr = ["email", "mobile_no", "username", "address", "country", "state", "city", "nearest_bus_stop"];

	// array of fields that should be text areas instead of input fields
	const textAreaFieldsArr = [
		'address', 'nearest_bus_stop',
		'store_address', 'nearest_bus_stop',
	]

	// fields to skip displaying
	// const skipFieldArr = [
	// 	'id', 'is_staff', 'image_url', 'fileId', 'phoneCode',
	// 	'stateCode', 'first_name', 'last_name', 'countryId',
	// 	'stateId', 'cityId', 'date_joined', 'last_login',
	// 	'hasStates', 'hasCities', 'password', 'password_confirmation',
	// 	'product_ratings', 'is_seller',
	// ]
	// const allResponseFields = [
	// 	'email', 'mobile_no', 'username', 'address', 'country',
	// 	'state', 'city', 'nearest_bus_stop', 'id', 'first_name',
	// 	'last_name', 'is_staff', 'image_url', 'fileId', 'phoneCode',
	// 	'currency', 'currencyName', 'currencySymbol', 'countryEmoji',
	// 	'stateCode', 'countryId', 'stateId', 'cityId', 'hasCities',
	// 	'hasStates', 'product_ratings', 'is_seller',
	// ]
	const acceptedRenderFields = [
		'email', 'mobile_no', 'username', 'address', 'country',
		'state', 'city', 'nearest_bus_stop', 'store',
	]

	// other phone input props
	const phoneProps = {
		inputMode: 'numeric',       // brings up number keypad on mobile
		minLength: 7,               // <-- number, not string
		maxLength: 10,              // <-- match pattern
		pattern: '[0-9]{7,10}',     // only digits, between 7–14 long
	};

	useEffect(() => {
		setIsMounting(false);
	}, []);
	return (
		<>
			<Breadcrumb page={titleCase(userInfo?.first_name||'')} />

			{!isMounting ?
			<div
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
					className={`${deviceType?'p-18':'p-30'} mb-0 pb-0`}
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
								(userInfo.image_url||imgPreview) ?

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
											isDisabled={
												(Object.values(editFields)?.some?.(value=>value)||
												Object.values(editStore)
														.filter((value)=>value)
														.map((obj)=>Object.values(obj))
														.flat().some((val)=>val))
												||false} />
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
									<span className="d-flex flex-row align-items-center justify-content-between f-wrap">

										{/* first and last name */}
										{titleCase(userInfo.first_name)}
										<span className={`d-flex flex-row align-items-${deviceType?'center':'baseline'} justify-content-between f-wrap`}>
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
													isDisabled={
														(Object.values(editFields)?.some?.(value=>value)||
														Object.values(editStore)
														.filter((value)=>value)
														.map((obj)=>Object.values(obj))
														.flat().some((val)=>val))||false
														} />}
										</span>
									</span>

									{/* last name input and buttons */}
									<>
										{editFields.last_name &&
										<span className={`d-flex ${deviceType?'flex-column':'flex-row'} align-items-center justify-content-center fadeInDownHalfUname`}>

											<span>
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
												className={`form-control w-100`}
												type={getInputType("last_name")}
												/>
												<span
												style={{
													fontSize: '0.625rem',
													color: fieldStats['last_name']?.colorIndicator
												}}
												className={`justify-content-end d-flex font-italic`}>
												{fieldStats['last_name']?.charCount ?
													<>
														{`${fieldStats['last_name']?.charCount}/${fieldStats['last_name']?.maxCharsLimit} chars`}
													</>
													:null}
												</span>
											</span>

											<span className={`align-self-${deviceType?'center':'baseline'}`}>
											{/* last name cancel and submit buttons */}
											<EditFieldButton
											setEditFields={setEditFields}
											userKey={"last_name"}
											editField={editFields["last_name"]}
											onSubmitHandler={onSubmitHandler}
											loading={loading} />
											</span>
										</span>}
									</>
								</span>
							</p>
							{reOrderFields(Object.entries(userInfo), reOrderFieldsArr).map(([userKey, userValue], index) => {
								if (!acceptedRenderFields.includes(userKey)) return null;
								if (userKey==='store'&&(!userInfo.is_seller)) return null;
								const stores = userKey==='store'
								const mobile = userKey==='mobile_no'
								const isState = userKey==='state'
								const email = userKey==='email'
								const sentence = userKey==='address' || userKey==='nearest_bus_stop'
								const editField = editFields[userKey]
								const editStoreField = Object.values(editStore)
														.filter((value)=>value)
														.map((obj)=>Object.values(obj))
														.flat().some((val)=>val)

								const fieldSelected = Object.entries(editFields).filter(([key, value])=>value).map(([key])=>key)
								const isFieldSelected = !!fieldSelected.length
								const isDisabled = (isFieldSelected||editStoreField)?!fieldSelected?.includes(userKey):false
								if (isFieldSelected) updatedFieldRef.current = fieldSelected
								const countryStateCity = ['country', 'state', 'city'].every(
									key => key in editFields && Boolean(editFields[key])
								);
								const stateCity = ['state', 'city'].every(
									key => key in editFields && Boolean(editFields[key])
								);
								const isTextArea = toTextArea(userKey, textAreaFieldsArr)
								const stateHasStates = editField?userInfo.hasStates:hasStates
								const stateHasCities = editField?userInfo.hasCities:hasCities
								return (
									<Fragment key={index}>
										{(userKey==='state'&&!stateHasStates&&editFields["state"])?undefined:
										(userKey==='city'&&(!stateHasStates||!stateHasCities)&&editFields["city"])?undefined:
										(!index)?undefined:
										<hr
										style={{
											marginTop: '0.8rem',
											marginBottom: '0.8rem',
											}} />}
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
												<div
												style={{
													minWidth: '6rem',
													textWrap: 'nowrap',
												}}
												className="profile-control mb-0 d-flex flex-column">

													{/* title label */}
													<span className="d-flex flex-row align-items-center justify-content-between">
														<span
														className="bold-text"
														style={{textDecoration: userKey==='store'?'underline':''}}>{titleCase((userKey==='store'&&userValue.length>=1)?userKey+'s':userKey)}:
														</span>
														{/* Toggle Switch */}
														{userKey==='store'&&
														<ToggleButton onClick={toggleStores} miniStyle={'justify-content-end'}/>}
													</span>

													{/* paragraph text and phone code span */}
													<span
													className="d-flex flex-row align-items-center justify-content-between">
														<span
														className={`${stores?'w-100':''} profile-control`}
															style={{
																fontStyle: email?'italic':'',
																padding: stores?'':`${0.375*2}rem ${0}rem`,
																textWrap: 'wrap',
																display: stores?'initial':'',
															}}>

																{/* all non location paragraphs content */}
																{/* e.g email, mobile no, address,etc */}
																{!userValue?
																	(<span className="font-italic">
																		{((userKey==='state'&&!userInfo.hasStates)||
																		(userKey==='city'&&(!userInfo.hasCities)))?'N/A':
																		'Not Provided.'}
																	</span>):
																	(showStores&&stores)?(userValue.map((store, storeIdx) => {
																		const storeID = store.id
																		return (
																			<span className={`store-container ${animating}`} key={storeIdx}>
																				{Object.entries(store).map(([sKey, sVal], sIdx) => {
																					const editingStoreField = editStore[store.id]?.[sKey]
																					if (editingStoreField) {
																						updatedStoreFieldRef.current = {id: store.id, field: sKey}
																					} else  if (updatedStoreFieldRef.current[store.id]===sKey&&
																						!editingStoreField) {
																						updatedStoreFieldRef.current = {}
																					}
																					if (sKey==='id'||
																						sKey==='rating'||
																						sKey==='user') return null;
																					const storeFieldsToRender = ['store_phone_number', 'store_address', 'nearest_bus_stop', 'description', 'verified', 'store_status']
																					const phone = sKey==='store_phone_number'
																					const storeSentence = sKey==='store_address'||
																											sKey==='nearest_bus_stop'||
																											sKey==='description'
																					const isStoreTextArea = toTextArea(sKey, textAreaFieldsArr)
																					const showThisStore = showSelectedStore === storeID

																					return (
																						<Fragment key={sKey}>
																							<>
																								{sKey==="store_name"&&
																								<div className="d-flex flex-row align-items-center justify-content-between">
																									<Link
																									className="bold-text store-name d-inflex f-wrap"
																									to={`store-products/${store.id}`}
																									style={{
																										}}>{titleCase(sKey)}: {titleCase(sVal)}
																									</Link>
																									<ToggleButton
																									onClick={()=>toggleSelectedStore(storeID)}
																									checked={showThisStore}
																									heights={{height: 22, mini: 18}}/>
																								</div>}

																								<div
																								className={`specific-store ${animatingThisStore} ${
																									storeFieldsToRender.includes(sKey) ? 'store-container' : ''
																								}`}
																								style={{
																									transform: showThisStore ? 'scaleY(1)' : 'scaleY(0)',
																									opacity: showThisStore ? 1 : 0,
																									height: showThisStore ? 'auto' : 0,
																								}}
																								>
																									<hr className={`my-1 specific-store ${animatingThisStore}`} />
																									<span className={`pl-3 d-flex flex-${deviceType?'column':'row'} align-items-${!deviceType?'end':(editingStoreField?'center':'end')} justify-content-between specific-store ${animatingThisStore}`}>
																										<span className="w-100">
																											<span className={`d-flex flex-column ${phone?'w-100':''}`}>
																												<span className="bold-text text-nowrap">{titleCase(sKey)}:</span>
																												{editingStoreField ?
																												<span style={{whiteSpace: 'nowrap'}}>
																														{(phone)&&
																														// phone code prefix for mobile number
																														<span style={{paddingLeft: '5%',}}>
																															<PhoneCode
																															ukey={sKey}
																															phoneCode={(sVal)?userInfo.phoneCode:''} />
																														</span>}

																													{isStoreTextArea?
																														// text area field
																														<textarea
																														id={sKey}
																														name={sKey}
																														onChange={(e) => onChangeStoreHandler(e, store.id)}
																														value={storeFormData[store.id]?.[sKey]||''}
																														style={{
																														borderRadius: '5px',
																														display: 'initial',
																														width: deviceType?'100%':'95%',
																														}}
																														className="form-control"
																														rows={2}
																														/>
																														:
																														<input
																														id={sKey}
																														name={sKey}
																														onChange={(e) => onChangeStoreHandler(e, store.id)}
																														value={storeFormData[store.id]?.[sKey]||''}
																														style={{
																															borderRadius: '5px', width: '100%',
																															display: 'inline-block',
																														}}
																														className={`form-control ${(!deviceType)?(sKey!=='description'?'w-80':'w-100'):(sKey==='store_phone_number'?'w-85':'w-100')}`}
																														type="text"
																														{...(sKey === 'store_phone_number' ? phoneProps : {})}
																														/>}
																												</span>
																												:
																												<span style={{whiteSpace: 'nowrap'}}>
																													{(phone)&&
																													// phone code prefix for mobile number
																													<span style={{paddingLeft: '5%',}}>
																														<PhoneCode
																														ukey={sKey}
																														phoneCode={(sVal)?userInfo.phoneCode:''} />
																													</span>}

																													<span
																													style={{
																														paddingLeft: phone?'':((deviceType&&storeVariablesMobileNoPad.includes(sKey))?'':'5%'),
																														whiteSpace: 'pre-wrap',
																														wordBreak: 'break-word',
																														overflowWrap: 'break-word',
																														width: '100%',
																													}}>{((phone)?formatPhoneNumber(sVal):
																														sKey==='verified'&&!sVal?'Not Verified.':
																														storeSentence?sentenceCase(sVal):
																														titleCase(sVal))||'Not Provided.'}</span>
																												</span>}
																											</span>
																											{editingStoreField &&
																													<span
																													style={{
																														fontSize: '0.625rem',
																														paddingRight: '3%',
																														color: fieldStats[store?.id]?.[sKey]?.colorIndicator
																													}}
																													className={`justify-content-end d-flex font-italic`}>
																													{(
																														fieldStats[store?.id]?.[sKey]?.charCount
																														||
																														fieldStats[store?.id]?.[sKey]?.wordCount) ?
																															(isStoreTextArea ?
																															<>
																																{`${fieldStats[store?.id]?.[sKey]?.charCount} chars • ${fieldStats[store?.id]?.[sKey]?.wordCount}/${fieldStats[store?.id]?.[sKey]?.maxWords} words`}
																															</>
																															:
																															<>
																																{`${fieldStats[store?.id]?.[sKey]?.charCount}/${fieldStats[store?.id]?.[sKey]?.maxCharsLimit} chars`}
																															</>)
																														:null}
																													</span>
																												}
																										</span>
																										<span className={`${(isStoreTextArea?(!fieldStats[store?.id]?.[sKey]?.charCount?'pb-0':'pb-4'):(!fieldStats[store?.id]?.[sKey]?.charCount?'pb-0':'pb-3'))}`}>
																											{storeVariables.includes(sKey)&&
																											<EditFieldButton
																											store={{id: store.id, field: sKey, parentField: userKey}}
																											setEditFields={setEditStore}
																											userKey={sKey}
																											loading={loading}
																											onSubmitHandler={onSubmitHandler}
																											editField={editingStoreField}
																											isDisabled={isDisabled} />}
																										</span>
																									</span>
																								</div>
																								{/* } */}
																							</>
																						</Fragment>
																					)
																				})}
																				<br />
																			</span>
																		)
																	})):
																	<span>
																		{mobile ? `${userInfo.phoneCode} ${formatPhoneNumber(userValue)}`:
																		sentence ? sentenceCase(userValue):
																		email ? userValue:
																		titleCase(userValue)}
																		{isState && `|${userInfo.stateCode}`}
																	</span>
																}
														</span>
														{/* edit button for all (locations inclusive) fields */}
														{(((userKey==='state'&&!userInfo.hasStates)||
														(userKey==='city'&&(!userInfo.hasCities)))||
														userKey==='store')?undefined:
														<EditFieldButton
														setEditFields={setEditFields}
														userKey={userKey}
														editField={editField}
														isDisabled={isDisabled} />}
													</span>
												</div>
												:

												// input field view (edit view)
												<div className="d-flex flex-column">

													{/* label for all fields */}
													{
													(userKey==='state'&&!stateHasStates)?undefined:
													(userKey==='city'&&(!stateHasStates||!stateHasCities))?undefined:
													(userKey==='store')?undefined:
													<label
													htmlFor="userKey"
													className="profile-control mb-0 bold-text"
													style={{
														minWidth: '6rem',
														textWrap: 'nowrap',
													}}
													>
														{titleCase(userKey)}:
													</label>}
														{userKey==='country' ?

														// country select field
														<div
														className={`d-flex ${deviceType?'flex-column':'flex-row'} justify-content-between`}
														>
															<div className={deviceType?'':'w-75'}>
																{CountryCompSelect}
															</div>
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
														(userKey==='state'&&
															stateHasStates&&
															country!==''
														) ?

															// state select field
															<div
															className={`d-flex ${deviceType?'flex-column':'flex-row'} justify-content-between`}
															>
																<div className={deviceType?'':'w-75'}>
																	{StateCompSelect}
																</div>
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
															(userKey==='city'&&
																stateHasStates&&
																stateHasCities&&
																country!==''&&
																state!==''
															) ?

																// city select field
																<div
																className={`d-flex ${deviceType?'flex-column':'flex-row'} justify-content-between`}
																>
																	<div className={deviceType?'':'w-75'}>
																		{CityCompSelect}
																	</div>
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
																(!countryStateCityArr.includes(userKey) ?
																<>
																	<div className={`d-flex flex-${(isTextArea||deviceType)?'column':'row'} justify-content-between align-items-${deviceType?'normal':'baseline'}`}>

																		{(!deviceType)&&
																		// phone code prefix for mobile number
																		<PhoneCode
																		ukey={userKey}
																		phoneCode={userInfo.phoneCode} />}
																		
																		<span className={`d-flex ${deviceType?'':'w-100'} flex-column align-items-center`}>
																			<span className={`d-flex flex-${!deviceType?'column':(userKey==='mobile_no'?'row':'column')} align-items-center w-100`}>
																				{(deviceType)&&
																				// phone code prefix for mobile number
																				<PhoneCode
																				ukey={userKey}
																				phoneCode={userInfo.phoneCode} />}

																				{isTextArea?
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
																				{...(userKey === 'mobile_no' ? phoneProps : {})}
																				/>}
																				<>
																					{!['email','password', 'password_confirmation', 'mobile_no'].includes(userKey)&&
																					<span
																					style={{
																						fontSize: '0.625rem',
																						color: fieldStats[userKey]?.colorIndicator
																					}}
																					className={`align-self-end d-flex font-italic`}>
																					{(
																						fieldStats[userKey]?.charCount
																					||
																						fieldStats[userKey]?.wordCount) ?
																							(isTextArea ?
																							<>
																								{`${fieldStats[userKey]?.charCount} chars • ${fieldStats[userKey]?.wordCount}/${fieldStats[userKey]?.maxWords} words`}
																							</>
																							:
																							<>
																								{`${fieldStats[userKey]?.charCount}/${fieldStats[userKey]?.maxCharsLimit} chars`}
																							</>)
																						:null}
																					
																					</span>}
																				</>
																			</span>
																		</span>
																		<span className={`align-self-${(deviceType||isTextArea)?'center':'baseline'}`}>
																			{/* cancel and submit buttons for all non location fields (input and textarea) */}
																			<EditFieldButton
																			setEditFields={setEditFields}
																			userKey={userKey}
																			editField={editField}
																			onSubmitHandler={onSubmitHandler}
																			loading={loading} />
																		</span>
																	</div>
																</>
																:undefined)
														}
												</div>
											}
										</form>
									</Fragment>
								)}
							)}
						</>
						:
						<BouncingDots size="lg" color="#475569" p="8" />}
					</div>
					<>
						<hr
						style={{
							marginTop: '0.5rem',
							marginBottom: '0.5rem',
							}} />
							<div className={`d-flex ${deviceType?'flex-column':'flex-row'} align-items-center justify-content-around`}>
								
								<button
								type="button"
								onClick={() => {navigate(`register-store/${userInfo?.id}`)}}
								className="btn btn-sm btn-secondary d-block mt-2"
								>
									{userInfo?.is_seller?'Add Another Store':'Become a Seller'}
								</button>
								
								{userInfo?.has_unfulfilled_installments &&
								<button
								type="button"
								onClick={() => {navigate(`installmental-payment`)}}
								className="btn btn-sm btn-secondary d-block mt-2"
								>
									Pay Installmental
								</button>}
								{userInfo?.is_superuser &&
								<button
								type="button"
								onClick={() => {navigate(`admin-dashboard`)}}
								className="btn btn-sm btn-secondary d-block mt-2"
								>
									Admin Dashboard
								</button>}
								<button
									type="button"
									onClick={() => {}}
									className="btn btn-sm btn-danger d-block mt-2"
									>
										Delete Account
								</button>
							</div>
						<hr
						style={{
							marginTop: '0.5rem',
							marginBottom: '0.5rem',
							}} />
					</>
				</div>
				
			</div>
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"14"} />}
		</>
	)
}

function EditFieldButton({
	userKey, editField, setEditFields, isDisabled,
	onSubmitHandler, loading, handleUpload,
	store=null}) {
	const deviceType = useDeviceType().width <= 576;
	if (!userKey) return null;
	if (userKey==='email') return null; // can't edit email for now
	return (
		<span
		className="d-flex align-items-center justify-content-center flex-row">
			<button
			type="button"
			className={`btn btn-profile ${(deviceType&&userKey==='image_url')?'':(deviceType?'ml-1':'')}`}
			disabled={(store&&editField)?false:isDisabled}
			style={{
				padding: (deviceType&&userKey==='image_url')?'0.2rem 0.7rem':'0.25rem 0.7rem',
			}}
			onClick={()=>{
				if (store) {
					setEditFields(prev=>({
						...prev,
						[store.id]: {
							...prev[store.id],
							[store.field]: !prev[store.id]?.[store.field]
						}
					}))
				} else {
					setEditFields(prev=>{
						if (userKey==='country') {
							return ({
								country: !prev[userKey],
								state: !prev[userKey],
								city: !prev[userKey],
							})
						} else if (userKey==='state') {
							return ({
								state: !prev[userKey],
								city: !prev[userKey],
							})
						} else {
							return ({
							[userKey]: !prev[userKey]
							})
						}
					})}
				}
			}>
				{editField?'Cancel':'Edit'}
			</button>


			{editField &&
			<button
			type="button"
			className={`btn ${loading?'':'btn-profile'} ml-2`}
			style={{
				padding: '0.2.5rem 0.7rem'
			}}
			onClick={(e)=> {
				console.log({store, userKey})
				if (store?.parentField==='store') {
					console.log('submitting store changes');
					onSubmitHandler(e, true);
				} else if (userKey==='image_url') {
					handleUpload(e);
				} else {
					onSubmitHandler(e);
				}
			}}
			disabled={loading}>
				{loading?<BouncingDots size="ts" color="#475569" p="0" />:
				'Submit'}
			</button>}
		</span>
	)
}

function PhoneCode({ukey, phoneCode}) {
	if (ukey!=='mobile_no'&&ukey!=='store_phone_number') return
	return (
		// phone code prefix for mobile number
		<span
		style={{
			paddingRight: '0.5rem',
		}}>{phoneCode}</span>
	)
}
export { Profile }
