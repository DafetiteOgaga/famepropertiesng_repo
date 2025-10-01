import { useEffect, useState, useRef, forwardRef, useImperativeHandle, Fragment } from "react";
import 'react-country-state-city/dist/react-country-state-city.css';
import { Breadcrumb } from "../sections/breadcrumb";
import { useDeviceType } from "../../hooks/deviceType";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { titleCase } from "../../hooks/changeCase";
import { toast } from "react-toastify";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useImageKitAPIs } from "../../hooks/fetchAPIs";
import { ImageCropAndCompress } from "../../hooks/fileResizer/ImageCropAndCompress";
import { BouncingDots } from "../../spinners/spinner";
import { authenticator } from "../loginSignUpProfile/dynamicFetchSetup";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { inputArr, isFieldsValid } from "./productFormInfo";
import { toTextArea, limitInput } from "../loginSignUpProfile/profileSetup/formsMethods";
import { ToggleButton } from "../../hooks/buttons";

const baseURL = getBaseURL();

const initialFormData = () => ({
	product_name: '',
	product_description: '',
	full_descriptions: '',
	technical_descriptions: '',
	technical_feature_1: '',
	technical_feature_2: '',
	technical_feature_3: '',
	technical_feature_4: '',
	technical_feature_5: '',
	marketing_descriptions: '',
	market_price: '',
	discount_price: '',
	number_of_items_available: '',
	storeID: '',
	// id: crypto.randomUUID(),
})

