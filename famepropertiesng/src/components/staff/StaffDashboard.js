import React, { useEffect, useState, useRef, Fragment } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import { onMessage } from "firebase/messaging";
import { messaging, useRequestForFCMToken } from "../firebaseSetup/firebase-config";
import { Breadcrumb } from "../sections/breadcrumb";
import { useDeviceType } from "../../hooks/deviceType";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { BouncingDots } from "../../spinners/spinner";
import { digitSeparator, sentenceCase, titleCase } from "../../hooks/changeCase";
import { toast } from "react-toastify";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { onlyNumbers, usePSPK } from "../../hooks/formMethods/formMethods";
import { Listbox } from "@headlessui/react";
import { HeadlessSelectBtn, ToggleButton } from "../../hooks/buttons";
import { useAuthFetch } from "../loginSignUpProfile/authFetch";
import { useAllNotifications, getNotificationsFromIndexedDB,
	markNotificationsAsSeen,} from "../firebaseSetup/indexDBMethods";
import { useAuth } from "../../hooks/allAuth/authContext";

const tableHeadArr_details = [
	"Checkout",
]
const tableHeadArr_summary = [
	"S/N",
	"ID",
	"Name",
	"Amount",
	"Status",
]

function isArrayIndexString(value) {
	return (
		/^[0-9]+$/.test(value.trim())
	);
}

const faIcon = (status) => {
	console.log('===', {status});
	const fa = 'fa';
	switch (status?.toLowerCase()) {
		case 'processing':
			return `${fa} fa-circle processing-color`;
		case 'shipped':
			return `${fa} fa-truck shipped-color`;
		case 'delivered':
			return `${fa} fa-check delivered-color`;
		default:
			return `${fa} fa-question-circle cancelled-color`;
	}
};

function convertToAmount(amount) {
	// console.log('convertToAmount check for:', amount)
	if (amount.toLowerCase().includes('remaining_balance')||
		amount.toLowerCase().includes('subtotal_amount')||
		amount.toLowerCase().includes('total_amount')||
		amount.toLowerCase().includes('amount_paid')||
		amount.toLowerCase().includes('price')||
		amount.toLowerCase().includes('shipping_fee')) {
		return true
	}
	return false
}

