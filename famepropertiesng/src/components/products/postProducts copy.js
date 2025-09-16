import { useEffect, useState, useRef, use } from "react";
import 'react-country-state-city/dist/react-country-state-city.css';
import { Breadcrumb } from "../sections/breadcrumb";
import { useDeviceType } from "../../hooks/deviceType";
import { Link, useNavigate } from 'react-router-dom';
import { titleCase } from "../../hooks/changeCase";
import { toast } from "react-toastify";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useImageKitAPIs } from "../../hooks/fetchAPIs";
import { ImageCropAndCompress } from "../../hooks/fileResizer/ImageCropAndCompress";
import { BouncingDots } from "../../spinners/spinner";
import { authenticator } from "../loginSignUpProfile/dynamicFetchSetup";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { inputArr, isFieldsValid } from "./productFormInfo";
import { toTextArea, limitInput } from "../loginSignUpProfile/profileSetup/profileMethods";

const baseURL = getBaseURL();

const initialFormData = {
	product_name: '',
	product_description: '',
	full_descriptions: '',
	technical_descriptions: '',
	marketing_descriptions: '',
	market_price: '',
	discount_price: '',
	storeID: '',
}

function PostProduct() {
	const formImageCountRef = useRef(null);
	const [checkReadiness, setCheckReadiness] = useState(false);
	const { createLocal } = useCreateStorage()
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const baseAPIURL = useImageKitAPIs()?.data;
	const navigate = useNavigate();
	const [selectedFiles, setSelectedFiles] = useState([null, null, null, null]);
	const [uploadedImages, setUploadedImages] = useState([null, null, null, null]); // imagekit response like {image_url, fileId}
	const [imagePreviews, setImagePreviews] = useState([false, false, false, false]);
	const [formData, setFormData] = useState(initialFormData);
	const [isMounting, setIsMounting] = useState(true);
	const [fieldStats, setFieldStats] = useState({})
	const deviceType = useDeviceType().width <= 576;

	const userInfo = createLocal.getItem('fpng-user')
	const storesArr = userInfo?.store

	// array of fields that should be text areas instead of input fields
	const textAreaFieldsArr = [
		'full_descriptions', 'technical_descriptions',
		'marketing_descriptions',
	]

	// handle input changes
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value, tagName } = e.target
		let maxChars;
		if (name==='product_name') {
			maxChars = 60;
		} else if (name==='product_description') {
			maxChars = 150;
		} else if (name==='market_price'||name==='discount_price') {
			maxChars = 10;
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
		uploadedImages.forEach((uploadedImage, index) => {
			if (uploadedImage) {
				const imageKey = `image_url${index}`;
				const fileIdKey = `fileId${index}`;
				setFormData(prev => ({
					...prev,
					...{
						[imageKey]: uploadedImage.url,
						[fileIdKey]: uploadedImage.fileId,
					},
				}));

				// clear uploadedImage state after transferring to formData
				setUploadedImages(prev => {
					const newUploadedImages = [...prev];
					newUploadedImages[index] = null;
					return newUploadedImages;
				})

				setCheckReadiness(prev=>!prev) // trigger useEffect to check if all images are uploaded
			}
		})
		selectedFiles.forEach((file, index) => {
			if (!file) {
				// remove corresponding image_url and fileId if file is null
				const imageKey = `image_url${index}`;
				const fileIdKey = `fileId${index}`;
				setFormData(prev => {
					const updated = { ...prev };
					delete updated[imageKey];
					delete updated[fileIdKey];
					return updated;
				});
			}
		})
	}, [uploadedImages, selectedFiles])

	// check if all required fields are filled
	const checkFields = isFieldsValid({formData});

	// find a way to handle this with ProductSection child component
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
			cleanedData[key] = (
				key==='fileId'||
				key==='fileId1'||
				key==='fileId2'||
				key==='fileId3'||
				key==='image_url'||
				key==='image_url1'||
				key==='image_url2'||
				key==='image_url3'||
				key==='market_price'||
				key==='discount_price'||
				key==='storeID'||
				typeof value === 'number'
			)?value:value.trim().toLowerCase();
		})

		try {
			const response = await fetch(`${baseURL}/products/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cleanedData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setIsError(errorData?.error)
				setLoading(false);
				console.warn('Product Creation Error:', errorData);
				toast.error(errorData?.error || 'Product Creation Error!');
				return;
			}
			const data = await response.json();
			console.log('Response data from server',data)
			toast.success(
				<div>
					Successful.<br />
					<strong>{titleCase('')} Product Created!</strong>
				</div>
			);
			// setFormData(initialFormData); // reset form
			// // navigate('/') // go to home page after registration
			return data;
		} catch (error) {
			console.error("Error during Product Creation:", error);
			toast.error('Error! Product Creation Failed. Please try again.');
			return null;
		} finally {
			setLoading(false);
		}
	}

	// auto submit form when formData has url and fileID filled (i.e when image has been uploded to cloud)
	useEffect(() => {
		console.log('#####'.repeat(14));
		// console.log('formData.image_url or formData.fileId changed:', formData);
		console.log('formimageCountRef:', formImageCountRef.current);
		const allUploadedImagesReady = formImageCountRef?.current?.every(idx=> {
			const imageUrlVal = formData[`image_url${idx}`];
			const fileIdVal = formData[`fileId${idx}`];
			console.log(`Checking image url and file id at index ${idx}:`, !!imageUrlVal, !!fileIdVal);
			const bValue = Boolean(imageUrlVal&&fileIdVal)
			console.log(`Image at index ${idx} is ready:`, bValue);
			return bValue
		});
		console.log('#####'.repeat(10));
		console.log('All uploaded images ready:', allUploadedImagesReady);
		if (allUploadedImagesReady) {
			onSubmitToServerHandler(); // auto submit on image upload
			formImageCountRef.current = null; // reset
		} else console.log('Not all images are ready yet, waiting...');
		console.log('#####'.repeat(14));
	}, [checkReadiness]);

	// find a way to use this wth the child component ProductSection
	const handleSubmittingProcessedImagesWithForm = (e) => {
		e.preventDefault();
		setLoading(true);
		if (selectedFiles[0]) {
			console.log("atleast first image selected ...");
			handleImageUploadToCloud(e);
		} else if (!selectedFiles[0]) {
			console.log("No image selected, skipping upload ...");
			onSubmitToServerHandler(e)
		} else {
			console.warn("Child handleImageProcessing function not available");
			toast.error("Image processing not ready. Please try again.");
			setLoading(false);
			return;
		}
	}

	// handle image upload to cloud then finally submit form after
	const handleImageUploadToCloud = async (e=null) => {
		if (e) e.preventDefault();
		setLoading(true);

		// collect all files into an array
		const files = selectedFiles
				.map((file, idx) => ({
					file,
					idx,
				}))
				.filter(item => item.file); // only keep ones with actual files

		console.log("Files to upload:", files);
		formImageCountRef.current = files.map(item=>item.idx);
		console.log("Files to upload indexes:", formImageCountRef.current);

		if (selectedFiles[0] instanceof Blob || selectedFiles[0] instanceof File) {
			console.log("File(s) ready for upload:", files);
			try {
				// upload each file one by one
				for (let i = 0; i < files.length; i++) {
					// get authentication signature from backend
					const authData = await authenticator();
					if (!authData) throw new Error("Failed to get ImageKit auth data");
					console.log("Auth data for upload:", authData);

					const { file, idx } = files[i];
					console.log(`Uploading file ${i + 1}:`, file);

					const imageFormData = new FormData();
					imageFormData.append("file", file);
					imageFormData.append("fileName", `store_credential_${i + 1}.jpg`);
					imageFormData.append("folder", "store_credentials");
					imageFormData.append("publicKey", baseAPIURL?.IMAGEKIT_PUBLIC_KEY);
					imageFormData.append("signature", authData.signature);
					imageFormData.append("expire", authData.expire);
					imageFormData.append("token", authData.token);

					const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
						method: "POST",
						body: imageFormData,
					});

					if (!uploadResponse.ok) {
						const errorText = `Upload failed for file ${i + 1}`;
						console.warn(errorText, uploadResponse);
						toast.error(errorText);
						continue; // move to next file instead of stopping everything
					}

					const result = await uploadResponse.json();
					console.log(`Upload successful for file ${i + 1}:`, result);
					toast.success(`Upload successful for file ${i + 1}: ${result.name.slice(0,15)}...`);
					setUploadedImages(prev => {
						const newUploadedImages = [...prev];
						newUploadedImages[idx] = result;
						return newUploadedImages;
					}); // store response in the corresponding uploadedImage state
					// setCheckReadiness(prev=>!prev) // trigger useEffect to check if all images are uploaded
				}
				setCheckReadiness(prev=>!prev) // trigger useEffect to check if all images are uploaded
				// added image_url and fileId to formdata and finally submit form
				// this is setup in a useEffect above
			} catch (err) {
				toast.error('Upload failed. Please try again.');
				console.error("Upload failed:", err);
				setLoading(false);
				return;
			}
		} else {
			// just submit if no file to upload
			console.log("No file selected, skipping upload.");
			onSubmitToServerHandler(); // submit form after successful upload
		}
	};

	// clear error message after 3s
	useEffect(() => {
		if (isError) {
			const delay = setTimeout(() => {
				setIsError(null)
			}, 3000);
			return ()=>clearTimeout(delay)
		}
	}, [isError])

	const imageCropAndCompressArrDetails = [
		{
			id: "product_image",
			label: "Product Image",
			required: true
		},
		{
			id: "product_image2",
			label: "Product Image 2",
		},
		{
			id: "product_image3",
			label: "Product Image 3",
		},
		{
			id: "product_image4",
			label: "Product Image 4",
		},
		{
			id: "product_image5",
			label: "Product Image 5",
		}
	]
	const handleSetFile = (index, file) => {
		setSelectedFiles(prev => {
			const newFiles = [...prev];
			newFiles[index] = file;
			return newFiles;
		});
	};
	const handlePreviewImage = (index, preview) => {
		setImagePreviews(prev => {
			const newPreviews = [...prev];
			newPreviews[index] = preview;
			return newPreviews;
		});
	};

	// console.log({country, state, city})
	// console.log({storesArr})
	// console.log({userInfo})
	// const userInfoSeller = userInfo?.is_seller;
	// console.log({userInfoSeller})
	// console.log({sellerValue})
	// const updatedSeller = sellerValue?.user?.is_seller
	// console.log({updatedSeller})
	console.log({formData})
	console.log('uploadedImages array:', uploadedImages)
	// console.log({uploadedImage1})
	// console.log({uploadedImage2})
	// console.log({uploadedImage3})
	console.log({checkFields})
	// console.log({selectedFile}, 'is and instance of blob, file:', selectedFile instanceof Blob, selectedFile instanceof File)
	// console.log({previewURL})
	// console.log({isEmailLoading})
	console.log('selectedFiles array:', selectedFiles)
	// console.log({selectedFile1})
	// console.log({selectedFile2})
	// console.log({selectedFile3})
	// console.log({imagePreview})
	// console.log({imagePreview1})
	// console.log({imagePreview2})
	console.log('imagePreviews array:', imagePreviews)
	useEffect(() => {
		// flip loading off immediately after mount
		setIsMounting(false);
	}, []);
	return (
		<>
			<Breadcrumb page={'Post Products'} />

			{!isMounting ?
			<form
			// onSubmit={handleImageUploadToCloud}
			onSubmit={handleSubmittingProcessedImagesWithForm}
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
						{/* <span className="bg-secondary pr-3"
						style={{color: '#475569'}}>
							Post Products
						</span> */}
					</h5>
					<div className={`bg-light ${deviceType?'p-18':'p-30'} mb-5`}
					style={{borderRadius: '10px'}}>
						{/* form 1 */}
						<ProductSection />

						<hr className="my-4" />

						{/* form 2 */}
						<div className="row">
							{inputArr.map((input, index) => {
								const isTextArea = toTextArea(input.name, textAreaFieldsArr);
								return (
									<div key={index}
									className="col-md-6 form-group">
										<label
										htmlFor={input.name}>{titleCase(input.name)}<span>{`${input.important?'*':''}`}</span></label>
											{<>
												<div
												style={{
													display: 'flex',
													flexDirection: 'row',
													alignItems: 'baseline',
													position: 'relative',
													width: '100%',
												}}>
													{/* inputs */}
													{isTextArea?
													<>
														{/* text area field */}
														<textarea
														id={input.name}
														name={input.name}
														onChange={onChangeHandler}
														value={formData[input.name]}
														style={{
															borderRadius: '5px',
															width: '100%',
														}}
														className="form-control"
														rows={3}
														placeholder={input.placeholder}
														required={input.important}
														/>
													</>
													:

													<>
														{/* input field */}
														<input
														id={input.name}
														name={input.name}
														onChange={onChangeHandler}
														value={formData[input.name]}
														style={{borderRadius: '5px'}}
														className="form-control"
														type={input.type}
														required={input.important}
														placeholder={input.placeholder}/>
													</>}
												</div>
											</>}

											{/* character and word count */}
											<>
												<span
												style={{
													fontSize: '0.625rem',
													color: fieldStats[input.name]?.colorIndicator
												}}
												className="justify-content-end d-flex font-italic">
												{(fieldStats[input.name]?.charCount||
													fieldStats[input.name]?.wordCount) ?
														(isTextArea ?
														<>
															{/* words count (but show chars too) */}
															{`${fieldStats[input.name]?.charCount} chars • ${fieldStats[input.name]?.wordCount}/${fieldStats[input.name]?.maxWords} words`}
														</>
														:
														<>
															{/* chars count only */}
															{`${fieldStats[input.name]?.charCount}/${fieldStats[input.name]?.maxCharsLimit} chars`}
														</>):null}
												</span>
											</>
									</div>
								)
							})}

							
							<>

								{/* Select, crop and compress files */}
								{imageCropAndCompressArrDetails.map(({ id, label, setter, preview, required }, idx) => {
									if (!selectedFiles[0]&&idx>0) return null; // only show others if first one is selected
									return (
										<div className="col-md-6 form-group" key={id}>
											<label htmlFor={id}>
											{titleCase(label)}{required && <span>*</span>}
											</label>
											<ImageCropAndCompress
											onComplete={(file) => handleSetFile(idx, file)}
											type="product"
											imageId={id}
											buttonText={label}
											isImagePreview={(preview) => handlePreviewImage(idx, preview)}
											/>
										</div>
									)
								})}
							</>
						</div>

						<hr className="my-4" />

						{/* form 3 */}
						<div className="row">
							{inputArr.map((input, index) => {
								const isTextArea = toTextArea(input.name, textAreaFieldsArr);
								return (
									<div key={index}
									className="col-md-6 form-group">
										<label
										htmlFor={input.name}>{titleCase(input.name)}<span>{`${input.important?'*':''}`}</span></label>
											{<>
												<div
												style={{
													display: 'flex',
													flexDirection: 'row',
													alignItems: 'baseline',
													position: 'relative',
													width: '100%',
												}}>
													{/* inputs */}
													{isTextArea?
													<>
														{/* text area field */}
														<textarea
														id={input.name}
														name={input.name}
														onChange={onChangeHandler}
														value={formData[input.name]}
														style={{
															borderRadius: '5px',
															width: '100%',
														}}
														className="form-control"
														rows={3}
														placeholder={input.placeholder}
														required={input.important}
														/>
													</>
													:

													<>
														{/* input field */}
														<input
														id={input.name}
														name={input.name}
														onChange={onChangeHandler}
														value={formData[input.name]}
														style={{borderRadius: '5px'}}
														className="form-control"
														type={input.type}
														required={input.important}
														placeholder={input.placeholder}/>
													</>}
												</div>
											</>}

											{/* character and word count */}
											<>
												<span
												style={{
													fontSize: '0.625rem',
													color: fieldStats[input.name]?.colorIndicator
												}}
												className="justify-content-end d-flex font-italic">
												{(fieldStats[input.name]?.charCount||
													fieldStats[input.name]?.wordCount) ?
														(isTextArea ?
														<>
															{/* words count (but show chars too) */}
															{`${fieldStats[input.name]?.charCount} chars • ${fieldStats[input.name]?.wordCount}/${fieldStats[input.name]?.maxWords} words`}
														</>
														:
														<>
															{/* chars count only */}
															{`${fieldStats[input.name]?.charCount}/${fieldStats[input.name]?.maxCharsLimit} chars`}
														</>):null}
												</span>
											</>
									</div>
								)
							})}

							
							<>

								{/* Select, crop and compress files */}
								{imageCropAndCompressArrDetails.map(({ id, label, setter, preview, required }, idx) => {
									if (!selectedFiles[0]&&idx>0) return null; // only show others if first one is selected
									return (
										<div className="col-md-6 form-group" key={id}>
											<label htmlFor={id}>
											{titleCase(label)}{required && <span>*</span>}
											</label>
											<ImageCropAndCompress
											onComplete={(file) => handleSetFile(idx, file)}
											type="product"
											imageId={id}
											buttonText={label}
											isImagePreview={(preview) => handlePreviewImage(idx, preview)}
											/>
										</div>
									)
								})}
							</>
						</div>

						{/* select store */}
						<div className="col-md-6 form-group">
							<label
							htmlFor={'storeID'}>Select Store<span>*</span></label>
							<select
							className="form-control"
							id={'storeID'}
							name="storeID"
							onChange={onChangeHandler}
							style={{borderRadius: '5px'}}
							value={formData['storeID']}
							required={true}
							>
								<option value="">-- Select a store --</option>
								{storesArr?.map((store, i) => {
									return (
										<option
										key={i}
										value={store.id}>{titleCase(store.store_name)}</option>
									)
								})}
							</select>
						</div>

						{/* post button */}
						<button
						type="submit"
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={
							!checkFields||
							!selectedFiles[0]||
							loading
						}
						>
							{!loading?'Post':<BouncingDots size="sm" color="#fff" p="1" />}
						</button>

						{/* show error response message */}
						{isError && <ShowErrorFromServer isError={isError} />}
					</div>
				</div>
			</form>
			:
			<BouncingDots size="lg" color="#475569" p={deviceType?"10":"14"} />}
		</>
	)
}
const ProductSection = () => {
	const baseAPIURL = useImageKitAPIs()?.data;
	const formImageCountRef = useRef(null);
	const [formData, setFormData] = useState(initialFormData);
	const [fieldStats, setFieldStats] = useState({})
	const [selectedFiles, setSelectedFiles] = useState([null, null, null, null]);
	const [uploadedImages, setUploadedImages] = useState([null, null, null, null]); // imagekit response like {image_url, fileId}
	const [imagePreviews, setImagePreviews] = useState([false, false, false, false]);
	const [loading, setLoading] = useState(false);
	const [checkReadiness, setCheckReadiness] = useState(false);

	// array of fields that should be text areas instead of input fields
	const textAreaFieldsArr = [
		'full_descriptions', 'technical_descriptions',
		'marketing_descriptions',
	]
	// handle input changes
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value, tagName } = e.target
		let maxChars;
		if (name==='product_name') {
			maxChars = 60;
		} else if (name==='product_description') {
			maxChars = 150;
		} else if (name==='market_price'||name==='discount_price') {
			maxChars = 10;
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
	const imageCropAndCompressArrDetails = [
		{
			id: "product_image",
			label: "Product Image",
			required: true
		},
		{
			id: "product_image2",
			label: "Product Image 2",
		},
		{
			id: "product_image3",
			label: "Product Image 3",
		},
		{
			id: "product_image4",
			label: "Product Image 4",
		},
		{
			id: "product_image5",
			label: "Product Image 5",
		}
	]
	// updates country, state, city and image details in formData whenever they change
	useEffect(() => {
		uploadedImages.forEach((uploadedImage, index) => {
			if (uploadedImage) {
				const imageKey = `image_url${index}`;
				const fileIdKey = `fileId${index}`;
				setFormData(prev => ({
					...prev,
					...{
						[imageKey]: uploadedImage.url,
						[fileIdKey]: uploadedImage.fileId,
					},
				}));

				// clear uploadedImage state after transferring to formData
				setUploadedImages(prev => {
					const newUploadedImages = [...prev];
					newUploadedImages[index] = null;
					return newUploadedImages;
				})

				setCheckReadiness(prev=>!prev) // trigger useEffect to check if all images are uploaded
			}
		})
		selectedFiles.forEach((file, index) => {
			if (!file) {
				// remove corresponding image_url and fileId if file is null
				const imageKey = `image_url${index}`;
				const fileIdKey = `fileId${index}`;
				setFormData(prev => {
					const updated = { ...prev };
					delete updated[imageKey];
					delete updated[fileIdKey];
					return updated;
				});
			}
		})
	}, [uploadedImages, selectedFiles])
	
	// handle image upload to cloud then finally submit form after
	const handleImageUploadToCloud = async (e=null) => {
		if (e) e.preventDefault();
		setLoading(true);

		// collect all files into an array
		const files = selectedFiles
				.map((file, idx) => ({
					file,
					idx,
				}))
				.filter(item => item.file); // only keep ones with actual files

		console.log("Files to upload:", files);
		formImageCountRef.current = files.map(item=>item.idx);
		console.log("Files to upload indexes:", formImageCountRef.current);

		if (selectedFiles[0] instanceof Blob || selectedFiles[0] instanceof File) {
			console.log("File(s) ready for upload:", files);
			try {
				// upload each file one by one
				for (let i = 0; i < files.length; i++) {
					// get authentication signature from backend
					const authData = await authenticator();
					if (!authData) throw new Error("Failed to get ImageKit auth data");
					console.log("Auth data for upload:", authData);

					const { file, idx } = files[i];
					console.log(`Uploading file ${i + 1}:`, file);

					const imageFormData = new FormData();
					imageFormData.append("file", file);
					imageFormData.append("fileName", `store_credential_${i + 1}.jpg`);
					imageFormData.append("folder", "store_credentials");
					imageFormData.append("publicKey", baseAPIURL?.IMAGEKIT_PUBLIC_KEY);
					imageFormData.append("signature", authData.signature);
					imageFormData.append("expire", authData.expire);
					imageFormData.append("token", authData.token);

					const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
						method: "POST",
						body: imageFormData,
					});

					if (!uploadResponse.ok) {
						const errorText = `Upload failed for file ${i + 1}`;
						console.warn(errorText, uploadResponse);
						toast.error(errorText);
						continue; // move to next file instead of stopping everything
					}

					const result = await uploadResponse.json();
					console.log(`Upload successful for file ${i + 1}:`, result);
					toast.success(`Upload successful for file ${i + 1}: ${result.name.slice(0,15)}...`);
					setUploadedImages(prev => {
						const newUploadedImages = [...prev];
						newUploadedImages[idx] = result;
						return newUploadedImages;
					}); // store response in the corresponding uploadedImage state
					// setCheckReadiness(prev=>!prev) // trigger useEffect to check if all images are uploaded
				}
				setCheckReadiness(prev=>!prev) // trigger useEffect to check if all images are uploaded
				// added image_url and fileId to formdata and finally submit form
				// this is setup in a useEffect above
			} catch (err) {
				toast.error('Upload failed. Please try again.');
				console.error("Upload failed:", err);
				setLoading(false);
				return;
			}
		} else {
			// just submit if no file to upload
			console.log("No file selected, skipping upload.");
			// onSubmitToServerHandler(); // submit form after successful upload
		}
	};

	const handleSetFile = (index, file) => {
		setSelectedFiles(prev => {
			const newFiles = [...prev];
			newFiles[index] = file;
			return newFiles;
		});
	};
	const handlePreviewImage = (index, preview) => {
		setImagePreviews(prev => {
			const newPreviews = [...prev];
			newPreviews[index] = preview;
			return newPreviews;
		});
	};
	return (
		<>
			<div className="row">
				{inputArr.map((input, index) => {
					const isTextArea = toTextArea(input.name, textAreaFieldsArr);
					return (
						<div key={index}
						className="col-md-6 form-group">
							<label
							htmlFor={input.name}>{titleCase(input.name)}<span>{`${input.important?'*':''}`}</span></label>
								{<>
									<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'baseline',
										position: 'relative',
										width: '100%',
									}}>
										{/* inputs */}
										{isTextArea?
										<>
											{/* text area field */}
											<textarea
											id={input.name}
											name={input.name}
											onChange={onChangeHandler}
											value={formData[input.name]}
											style={{
												borderRadius: '5px',
												width: '100%',
											}}
											className="form-control"
											rows={3}
											placeholder={input.placeholder}
											required={input.important}
											/>
										</>
										:

										<>
											{/* input field */}
											<input
											id={input.name}
											name={input.name}
											onChange={onChangeHandler}
											value={formData[input.name]}
											style={{borderRadius: '5px'}}
											className="form-control"
											type={input.type}
											required={input.important}
											placeholder={input.placeholder}/>
										</>}
									</div>
								</>}

								{/* character and word count */}
								<>
									<span
									style={{
										fontSize: '0.625rem',
										color: fieldStats[input.name]?.colorIndicator
									}}
									className="justify-content-end d-flex font-italic">
									{(fieldStats[input.name]?.charCount||
										fieldStats[input.name]?.wordCount) ?
											(isTextArea ?
											<>
												{/* words count (but show chars too) */}
												{`${fieldStats[input.name]?.charCount} chars • ${fieldStats[input.name]?.wordCount}/${fieldStats[input.name]?.maxWords} words`}
											</>
											:
											<>
												{/* chars count only */}
												{`${fieldStats[input.name]?.charCount}/${fieldStats[input.name]?.maxCharsLimit} chars`}
											</>):null}
									</span>
								</>
						</div>
					)
				})}

				
				<>

					{/* Select, crop and compress files */}
					{imageCropAndCompressArrDetails.map(({ id, label, setter, preview, required }, idx) => {
						if (!selectedFiles[0]&&idx>0) return null; // only show others if first one is selected
						return (
							<div className="col-md-6 form-group" key={id}>
								<label htmlFor={id}>
								{titleCase(label)}{required && <span>*</span>}
								</label>
								<ImageCropAndCompress
								onComplete={(file) => handleSetFile(idx, file)}
								type="product"
								imageId={id}
								buttonText={label}
								isImagePreview={(preview) => handlePreviewImage(idx, preview)}
								/>
							</div>
						)
					})}
				</>
			</div>
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
export { PostProduct }
