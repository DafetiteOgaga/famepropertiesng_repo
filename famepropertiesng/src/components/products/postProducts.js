import { useEffect, useState, useRef, forwardRef, useImperativeHandle, Fragment } from "react";
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

const initialFormData = () => ({
	product_name: '',
	product_description: '',
	full_descriptions: '',
	technical_descriptions: '',
	marketing_descriptions: '',
	market_price: '',
	discount_price: '',
	storeID: '',
	id: crypto.randomUUID(),
})

function PostProduct() {
	const trackEmptyFormsRef = useRef([]);
	const formImageCountRef = useRef(null);
	const [checkReadiness, setCheckReadiness] = useState(false);
	const { createLocal } = useCreateStorage()
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const navigate = useNavigate();
	const [selectData, setSelectData] = useState({storeID: ''})
	const [submittedForm, setSubmittedForm] = useState([]);
	const [sections, setSections] = useState([0]); // start with one section
	const productSectionRefs = useRef([]); // keep refs for each section/form
	const firstImages = useRef([]); // track if first image for all forms are selected
	const renderedFormIDs = useRef([])
	const deviceType = useDeviceType().width <= 576;

	const userInfo = createLocal.getItem('fpng-user')
	const storesArr = userInfo?.store

	// handles final form submission
	const onSubmitToServerHandler = async (e=null) => {
		if (e) e.preventDefault();

		// console.log('Submitting form to server with data ...');
		// console.log('set loading to true (onSubmitToServerHandler) ...')
		setLoading(true);

		// clean data: trim strings and convert to lowercase except for certain fields
		const cleanedDataArray = submittedForm.map(formObj => {
			const cleanedData = {};
			Object.entries(formObj).forEach(([key, value]) => {
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
					// key==='storeID'||
					typeof value === 'number'
				)?value:value.trim().toLowerCase();
			})

			// add select data
			cleanedData['storeID'] = selectData['storeID'];
			setSelectData({storeID: ''}) // reset select data after transferring to cleaned data

			// console.log('Submitting form with cleaned data:', cleanedData);
			return cleanedData;
		});

		try {
			const response = await fetch(`${baseURL}/products/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cleanedDataArray),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setIsError(errorData?.error)
				// console.log('set loading to false !response.ok (onSubmitToServerHandler) ...')
				setLoading(false);
				console.warn('Product Creation Error:', errorData);
				toast.error(errorData?.error || 'Product Creation Error!');
				return;
			}
			const data = await response.json();
			// console.log('Response data from server',data)
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
			// console.log('set loading to false in finally (onSubmitToServerHandler) ...')
			setLoading(false);
		}
	}

	// auto submit form when formData has url and fileID filled
	// (i.e when image has been uploded to cloud)
	useEffect(() => {
		console.log('#####'.repeat(14));
		console.log('formData:', submittedForm);
		console.log('formimageCountRef:', formImageCountRef.current);
		if (submittedForm.length===formImageCountRef?.current?.length) {
			const allUploadedImagesReady = formImageCountRef?.current?.every(formEntry => {
				const formObj = submittedForm.find(f => f.id === formEntry.id);
				if (!formObj) return false;
		
				return formEntry.uploadedImgIdx.every(idx => {
					const imageUrlVal = formObj[`image_url${idx}`];
					const fileIdVal = formObj[`fileId${idx}`];
					console.log(`Checking image url and file id at index ${idx} for form ${formObj.id}:`, !!imageUrlVal, !!fileIdVal);
					const bValue = Boolean(imageUrlVal && fileIdVal);
					console.log(`Image at index ${idx} is ready for form ${formObj.id}:`, bValue);
					return bValue;
				});
			});
			console.log('#####'.repeat(10));
			console.log('All uploaded images ready:', allUploadedImagesReady);
			if (allUploadedImagesReady) {
				onSubmitToServerHandler(); // auto submit on image upload
				formImageCountRef.current = null; // reset
			} else console.log('Not all images are ready yet, waiting...');
		} else console.log('waiting for other forms to upload images ...');
		console.log('#####'.repeat(14));
	}, [checkReadiness]);

	// handle form submission on button click
	const handleSubmittingProcessedImagesWithForm = async (e) => {
		e.preventDefault();
		// console.log('set loading to true (handleSubmittingProcessedImagesWithForm) ...')
		setLoading(true);

		// console.log("called handleSubmittingProcessedImagesWithForm from parent ...");

		// trigger child to upload images and submit form
		// console.log("Triggering image upload in all sections ...");
		// console.log({sections})
		for (let i = 0; i < sections.length; i++) {
			// console.log(`Triggering upload for section index: ${i} (array position: ${i})`);
			if (productSectionRefs.current[i]) {
				await productSectionRefs.current[i].triggerUpload();
			}
		}
	}

	// clear error message after 3s
	useEffect(() => {
		if (isError) {
			const delay = setTimeout(() => {
				setIsError(null)
			}, 3000);
			return ()=>clearTimeout(delay)
		}
	}, [isError])

	// handle form data from child istances
	const handlSubmittedForm = (value) => {
		setSubmittedForm(prev => {
			const existingIndex = prev.findIndex(f => f.id === value.id);
			if (existingIndex !== -1) {
				// replace existing
				const copy = [...prev];
				copy[existingIndex] = value;
				return copy;
			}
			// otherwise add new
			return [...prev, value];
		});
	};

	// Add one more section/form
	const handleAddSection = () => {
		setSections(prev => [...prev, prev.length]); // e.g. [0] -> [0,1] -> [0,1,2]
	};

	// Remove the last section/form or specific index
	const handleRemoveSection = (index=-1) => {
		// console.log('Removing section at index:', index);
		setSections(prev => {
			const copy = [...prev]; // make a shallow copy so we don’t mutate React state directly
			const copyLength = copy.length;
			// console.log('Current sections length:', copyLength);

			if (copy.length <= 1) {
				// safeguard: don’t allow removing the only remaining section
				return copy;
			}

			if (index === -1 || index === copy.length - 1) {
				// no index or last index → remove last
				copy.pop();
			} else if (index > 0) {
				// remove specific section but never index 0
				copy.splice(index, 1);
			}

			return copy;
		});

		// keep refs + IDs arrays in sync with sections
		if (productSectionRefs.current.length > 1) {
			if (index === -1 || index === productSectionRefs.current.length - 1) {
				productSectionRefs.current.pop();
				renderedFormIDs.current.pop();
			} else if (index > 0) {
				productSectionRefs.current.splice(index, 1);
				renderedFormIDs.current.splice(index, 1);
			}
		}

		// 3. Update submittedForm to equally be in sync
		setSubmittedForm(prev => {
			if (prev.length <= 1) return prev; // safeguard
			const copy = [...prev];
			if (index === -1 || index === copy.length - 1) {
				copy.pop();
			} else if (index > 0) {
				copy.splice(index, 1);
			}
			return copy;
		});
	};

	// const handleFirstImageSelected = (isFirstImages) => {
	// 	firstImages.current.push(isFirstImages);
	// }

	const handleFieldsValidation = () => {
		const areInstancesValid = Object.entries(submittedForm).map(([key, value]) => {
			// console.log({key, value})
			const fieldId = value.id;
			const isValid = isFieldsValid({formData: value});
			return { fieldId, isValid };
		})
		const allValid = areInstancesValid.every(item => item.isValid);
		const allFormsFirstImageSelected =
											// firstImages.current.length === sections.length&&
											firstImages.current.every(obj => obj.selected);
		// console.log({areInstancesValid, allValid, allFormsFirstImageSelected, selectData})
		return submittedForm.length&&
				// allValid&&
				selectData.storeID&&
				allFormsFirstImageSelected;
	}
	const checkFields = handleFieldsValidation();

	// // track current form ID
	// const handleCurrentFormID = (id) => {
	// 	console.log({id})
	// }

	// console.log('formdata from child:\n'.repeat(5), submittedForm)
	// console.log('renderedFormIDs', renderedFormIDs.current)
	// console.log('productSectionRefs:', productSectionRefs.current)
	// console.log({sections})
	// console.log('sections length:', sections.length)
	// console.log('trackEmptyFormsRef:\n'.repeat(2), trackEmptyFormsRef.current)
	// console.log({checkFields})
	// console.log('firstImages:', firstImages)
	console.log({userInfo})
	return (
		<>
			<Breadcrumb page={'Post Products'} />

			<form
			onSubmit={handleSubmittingProcessedImagesWithForm}
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
						{/* <span className="bg-secondary pr-3"
						style={{color: '#475569'}}>
							Post Products
						</span> */}
					</h5>
					<div className={`bg-light ${deviceType?'p-18':'p-30'} mb-5`}
					style={{borderRadius: '10px'}}>

					{/* Render instances of ProductSection dynamically */}
					{sections.map((index, i) => {
						const formID = renderedFormIDs.current[i]?.id;
						return (
							<Fragment key={sections[i]}>
								<div
								className="d-flex justify-content-between align-items-baseline"
								>
									<h5
									style={{color: '#6C757D'}}
									className="mb-3 font-italic font-underline">
										{`Product ${sections[i]+1}`} {(trackEmptyFormsRef.current.includes(formID)&&i)?'(This section is not filled and will not be submitted)':''}
									</h5>
									{!i?undefined:
									<span className="fa fa-times btn-danger"
									onClick={()=>handleRemoveSection(i)}
									style={{
										padding: deviceType?'0.5rem':'0.2rem 0.3rem',
										border: '1px solid #ccc',
										borderRadius: '10%',
									}}/>}
								</div>
								<ProductSection
								ref={el => (productSectionRefs.current[i] = el)}
								renderedFormIDs={renderedFormIDs}
								// handleCurrentFormID={handleCurrentFormID}
								submittedForm={submittedForm}
								setSubmittedForm={handlSubmittedForm}
								setCheckReadiness={setCheckReadiness}
								setLoading={setLoading}
								checkFirstImageSelected={firstImages}
								formImageCountRef={formImageCountRef}
								trackEmptyFormsRef={trackEmptyFormsRef}
								onSubmitToServerHandler={onSubmitToServerHandler} />

								<hr
								// className="bg-lite"
								style={{borderTop: '1px dashed #ccc', margin: '2rem 0'}} />
							</Fragment>
						)})}

						{/* select store */}
						<div className="col-md-6 form-group px-0 mb-0">
							<label
							htmlFor={'storeID'}>Select Store<span>*</span></label>
							<select
							className="form-control"
							id={'storeID'}
							name="storeID"
							onChange={(e)=>setSelectData({storeID: e.target.value})}
							style={{borderRadius: '5px'}}
							value={selectData['storeID']}
							required={true}
							disabled={loading||!storesArr?.length}
							>
								<option value="">-- {(storesArr?.length)?'Select a store':'No Store Registered'} --</option>
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

						<div className={`d-flex flex-${deviceType?'column':'row'} justify-content-${deviceType?'between':'around'} my-4`}>
							<button
							type="button"
							className={`custom-upload-btn btn-color-dark ${deviceType?'mb-2':''}`}
							onClick={handleAddSection}>
								<span className="fa fa-plus"/> Add Section
							</button>
							<button
							type="button"
							className="custom-upload-btn btn-color-dark"
							onClick={()=>handleRemoveSection()} disabled={sections.length === 1}>
								<span className="fa fa-minus"/> Remove Last Section
							</button>
						</div>

						{/* post button */}
						<button
						type="submit"
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={
							!checkFields||
							loading}>
							{!loading?'Post':
							<BouncingDots size="sm" color="#fff" p="1" />}
						</button>

						{/* show error response message */}
						{isError && <ShowErrorFromServer isError={isError} />}
					</div>
				</div>
			</form>
		</>
	)
}
const ProductSection = forwardRef(({renderedFormIDs,
									// handleCurrentFormID,
									setSubmittedForm,
									submittedForm,
									onSubmitToServerHandler,
									formImageCountRef,
									trackEmptyFormsRef,
									setLoading,
									checkFirstImageSelected,
									setCheckReadiness},
									ref) => {
	const baseAPIURL = useImageKitAPIs()?.data;
	const [formData, setFormData] = useState(initialFormData);
	const [fieldStats, setFieldStats] = useState({})
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadedImages, setUploadedImages] = useState([]); // imagekit response like {image_url, fileId}
	const [imagePreviews, setImagePreviews] = useState([]);
	const [isFirstImages, setIsFirstImages] = useState([]); // track if first image for all forms are selected

	// reset form data
	const resetForm = () => {
		setFormData(prev => ({
			...initialFormData,
		  id: prev.id   // keep old id
		}));
	};

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
		{
			id: `product_image4_${formData.id}`,
			label: "Product Image 4",
		},
		{
			id: `product_image5_${formData.id}`,
			label: "Product Image 5",
		}
	]

	const imageLength = imageCropAndCompressArrDetails.length;
	// initialize selectedFiles and uploadedImages arrays based on imageCropAndCompressArrDetails length
	useEffect(() => {
		setSelectedFiles(new Array(imageLength).fill(null));
		setUploadedImages(new Array(imageLength).fill(null));
		// setImagePreviews(new Array(imageLength).fill(false));
	}, [imageCropAndCompressArrDetails.length])

	// notify parent if first image is selected for this form instance
	// const handleFirstImageSelected = (func) => {
	// 	func(isFirstImages);
	// }

	// track if first image is selected for all forms
	// and if first image is closed reset all other images (per form instance)
	useEffect(() => {
		// clear all images if first image is closed
		if (selectedFiles[0] === null) {
			// console.log('Resetting all image fields as first image is closed ...');
			setSelectedFiles(new Array(imageLength).fill(null));

			// remove from isFirstImages if it exists
			const prev = checkFirstImageSelected.current || [];
			checkFirstImageSelected.current = prev.filter(obj => obj.id !== formData.id);
		}

		// track if first image is selected for all forms
		if (selectedFiles[0] instanceof Blob || selectedFiles[0] instanceof File) {
			const prev = checkFirstImageSelected.current || [];
			// console.log('checkinhg if first image exists in tracking array ...')
			const exists = prev.some(obj => obj.id === formData.id);
			// console.log('')
			// console.log({exists})
			if (!exists) {
				// console.log('Tracking first image selection for this form instance ...')
				checkFirstImageSelected.current = [...prev, { id: formData.id, selected: true }];
			}
		}
		// else console.log('First image not selected ...')
		// else {
		// 	// remove from isFirstImages if it exists
		// 	const prev = checkFirstImageSelected.current || [];
		// 	checkFirstImageSelected.current = prev.filter(obj => obj.id !== formData.id);
		// }
	}, [selectedFiles[0]]);

	// updates images instance details in formData whenever they change
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

	// handle image upload to imagekit cloud before finally submit form
	// with the image URLs and fileIds (via onSubmitToServerHandler())
	const handleImageUploadToCloud = async (e=null) => {
		if (e) e.preventDefault();
		// console.log('set loading to true (handleImageUploadToCloud) ...')
		setLoading(true);

		// collect all files into an array
		const files = selectedFiles
				.map((file, idx) => ({
					file,
					idx,
				}))
				.filter(item => item.file); // only keep ones with actual files

		// console.log("Files to upload:", files);


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
		// console.log("Files to upload indexes:", formImageCountRef.current);

		// only upload if there's at least first file selected
		if (selectedFiles[0] instanceof Blob || selectedFiles[0] instanceof File) {
			// console.log("File(s) ready for upload:", files);
			try {
				// upload each file one by one
				for (let i = 0; i < files.length; i++) {
					// get authentication signature from backend
					const authData = await authenticator();
					if (!authData) throw new Error("Failed to get ImageKit auth data");
					// console.log("Auth data for upload:", authData);

					const { file, idx } = files[i];
					// console.log(`Uploading file ${i + 1}:`, file);

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
				}
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
			}
		} else {
			// just submit if no file to upload
			// console.log("No file selected, skipping upload.");
			onSubmitToServerHandler(); // submit form after successful upload
		}
	};

	// expose triggerUpload method to parent via ref
	useImperativeHandle(ref, () => ({
		triggerUpload: async (...args) => {
			// console.log("BBBBB triggerUpload started".repeat(5));
			try {
				const result = await handleImageUploadToCloud(...args);
				// console.log("BBBBB triggerUpload ended".repeat(5));
				return result;
			} catch (error) {
				console.error("BBBBB triggerUpload failed:".repeat(5), error);
				throw error; // rethrow so parent knows
			}
		},
	}));

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

	// send form data to parent whenever formData changes
	const handleSendFormToParent = () => {
		// console.log('Sending form data to parent');
		// console.log({formData})
		setSubmittedForm(formData)
		// handleFirstImageSelected(checkFirstImageSelected)
	}

	// check if all fields are empty (skipping id)
	useEffect(() => {
		// check if all fields (except id) are empty strings
		const allEmpty = Object.entries(formData).every(([key, value]) => {
			if (key === 'id') return true // skip id
			return value === '' // check others are empty strings
		})
		// console.log({allEmpty})
		const isFormTracked = renderedFormIDs.current.find(form=>form.id===formData.id)

		// track rendered form IDs (used for dynamic rendering and removal of forms in parent)
		if (!isFormTracked) {
			renderedFormIDs.current.push({
				idx: renderedFormIDs.current.length,
				id: formData.id
			});
		}

		// console.log('current form:XXXXXXX\n'.repeat(5), formData);
		// console.log('existing forms:ZZZZZ\n'.repeat(5), submittedForm);

		// only send to parent if some fields are filled (i.e form not empty)
		if (!allEmpty) {
			// remove from empty tracking if it exists
			// console.log("Removing form ID from empty tracking array if exists ...");
			trackEmptyFormsRef.current = trackEmptyFormsRef.current.filter(id => id !== formData.id);
			handleSendFormToParent() // trigger send to parent
			// console.log("triggering check readiness (after formData sync) ...");
		} else {
			// if all the form's fields are empty, add to empty tracking array
			// console.log("Tracking empty form using ID ...");
			if (!trackEmptyFormsRef.current.includes(formData.id)) {
				trackEmptyFormsRef.current.push(formData.id);
			}
		}
		// reload parent component to fetch updated data
		setCheckReadiness(prev => !prev);  // only toggle once data is in sync
	}, [formData])
	// console.log({formData})
	// console.log('uploadedImages array:', uploadedImages)
	// // console.log({checkFields})
	// console.log('selectedFiles array:', selectedFiles)
	// console.log('imagePreviews array:', imagePreviews)
	// console.log('formImageCountRef:', formImageCountRef?.current);
	// // console.log({numberOfImages})
	// console.log('isFirstImages:', isFirstImages)
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
})
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