function StaffDashboard() {
	const fetchSearchRef = useRef(false);
	const { state } = useLocation()
	const nId = state?.nId
	usePSPK()
	const authFetch = useAuthFetch();
	const navigate = useNavigate();
	const { createLocal, createSession } = useCreateStorage()
	const deviceType = useDeviceType().width <= 576;
	const [loadingNotification, setLoadingNotification] = useState(true);
	const userInfo = createLocal.getItem('fpng-user');
	const [isMounting, setIsMounting] = useState(true);
	const [loading, setLoading] = useState(false);
	// const [typedInstallAmount, setTypedInstallAmount] = useState(0);
	const [isFetchCheckout, setIsFetchCheckout] = useState(false);
	const [selectedCheckoutID, setSelectedCheckoutID] = useState('');
	const [dataFromCheckoutID, setDataFromCheckoutID] = useState(null);
	const [dataToRender, setDataToRender] = useState(null);
	const [isSummary, setIsSummary] = useState(false);
	const { freshNotifications, setFreshNotifications, setIsSeen } = useAuth();
	const [searchText, setSearchText] = useState('');
	const [searchResponse, setSearchResponse] = useState(null);
	const [selectedSearchResult, setSelectedSearchResult] = useState(null);
	const [isOperationInProgress, setIsOperationInProgress] = useState(false);
	const [updateData, setUpdateData] = useState(null);
	const [updateFromServer, setUpdateFromServer] = useState(null);
	// const notifications = useAllNotifications().notifications

	const currencySym = userInfo?.currencySymbol||'₦'

	const [notifications, setNotifications] = useState([]);
	useEffect(() => {
		console.log('load notification effect')
		if (notifications||freshNotifications) {
			console.log('k'.repeat(50)+'\n', 'Setting loadingNotification to', !loadingNotification)
			getNotificationsFromIndexedDB().then(setNotifications);
			setLoadingNotification(false)
			setFreshNotifications(false);
		}
	}, [loadingNotification, freshNotifications, isSummary]);

	const fetchOnClickOrMount = (cID) => {
		if (!cID) return
		console.log('fetchOnClickOrMount notification')
		console.log('cID:', cID)
		setSelectedCheckoutID(cID)
		setIsFetchCheckout(true)
		setIsSummary(true)
		setSelectedSearchResult(null)
	}
	useEffect(() => {
		console.log('nId on load:', nId)
		if (nId) {
			console.log('initial load notification effect')
			fetchOnClickOrMount(nId)
			// remove nId state without reloading
			navigate(".", { replace: true, state: null });
		}
	}, [])
	useEffect(()=> {
		if (notifications.length > 0) {
			const markAsSeen = async () => {
				const idArr = notifications.map(n => n.id);
				try {
					const success = await markNotificationsAsSeen(idArr, 'staff dashboard');
					if (success) {
						setIsSeen(true);
					}
				} catch (error) {
					console.error("Error marking notifications as seen:", error);
					toast.error("Failed to mark notifications as seen.");
				}
			}
			markAsSeen();
		}
	}, [notifications])

	useEffect(() => {
		setIsMounting(false);
	}, []);

	useEffect(() => {
		if (isFetchCheckout) {
			if ((searchText===''||!searchText)&&
				(selectedCheckoutID===''||!selectedCheckoutID)) {
					return;
				}
			let url
			let argument
			if (!fetchSearchRef.current) {
				url = `checkout/${selectedCheckoutID}/`
				argument = selectedCheckoutID
			} else {
				url = `search/${userInfo?.id}/${searchText}/`
				argument = searchText
			}
			console.log('fetching search result for:', argument)
			const fetchDataFromServer = async () => {
				setDataFromCheckoutID(null);
				setSearchResponse(null);
				console.log('using fetchDataFromServer to fetch details for:', searchText)
				setLoading(true);
				try {
					console.log('fetching...')
					const response = await authFetch(url);

					console.log('response ok. waiting for data...')
					const data = await response // .json();
					if (!data) return
					console.log('Response data from server',data)
					console.log({fetchSearchRef: fetchSearchRef.current})
					if (!fetchSearchRef.current) {
						console.log('setting data from checkout ID')
						setDataFromCheckoutID(data);
						setIsSummary(true);
						setSelectedSearchResult(null);
						setDataToRender(data)
					} else {
						console.log('setting search response')
						setSearchResponse(data);
						// setIsSummary(false);
					}
					setIsFetchCheckout(false);
					
					setSelectedCheckoutID('')
					setSearchText('')
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
					setSearchText('')
					setSelectedCheckoutID('')
					fetchSearchRef.current = false;
				}
			}
			fetchDataFromServer()
		}
	}, [isFetchCheckout])

	useEffect(() => {
		console.log('isOperationInProgress changed:', isOperationInProgress)
		if (!isOperationInProgress) {return}
		console.log('isOperationInProgress effect triggered')
		const updateCheckout = async () => {
			console.log('isOperationInProgress changed to true, refetching data...')
			console.log('sending updateData:', updateData)
			setLoading(true);
			try {
				console.log('updating...')
				// or use dataFromCheckoutID instead of dataToRender
				const response = await authFetch(`update-checkout/${userInfo?.id}/${dataToRender?.checkoutID}/`, {
					method: "POST",
					body: updateData,
				});

				console.log('response ok. waiting for data...')
				const update = await response // .json();
				if (!update) return
				console.log('Response data from server',update)
				setUpdateFromServer(update);
				setDataToRender(update);

				return update;
			} catch (error) {
				console.log('error caught')
				console.error("catch error:", error);
				toast.error('Ecatch eror! Failed. Please try again.');
				return null;
			} finally {
				setIsOperationInProgress(false);
				setLoading(false);
			}
		}
		updateCheckout()
	}, [isOperationInProgress])

	useEffect(() => {
		if (selectedSearchResult) {
			console.log('selectedSearchResult changed:', selectedSearchResult)
			setDataToRender(selectedSearchResult)
			setIsSummary(true);
			setDataFromCheckoutID(null)
		}
	}, [selectedSearchResult])

	const titleOrHead = dataToRender?.checkoutID||
						dataToRender?.store_name||
						dataToRender?.reference||
						dataToRender?.name||
						dataToRender?.email;

	console.log({
		loadingNotification,
		freshNotifications,
		nId, notifications,
		selectedCheckoutID,
		dataFromCheckoutID,
		searchResponse,
		isSummary,
		selectedSearchResult,
		dataToRender, titleOrHead,
		isOperationInProgress,
		updateData,
		updateFromServer
	})
	// console.log({searchText})
	return (
		<>
			<Breadcrumb page={`Dashboard (Welcome ${titleCase((parseInt(userInfo?.first_name)>12)?(userInfo?.first_name?.slice(0, 9)+'...'):(userInfo?.first_name))})`} />

			


			{!isMounting ?
			<div className="container-fluid mt-2"style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}>
				<div className="row px-xl-5">
					<div className="col-lg-8 mb-5">
						<div className="d-flex justify-content-start align-items-center mb-2">
							<div className="mr-2">
							{/* Toggle Switch */}
							<ToggleButton
							checked={isSummary}
							onChange={(e) => setIsSummary(e.target.checked)}/>
							</div>
							<span
							style={{color: '#475569'}}>
								{isSummary?'Details':'Summary'}
							</span>
						</div>
					
						<div className={`flip-container ${isSummary ? "flipped" : ""}`}>
							<div className="flipper"
							// style={{minHeight: '100%'}}
							>
								<div style={{
									position: 'unset',
									overflow: 'hidden'
								}}
								className={`front ${isSummary?'d-none':''}`}>
									<table className={`table table-light table-borderless table-hover text-center mb-0`}>
										<thead className="thead-dark">
											<tr>
												{tableHeadArr_summary.map((head, index) => {
													if (deviceType && head.toLowerCase() === 'amount') {
														return null; // Skip rendering this header on mobile
													}
													const first = index === 0;
													const last = index === tableHeadArr_summary.length - 1;
													const headKey = head.toLowerCase()
													return (
														<th key={index} className={`align-middle`}
														style={{
															...first?{borderTopLeftRadius: 8,}:
															last&&{borderTopRightRadius: 8,},
															...deviceType?(
																styles.mobilePadding,
																styles.mobileFontSize,
																{width: headKey==='id'||
																		headKey==='status'
																			?'5%':''}):
																{
																	width: headKey==='id' ? 0 : ''
																	// 		headKey==='name'?'20%':
																	// 		headKey==='price'?'5%':
																	// 		headKey==='quantity'?'25%':
																	// 		headKey==='x'?'10%':'',
																}
															}}
																			>
																{head}
														</th>
													)
												})}
											</tr>
										</thead>
										{notifications?.length?
										<tbody className="align-middle">
											{notifications.map((notification, nIdx) => {
												return (
													<tr key={notification?.id}
													onClick={() => fetchOnClickOrMount(notification?.id)}
													style={{
														// ...deviceType?styles.mobilePadding:{},
														cursor: 'pointer',
														}}
													>
														{/* serial number */}
														<td className="align-middle text-wrap" // text-left"
														>{nIdx+1}.</td>

														{/* id */}
														<td className="align-middle text-wrap" // text-left"
														>...{notification?.id?.slice(22)}</td>

														{/* customer name */}
														<td className="align-middle text-wrap" // text-left"
														>{titleCase(JSON.parse(notification?.user)?.first_name)}</td>

														{/* amount */}
														<td className={`${deviceType?'d-none':''} align-middle text-bg-color text-nowrap`}
														// style={deviceType?styles.mobilePadding:{}}
														>
															{currencySym} {digitSeparator(parseInt(JSON.parse(notification?.amount)?.total))}
														</td>

														{/* status */}
														<td className="align-middle text-wrap" // text-left"
														>
																<span className={`${deviceType?'d-none':'mr-2'}`}>
																	{titleCase(notification?.shipping_status)}
																</span>
															<span
															className={`${faIcon(notification?.shipping_status)}`}
															title={notification?.shipping_status}
															/>
															</td>
													</tr>
												)
											})}
										</tbody>
										:
										<tbody>
											<tr>
												<td colSpan="5" className="text-center font-italic">
													{(notifications?.length===0)?
													'No new notification'
													:
													<BouncingDots size={"vm"} color="#475569" p={"0"} />}
												</td>
											</tr>
										</tbody>}
									</table>
								</div>

								<div style={{
									position: 'unset',
									overflow: 'hidden'
								}}
								className={`back ${!isSummary?'d-none':''}`}>
									<table className={`table ${dataToRender?'table-light':''} table-borderless table-hover text-center mb-0`}>
										<thead className="thead-dark">
											<tr>
												{tableHeadArr_details.map((head, index) => {
													let first = index === 0;
													let last = index === tableHeadArr_details.length - 1;
													const lengthOfArr = tableHeadArr_details.length === 1;
													return (
														<th key={index} className="align-middle"
														style={{
															...(lengthOfArr?
																{borderTopLeftRadius: 8, borderTopRightRadius: 8,}:
																	first?{borderTopLeftRadius: 8,}:
																	last&&{borderTopRightRadius: 8,}
															),
															...{
																// position: 'relative',
																// // width: '78%',
																// width: '10%',
																// // width: '100%',
																// // display: 'inline-flex',
																// // justifyContent: 'center',
															}
														}}>
															{head}{(titleOrHead)?` - ${titleCase(titleOrHead)}`:''}
														</th>
													)
												})}
											</tr>
										</thead>
										{
										(dataToRender&&!loading)
										// false
										?
										<tbody className="align-middle">
											{/* {['dataToRender'].map((item, itemIdx) => {
												// const isLoading = loadingNotification[product?.product_id]
												return ( */}
													<tr>

														{/* product name */}
														<td className={`d-flex ${deviceType?'flex-column':'flex-row'} align-middle text-bg-color text-wrap justify-content-between`}
														// className="text-left"
														// className="align-middle text-wrap" // text-left"
														style={{...(deviceType?styles.mobilePadding:{})}}>
															<div className="text-left"
															style={{whiteSpace: 'pre-wrap',}}>
																{/* {JSON.stringify(dataToRender, null, 4)} */}
																{Object.entries(dataToRender||{}).map(([key, value], kIdx) => {
																	let pStatus = 0
																	if (dataToRender?.checkoutID && key?.toLowerCase()==='payment_status') {
																		if (value?.toLowerCase() === 'completed') {
																			pStatus = 1
																		} else {
																			pStatus = -1
																		}
																	}
																	return (
																		<div key={key+kIdx}
																		className="py-1">
																			<strong>{titleCase(key)}: </strong>
																			<span style={{
																				wordBreak: 'break-word',
																				fontStyle: 'italic',
																				backgroundColor: pStatus===1?'#475569':'',
																				color: pStatus===1?'#fff':'',
																				borderRadius: (pStatus===1||pStatus===-1)?'4px':'',
																				border: pStatus===-1?'1px solid #475569':'',
																				padding: (pStatus===1||pStatus===-1)?'3px 6px':'',
																				}}>
																				{(value === null||
																					value === undefined||
																					(Array.isArray(value) && !value.length)|| value==='') ?
																						'N/A' // if null
																						// : (dataToRender?.checkoutID && key?.toLowerCase()==='payment_status')?
																						// value+'kkk'
																						: (typeof(value) === 'number' && value === 0) ?
																						'0' // if zero number
																						: (typeof(value) === 'object' && Array.isArray(value)) ?
																						recursivelyExpandAndRenderObjects(value) // if array
																						: (typeof(value) === 'object') ?
																						recursivelyExpandAndRenderObjects(value) // if object
																						: typeof(value) === 'boolean' ?
																						value ? 'True' : 'False'  // if boolean
																						: convertToAmount(key) ?
																						digitSeparator(value) // if number
																						: typeof(value) === 'string'&&value.includes('@') ?
																						value // if email
																						:
																						sentenceCase(String(value)) // if primitive
																				} {key.toLowerCase() === 'shipping_status' && typeof value === 'string' && (
																					<span className={faIcon(value)} />
																				)}
																			</span>
																			<br />
																		</div>
																	)
																})}
															</div>
															{dataToRender?.checkoutID &&
																<OperationButtons
																info={{
																	paymentStatus: dataToRender?.payment_status,
																	paymentMethod: dataToRender?.payment_method,
																	shippingStatus: dataToRender?.shipping_status,
																}}
																setIsOperationInProgress={setIsOperationInProgress}
																setUpdateData={setUpdateData}
																device={deviceType}/>}
															
														</td>
													</tr>
												{/* )
											})} */}
										</tbody>
										:
										<tbody>
											<tr>
												<td colSpan="5" className="text-center font-italic">
													{(!dataToRender&&!loading)?
													'Nothing to display.'
													:
													<BouncingDots size={"vm"} color="#475569" p={deviceType?"0":"13"} />}
												</td>
											</tr>
										</tbody>}
									</table>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-4">


						{/* pending checkouts */}
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Search
							</span>
						</h5>

						<div className="bg-light p-30 mb-3"
						style={{borderRadius: '10px'}}>
							{/* {(unfulfilledCheckoutIds?.has_unfulfilled_installments) ? */}
							<div className="border-bottom pb-2">
								<label
								htmlFor={'searchTxt'}>Enter Query<span>*</span></label>

								<input
								id="searchTxt"
								name="searchTxt"
								onChange={(e)=> {
									console.log('changing');
									setSearchText(e.target.value);
									fetchSearchRef.current = true;
								}}
								value={searchText||''}
								style={{borderRadius: '5px'}}
								className={`form-control`} // ${deviceType?'w-40':'w-100'}`}
								type="text"
								autoComplete="on"
								// disabled={(totalNumberOfInstallmentsAvailable-1)===(installmentsCount||0)}
								placeholder="Enter search parameter"/>
              

							</div>
							{/* :
							<BouncingDots size={"sm"} color="#475569" p={"2"} />} */}
							<div className="pt-2">
								<button
								// className={`btn btn-block font-weight-bold py-3 ${needToRefetch?'zoomAnimation1Btn':'btn-primary'}`}
								className={`btn btn-block font-weight-bold py-3 btn-primary`}
								onClick={() => setIsFetchCheckout(true)}
								disabled={(searchText===''||!searchText)}
								>
									{/* {needToRefetch?'Fetch New Checkout':'Get Details'} */}
									Get Details
								</button>
							</div>
						</div>

						{
						// true&&
						// searchResponse?.results&&
						<div className={`installment-pay ${searchResponse?.results?'show':''}`}>
							<h5 className="section-title position-relative text-uppercase mb-3">
								<span className="bg-secondary pr-3"
								style={{color: '#475569'}}>Search Results
								</span>
							</h5>
							<div className="bg-light p-30 mb-3"
							style={{borderRadius: '10px'}}>
								{/* {(unfulfilledCheckoutIds?.has_unfulfilled_installments) ? */}
								<div className="border-bottom pb-2">

									{Object.entries(searchResponse?.results||{}).map(([resultKey, resultValue], rIdx) => {
										return (
											<div key={resultKey+rIdx} className="d-flex flex-row align-items-baseline">
												<ExpandableAndCollapsibleSearchResults
												data={resultValue}
												label={titleCase(resultKey)}
												setSelected={setSelectedSearchResult} />
											</div>
										)
									})}

								</div>
							</div>
						</div>}

					</div>
				</div>
			</div>
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"18"} />}
		</>
	)
}

