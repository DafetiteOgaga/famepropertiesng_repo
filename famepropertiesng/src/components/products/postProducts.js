import { useEffect, useState, useRef, forwardRef, useImperativeHandle, Fragment } from "react";
import 'react-country-state-city/dist/react-country-state-city.css';
import { Breadcrumb } from "../sections/breadcrumb";
import { useDeviceType } from "../../hooks/deviceType";
import { titleCase } from "../../hooks/changeCase";
import { toast } from "react-toastify";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useAuthFetch } from "../loginSignUpProfile/authFetch";
import { ImageCropAndCompress } from "../../hooks/fileResizer/ImageCropAndCompress";
import { BouncingDots } from "../../spinners/spinner";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { inputArr, isFieldsValid } from "./productFormInfo";
import { toTextArea, limitInput, isEmpty, getCategories,
			onlyNumbers
} from "../../hooks/formMethods/formMethods";
import { Listbox } from "@headlessui/react";
import { HeadlessSelectBtn } from "../../hooks/buttons";
import { useUploadToImagekit } from "../imageServer/uploadToImageKit";

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
	id: crypto.randomUUID(),
})

function PostProduct() {
	const authFetch = useAuthFetch();
	const trackEmptyFormsRef = useRef([]);
	const formImageCountRef = useRef(null);
	const [checkReadiness, setCheckReadiness] = useState(false);
	const { createLocal, createSession } = useCreateStorage()
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const [selectData, setSelectData] = useState({storeID: ''})
	const [submittedForm, setSubmittedForm] = useState([]);
	const [sections, setSections] = useState([0]); // start with one section
	const productSectionRefs = useRef([]); // keep refs for each section/form
	const firstImages = useRef([]); // track if first image for all forms are selected
	const renderedFormIDs = useRef([])
	const [renderedFormIDChanged, setRenderedFormIDChanged] = useState(false)
	const [isMounting, setIsMounting] = useState(true);
	const deviceType = useDeviceType().width <= 576;
	const [checkCategory, setCheckCategory] = useState({});

	const userInfo = createLocal.getItem('fpng-user')
	const storesArr = userInfo?.store
	const categoriesArr = createSession.getItem('fpng-catg')
	const categories = getCategories(categoriesArr);

	// handles final form submission
	const onSubmitToServerHandler = async (e=null) => {
		if (e) e.preventDefault();

		setLoading(true);

		// clean data: trim strings and convert to lowercase except for certain fields
		const cleanedDataArray = submittedForm
			.map(formObj => {
				// check and track empty forms
				if (isEmpty(formObj)) return null; // skip empty forms

				// cleaning the data
				const cleanedData = {};
				Object.entries(formObj)
					.forEach(([key, value]) => {
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
				cleanedData['storeID'] = selectData['storeID'];
				// add categories
				const checkedCat = Object.entries(checkCategory).reduce((acc, [key, value]) => {
					if (value) acc[key] = value
					return acc
				}, {})
				cleanedData['productCategories'] = checkedCat;

				return cleanedData;
			}).filter(item => item !== null);;

		console.log(cleanedDataArray);

		try {
			const response = await authFetch(`products/`, {
				method: "POST",
				body: cleanedDataArray,
			});

			const data = await response // .json();
			if (!data) return
			toast.success(
				<div>
					Successful.<br />
					<strong>{titleCase('')} Product Created!</strong>
				</div>
			);
			// clear all child forms
			trackEmptyFormsRef.current = []; // reset empty forms tracking
			formImageCountRef.current = null; // reset form image tracking
			setSubmittedForm([]); // reset submitted form data
			renderedFormIDs.current = []; // reset rendered form IDs tracking
			setSections([0]); // reset to one section

			// reset first images tracking
			firstImages.current = [];

			// reset all child forms via refs
			productSectionRefs.current.forEach(ref => {
				if (ref && ref.resetForm) {
					ref.resetForm();
				}
			});
			// clear refs array and reset to one ref for single section
			productSectionRefs.current = [];

			setCheckReadiness(false);
			// reset select data
			setSelectData({storeID: ''})
			// reset category checks
			setCheckCategory({});
			setRenderedFormIDChanged(prev => !prev) // trigger re-render

			setTimeout(() => {
				window.location.reload();
			}, 100);
			return data;
		} catch (error) {
			console.error("Error during Product Creation:", error);
			toast.error('Error! Product Creation Failed. Please try again.');
			return null;
		} finally {
			setLoading(false);
		}
	}

	// auto submit form when formData has url and fileID filled
	// (i.e when image has been uploded to cloud)
	useEffect(() => {
		if (submittedForm.length===formImageCountRef?.current?.length) {
			const allUploadedImagesReady = formImageCountRef?.current?.every(formEntry => {
				const formObj = submittedForm.find(f => f.id === formEntry.id);
				if (!formObj) return false;
		
				return formEntry.uploadedImgIdx.every(idx => {
					const imageUrlVal = formObj[`image_url${idx}`];
					const fileIdVal = formObj[`fileId${idx}`];
					const bValue = Boolean(imageUrlVal && fileIdVal);
					return bValue;
				});
			});
			if (allUploadedImagesReady) {
				onSubmitToServerHandler(); // auto submit on image upload
				formImageCountRef.current = null; // reset
			}
		}
	}, [checkReadiness]);

	// handle form submission on button click
	const handleSubmittingProcessedImagesWithForm = async (e) => {
		e.preventDefault();
		setLoading(true);

		// trigger child to upload images and submit form
		for (let i = 0; i < sections.length; i++) {
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
		setSections(prev => {
			const copy = [...prev]; // make a shallow copy so we don’t mutate React state directly

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
				setRenderedFormIDChanged(prev => !prev) // trigger re-render
			} else if (index > 0) {
				productSectionRefs.current.splice(index, 1);
				renderedFormIDs.current.splice(index, 1);
				setRenderedFormIDChanged(prev => !prev) // trigger re-render
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

	const handleFieldsValidation = () => {
		const allFormsFirstImageSelected = firstImages.current.every(obj => obj.selected)&&
											// or maybe i should use renderedFormIDs.length (its still consistent with instant updates)
											sections.length===firstImages.current.length;
		// console.log({allFormsFirstImageSelected, selectData: selectData.storeID, submittedForm: submittedForm.length})
		return submittedForm.length&&
				// allValid&&
				selectData.storeID&&
				allFormsFirstImageSelected;
	}
	const checkFields = handleFieldsValidation();

	useEffect(() => {
		const renderedFormsIDs = renderedFormIDs?.current?.map(form=>form.id)||[];
		firstImages.current = firstImages.current.filter(obj => renderedFormsIDs.includes(obj.id));
	}, [renderedFormIDChanged])
	useEffect(() => {
		setIsMounting(false);
	}, []);
	const isCategoryEmpty = Object.keys(checkCategory).every(c=>!checkCategory[c])
	const selectedStoreNme = storesArr?.find(store => store.id.toString()===selectData.storeID.toString())?.store_name
	console.log({selectData})
	return (
		<>
			<Breadcrumb page={'Post-Product(s)'} />

			{!isMounting ?
			<form
			onSubmit={handleSubmittingProcessedImagesWithForm}
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
								submittedForm={submittedForm}
								setRenderedFormIDChanged={setRenderedFormIDChanged}
								setSubmittedForm={handlSubmittedForm}
								setCheckReadiness={setCheckReadiness}
								setLoading={setLoading}
								checkFirstImageSelected={firstImages}
								formImageCountRef={formImageCountRef}
								trackEmptyFormsRef={trackEmptyFormsRef}
								onSubmitToServerHandler={onSubmitToServerHandler} />

								<hr
								style={{borderTop: '1px dashed #ccc', margin: '2rem 0'}} />
							</Fragment>
						)})}

						{/* select store */}
						<div className="col-md-6 form-group px-0 mb-0">
							<label
							htmlFor={'storeID'}>Select Store<span>*</span></label>
							{/* <select
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
							</select> */}

							<HeadlessSelectBtn
							onChangeLB={[(val)=>setSelectData({storeID: val})]}
							lbStateVal={selectData.storeID}
							lbArr={storesArr}
							lbInitialVal={selectedStoreNme || "-- Select a Store --"}
							input={{
								name: "storeID",
								value: selectData.storeID || "",
								disabled: loading||!storesArr?.length
							}}/>
							
							
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
							}}>
								{categories.map((cat, catIdx) => {
									return (
										<Fragment key={cat}>
											<div className={`col-md-3 mobile-item ${deviceType?'mb-2':'mb-1'}`}
											style={{
												fontSize: 14,
												textWrap: deviceType?'':'nowrap'
												}}>
												<label className="d-flex hover-checkbox mb-0"
												style={{ cursor: "pointer", gap: 3 }}>
													<input
													type="checkbox"
													checked={!!checkCategory[cat]} // check if this category is true
													onChange={() =>
														setCheckCategory((prev) => ({
															...prev,
															[cat]: !prev[cat], // toggle the value
														}))
													}
													/><span>{' '}{titleCase(cat)}</span>
												</label>
											</div>
											{/* <br /> */}
										</Fragment>
									)
								})}
							</div>
						</>}

						{/* add and remove form section buttons */}
						<div className={`d-flex flex-${deviceType?'column':'row'} justify-content-${deviceType?'between':'around'} my-4`}>
							{/* add form button */}
							<button
							type="button"
							className={`custom-upload-btn btn-color-dark ${deviceType?'mb-2':''}`}
							onClick={handleAddSection}
							disabled={sections.length >= 5}>
								<span className="fa fa-plus"/> Add Section
							</button>

							{/* remove form button */}
							<button
							type="button"
							className="custom-upload-btn btn-color-dark"
							onClick={()=>handleRemoveSection()}
							disabled={sections.length === 1}>
								<span className="fa fa-minus"/> Remove Last Section
							</button>
						</div>

						{/* post button */}
						<button
						type="submit"
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={
							!checkFields||
							loading||
							isCategoryEmpty}>
							{!loading?`Post ${sections.length>1?`All (${sections.length}) Products`:'Product'}`:
							<BouncingDots size="sm" color="#fff" p="1" />}
						</button>
						<NoteOnNumOfPosts />

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
const ProductSection = forwardRef(({renderedFormIDs,
									setSubmittedForm,
									submittedForm,
									setRenderedFormIDChanged,
									onSubmitToServerHandler,
									formImageCountRef,
									trackEmptyFormsRef,
									setLoading,
									checkFirstImageSelected,
									setCheckReadiness},
									ref) => {
	const [formData, setFormData] = useState(initialFormData);
	const [fieldStats, setFieldStats] = useState({})
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadedImages, setUploadedImages] = useState([]); // imagekit response like {image_url, fileId}
	const [imagePreviews, setImagePreviews] = useState([]);
	const postToImagekit = useUploadToImagekit();

	// reset form data
	const resetForm = () => {
		setFormData(initialFormData)
		handleSendFormToParent()
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
		let cleanedValue = value;
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
			// only allow numbers and dot for prices
			cleanedValue = onlyNumbers(value)
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
		} = limitInput(cleanedValue, maxChars, undefined, isTextArea);

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
	]

	const imageLength = imageCropAndCompressArrDetails.length;
	// initialize selectedFiles and uploadedImages arrays based on imageCropAndCompressArrDetails length
	useEffect(() => {
		setSelectedFiles(new Array(imageLength).fill(null));
		setUploadedImages(new Array(imageLength).fill(null));
	}, [imageCropAndCompressArrDetails.length])

	// track if first image is selected for all forms
	// and if first image is closed reset all other images (per form instance)
	useEffect(() => {
		// clear all images if first image is closed
		if (selectedFiles[0] === null) {
			setSelectedFiles(new Array(imageLength).fill(null));

			// remove from isFirstImages if it exists
			const prev = checkFirstImageSelected.current || [];
			checkFirstImageSelected.current = prev.filter(obj => obj.id !== formData.id);
		}

		// track if first image is selected for all forms
		if (selectedFiles[0] instanceof Blob || selectedFiles[0] instanceof File) {
			const prev = checkFirstImageSelected.current || [];
			const exists = prev.some(obj => obj.id === formData.id);
			if (!exists) {
				checkFirstImageSelected.current = [...prev, { id: formData.id, selected: true }];
			}
		}
	}, [selectedFiles[0]]);

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

	// handle image upload to imagekit cloud before finally submit form
	// with the image URLs and fileIds (via onSubmitToServerHandler())
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

		// initialze formImageCountRef if null
		if (!formImageCountRef.current) {
			formImageCountRef.current = [];
		}

		// check if entry for this form ID already exists
		const existingEntryIndex = formImageCountRef.current.findIndex(entry => entry.id === formData.id);

		// update if exists, else add new
		if (existingEntryIndex >= 0) {
			// update existing form entry
			formImageCountRef.current[existingEntryIndex].uploadedImgIdx = files.map(item => item.idx);
		} else {
			// add new form entry
			formImageCountRef.current.push({
				id: formData.id,
				uploadedImgIdx: files.map(item => item.idx),
			});
		}

		// only upload if there's at least first file selected
		if (selectedFiles[0] instanceof Blob || selectedFiles[0] instanceof File) {
			try {
				// upload each file one by one
				for (let i = 0; i < files.length; i++) {
					const { file, idx } = files[i];
					console.log(`Uploading file ${i + 1}:`, file);
					const imageKitResponse = await postToImagekit({
						selectedFile: file,
						fileName: `product_${i + 1}.jpg`,
						folder: "products"
					});
					if (!imageKitResponse) {
						setLoading(false);
						return; // upload failed, stop here
					}
					setUploadedImages(prev => {
						const newUploadedImages = [...prev];
						newUploadedImages[idx] = imageKitResponse;
						return newUploadedImages;
					});
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
			onSubmitToServerHandler(); // submit form after successful upload
		}
	};

	// expose triggerUpload method to parent via ref
	useImperativeHandle(ref, () => ({
		triggerUpload: async (...args) => {
			try {
				const result = await handleImageUploadToCloud(...args);
				return result;
			} catch (error) {
				console.error("BBBBB triggerUpload failed:".repeat(5), error);
				throw error; // rethrow so parent knows
			}
		},
		resetForm: () => {
			console.log("Resetting form data ...");
			// resets form data
			resetForm();
		}
	}));

	// handle setting selected files from ImageCropAndCompress component
	// i.e cropped and compressed files
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

	// send form data to parent whenever formData changes
	const handleSendFormToParent = () => {
		setSubmittedForm(formData)
	}

	// check if all fields are empty (skipping id)
	useEffect(() => {
		// check if all fields (except id) are empty strings
		const isFormTracked = renderedFormIDs.current.find(form=>form.id===formData.id)

		// track rendered form IDs (used for dynamic rendering and removal of forms in parent)
		if (!isFormTracked) {
			renderedFormIDs.current.push({
				idx: renderedFormIDs.current.length,
				id: formData.id
			});
			setRenderedFormIDChanged(prev => !prev) // trigger re-render
		}

		// only send to parent if some fields are filled (i.e form not empty)
		if (!isEmpty(formData)) {
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
