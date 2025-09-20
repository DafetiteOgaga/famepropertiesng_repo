import React, { useState, useEffect } from "react"
import { Breadcrumb } from "../sections/breadcrumb"
import { useDeviceType } from "../../hooks/deviceType"
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { BouncingDots } from "../../spinners/spinner";
import { digitSeparator, formatPhoneNumber, sentenceCase, titleCase } from "../../hooks/changeCase";
import { inputArr, isFieldsValid } from "./checkoutFormInfo";
// import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
// import 'react-country-state-city/dist/react-country-state-city.css';
import { limitInput, useCountryStateCity } from "../loginSignUpProfile/profileSetup/formsMethods";
import { toast } from "react-toastify";
import { getBaseURL } from "../../hooks/fetchAPIs";

const initialFormData = {
	first_name: '',
	last_name: '',
	address: '',
	nearest_bus_stop: '',
	mobile_no: '',
	email: '',
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
	cartDetails: [],
	shippingCost: 0,
	subTotal: 0,
	totalAmount: 0,
	paymentMethod: '',
}
const getField = (obj, field) => {
	return obj.find(item => item.field === field)?.value
}
const baseURL = getBaseURL();
const shipping = 1500

const paymentOptions = [
	"card_payment",
	"bank_transfer",
	"pay_on_delivery"
]