function OperationButtons ({info, device, setIsOperationInProgress, setUpdateData}) {
	console.log({info})
	const paymentMethod = info.paymentMethod.toLowerCase();
	const paymentStatus = info.paymentStatus.toLowerCase();
	const shippingStatus = info.shippingStatus.toLowerCase();

  	// Keep track of which buttons to show
	let showShipped = false;
	let showDelivered = false;
	let showCancel = true;

  	// CASE 1: Pay on delivery
	if (paymentMethod === "pay_on_delivery") {
		if (shippingStatus === "processing") {
			showShipped = true;
		} else if (shippingStatus === "shipped") {
			showDelivered = true;
		}
	}

	// CASE 2: Pay now
	else if (paymentMethod === "pay_now") {
		if (shippingStatus === "processing") {
			showShipped = true;
		} else if (shippingStatus === "shipped" && paymentStatus === "completed") {
			showDelivered = true;
		}
	}

	// CASE 3: Installmental payment
	else if (paymentMethod === "installmental_payment") {
		if (paymentStatus === "completed") {
			if (shippingStatus === "processing") {
				showShipped = true;
			} else if (shippingStatus === "shipped") {
				showDelivered = true;
			}
		}
	}

	// once delivered, hide everything
	if (shippingStatus === "delivered") {
		showShipped = false;
		showDelivered = false;
		showCancel = false;
	}
	return (
		<div style={device?{gap: '15px'}:{}}
		className={`d-flex ${device?'flex-row justify-content-center':'flex-column align-items-end'}`}>
			{/* delivered */}
			{
			showDelivered&&
			<button
			style={{textWrap: 'nowrap'}}
			type="button"
			className="btn btn-sm btn-secondary d-block mt-2"
			onClick={() => {
				setIsOperationInProgress(true);
				setUpdateData({
					shipping_status: 'delivered'
				})
			}}
			>
				Delivered
			</button>}

			{/* shipped */}
			{
			showShipped&&
			<button
			style={{textWrap: 'nowrap'}}
			type="button"
			className="btn btn-sm btn-secondary d-block mt-2"
			onClick={() => {
				setIsOperationInProgress(true);
				setUpdateData({
					shipping_status: 'shipped'
				})
			}}
			>
				Shipped
			</button>}

			{/* cancel order */}
			{
			showCancel&&
			<button
			style={{textWrap: 'nowrap'}}
			type="button"
			className="btn btn-sm btn-danger d-block mt-2"
			// onClick={() => {
			// 	setIsOperationInProgress(true);
			// 	setUpdateData({
			// 		shipping_status: 'cancelled'
			// 	})
			// }}
			>
				Cancel Order
			</button>}
		</div>
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

function ExpandableAndCollapsibleSearchResults({ data, label = null, level = 0, maxLevel = 2, setSelected=null }) {
	const [isExpanded, setIsExpanded] = useState(false); // all collapsed by default
  
	if (data === null || data === undefined) return null;

	const stopRecursion = level >= maxLevel

	if (stopRecursion) {return null}
  
	// Handle primitive values (string, number, boolean)
	// if (typeof data !== "object") {
	//   return (
	// 	<div style={{ marginLeft: level * 14 }}>
	// 	  {label && <strong>{label}: </strong>}
	// 	  <span style={{ color: "#ccc" }}>{String(data)}</span>
	// 	</div>
	//   );
	// }
  
	// Handle arrays
	if (Array.isArray(data)) {
		console.log({dataHasNoVal: data?.length, label, data})
		if (!data?.length) {return null} // skip empty arrays
		return (
			<div style={{ marginLeft: level * 14 }}>
			{label && (
				<div className="py-1"
				onClick={() => setIsExpanded(!isExpanded)}
				style={{
					cursor: "pointer",
					userSelect: "none",
				}}
				>
					<span
						className="fa fa-angle-right mr-1"
						style={{
							transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
							transition: "0.2s",
						}}
					/>
					<span>{label}</span>{" "}
					<small style={{ color: "#aaa" }}>({data.length})</small>
				</div>
			)}
	
			{isExpanded && data.length > 0 && (
				<div style={{ marginLeft: 16 }}>
				{data.map((item, idx) => {
					console.log('z'.repeat(20))
					
					// console.log({item: item?.name})
					const label = item?.store_name||
								item?.checkoutID||
								item?.reference||
								item?.name||
								item?.email
					console.log({level, label})
					return (
						<ExpandableAndCollapsibleSearchResults
						key={idx}
						data={item}
						label={label}
						// label={`#${idx + 1}zzzz`}
						level={level + 1}
						// level={1}
						setSelected={setSelected}
						/>
				)})}
				</div>
			)}
			</div>
		);
	}

	// Handle objects
	return (
		<div style={{ marginLeft: level * 14 }}>
			{label && (
				<div className="py-1"
					onClick={() => {
						console.log('clicked label:', label)
						console.log({data})
						if (!stopRecursion) {
							console.log('stopping recursion, setting selected')
							setSelected(data)
						} else {
							setIsExpanded(!isExpanded)
						}
					}}
					style={{ cursor: "pointer", userSelect: "none" }}
				>
					{stopRecursion ?
					<span
					className="fa fa-angle-right mr-1"
					style={{
						transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
						transition: "0.2s",
					}}
					/>
					:
					<span
					className="mr-1">⦁</span>}
					{console.log('c'.repeat(29), {label})}
					<span>
						{(label.includes('@'))?label:titleCase(label)}
					</span>
				</div>
			)}
	
			{isExpanded && (
				<div style={{ marginLeft: 16 }}>
					{Object.entries(data).map(([key, value]) => (
					<ExpandableAndCollapsibleSearchResults
						key={key}
						data={value}
						label={key}
						level={level + 1}
						setSelected={setSelected}
					/>
					))}
				</div>
			)}
		</div>
	);
}

function recursivelyExpandAndRenderObjects(obj) {
	return Object.entries(obj).map(([key, value]) => {
		if (typeof value === 'object' && value !== null) {
			return (
				<div key={key} style={{ marginLeft: 20, wordBreak: 'break-word' }}>
					<strong>{titleCase(key)}:</strong>
					{recursivelyExpandAndRenderObjects(value)}
				</div>
			);
		} else {
			return (
				<div key={key} style={{ marginLeft: 20 }}
				className="py-1">
					<strong>{titleCase(key)}:</strong> {(value === null||
														value === undefined||
														(Array.isArray(value) && !value.length)||
														value==='') ?
															'N/A' // if null
															: isArrayIndexString(key) ? value // if number key
															: convertToAmount(key) ? digitSeparator(value) // if number
															:sentenceCase(String(value)) // if primitive
														}
				</div>
			);
		}
	});
}

export { StaffDashboard };
