import React, { useState, useEffect } from "react"
import { Breadcrumb } from "../sections/breadcrumb"
import { useDeviceType } from "../../hooks/deviceType"
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { BouncingDots } from "../../spinners/spinner";
import { digitSeparator, formatPhoneNumber, sentenceCase, titleCase } from "../../hooks/changeCase";
import { inputArr, isFieldsValid } from "./checkoutFormInfo";
import { limitInput, useCountryStateCity, onlyNumbers,
			usePSPK} from "../../hooks/formMethods/formMethods";
import { toast } from "react-toastify";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useAuthFetch } from "../loginSignUpProfile/authFetch";
import { ToggleButton } from "../../hooks/buttons";
import { PaystackCheckout } from "./paystackCheckout";

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
const apiUrl = getBaseURL(true) + '/get-paystack-keys/pk/';
const shipping = 1500

const paymentOptions = [
	"pay_now",
	"pay_on_delivery",
	"installmental_payment",
]

const _15percent = 0.15

function Checkout() {
	usePSPK() // fetch and store paystack public key
	const authFetch = useAuthFetch()
	const [typedInstallAmount, setTypedInstallAmount] = useState(0);
	const [finalInstallmentAmount, setFinalInstallmentAmount] = useState(null);
	const [isInstallPlan, setIsInstallPlan] = useState(false);
	const { cscFormData, cscRequiredFieldsGood, CountryCompSelect, StateCompSelect, CityCompSelect } = useCountryStateCity();
	const { createLocal, createSession } = useCreateStorage()
	const deviceSpec = useDeviceType();
	const [isMounting, setIsMounting] = useState(true);
	const [shipToDifferent, setShipToDifferent] = useState(false);
	const [formData, setFormData] = useState(initialFormData);
	const [loggedInFormData, setLoggedInFormData] = useState({});
	const [subTotalAmount, setsubTotalAmount] = useState(0);
	const [fieldStats, setFieldStats] = useState({})
	const [checkoutResp, setCheckoutResp] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(null);
	const [morePx, setMorePx] = useState(0);
	const isMobile = deviceSpec.width <= 576
	const userInfo = createLocal.getItem('fpng-user')||{};
	const currencySym = userInfo?.currencySymbol||'₦'
	const cartItems = createLocal.getItem('fpng-cart');

	const {country, state, city, hasStates, hasCities, phoneCode: countryPhoneCode } = cscFormData;

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

	// calculate total amount whenever inputValue changes
	useEffect(() => {
		const total = cartItems?.reduce((sum, item) => {
			const price = parseFloat(item.price) || 0;
			const quantity = parseInt(item.nop) || 1;
			return sum + price * quantity;
		}, 0)||0;
		setsubTotalAmount(isInstallPlan?((total*_15percent)+total):total);
	}, [cartItems, isInstallPlan]);

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
			cartDetails: cartItems?.map(item => ({
				productId: item.prdId,
				productPrice: item.price,
				productQuantity: item.nop,
			})),
			shippingCost: shipping,
			subTotal: subTotalAmount,
			totalAmount: parseInt(subTotalAmount)+parseInt(shipping),
		}))
	}

	const updateFormData = () => {
		setFormData(prev => ({
			...prev,
			...cscFormData,

			// order details
			cartDetails: cartItems?.map(item => ({
				productId: item.prdId,
				productPrice: item.price,
				productQuantity: item.nop,
			})),
			shippingCost: shipping,
			subTotal: subTotalAmount,
			totalAmount: parseInt(subTotalAmount)+parseInt(shipping),
		}))
	}

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
			setLoading(false)
			return;
		} else if (!shipToDifferent&&(loggedInFormData.paymentMethod===''||!loggedInFormData.paymentMethod)) {
			console.log('using loggedInFormData ... (profile addy)')
			const paymentErrTxt = 'Error! Please select a payment method'
			setIsError(paymentErrTxt)
			console.warn(paymentErrTxt);
			toast.error(paymentErrTxt);
			setLoading(false)
			return;
		}

		const formToBeSubmitted = shipToDifferent ? formData : loggedInFormData

		const cleanedData = {};
		Object.entries(formToBeSubmitted).forEach(([key, value]) => {
			cleanedData[key] =
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
		cleanedData['userID'] = userInfo?.id||null;

		try {
			const response = await authFetch(`${baseURL}/checkouts/`, {
				method: "POST",
				headers: 'no-header',
				body: cleanedData,
			});

			const data = await response // .json();
			if (!data) {
				setLoading(false)
				return
			}
			console.log('Response data from server',data)
			setCheckoutResp(data);
			toast.success(
				<div>
					Successful.
				</div>
			);
			setLoading(false)
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

		setMorePx(prev => {
			// count the normal filled fields
			const filledCount = fieldsToWatch.filter(
				val => formData[val] !== '' && formData[val] !== null && formData[val] !== undefined
			).length;
			// base pixels
			let newMorePx = filledCount * 7;
			// add +10 if state is filled
			if (hasStates) {
				newMorePx += 80;
			}
			// add +10 if city is filled
			if (hasCities) {
				newMorePx += 80;
			}
			console.log('Updating morePx from', prev, 'to', newMorePx);
			return newMorePx;
		});
	}, [formData, loggedInFormData])

	useEffect(() => {
		// reset installment fields if payment method changes away from installment plan
		if (formData.paymentMethod === 'installmental_payment' ||
			loggedInFormData.paymentMethod === 'installmental_payment') {
			setIsInstallPlan(true)
			toast.info('Enter First Inatallment amount.')
		} else {
			setIsInstallPlan(false)
		}
	}, [formData.paymentMethod, loggedInFormData.paymentMethod])

	const _15percentField = parseInt(subTotalAmount) - parseInt((subTotalAmount/(1+_15percent)));

	const updatedCheckoutResp = {
		...checkoutResp,
		amount: finalInstallmentAmount??(checkoutResp?.amount),
	}
	const checkJustFields = isFieldsValid({formData});

	console.log({loading})
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
						<ToggleButton
						checked={shipToDifferent}
						onChange={(e) => setShipToDifferent(e.target.checked)}
						disabled={!isLoggedIn} />

						{!isMounting ?
						<>
							<div className={`p-30 ${isInstallPlan?(shipToDifferent?'mb-0 pb-0':'mb-5'):'mb-5'}`}
							style={{borderRadius: '10px'}}>
								<div className={`flip-container ${shipToDifferent ? "flipped" : ""}`}>
									<div className="flipper"
									style={{minHeight: !isMobile?(shipToDifferent?'380px':'270px'):(shipToDifferent?`${500+morePx}px`:'520px')}}>
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
															{((field.field.toLowerCase()==='state'&&userInfo.hasStates===false)||
															(field.field.toLowerCase()==='city'&&userInfo.hasCities===false))?'N/A':
															field.field.includes('mobile')?
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
														htmlFor={input.name}>
															{titleCase(input.name)}
															<span>
																{`${input.important?'*':''}`}
															</span>
														</label>
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
							{<EnterInstallmentalAmount
							currencySym={currencySym}
							isInstallPlan={isInstallPlan}
							typedInstallAmount={typedInstallAmount}
							subTotalAmount={subTotalAmount}
							setTypedInstallAmount={setTypedInstallAmount}
							finalInstallmentAmount={finalInstallmentAmount}
							setFinalInstallmentAmount={setFinalInstallmentAmount}
							shipToDifferent={shipToDifferent} />}
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
								<div className={`installment-pay ${isInstallPlan?'show':''}`}>
									<div className="d-flex justify-content-between mb-3">
										<h6>Installmental fee (15%)</h6>
										<h6>{currencySym} {digitSeparator(_15percentField)}</h6>
									</div>
								</div>
								<div className="d-flex justify-content-between mb-3">
									<h6>Subtotal
										<span className={`installment-pay ${isInstallPlan?'show':''}`}>{isInstallPlan&&' + 15%'}</span>
									</h6>
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
									const pod = option==='pay_on_delivery'
									const isLoggedInUser = !!userInfo?.id
									const installmental = option==='installmental_payment'
									// if (pod&&!isLoggedInUser) return null;
									return (
										<div key={option}
										className="form-group"
										style={{cursor: 'pointer'}}>
											<div className="custom-control custom-radio">
												<input
												type="radio"
												className="custom-control-input"
												name="payment"
												id={option}
												value={option}
												// disabled={(pod||installmental)&&!isLoggedInUser}
												disabled={pod||(installmental&&!isLoggedInUser)}
												onChange={
													// handleRadio
													(e) => {
														console.log('radio checked:', option)
													setFormData(prev=>({...prev, paymentMethod: e.target.value}));
													setLoggedInFormData(prev=>({...prev, paymentMethod: e.target.value}))
												}
												}/>
												<label
												className="custom-control-label"
												htmlFor={option}>
													{sentenceCase(option)}{installmental&&' + (15%)'}
													{(installmental&&!isLoggedInUser)&&ExtraNote([`You must be logged-in to use this option.`,])}
													{pod&&ExtraNote([`Temporarily unavailable.`,])}
												</label>
											</div>
										</div>
									)
								})}
								<button
								type="submit"
								disabled={
									(shipToDifferent?
										(!checkJustFields||!cscRequiredFieldsGood):
										false)||
									loading
								}
								className="btn btn-block btn-primary font-weight-bold py-3">
									{!loading?'Place Order':
									<div style={{margin: '-2.5% auto'}}>
										<BouncingDots size={"sm"} color="#475569" p={"1"} />
									</div>}
								</button>
							</div>
							:
							<BouncingDots size={isMobile?"sm":"sm"} color="#475569" p={isMobile?"10":"6"} />}
						</div>
					</div>
				</form>
			</div>
			{checkoutResp?.reference &&
			<>
				<PaystackCheckout
				checkoutData={updatedCheckoutResp}
				/>
			</>}
		</>
	)
}