function Checkout() {
	const { cscFormData, CountryCompSelect, StateCompSelect, CityCompSelect } = useCountryStateCity();
	const { createLocal } = useCreateStorage()
	const deviceSpec = useDeviceType();
	const [isMounting, setIsMounting] = useState(true);
	const [shipToDifferent, setShipToDifferent] = useState(false);
	// const [country, setCountry] = useState(''); // whole country object
	// const [state, setState] = useState('');     // whole state object
	// const [city, setCity] = useState('');       // whole city object
	const [formData, setFormData] = useState(initialFormData);
	const [loggedInFormData, setLoggedInFormData] = useState({});
	const [subTotalAmount, setsubTotalAmount] = useState(0);
	const [fieldStats, setFieldStats] = useState({})
	// const [payment, setPayment] = useState("");
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const [morePx, setMorePx] = useState(0);
	const isMobile = deviceSpec.width <= 576
	const userInfo = createLocal.getItem('fpng-user')||{};
	const currencySym = userInfo?.currencySymbol||'₦'
	const cartItems = createLocal.getItem('fpng-cart');

	const {country, state, city, hasStates, hasCities, phoneCode: countryPhoneCode } = cscFormData;
	// console.log({cartItems})

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

	// calculate total amount whenever inputValue changes
	useEffect(() => {
		const total = cartItems?.reduce((sum, item) => {
			const price = parseFloat(item.price) || 0;
			const quantity = parseInt(item.nop) || 1;
			return sum + price * quantity;
		}, 0)||0;
		setsubTotalAmount(total);
	}, [cartItems]);

	const shipToProfileAddress = () => {
		setLoggedInFormData(prev => ({
			...prev,

			first_name: userInfo?.first_name||'',
			last_name: userInfo?.last_name||'',
			address: userInfo?.address||'',
			nearest_bus_stop: userInfo?.nearest_bus_stop||'',
			mobile_no: userInfo?.mobile_no||'',
			email: userInfo?.email||'',

			// country
			country: userInfo?.country||null,
			countryId: userInfo?.countryId||null,
			phoneCode: userInfo?.phoneCode||null,
			currency: userInfo?.currency||null,
			currencyName: userInfo?.currencyName||null,
			currencySymbol: userInfo?.currencySymbol||null,
			countryEmoji: userInfo?.countryEmoji||null,
			hasStates: userInfo?.hasStates||false,

			// state
			state: userInfo?.state||null,
			stateId: userInfo?.stateId||null,
			stateCode: userInfo?.stateCode||null,
			hasCities: userInfo?.hasCities||false,

			// city
			city: userInfo?.city||null,
			cityId: userInfo?.cityId||null,

			// order details
			cartDetails: cartItems.map(item => ({
				productId: item.prdId,
				productPrice: item.price,
				productQuantity: item.nop,
			})),
			shippingCost: shipping,
			subTotal: subTotalAmount,
			totalAmount: parseInt(subTotalAmount)+parseInt(shipping),

			// payment method
			// paymentMethod: userInfo?.paymentMethod||'',
		}))
	}

	const updateFormData = () => {
		setFormData(prev => ({
			...prev,

			// // country
			// country: country?.name||null,
			// countryId: country?.id||null,
			// phoneCode: country?.phone_code||null,
			// currency: country?.currency||null,
			// currencyName: country?.currency_name||null,
			// currencySymbol: country?.currency_symbol||null,
			// countryEmoji: country?.emoji||null,
			// hasStates: country?.hasStates||false,

			// // state
			// state: country?.hasStates?(state?.name):null,
			// stateId: country?.hasStates?(state?.id):null,
			// stateCode: country?.hasStates?(state?.state_code):null,
			// hasCities: state?.hasCities||false,

			// // city
			// city: state?.hasCities?(city?.name):null,
			// cityId: state?.hasCities?(city?.id):null,
			...cscFormData,

			// order details
			cartDetails: cartItems.map(item => ({
				productId: item.prdId,
				productPrice: item.price,
				productQuantity: item.nop,
			})),
			shippingCost: shipping,
			subTotal: subTotalAmount,
			totalAmount: parseInt(subTotalAmount)+parseInt(shipping),

			// payment method
			// paymentMethod: payment,
		}))

		// if (country?.hasStates===false) {
		// 	setState('');
		// 	setCity('');
		// }
	}

	// useEffect(() => {
	// 	if (country?.name||country?.hasStates===false) {
	// 		setState('');
	// 		setCity('');
	// 	}
	// }, [country])

	// useEffect(() => {
	// 	if (state?.name||state?.hasCities===false) {
	// 		setCity('');
	// 	}
	// }, [state])

	// updates country, state, city and image details in formData whenever they change
	useEffect(() => {
		updateFormData()
	}, [cscFormData, subTotalAmount])

	useEffect(() => {
		if (!shipToDifferent) {
			shipToProfileAddress()
		}
	}, [shipToDifferent, subTotalAmount])

	const allFieldsArr = Object.entries(userInfo).map(([field, value]) => ({ field, value }));
	const allowedFields = [
		'first_name', 'last_name', 'email', 'mobile_no', 'address',
		'nearest_bus_stop', 'country', 'state', 'city'
	]

	const allowedFieldsArr = allFieldsArr.reduce((acc, item) => {
		const targetIndex = 5
		if (item.field === "nearest_bus_stop") {
			// insert directly at target index
			acc.splice(targetIndex, 0, item);
		} else if (allowedFields.includes(item.field)) {
			acc.push(item);
		}
		return acc;
	}, []);

	useEffect(() => {
		// flip loading off immediately after mount
		setIsMounting(false);
	}, []);

	const phoneCode = getField(allFieldsArr, "phoneCode")

	
	const isLoggedIn = Boolean(userInfo?.id)
	useEffect(() => setShipToDifferent(!isLoggedIn), [])

	const checkFields = isFieldsValid({formData})&&
						formData.paymentMethod!==''&&
						formData.totalAmount>0

	// handles final form submission
	const onSubmitToServerHandler = async (e=null) => {
		if (e) e.preventDefault();

		updateFormData();

		setLoading(true);

		if (shipToDifferent&&!checkFields) {
			console.log('using formData ... (diff addy)')
			const emptyFieldsErrTxt = 'Error! All fields with * are required'
			setIsError(emptyFieldsErrTxt)
			console.warn(emptyFieldsErrTxt);
			toast.error(emptyFieldsErrTxt);
			return;
		} else if (!shipToDifferent&&(loggedInFormData.paymentMethod===''||!loggedInFormData.paymentMethod)) {
			console.log('using loggedInFormData ... (profile addy)')
			const paymentErrTxt = 'Error! Please select a payment method'
			setIsError(paymentErrTxt)
			console.warn(paymentErrTxt);
			toast.error(paymentErrTxt);
			return;
		}

		const formToBeSubmitted = shipToDifferent ? formData : loggedInFormData
		// let suctext
		// if (shipToDifferent) {
		// 	// formToBeSubmitted = formData
		// 	suctext = 'using formData ... (diff addy)'
		// } else {
		// 	suctext = 'using loggedInFormData ... (profile addy)'
		// 	// formToBeSubmitted = loggedInFormData
		// }
		// console.log({formToBeSubmitted})
		// toast.success(suctext);
		// return; // remove this when ready to test submission

		const cleanedData = {};
		Object.entries(formToBeSubmitted).forEach(([key, value]) => {
			// if (key==='password_confirmation') return; // skip password_confirmation from submission
			cleanedData[key] =
				// typeof value === 'boolean' ? value:
				value === null ? value:
				(
					key==='fileId'||
					key==='image_url'||
					key==='stateCode'||
					key==='phoneCode'||
					key==='currency'||
					key==='currencyName'||
					key==='currencySymbol'||
					key==='countryEmoji'||
					key==='cartDetails' ||
					key==='shippingCost' ||
					key==='subTotal' ||
					key==='totalAmount' ||
					key==='paymentMethod' ||
					key==='hasStates'||
					key==='hasCities' ||
					key==='email' ||
					typeof value === 'number'
				)?value:
					value.trim().toLowerCase();
			if (key==='email') cleanedData[key] = value.trim()
		})

		// add user id if logged in
		cleanedData['userID'] = userInfo?.id||'';
		// cleanedData['storeID'] = selectData['storeID'];
		// console.log('submitting form:', cleanedData);
		// toast.success('Registration Successful!');
		try {
			const response = await fetch(`${baseURL}/checkouts/`, {
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
					Successful.
					{/* <br /> */}
					{/* Welcome, <strong>{titleCase(data.first_name)}!</strong> */}
				</div>
			);
			// toast.success(`Registration Successful.\nWelcome, ${data.first_name}!`);
			// setFormData(initialFormData); // reset form
			// setLoggedInFormData({});
			// navigate('/welcome')
			// navigate('/login') // go to login page after signup
			return data;
		} catch (error) {
			console.error("Error during registration:", error);
			toast.error('Error! Registration Failed. Please try again.');
			return null;
		} finally {
			setLoading(false);
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

	useEffect(()=> {
		const fieldsToWatch = inputArr.map(item => item.name);
		console.log({fieldsToWatch})

		// Count how many fields are non-empty
		const filledCount = fieldsToWatch.filter(field => formData[field]?.trim() !== '').length;

		// Update morePx once based on count
		setMorePx(filledCount * 7);
	}, [formData, loggedInFormData])

	// console.log({userInfo})
	// console.log({isLoggedIn})
	// console.log({allFieldsArr})
	// console.log({allowedFieldsArr})
	// console.log({phoneCode})
	// console.log({shipToDifferent})
	console.log({formData})

	// console.log({country, state, city})
	
	console.log('csc =', {country, state, city, hasStates, hasCities})
	console.log('fd =', {country: formData.country, state: formData.state, city: formData.city})
	// console.log({formData})
	// console.log({subTotalAmount})
	// console.log({payment})
	// console.log({checkFields})
	// console.log({loggedInFormData})
	// console.log({CountryCompSelect, StateCompSelect, CityCompSelect})
	console.log({cscFormData})
	return (
		<>
			<Breadcrumb page={'Cart/Checkout'} />

			<div className="container-fluid mt-3"style={{
				paddingLeft: isMobile ? 0 : '',
				paddingRight: isMobile ? 0 : '',
			}}>
				<form onSubmit={onSubmitToServerHandler}
				className="row px-xl-5">
					<div className="col-lg-8">
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Billing Address
							</span>
						</h5>

						{/* Toggle Switch */}
						<span className="d-flex align-items-center">
							<label className="toggle-switch mb-0">
								<input
								disabled={!isLoggedIn}
								type="checkbox"
								checked={shipToDifferent}
								onChange={(e) => setShipToDifferent(e.target.checked)}
								/>
								<span className="slider"></span>
							</label>
							<span className="ml-2">Shipping {shipToDifferent?'to a different':'to profile'} address</span>
						</span>

						{!isMounting ?
						<>
							<div className={`p-30 mb-5`}
							style={{borderRadius: '10px'}}>
								<div className={`flip-container ${shipToDifferent ? "flipped" : ""}`}>
									<div className="flipper"
									style={{minHeight: !isMobile?(shipToDifferent?'380px':'270px'):(shipToDifferent?`${655+morePx}px`:'520px')}}>
										<div className="front row">
											{allowedFieldsArr.map((field, index) => {
												return (
													<div
													key={`${field}${index}`}
													className="col-md-6">
														<h6
														style={{
															color: '#475569',
															textDecoration: 'underline'
														}}>{titleCase(field.field)}:</h6>
														<p
														style={{borderRadius: '5px'}}
														className="">
															{field.field.includes('mobile')?
																(phoneCode+' '+formatPhoneNumber(field.value)):
																(field.field.includes('email')?
																field.value.toLowerCase():
																titleCase(field.value))}
														</p>
													</div>
												)
											})}
										</div>
										<div className="back row">
											{inputArr.map((input, index) => {
												// console.log({country, state})
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
																		}}>{countryPhoneCode}</p>}
																		<input
																		// ref={input.type==='email'?emailRef:null}
																		id={input.name}
																		name={input.name}
																		onChange={onChangeHandler}
																		value={formData[input.name]}
																		style={{borderRadius: '5px'}}
																		className="form-control"
																		type={input.type}
																		required={shipToDifferent?input.important:false}
																		autoComplete={input.autoComplete}
																		{...input.phoneProps}
																		placeholder={input.placeholder}/>
																	</div>
																</>}
																<>
																	{!['email','password', 'password_confirmation', 'mobile_no'].includes(input.name)&&
																	<span
																	style={{
																		fontSize: '0.625rem',
																		color: fieldStats[input.name]?.colorIndicator
																	}}
																	className={`justify-content-end d-flex font-italic`}>
																	{fieldStats[input.name]?.charCount ?
																		<>
																			{`${fieldStats[input.name]?.charCount}/${fieldStats[input.name]?.maxCharsLimit} chars`}
																		</>:null}
																	</span>}
																</>
													</div>
												)
											})}
										</div>
									</div>
									
								</div>
								
							</div>
							{<ShowErrorFromServer isError={isError} />}
						</>
						:
						<BouncingDots size={isMobile?"sm":"lg"} color="#475569" p={isMobile?"10":"14"} />}
					</div>


					<div className="col-lg-4">
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Order Summary
							</span>
						</h5>

						{(!isMounting&&cartItems) ?
						<div className="bg-light p-30 mb-5"
						style={{borderRadius: '10px'}}>
							<div className="border-bottom">
								<h6 className="mb-3">Products</h6>
								{cartItems.map((item, index) => {
									const productname = item.name.length>24?item.name.slice(0, 24)+'...':item.name
									return (
										<div
										key={`${item.image}${index}`}
										className="d-flex justify-content-between">
											<p>{titleCase(productname)} x {item.nop}</p>
											<p>{currencySym} {digitSeparator(item.price*item.nop)}</p>
										</div>
									)
								})}
							</div>
							<div className="border-bottom pt-3 pb-2">
								<div className="d-flex justify-content-between mb-3">
									<h6>Subtotal</h6>
									<h6>{currencySym} {digitSeparator(subTotalAmount)}</h6>
								</div>
								<div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Shipping</h6>
									<h6 className="font-weight-medium">
										{currencySym} {digitSeparator(shipping)}
									</h6>
								</div>
							</div>
							<div className="pt-2">
								<div className="d-flex justify-content-between mt-2">
									<h5>Total</h5>
									<h5>
										{currencySym} {subTotalAmount?digitSeparator(parseInt(subTotalAmount)+parseInt(shipping)):'0'}
									</h5>
								</div>
							</div>
						</div>
						:
						<BouncingDots size={isMobile?"sm":"sm"} color="#475569" p={isMobile?"10":"8"} />}




						<div className="mb-5">
							<h5 className="section-title position-relative text-uppercase mb-3">
								<span className="bg-secondary pr-3"
								style={{color: '#475569'}}>
									Payment Method
								</span>
							</h5>
							{!isMounting ?
							<div className="bg-light"
							style={{borderRadius: '10px',
								paddingBottom: 30,
								paddingTop: 20,
								paddingLeft: 30,
								paddingRight: 30,
							}}>
								<div style={{
									display: "flex", alignItems: "center"
								}} className="mb-3">
									<span>*</span><span style={{
										fontSize: '0.7rem',
										fontStyle: 'italic',
									}}>Required</span>
								</div>
								{paymentOptions.map((option, index) => {
									// const id = option.replaceAll('_', '');
									// const label = option.replaceAll('_', ' ');
									return (
										<div key={option}
										className="form-group">
											<div className="custom-control custom-radio">
												<input
												type="radio"
												className="custom-control-input"
												name="payment"
												id={option}
												value={option}
												onChange={(e)=>{
													// setPayment(e.target.value);
													setFormData(prev=>({...prev, paymentMethod: e.target.value}));
													setLoggedInFormData(prev=>({...prev, paymentMethod: e.target.value}))
													}}/>
												<label
												className="custom-control-label"
												htmlFor={option}>
													{sentenceCase(option)}
												</label>
											</div>
										</div>
									)
								})}
								<button
								type="submit"
								className="btn btn-block btn-primary font-weight-bold py-3">
									Place Order
								</button>
							</div>
							:
							<BouncingDots size={isMobile?"sm":"sm"} color="#475569" p={isMobile?"10":"6"} />}
						</div>
					</div>
				</form>
			</div>
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
export { Checkout }
