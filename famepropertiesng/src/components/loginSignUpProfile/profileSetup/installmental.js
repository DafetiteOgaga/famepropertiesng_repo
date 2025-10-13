import { useState, useEffect } from "react";
import { Breadcrumb } from "../../sections/breadcrumb";
// import { useNavigate } from 'react-router-dom';
import { useDeviceType } from "../../../hooks/deviceType";
import { useCreateStorage } from "../../../hooks/setupLocalStorage";
import { BouncingDots } from "../../../spinners/spinner";
import { digitSeparator, titleCase } from "../../../hooks/changeCase";
import { toast } from "react-toastify";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { onlyNumbers, usePSPK } from "../../../hooks/formMethods/formMethods";
import { PaystackCheckout } from "../../checkout/paystackCheckout";
import { Listbox } from "@headlessui/react";
import { useAuthFetch } from "../authFetch";

const tableHeadArr = [
	"Products",
	"Name",
	"Price",
	"Amount",
]

const baseURL = getBaseURL()
const removeHyphens = (str) => {
	if (!str||typeof(str)!=='string') return str
	return str?.replace(/-/g, '')
}

function InstallmentalPayment() {
	usePSPK()
	const authFetch = useAuthFetch();
	// const navigate = useNavigate();
	const { createLocal, createSession } = useCreateStorage()
	const deviceType = useDeviceType().width <= 576;
	const [loadingImages, setLoadingImages] = useState({});
	const userInfo = createLocal.getItem('fpng-user');
	const [isMounting, setIsMounting] = useState(true);
	const [loading, setLoading] = useState(false);
	const [unfulfilledCheckoutIds, setUnfulfilledCheckoutIds] = useState(null);
	const [finalInstallmentAmount, setFinalInstallmentAmount] = useState(0);
	const [typedInstallAmount, setTypedInstallAmount] = useState(0);
	const [isFetchCheckout, setIsFetchCheckout] = useState(false);
	const [selectedCheckoutID, setSelectedCheckoutID] = useState('');
	const [checkoutInfomation, setCheckoutInfomation] = useState(null);
	const [proceedToPay, setProceedToPay] = useState(false);

	// handles image loading state
	const handleImageLoad = (prdId) => {
		setLoadingImages(prev => ({ ...prev, [prdId]: false }));
	};

	const handleImageStart = (prdId) => {
		setLoadingImages(prev => ({ ...prev, [prdId]: true }));
	};

	const currencySym = userInfo?.currencySymbol||'₦'

	// console.log({userInfo})
	useEffect(() => {
		setIsMounting(false);
	}, []);

	useEffect(() => {
		if (userInfo?.id) {
			const fetchCheckoutIDs = async () => {
				setLoading(true);
				try {
					const response = await authFetch(`${baseURL}/get-unfulfilled-and-or-unsettled-checkout-ids/${userInfo?.id}/installments/`);
					const data = await response //.json();
					if (!data) return
					// console.log('Response data from server',data)
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
					const response = await authFetch(`${baseURL}/fetch-chechout-details/${selectedCheckoutID}/`);

					console.log('response ok. waiting for data...')
					const data = await response // .json();
					if (!data) return
					console.log('Response data from server',data)
					setCheckoutInfomation(data);
					// toast.success(
					// 	<div>
					// 		Successful.
					// 	</div>
					// );
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
	// console.log({
	// 	selectedCheckoutID,
	// 	checkoutInfomation,
	// 	unfulfilledCheckoutIds
	// })
	const needToRefetch = checkoutInfomation?.checkoutID && selectedCheckoutID
		? removeHyphens(checkoutInfomation.checkoutID) !== selectedCheckoutID
		: false;
	console.log({checkoutInfomation})
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
										return (
											<th key={index} className="align-middle"
											style={{
												...first?{borderTopLeftRadius: 8,}:
												last&&{borderTopRightRadius: 8,},
											}}>
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
									return (
										<tr key={product?.product_id+productIndex}>

											{/* image */}
											<td className="align-middle"
											style={{
												...deviceType?styles.mobilePadding:{},
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
											style={{
												...deviceType?styles.mobilePadding:{},
												}}>{titleCase(product?.product_name||'')}</td>

											{/* price */}
											<td className="align-middle text-bg-color text-nowrap"
											style={deviceType?styles.mobilePadding:{}}>
												{currencySym} {digitSeparator(parseInt(product?.price))} X {product?.quantity}
											</td>

											{/* total item price */}
											<td className="align-middle text-bg-color text-nowrap"
											style={deviceType?styles.mobilePadding:{}}>
												{currencySym} {digitSeparator((parseInt((product?.price)*(product?.quantity))))}
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
							{(unfulfilledCheckoutIds?.has_unfulfilled_installments) ?
							<div className="border-bottom pb-2">
								<label
								htmlFor={'CheckoutId'}>Select Checkout<span>*</span></label>

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
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
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
								remainingBalance={parseInt(checkoutInfomation?.remaining_balance)||0}
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
									<h6 className="font-weight-medium">Number  of Installments Paid</h6>
									<h6 className="font-weight-medium">{checkoutInfomation?.installments_count||'N/A'}</h6>
								</div>
								<div className="d-flex justify-content-between mb-1">
									<h6>Subtotal</h6>
									<h6>{currencySym} {digitSeparator(parseInt(checkoutInfomation?.subtotal_amount))||'0'}</h6>
								</div>
								<div className="d-flex justify-content-between mb-1">
									<h6 className="font-weight-medium">Total Paid (Incl. shipping)</h6>
									<h6 className="font-weight-medium">{currencySym} {digitSeparator(parseInt(checkoutInfomation?.total_paid))||'0'}</h6>
								</div>
								<div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Remaining Balance</h6>
									<h6 className="font-weight-medium">{currencySym} {digitSeparator(parseInt(checkoutInfomation?.remaining_balance))||'0'}</h6>
								</div>
							</div>
							<div className="pt-2">
								<div className="d-flex justify-content-between mt-2">
									<h5>Total</h5>
									<h5>{currencySym} {digitSeparator(parseInt(checkoutInfomation?.total_amount))||'0'}</h5>
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
	return (
		<>
			<label className="mb-2"
			htmlFor="installmentPayment">
				{titleCase("installment amount")}<span>*</span>
			</label>
			<div className="d-flex align-items-baseline justify-content-center">
				<p className="mb-0"
				style={{whiteSpace: 'pre'}}>
					{digitSeparator(percent)} + {' '}
				</p>
				<input
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
					{' '} = {digitSeparator(finalComputedInstallmentAmount)}
				</p>
			</div>
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