const isEmpty =  (formObj, ignoreID=true) => {
	const emptyCheck = Object.entries(formObj).every(([key, value]) => {
		if (ignoreID && key==='id') return true; // ignore ID field
		const fieldsBool = value === null ||
							value === undefined ||
							(typeof value === 'string' && value.trim() === '') ||
							(Array.isArray(value) && value.length === 0) ||
							(typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
		return fieldsBool // returns every() value to isEmpty fxn
	})
	if (emptyCheck) {
		console.log(`Form ID ${formObj.id} is completely empty and should be skipped.`);
	}
	return emptyCheck // returned from every() fxn and passed to calling fxn outside of isEmpty()
};

const getCategories = (categoriesArr) => {
	if (!categoriesArr?.length) return null;
	const categories = categoriesArr.reduce((acc, currVal) => {
		let updated
		if (currVal.subcategories?.length) {
			// console.log('skipping:', currVal.name)
			updated = acc.concat(getCategories(currVal.subcategories))
		} else {
			updated  = acc.concat(currVal.name)
		}
		return updated;
	}, [])
	return categories;
}

function EditProduct() {
	const parameter = useParams()
	// console.log({parameter})
	const productID = parameter.productID;
	const reloadRef = useRef(1);
	const baseAPIURL = useImageKitAPIs()?.data;
	const formImageCountRef = useRef(null);
	const [checkReadiness, setCheckReadiness] = useState(false);
	const { createLocal, createSession } = useCreateStorage()
	const [checkCategory, setCheckCategory] = useState({});
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const [allFieldsLocked, setAllFieldsLocked] = useState(true);
	const navigate = useNavigate();
	const [selectStoreData, setSelectStoreData] = useState({storeID: ''})
	const [fieldStats, setFieldStats] = useState({})
	const [imagePreviews, setImagePreviews] = useState([]);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadedImages, setUploadedImages] = useState([]); // imagekit response like {image_url, fileId}
	const [formData, setFormData] = useState(initialFormData);
	const [isMounting, setIsMounting] = useState(true);
	const deviceType = useDeviceType().width <= 576;

	const lStore = createLocal.getItem('fpng-stor')||[];
	const userInfo = createLocal.getItem('fpng-user')
	// const lStoreDetails = lStore.find(store=>store.id?.toString()===parameters?.storeID?.toString())
	const storesArr = userInfo?.store

	const sessionProducts = createLocal.getItem('fpng-prod');
	// console.log({sessionProducts})
	// console.log({productID})
	const productToEdit = sessionProducts?.find(prod => String(prod.id) === String(productID));
	// console.log({productToEdit})
	const productImgs = {}
	let currentCateories

	const categoriesArr = createSession.getItem('fpng-catg')
	// console.log({categoriesArr})
	const categories = getCategories(categoriesArr);
	// console.log({categories})

	// change this from image_url_x to thumbnail_url_x later
	if (productToEdit) {
		Object.entries(productToEdit)
		.forEach(([field, value]) => {
			if (field.startsWith('image_url')&&value) {
				productImgs[field] = value
			}
		})
		currentCateories = productToEdit?.category?.map(cat => cat.name)
	}
	useEffect(() => {
		if (currentCateories?.length) {
			const initialCategories = currentCateories.reduce((acc, cat) => {
				acc[cat] = true
				return acc
			}, {})
			setCheckCategory(initialCategories)
		}
	}, [])
	// :
	// 					[]
	// console.log({productImgs})

	// array of fields that should be text areas instead of input fields
	const textAreaFieldsArr = [
		'full_descriptions', 'technical_descriptions',
		'marketing_descriptions',
	]

	// details for ImageCropAndCompress components
	const imageCropAndCompressArrDetails = [
		{
			id: `product_image_${formData.id}`,
			label: "Product Image",
			required: true
		},
		{
			id: `product_image2_${formData.id}`,
			label: "Product Image 2",
		},
		{
			id: `product_image3_${formData.id}`,
			label: "Product Image 3",
		},
		// {
		// 	id: `product_image4_${formData.id}`,
		// 	label: "Product Image 4",
		// },
		// {
		// 	id: `product_image5_${formData.id}`,
		// 	label: "Product Image 5",
		// }
	]

	useEffect(() => {
		if (productToEdit) {
			// prefill form data
			setFormData(prev => ({
				...prev,
				product_name: productToEdit.name || '',
				product_description: productToEdit.description || '',
				full_descriptions: productToEdit.fullDescription || '',
				technical_descriptions: productToEdit.technicalDescription || '',
				technical_feature_1: productToEdit.techFeature_1 || '',
				technical_feature_2: productToEdit.techFeature_2 || '',
				technical_feature_3: productToEdit.techFeature_3 || '',
				technical_feature_4: productToEdit.techFeature_4 || '',
				technical_feature_5: productToEdit.techFeature_5 || '',
				marketing_descriptions: productToEdit.marketingDescription || '',
				market_price: productToEdit.marketPrice || '',
				discount_price: productToEdit.discountPrice || '',
				number_of_items_available: productToEdit.numberOfItemsAvailable || '',
				storeID: productToEdit.store.id || '',
				storeName: productToEdit.store.store_name || '',
				id: productToEdit.id || productID,
				// image_url0: productToEdit.image_url_0 || '',
				// fileId0: productToEdit.fileId_0 || '',
				// thumbnail_url0: productToEdit.thumbnail_url_0 || '',
				// image_url1: productToEdit.image_url_1 || '',
				// fileId1: productToEdit.fileId_1 || '',
				// thumbnail_url1: productToEdit.thumbnail_url_1 || '',
				// image_url2: productToEdit.image_url_2 || '',
				// fileId2: productToEdit.fileId_2 || '',
				// thumbnail_url2: productToEdit.thumbnail_url_2 || '',
				// image_url3: productToEdit.image_url3 || '',
				// fileId3: productToEdit.fileId3 || '',
				// thumbnail_url3: productToEdit.thumbnail_url3 || '',
				// image_url4: productToEdit.image_url4 || '',
				// fileId4: productToEdit.fileId4 || '',
				// thumbnail_url4: productToEdit.thumbnail_url4 || '',
			}))
		}
	}, [])

	// handle input changes
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value, tagName } = e.target
		let maxChars;
		if (name==='product_name') {
			maxChars = 60;
		} else if (name==='product_description'||
					name==='technical_feature_1'||
					name==='technical_feature_2'||
					name==='technical_feature_3'||
					name==='technical_feature_4'||
					name==='technical_feature_5') {
			maxChars = 150;
		} else if (name==='market_price'||
					name==='discount_price'||
					name==='number_of_items_available') {
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
		} = limitInput(value, maxChars, undefined, isTextArea);

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

	// handles final form submission
	const onSubmitToServerHandler = async (e=null) => {
		if (e) e.preventDefault();

		console.log('Submitting form to server with data ...');
		// console.log('set loading to true (onSubmitToServerHandler) ...')
		// console.log({submittedForm})
		setLoading(true);

		// clean data: trim strings and convert to lowercase except for certain fields
		console.log('Processing form object:', formData);
		// check and track empty forms
		if (isEmpty(formData)) return null; // skip empty forms

		// clean data
		const cleanedData = {};
		Object.entries(formData)
			.forEach(([key, value]) => {
				if (key==='storeName'||key==='storeID') return; // skip storeName field
				cleanedData[key] = (
					key.startsWith('fileId')||
					key.startsWith('image_url')||
					key.startsWith('thumbnail_url')||
					key==='market_price'||
					key==='discount_price'||
					key==='number_of_items_available'||
					// key==='storeID'||
					typeof value === 'number'
				)?value:value.trim().toLowerCase();
			})

		// add select data
		// cleanedData['storeID'] = selectStoreData['storeID'];
		// add categories
		const checkedCat = Object.entries(checkCategory).reduce((acc, [key, value]) => {
			if (value) acc[key] = value
			return acc
		}, {})
		cleanedData['productCategories'] = checkedCat;

		console.log('Submitting form with cleaned data:', cleanedData);


		// setLoading(false);
		// console.log({cleanedData})
		// return

		try {
			const response = await fetch(`${baseURL}/update-product/${productID}/`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cleanedData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setIsError(errorData?.error)
				// console.log('set loading to false !response.ok (onSubmitToServerHandler) ...')
				setLoading(false);
				console.warn('Product Update Error:', errorData);
				toast.error(errorData?.error || 'Product Update Error!');
				return;
			}
			const data = await response.json();
			console.log('Response data from server',data)
			// const sessionProducts = createLocal.getItem('fpng-prod');
			const updated = sessionProducts?.map(prod => {
				return String(prod.id) === String(data?.id) ? data : prod
			});
			createLocal.setItem('fpng-prod', updated);

			toast.success(
				<div>
					Successful.<br />
					<strong>{titleCase(productToEdit?.name||'')} updated!</strong>
				</div>
			);
			console.log('Product Updated Successfully:', data);
			// use a transparent background to refresh this page
			// reset to one section
			// productSectionRefs.current[0].resetForm();
			// setFormData(initialFormData); // reset form
			/////// navigate('/') ///////// go to home page after registration
			navigate(`/detail/${data.id}`);
			return data;
		} catch (error) {
			console.error("Error during Product Update:", error);
			toast.error('Error! Product Update Failed. Please try again.');
			return null;
		} finally {
			// console.log('set loading to false in finally (onSubmitToServerHandler) ...')
			setLoading(false);
			// reloadRef,current = 0 // reset
		}
	}

	// auto submit form when formData has url and fileID filled
	// (i.e when image has been uploded to cloud)
	useEffect(() => {
		// console.log('#####'.repeat(14));
		// console.log('formData:', submittedForm);
		// console.log('formimageCountRef:', formImageCountRef.current);
		// if (submittedForm.length===formImageCountRef?.current?.length) {
			const allUploadedImagesReady = formImageCountRef?.current?.every(formEntry => {
				// const formObj = submittedForm.find(f => f.id === formEntry.id);
				if (!formData) return false;
		
				return formEntry.uploadedImgIdx.every(idx => {
					const imageUrlVal = formData[`image_url${idx}`];
					const fileIdVal = formData[`fileId${idx}`];
					console.log(`Checking image url and file id at index ${idx} for form ${formData.id}:`, !!imageUrlVal, !!fileIdVal);
					const bValue = Boolean(imageUrlVal && fileIdVal);
					console.log(`Image at index ${idx} is ready for form ${formData.id}:`, bValue);
					return bValue;
				});
			});
			// console.log('#####'.repeat(10));
			// console.log('All uploaded images ready:', allUploadedImagesReady);
			if (allUploadedImagesReady) {
				onSubmitToServerHandler(); // auto submit on image upload
				formImageCountRef.current = null; // reset
				reloadRef.current = 10 // disable reload
			} else if (!allUploadedImagesReady && reloadRef.current <= 5) {
				reloadRef.current += 1;
				setCheckReadiness(prev => !prev); // re-check readiness
				// console.log(`Not all images are ready yet, reloading (${reloadRef.current})...`);
			}
		// } else console.log('waiting for other forms to upload images ...');
		// console.log('#####'.repeat(14));
	}, [checkReadiness]);

	// handle image upload to imagekit cloud before finally submit form
	// with the image URLs and fileIds (via onSubmitToServerHandler())
	const handleImageUploadToCloud = async (e=null) => {
		if (e) e.preventDefault();
		console.log('set loading to true (handleImageUploadToCloud) ...')
		setLoading(true);

		// collect all files into an array
		const files = selectedFiles
				.map((file, idx) => ({
					file,
					idx,
				}))
				.filter(item => item.file); // only keep ones with actual files

		console.log("Files to upload:", files);


		// update formImageCountRef to track which forms have which image indexes
		// so we can track (and delay submission of incomplete data such as
		// images urls and fileIDs until) when all images for a form are uploaded
		// and these data is in the formData state

		// initialze formImageCountRef if null
		if (!formImageCountRef.current) {
			// console.log('Initializing formImageCountRef');
			formImageCountRef.current = [];
		}

		// check if entry for this form ID already exists
		const existingEntryIndex = formImageCountRef.current.findIndex(entry => entry.id === formData.id);
		// console.log('Existing entry index:', existingEntryIndex);

		// update if exists, else add new
		if (existingEntryIndex >= 0) {
			// update existing form entry
			// console.log('Updating existing form entry in formImageCountRef');
			formImageCountRef.current[existingEntryIndex].uploadedImgIdx = files.map(item => item.idx);
		} else {
			// add new form entry
			// console.log('Adding new form entry to formImageCountRef');
			formImageCountRef.current.push({
				id: formData.id,
				uploadedImgIdx: files.map(item => item.idx),
			});
		}
		console.log("Files to upload indexes:", formImageCountRef.current);

		const hasImage = selectedFiles.some(file => file instanceof Blob || file instanceof File);

		// only upload if there's at least first file selected
		if (hasImage) {
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
					imageFormData.append("fileName", `product_${i + 1}.jpg`);
					imageFormData.append("folder", "products");
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
					// setCheckReadiness(prev => !prev); // trigger readiness check for submission
				}
				setCheckReadiness(prev => !prev); // trigger readiness check for submission
				// uploadedImages state will update formData with the result (containing image url and fileID)
				// via useEffect above
			} catch (err) {
				toast.error('Upload failed. Please try again.');
				console.error("Upload failed:", err);
				console.log('set loading to false in catch (handleImageUploadToCloud) ...')
				setLoading(false);
				return;
			} finally {
				console.log('Finally block reached after upload attempts');
				// onSubmitToServerHandler(); // submit form after successful upload
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

	const handleFieldsValidation = () => {
		console.log({selectStoreData: selectStoreData.storeID})
		return selectStoreData.storeID
	}
	const checkFields = true // handleFieldsValidation();

	// handle setting selected files from ImageCropAndCompress component
	// i.e cropped and compressed files
	const handleSetFile = (index, file) => {
		setSelectedFiles(prev => {
			const newFiles = [...prev];
			newFiles[index] = file;
			return newFiles;
		});
		// try handling sending file check for 1st file here
	};
	const handlePreviewImage = (index, preview) => {
		setImagePreviews(prev => {
			const newPreviews = [...prev];
			newPreviews[index] = preview;
			return newPreviews;
		});
	};

	useEffect(() => {
		// flip loading off immediately after mount
		setIsMounting(false);
	}, []);

	const imageLength = imageCropAndCompressArrDetails.length;
	// initialize selectedFiles and uploadedImages arrays based on imageCropAndCompressArrDetails length
	useEffect(() => {
		setSelectedFiles(new Array(imageLength).fill(null));
		setUploadedImages(new Array(imageLength).fill(null));
		// setImagePreviews(new Array(imageLength).fill(false));
	}, [imageCropAndCompressArrDetails.length])

	// updates images instance details in formData whenever they change
	useEffect(() => {
		uploadedImages.forEach((uploadedImage, index) => {
			if (uploadedImage) {
				const imageKey = `image_url${index}`;
				const fileIdKey = `fileId${index}`;
				const thumbnailUrl = `thumbnail_url${index}`;
				setFormData(prev => ({
					...prev,
					...{
						[imageKey]: uploadedImage.url,
						[fileIdKey]: uploadedImage.fileId,
						[thumbnailUrl]: uploadedImage.thumbnailUrl,
					},
				}));

				// clear uploadedImage state after transferring to formData
				setUploadedImages(prev => {
					const newUploadedImages = [...prev];
					newUploadedImages[index] = null;
					return newUploadedImages;
				})
			}
		})

		// remove image_url and fileId if corresponding selectedFile is null
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

	// console.log({formData})
	// console.log({selectedFiles})
	// console.log({uploadedImages})
	// console.log({imagePreviews})
	
	// console.log({hasImage})
	const isCategoryEmpty = Object.keys(checkCategory).every(c=>!checkCategory[c])
	console.log({checkCategory, isCategoryEmpty})
	const checkedCat = Object.entries(checkCategory).reduce((acc, [key, value]) => {
		if (value) acc[key] = value
		return acc
	}, {})
	console.log({checkedCat})
	console.log({productToEdit, currentCateories})
	return (
		<>
			<Breadcrumb page={`Update Product / ${titleCase(productToEdit?.name||'')}`} slash={false} />

			{!isMounting ?
			<form
			onSubmit={handleImageUploadToCloud}
			// className="container-fluid"
			style={
				!deviceType?
					{
						display: 'flex',
						justifyContent: 'center',
					}
				:{}}>
				<div className="px-xl-5"
				style={{
					padding: deviceType?'':'0 1rem',
					width: deviceType?'':'90%',
				}}>
					<h5 className="text-uppercase mb-3">
					</h5>
					<div className={`bg-light ${deviceType?'p-18':'p-30'} mb-5`}
					style={{borderRadius: '10px'}}>
						{/* Toggle Switch */}
						<ToggleButton
						onClick={() => setAllFieldsLocked(prev => !prev)}
						miniStyle={'justify-content-end'}/>
						{/* <span className="d-flex align-items-center justify-content-end">
							<label className="toggle-switch mb-0">
								<input
								type="checkbox"
								onClick={() => setAllFieldsLocked(prev => !prev)}
								/>
								<span className="slider"></span>
							</label>
						</span> */}
						<div
						className="d-flex justify-content-between align-items-baseline"
						>
							<h5
							style={{color: '#6C757D'}}
							className="mb-3 font-italic font-underline">
								{/* {`Product`} */}
							</h5>
						</div>

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
														{/* inputs and textareas */}
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
															disabled={allFieldsLocked}
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
															placeholder={input.placeholder}
															required={input.important}
															disabled={allFieldsLocked}
															/>
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
									{imageCropAndCompressArrDetails.map(({ id, label, required }, idx) => {
										// if (!selectedFiles[0]&&idx>0) return null; // only show others if first one is selected
										// console.log({idx, hasFile: selectedFiles[idx], url: productImgs[`image_url_${idx}`]})
										return (
											<div className="col-md-6 form-group" key={id}>
												<label htmlFor={id}>
												{titleCase(label)}{required && <span>*</span>}
												</label>
												<>
													<ImageCropAndCompress
													onComplete={(file) => handleSetFile(idx, file)}
													type="product"
													imageId={id}
													buttonText={label}
													disableBtn={allFieldsLocked}
													isImagePreview={(preview) => handlePreviewImage(idx, preview)}
													/>
													{/* change this from image_url_x to thumbnail_url_x later */}
													{(!selectedFiles[idx]&&productImgs[`image_url_${idx}`]) &&
													<img
													style={{
														// marginTop: '0.5rem',
														maxWidth: '210px',
														maxHeight: '210px',
														objectFit: 'contain',
														borderRadius: '3%',
														// border: '1px solid #ccc',
													}}
													src={productImgs[`image_url_${idx}`]}
													alt={`Product ${idx+1}`} />}
												</>
											</div>
										)
									})}
								</>
							</div>
						</>

						{/* select store */}
						<div className="col-md-6 form-group px-0 mb-0">
							<label
							htmlFor={'storeID'}>Select Store<span>*</span></label>
							<select
							className="form-control"
							id={'storeID'}
							name="storeID"
							onChange={(e)=>setSelectStoreData({storeID: e.target.value})}
							style={{borderRadius: '5px'}}
							value={selectStoreData['storeID']}
							required={true}
							// disabled={loading||!storesArr?.length||allFieldsLocked}
							disabled
							>
								<option value={formData['storeID']}>{(storesArr?.length)?formData['storeName']:'No Store Registered'}</option>
								{storesArr?.map((store, i) => {
									return (
										<option
										key={i}
										value={store.id}>{titleCase(store.store_name)}</option>
									)
								})}
							</select>
						</div>
						{/* if user has no store */}
						{(!storesArr?.length)&&
						<StoreNameAndNoteValidText />}

{categories &&
						<>
							{/* categories checkboxes */}
							<div className="d-flex flex-column mb-2">
								<label
								className="col-md-6 form-group px-0 mb-0 mt-4"
								>Categories<span>*</span></label>
								<Note />
							</div>
						
							<div className="row mt-1 mb-2"
							style={{
								marginLeft: deviceType?'0':'',
								marginRight: deviceType?'0':'',
								// maxHeight: 200,
								// overflowY: 'auto',
								// border: '1px solid #ccc',
								// padding: deviceType?'0.5rem':'1rem',
								// borderRadius: 10,
							}}>
								{categories.map((cat, catIdx) => {
									return (
										<Fragment key={cat}>
											<div className={`col-md-3 mobile-item ${deviceType?'mb-2':'mb-1'}`}
											style={{
												fontSize: 14,
												textWrap: deviceType?'':'nowrap'
												}}>
												<label className="hover-checkbox mb-0"
												style={{ cursor: "pointer" }}>
													<input
													// style={{fontSize: 20}}
													type="checkbox"
													checked={!!checkCategory[cat]} // check if this category is true
													onChange={() =>
														setCheckCategory((prev) => ({
															...prev,
															[cat]: !prev[cat], // toggle the value
														}))
													}
													disabled={allFieldsLocked}
													/><span>{' '}{titleCase(cat)}</span>
												</label>
											</div>
											{/* <br /> */}
										</Fragment>
									)
								})}
							</div>
						</>}

						<div className={'mt-4'}>
							{/* post button */}
							<button
							type="submit"
							className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
							disabled={
								allFieldsLocked||
								loading||
								isCategoryEmpty}>
								{!loading?`Post`:
								<BouncingDots size="sm" color="#fff" p="1" />}
							</button>
						{/* <NoteOnNumOfPosts /> */}
						</div>

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
function StoreNameAndNoteValidText({
	isStoreNameAvailable, isStoreLoading}) {
	return (
		<>
			<span
			style={{
				fontSize: '0.75rem',
				display: 'inline-block',
				transform: 'skewX(-17deg)',
			}}>*You currently have no store registered</span>
		</>
	)
}

function NoteOnNumOfPosts() {
	return (
		<>
			<span
			style={{
				fontSize: '0.75rem',
				display: 'inline-block',
				transform: 'skewX(-10deg)',
				textAlign: 'center',
			}}>*Note: You can only submit 5 products in one post. To post more, make multiple posts</span>
		</>
	)
}
function Note() {
	return (
		<>
			<span
			style={{
				fontSize: '0.75rem',
				display: 'inline-block',
				transform: 'skewX(-17deg)',
			}}>*You must select atleast one category</span>
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
export { EditProduct }
