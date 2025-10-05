import { useState, useEffect } from "react";
import { Breadcrumb } from "../../sections/breadcrumb";
import { Link, useNavigate } from 'react-router-dom';
import { useDeviceType } from "../../../hooks/deviceType";
import { useCreateStorage } from "../../../hooks/setupLocalStorage";
import { BouncingDots } from "../../../spinners/spinner";
import { digitSeparator, titleCase } from "../../../hooks/changeCase";
import { useOutletContext } from 'react-router-dom';
import { toast } from "react-toastify";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { useConfirmTotals, onlyNumbers } from "../../../hooks/formMethods/formMethods";
import { PaystackCheckout } from "../../checkout/paystackCheckout";
import { Listbox } from "@headlessui/react";

const tableHeadArr = [
	"Products",
	"Name",
	"Price",
	"Quantity",
	// "X"
]

const baseURL = getBaseURL()
const apiUrl = getBaseURL(true) + '/get-paystack-keys/pk/';
const shipping = 1500
const removeHyphens = (str) => {
	// console.log({str})
	if (!str||typeof(str)!=='string') return str
	return str?.replace(/-/g, '')
}

function InstallmentalPayment() {
	const navigate = useNavigate();
	const { handleAddToCart } = useOutletContext();
	const { createLocal, createSession } = useCreateStorage()
	const deviceType = useDeviceType().width <= 576;
	// const [isImageLoading, setIsImageLoading] = useState({});
	const [loadingImages, setLoadingImages] = useState({});
	const userInfo = createLocal.getItem('fpng-user');
	const [inputValue, setInputValue] = useState([]);
	const [totalAmount, setTotalAmount] = useState(0);
	const [reload, setReload] = useState(false);
	const [isMounting, setIsMounting] = useState(true);
	const [loading, setLoading] = useState(false);
	const [unfulfilledCheckoutIds, setUnfulfilledCheckoutIds] = useState(null);
	const [finalInstallmentAmount, setFinalInstallmentAmount] = useState(0);
	const [typedInstallAmount, setTypedInstallAmount] = useState(0);
	const [isFetchCheckout, setIsFetchCheckout] = useState(false);
	const [selectedCheckoutID, setSelectedCheckoutID] = useState('');
	const [checkoutInfomation, setCheckoutInfomation] = useState(null);
	const [proceedToPay, setProceedToPay] = useState(false);

	// console.log({cartInStorage})
	useEffect(() => {
		const cartInStorage = createLocal.getItemRaw('fpng-cart')||[]
		// console.log({cartInStorage})
		setInputValue(cartInStorage);
	}, [reload]);

	const handleInputChange = (e, cart, index) => {
		e.preventDefault();
		let value = e.target.value;

		// only allow digits
		if (!/^\d*$/.test(value)) return;

		// handle empty string (let user clear before typing a new number)
		if (value === "") {
			setInputValue(prev => {
				const updated = [...prev];
				updated[index] = { ...updated[index], nop: "" };
				createLocal.setItemRaw("fpng-cart", updated);
				return updated;
			});
			return;
		}

		// parse number and auto-correct 0 → 1
		let newValue = Math.max(1, parseInt(value, 10));

		// update state and localStorage with typed value
		setInputValue(prev => {
			const updated = [...prev];
			updated[index] = { ...updated[index], nop: newValue };
			createLocal.setItemRaw("fpng-cart", updated);
			return updated;
		});
	};

	// on input blur, if empty reset to 1
	const handleInputBlur = (cart, index) => {
		setInputValue(prev => {
			const updated = [...prev];
			let currentValue = updated[index].nop;

			// console.log({cart, index, currentValue})
			// if user left it empty, reset to 1
			if (currentValue === "" || currentValue === undefined) {
				updated[index] = { ...updated[index], nop: 1 };
				// createLocal.setItemRaw("fpng-cart", updated);
			}
			if (parseInt(currentValue) > parseInt(cart?.totalAvailable)) {
				// toast.error(`Only ${cart?.totalAvailable} ${titleCase(cart?.name)} available in stock right now.`);
				// console.log('exceeding available stock')
				// reset to total available if exceeding available stock
				updated[index] = { ...updated[index], nop: cart?.totalAvailable };
				// createLocal.setItemRaw("fpng-cart", updated);
				// runToast = true
			}
			createLocal.setItemRaw("fpng-cart", updated);
			return updated;
		});
		if (parseInt(inputValue?.[index]?.nop) > parseInt(cart?.totalAvailable)) {
			toast.error(`Only ${cart?.totalAvailable} ${titleCase(cart?.name)} available in stock right now.`);
		}
	};

	// handles image loading state
	const handleImageLoad = (prdId) => {
		setLoadingImages(prev => ({ ...prev, [prdId]: false }));
	};

	const handleImageStart = (prdId) => {
		setLoadingImages(prev => ({ ...prev, [prdId]: true }));
	};

	const handleStateFuncOnClicks = (prev, index, mode) => {
		let computedCurrVal
		const updated = [...prev];
		if (mode === 'x') {
			// remove item from cart
			updated.splice(index, 1);
		} else {
			const currentValue = updated[index].nop || 1;
			if (mode === '+') {
				computedCurrVal = currentValue + 1;
			} else if (mode === '-') {
				computedCurrVal = currentValue - 1;
			}
			const newValue = Math.max(1, computedCurrVal);
			updated[index] = { ...updated[index], nop: newValue };
		}
		// createLocal.setItemRaw("fpng-cart", updated);
		return updated;
	}
	const currencySym = userInfo?.currencySymbol||'₦'

	// calculate total amount whenever inputValue changes
	useEffect(() => {
		const total = inputValue.reduce((sum, item) => {
			const price = parseFloat(item.price) || 0;
			const quantity = parseInt(item.nop) || 1;
			return sum + price * quantity;
		}, 0);
		setTotalAmount(total);
	}, [inputValue]);

	// console.log({inputValue});
	console.log({userInfo})
	// console.log({totalAmount})
	useEffect(() => {
		// flip loading off immediately after mount
		setIsMounting(false);
	}, []);
	const isInputReady = inputValue?.length
	// console.log({currentTotalsAvailable})
	const updatedTotalsAllGood = useConfirmTotals(inputValue)
	console.log({updatedTotalsAllGood})

	const isPK = createSession.getItem('fpng-pspk')
	useEffect(() => {
		if (!isPK) {
			const fetchPK = async () => {
				try {
					const response = await fetch(apiUrl);
					if (!response.ok) {
						// Handle non-2xx HTTP responses
						const errorData = await response.json();
						console.warn('Error:', errorData);
						toast.error(errorData?.error || errorData?.message || 'Error!');
						return;
					}
					const data = await response.json();
					// console.log('Response data from server',data)
					createSession.setItem('fpng-pspk', data?.pk);
					return data;
				} catch (error) {
					console.error("catch error:", error);
					toast.error('catch error! Failed. Please try again.');
					return null;
				} finally {}
			}
			fetchPK()
		}
	}, [])


	useEffect(() => {
		if (userInfo?.id) {
			const fetchCheckoutIDs = async () => {
				setLoading(true);
				try {
					const response = await fetch(`${baseURL}/get-unfulfilled-checkout-ids/${userInfo?.id}/`);
		
					if (!response.ok) {
						// Handle non-2xx HTTP responses
						const errorData = await response.json();
						console.warn('Error:', errorData);
						toast.error(errorData?.error || errorData?.message || 'Error!');
						setLoading(false);
						return;
					}
					const data = await response.json();
					console.log('Response data from server',data)
					setUnfulfilledCheckoutIds(data);
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

	useEffect(() => {
		if (isFetchCheckout&&(selectedCheckoutID!==''||!selectedCheckoutID)) {
			console.log('fetching checkout details for:', selectedCheckoutID)
			const fetchCheckoutDetails = async () => {
				console.log('using fetchCheckoutDetails to fetch details for:', selectedCheckoutID)
				setLoading(true);
				try {
					console.log('fetching...')
					const response = await fetch(`${baseURL}/installment-payment/${selectedCheckoutID}/`,
						// {
						// 	method: "POST",
						// 	headers: { "Content-Type": "application/json" },
						// 	body: JSON.stringify(cleanedData),
						// }
					);
		
					if (!response.ok) {
						console.log('response not ok')
						// Handle non-2xx HTTP responses
						const errorData = await response.json();
						// setIsError(errorData?.error||errorData?.message)
						// setLoading(false);
						console.warn('Error:', errorData);
						toast.error(errorData?.error || errorData?.message || 'Error!');
						setIsFetchCheckout(false);
						setLoading(false);
						return;
					}
					console.log('response ok. waiting for data...')
					const data = await response.json();
					console.log('Response data from server',data)
					setCheckoutInfomation(data);
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
					setIsFetchCheckout(false);
					setLoading(false);
					return data;
				} catch (error) {
					console.log('error caught')
					console.error("catch error:", error);
					toast.error('Ecatch eror! Failed. Please try again.');
					return null;
				} finally {
					console.log('finally block')
					setLoading(false);
					setIsFetchCheckout(false);
				}
			}
			fetchCheckoutDetails()
		}
	}, [isFetchCheckout])
	const checkoutProducts = checkoutInfomation?.products||[]
	const paymentData = {...checkoutInfomation?.new_payment_details, amount: finalInstallmentAmount}
	console.log({paymentData})
	console.log({
		selectedCheckoutID,
		checkoutInfomation,
		unfulfilledCheckoutIds
	})
	const needToRefetch = checkoutInfomation?.checkoutID && selectedCheckoutID
		? removeHyphens(checkoutInfomation.checkoutID) !== selectedCheckoutID
		: false;
	console.log({
		// fetchedIsUndefined,
		// selectedIsEmpty,
		// fetchedID,
		// selectedID,
		// areEqual,
		needToRefetch
	})
	return (
		<>
			<Breadcrumb page={'Shopping Cart'} />

			{/* <!-- Cart Start --> */}
			{!isMounting ?
			<div className="container-fluid mt-3"style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}>
				<h6 className="px-xl-5 mb-1" style={{color: '#475569'}}>
					{(checkoutInfomation?.checkoutID)?
					(<>
						<span className="text-uppercase">Details for - </span>{removeHyphens(checkoutInfomation?.checkoutID)}
					</>)
					:
					<span className="text-uppercase">No detail selected yet</span>}
				</h6>
				<div className="row px-xl-5">
					<div className="col-lg-8 table-responsive mb-5">
						<table className={`table ${checkoutInfomation?'table-light':''} table-borderless table-hover text-center mb-0`}>
							<thead className="thead-dark">
								<tr>
									{tableHeadArr.map((head, index) => {
										const first = index === 0;
										const last = index === tableHeadArr.length - 1;
										// const headKey = head.toLowerCase()
										return (
											<th key={index} className="align-middle"
											style={{
												...first?{borderTopLeftRadius: 8,}:
												last&&{borderTopRightRadius: 8,},
												// ...deviceType?(
												// 	styles.mobilePadding,
												// 	styles.mobileFontSize):
												// 	{
												// 		width: headKey==='products'?'5%':
												// 				headKey==='name'?'20%':
												// 				headKey==='price'?'5%':
												// 				headKey==='quantity'?'25%':
												// 				headKey==='x'?'10%':'',}
															}}
											>
													{head}
											</th>
										)
									})}
								</tr>
							</thead>
							{(checkoutInfomation&&!loading)?
							<tbody className="align-middle">
								{checkoutProducts.map((product, productIndex) => {
									const isLoading = loadingImages[product?.product_id]
									// console.log({cart})
									// const productMiniDetails = {
									// 	id: inputValue?.[index]?.prdId,
									// 	name: inputValue?.[index]?.name,
									// }
									return (
										<tr key={product?.product_id+productIndex}>

											{/* image */}
											<td className="align-middle"
											// onClick={() => navigate(`/detail/${cart?.prdId}`)}
											style={{
												...deviceType?styles.mobilePadding:{},
												// cursor: 'pointer',
												}}>
												{isLoading && (
													<BouncingDots size="ts" color="#475569" p="1" />)}
													<img
													key={product?.product_id}
													src={product?.product_thumbnail}
													alt={product?.product_name}
													className={`cart-image-img ${isLoading ? 'd-none' : ''}`}
													onLoad={() => handleImageLoad(product?.product_id)}
													onError={() => handleImageLoad(product?.product_id)} // stop loader on error too
													onLoadStart={() => handleImageStart(product?.product_id)}
												/>
											</td>

											{/* product name */}
											<td className="align-middle text-wrap" // text-left"
											// onClick={() => navigate(`/detail/${cart?.prdId}`)}
											style={{
												...deviceType?styles.mobilePadding:{},
												// cursor: 'pointer',
												}}>{titleCase(product?.product_name||'')}</td>

											{/* price */}
											<td className="align-middle text-bg-color text-nowrap"
											style={deviceType?styles.mobilePadding:{}}>
												{currencySym} {digitSeparator(product?.price?.split('.')[0])}
											</td>

											{/* number of product items */}
											<td className="align-middle text-bg-color text-nowrap"
											style={deviceType?styles.mobilePadding:{}}>
												{product?.quantity}
											</td>
										</tr>
									)
								})}
							</tbody>
							:
							<tbody>
								<tr>
									<td colSpan="5" className="text-center font-italic">
										{(!checkoutInfomation&&!loading)?
										'Pick a checkout ID to continue payment.'
										:
										<BouncingDots size={"vm"} color="#475569" p={"0"} />}
									</td>
								</tr>
							</tbody>}
						</table>
					</div>
					<div className="col-lg-4">


						{/* pending checkouts */}
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Checkout
							</span>
						</h5>
						<div className="bg-light p-30 mb-3"
						style={{borderRadius: '10px'}}>
							{(unfulfilledCheckoutIds?.unfulfilled_checkout_ids) ?
							<div className="border-bottom pb-2">
								{/* <div className="col-md-6 form-group px-0 mb-0"> */}
								<label
								htmlFor={'CheckoutId'}>Select Checkout<span>*</span></label>
								{/* <select
								className="custom-select"
								id={'CheckoutId'}
								name="CheckoutId"
								onChange={(e)=>setSelectedCheckoutID(e.target.value)}
								style={{borderRadius: '5px'}}
								value={selectedCheckoutID}
								required={true}
								>
									<option value={selectedCheckoutID}>{selectedCheckoutID===''?'Select an ID':selectedCheckoutID}</option>
									{unfulfilledCheckoutIds?.unfulfilled_checkout_ids?.map((checkoutID, chkoutIdx) => {
										return (
											<option
											key={checkoutID}
											// style={{fontSize: 15,}}
											value={removeHyphens(checkoutID)}>{removeHyphens(checkoutID)}</option>
										)
									})}
								</select> */}
								<div style={{ position: "relative", width: "100%" }}>
									<Listbox value={selectedCheckoutID} onChange={setSelectedCheckoutID}>
										<Listbox.Button
										style={{
											width: "100%",
											padding: "10px 12px",
											borderRadius: "6px",
											border: "1px solid #495057",
											backgroundColor: "#fff",
											textAlign: "left",
											cursor: "pointer",
										}}
										>
											{selectedCheckoutID || "Select a Checkout ID"}
										</Listbox.Button>

										<Listbox.Options
										style={{
											position: "absolute",
											marginTop: "4px",
											width: "100%",
											backgroundColor: "#fff",
											border: "1px solid #ddd",
											borderRadius: "6px",
											boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
											maxHeight: "200px",
											overflowY: "auto",
											overflowX: "hidden",
											zIndex: 10,
										}}
										>
											{unfulfilledCheckoutIds?.unfulfilled_checkout_ids?.map((id) => (
												<Listbox.Option
												key={id}
												value={removeHyphens(id).trim()}
												style={{
													padding: "10px 12px",
													cursor: "pointer",
													fontSize: deviceType?16.5:15,
												}}
												>
													{removeHyphens(id)}
												</Listbox.Option>
											))}
										</Listbox.Options>
									</Listbox>
								</div>
							</div>
							:
							<BouncingDots size={"sm"} color="#475569" p={"2"} />}
							<div className="pt-2">
								<button
								className={`btn btn-block font-weight-bold py-3 ${needToRefetch?'zoomAnimation1Btn':'btn-primary'}`}
								onClick={() => setIsFetchCheckout(true)}
								disabled={(selectedCheckoutID===''||!selectedCheckoutID)}
								>
									{needToRefetch?'Fetch New Checkout':'Get Details'}
								</button>
							</div>
						</div>

						{/* installment amount */}
						<div className={`installment-pay ${checkoutInfomation?'show':''}`}>
							<h5 className="section-title position-relative text-uppercase mb-3">
								<span className="bg-secondary pr-3"
								style={{color: '#475569'}}>
									Enter Amount
								</span>
							</h5>
							<div className="bg-light p-30 mb-3"
							style={{borderRadius: '10px'}}>
								{<EnterInstallmentalAmount
								installmentsCount={checkoutInfomation?.installments_count}
								typedInstallAmount={typedInstallAmount}
								remainingBalance={checkoutInfomation?.remaining_balance?.split('.')[0]||0}
								setTypedInstallAmount={setTypedInstallAmount}
								finalInstallmentAmount={finalInstallmentAmount}
								setFinalInstallmentAmount={setFinalInstallmentAmount}
								/>}
							</div>
						</div>

						{/* cart summary */}
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Checkout Summary
							</span>
						</h5>
						<div className="bg-light p-30 mb-5"
						style={{borderRadius: '10px'}}>
							<div className="border-bottom pb-2">
							<div className="d-flex justify-content-between mb-1">
									<h6 className="font-weight-medium">Number  of Installment Paid</h6>
									<h6 className="font-weight-medium">{checkoutInfomation?.installments_count||'N/A'}</h6>
								</div>
								<div className="d-flex justify-content-between mb-1">
									<h6>Subtotal</h6>
									<h6>{currencySym} {digitSeparator(checkoutInfomation?.subtotal_amount?.split('.')[0])||'0'}</h6>
								</div>
								<div className="d-flex justify-content-between mb-1">
									<h6 className="font-weight-medium">Total Paid (Incl. shipping)</h6>
									<h6 className="font-weight-medium">{currencySym} {digitSeparator(checkoutInfomation?.total_paid?.split('.')[0])||'0'}</h6>
								</div>
								<div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Remaining Balance</h6>
									<h6 className="font-weight-medium">{currencySym} {digitSeparator(checkoutInfomation?.remaining_balance?.split('.')[0])||'0'}</h6>
								</div>
								{/* <div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Shipping (Paid)</h6>
									<h6 className="font-weight-medium">{currencySym} {digitSeparator(shipping)}</h6>
								</div> */}
							</div>
							<div className="pt-2">
								<div className="d-flex justify-content-between mt-2">
									<h5>Total</h5>
									<h5>{currencySym} {digitSeparator(checkoutInfomation?.total_amount?.split('.')[0])||'0'}</h5>
								</div>
								<button
								className="btn btn-block btn-primary font-weight-bold my-3 py-3"
								onClick={() => setProceedToPay(true)}
								disabled={!finalInstallmentAmount}
								>
									Proceed To Pay
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"14"} />}

			{proceedToPay &&
			<>
				<PaystackCheckout
				checkoutData={paymentData}
				// installAmount={finalInstallmentAmount?parseInt(finalInstallmentAmount)+shipping:null}
				/>
			</>}
		</>
	)
}

function EnterInstallmentalAmount({
	installmentsCount,
	typedInstallAmount,
	setTypedInstallAmount,
	remainingBalance,
	finalInstallmentAmount,
	setFinalInstallmentAmount,
}) {
	const totalNumberOfInstallmentsAvailable = 3 // cycle of installments allowed
	const deviceSpec = useDeviceType();
	const isMobile = deviceSpec.width <= 576
	const percent = Math.ceil(parseInt(remainingBalance)/(totalNumberOfInstallmentsAvailable - (installmentsCount||0)));
	let finalComputedInstallmentAmount = parseInt(typedInstallAmount||0) + parseInt(percent);
	if (finalComputedInstallmentAmount > remainingBalance) {
		setTypedInstallAmount(remainingBalance - percent)
	}
	useEffect(() => {
		setFinalInstallmentAmount(finalComputedInstallmentAmount)
	}, [finalComputedInstallmentAmount])
	// console.log({
	// 	remainingBalance,
	// 	percent,
	// 	typedInstallAmount,
	// 	finalComputedInstallmentAmount,
	// 	finalInstallmentAmount,
	// 	totalNumberOfInstallmentsAvailable,
	// 	installmentsCount
	// })
	// if (!isInstallPlan) return null;
	return (
		<>
			{/* <div className=""> */}
				<label className="mb-2"
				htmlFor="installmentPayment">
					{titleCase("installment amount")}<span>*</span>
				</label>
				{/* {[
					"(First installment must be at least 40% of the total amount).",
					"Note that the total amount includes 15% installmental fee and shipping fee is charged on first installment.",
					].map((text, textIndex) => {
						return (
						<p className="mb-1"
						style={{
							fontStyle: 'italic',
							fontSize: '0.75rem',
						}}>
							{text}
						</p>)
					}
				)} */}
				<div className="d-flex align-items-baseline">
					<p className="mb-0"
					style={{whiteSpace: 'pre'}}>
						{percent} + {' '}
					</p>
					<input
					// ref={input.type==='email'?emailRef:null}
					id="installmentPayment"
					name="installmentPayment"
					onChange={(e)=> {
						console.log('changing')
						const val = onlyNumbers(e.target.value);
						console.log({val})
						setTypedInstallAmount(val)
					}}
					value={typedInstallAmount||''}
					style={{borderRadius: '5px'}}
					className={`form-control ${isMobile?'w-40':'w-100'}`}
					type="text"
					autoComplete="on"
					disabled={(totalNumberOfInstallmentsAvailable-1)===(installmentsCount||0)}
					placeholder="0"/>
					<p className="mb-0"
					style={{whiteSpace: 'pre'}}>
						{' '} = {finalComputedInstallmentAmount}
					</p>
				</div>
			{/* </div> */}
		</>
	)
}

const styles = {
	mobilePadding: {
		padding: '0.8rem 0.2rem'
	},
	mobileFontSize: {
		fontSize: '14px',
		padding: '10px 4px', // increase tap area
	},
	mobileQtyWidth: {
		display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
	},
	pCQtyWidth: {
		width: '50%',
	}
}
export { InstallmentalPayment };