function ExtraNote(textArr) {
	if (!textArr||!Array.isArray(textArr)||textArr.length===0) return null;
	return (
		textArr.map((text, textIndex) => {
			return (
			<p key={text} className="mb-1"
			style={{
				fontStyle: 'italic',
				fontSize: '0.75rem',
			}}>
				{text}
			</p>)
		})
	)
}

function EnterInstallmentalAmount({
	currencySym,
	isInstallPlan,
	typedInstallAmount,
	setTypedInstallAmount,
	subTotalAmount,
	finalInstallmentAmount,
	setFinalInstallmentAmount,
	shipToDifferent,
}) {
	const deviceSpec = useDeviceType();
	const isMobile = deviceSpec.width <= 576
	const _30Percent = Math.ceil(parseInt(subTotalAmount)*0.4);
	let finalComputedInstallmentAmount = parseInt(typedInstallAmount||0) + parseInt(_30Percent) + parseInt(shipping);
	if (finalComputedInstallmentAmount > subTotalAmount) {
		setTypedInstallAmount(subTotalAmount - _30Percent)
	}
	useEffect(() => {
		if (isInstallPlan) {
			setFinalInstallmentAmount(finalComputedInstallmentAmount)
		} else {
			setFinalInstallmentAmount(null)
			setTypedInstallAmount(0)
		}
	}, [finalComputedInstallmentAmount, isInstallPlan])
	if (!isInstallPlan) return null;
	return (
		<div className={`p-30 ${isMobile?(shipToDifferent?'pt-6':'pt-0'):''}`}>
			<div className="form-group">
				<label className="mb-0"
				htmlFor="installmentPayment">
					{titleCase("installment amount")}<span>*</span>
				</label>
				{ExtraNote([
					"(First installment must be at least 40% of the total amount).",
					`Note that the total amount includes 15% installmental fee (and shipping fee of ${currencySym}${digitSeparator(shipping)} which is charged on first installment).`,
					])}
				<div className="d-flex align-items-baseline">

					<p style={{whiteSpace: 'pre'}}>
						{digitSeparator(_30Percent)} + {' '}
					</p>

					<input
					id="installmentPayment"
					name="installmentPayment"
					onChange={(e)=> {
						const val = onlyNumbers(e.target.value);
						setTypedInstallAmount(val)
					}}
					value={typedInstallAmount||''}
					style={{borderRadius: '5px'}}
					className={`form-control ${isMobile?'w-40':'w-20'}`}
					type="text"
					autoComplete="on"
					placeholder="0"/>

					<p style={{whiteSpace: 'pre'}}>
						{' + '}{digitSeparator(shipping)}
					</p>

					<p style={{whiteSpace: 'pre'}}>
						{' '} = {digitSeparator(finalComputedInstallmentAmount)}
					</p>
				</div>
			</div>
		</div>
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
