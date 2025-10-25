import { useState, useEffect } from "react";
import { Breadcrumb } from "../sections/breadcrumb";
import { useNavigate } from 'react-router-dom';
import { useDeviceType } from "../../hooks/deviceType";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { BouncingDots } from "../../spinners/spinner";
import { digitSeparator, titleCase } from "../../hooks/changeCase";
import { toast } from "react-toastify";
import { useAllNotifications, markNotificationsAsSeen,
	getNotificationsFromIndexedDB, } from "../firebaseSetup/indexDBMethods";
import { useAuth } from "../../hooks/allAuth/authContext";

const tableHeadArr = [
	"ID",
	"Name",
	"Amount",
	"Status",
]

function Notifications() {
	const navigate = useNavigate();
	const { createLocal } = useCreateStorage()
	const deviceType = useDeviceType().width <= 576;
	const userInfo = createLocal.getItem('fpng-user');
	const [isMounting, setIsMounting] = useState(true);
	const { setIsSeen } = useAuth();
	const [notifications, setNotifications] = useState([]);

	console.log("Rendering Notifications component");

	useEffect(() => {
		console.log('load notification effect')
		// if (notifications||freshNotifications) {
			console.log('t'.repeat(50)+'\n')
			getNotificationsFromIndexedDB('unseen').then(setNotifications);
			// setLoadingNotification(false)
			// setFreshNotifications(false);
		// }
	}, []);

	// const notifications = useAllNotifications({seen: 'unseen', comp: 'notification'}).notifications
	useEffect(()=> {
		console.log("Notifications changed:", notifications);
		if (notifications.length > 0) {
			console.log("Marking notifications as seen...");
			const markAsSeen = async () => {
				console.log("Inside markAsSeen function");
				const idArr = notifications.map(n => n.id);
				console.log("Notification IDs to mark as seen:", idArr);
				try {
					console.log("IDs to mark as seen:", idArr);
					const success = await markNotificationsAsSeen(idArr, 'notifications');
					if (success) {
						console.log("Notifications marked as seen successfully");
						setIsSeen(true);
					}
					console.log("maybe markAsSeen completed");
				} catch (error) {
					console.log("Error in markAsSeen:", error);
					console.error("Error marking notifications as seen:", error);
					toast.error("Failed to mark notifications as seen.");
				}
			}
			markAsSeen();
		}
	}, [notifications])
	
	// const [notifications, setNotifications] = useState([]);
	// useEffect(() => {
	// 	getNotificationsFromIndexedDB().then(setNotifications);
	// }, []);

	const currencySym = userInfo?.currencySymbol||'₦'

	useEffect(() => {
		console.log("Notifications component mounted");
		setIsMounting(false);
	}, []);

	console.log({
		notifications,
		title: notifications?.[0]?.title,
		body: notifications?.[0]?.body,
		id: notifications?.[0]?.id,
		pending: notifications?.[0]?.pending,
		shipping_status: notifications?.[0]?.shipping_status,
	})
	
	return (
		<>
			<Breadcrumb page={'Notifications'} />

			{!isMounting ?
			<div className="container-fluid mt-3"
			style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}>
				<div className="row px-xl-5 d-flex justify-content-center">
					<div className="col-lg-8 table-responsive mb-5">
						<table className={`table table-light table-borderless table-hover text-center mb-0`}>
							<thead className="thead-dark">
								<tr>
									{tableHeadArr.map((head, index) => {
										if (deviceType && head.toLowerCase() === 'amount') {
											return null; // Skip rendering this header on mobile
										}
										const first = index === 0;
										const last = index === tableHeadArr.length - 1;
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
														// width: headKey==='products'?'5%':
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
									// const isLoading = loadingImages[cart?.prdId]
									// const productMiniDetails = {
									// 	id: inputValue?.[index]?.prdId,
									// 	name: inputValue?.[index]?.name,
									// }
									return (
										<tr key={notification?.id}
										onClick={() => {
											navigate(`/staff-dashboard/${userInfo?.id}`, {
												state: { nId: notification?.id }
											});
										}}
										style={{
											// ...deviceType?styles.mobilePadding:{},
											cursor: 'pointer',
											}}
										>
											{/* id */}
											<td className="align-middle text-wrap" // text-left"
											// onClick={() => navigate(`/detail/${cart?.prdId}`)}
											// style={{
											// 	...deviceType?styles.mobilePadding:{},
											// 	cursor: 'pointer',
											// 	}}
												>...{notification?.id?.slice(22)}</td>

											{/* customer name */}
											<td className="align-middle text-wrap" // text-left"
											// onClick={() => navigate(`/detail/${cart?.prdId}`)}
											// style={{
											// 	...deviceType?styles.mobilePadding:{},
											// 	cursor: 'pointer',
											// 	}}
												>{titleCase(JSON.parse(notification?.user)?.first_name)}</td>

											{/* info */}
											{/* <td className="align-middle text-wrap" // text-left"
											// onClick={() => navigate(`/detail/${cart?.prdId}`)}
											// style={{
											// 	...deviceType?styles.mobilePadding:{},
											// 	cursor: 'pointer',
											// 	}}
												>{titleCase(notification?.title)}</td> */}

											{/* amount */}
											<td className={`${deviceType?'d-none':''} align-middle text-bg-color text-nowrap`}
											// style={deviceType?styles.mobilePadding:{}}
											>
												{currencySym} {digitSeparator(parseInt(JSON.parse(notification?.amount)?.total))}
											</td>

											{/* status */}
											<td className="align-middle text-wrap" // text-left"
											// onClick={() => navigate(`/detail/${cart?.prdId}`)}
											// style={{
											// 	...deviceType?styles.mobilePadding:{},
											// 	cursor: 'pointer',
											// 	}}
												>
													<span className={`${deviceType?'d-none':'mr-2'}`}>
														{titleCase(notification?.shipping_status)}
													</span>
												<span
												className={`fa ${
													notification?.shipping_status?.toLowerCase() === 'processing' ? 'fa-circle text-muted' :
													notification?.shipping_status?.toLowerCase() === 'shipped' ? 'fa-truck text-muted' :
													'fa-check text-success'
												}`}
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
					{/* <div className="col-lg-4">
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Cart Summary
							</span>
						</h5>
						<div className="bg-light p-30 mb-5"
						style={{borderRadius: '10px'}}>
							<div className="border-bottom pb-2">
								<div className="d-flex justify-content-between mb-3">
									<h6>Subtotal</h6>
									<h6>{currencySym} {totalAmount?digitSeparator(totalAmount):'0'}</h6>
								</div>
								<div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Shipping</h6>
									<h6 className="font-weight-medium">{currencySym} {totalAmount?digitSeparator(shipping):'0'}</h6>
								</div>
							</div>
							<div className="pt-2">
								<div className="d-flex justify-content-between mt-2">
									<h5>Total</h5>
									<h5>{currencySym} {totalAmount?digitSeparator(parseInt(totalAmount)+parseInt(shipping)):'0'}</h5>
								</div>
								<button
								className="btn btn-block btn-primary font-weight-bold my-3 py-3"
								onClick={() => navigate('checkout')}
								disabled={inputValue.length===0}
								>
									Proceed To Checkout
								</button>
							</div>
						</div>
					</div> */}
				</div>
			</div>
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"14"} />}
		</>
	)
}

const styles = {
	mobilePadding: {
		padding: '0.8rem 0.2rem',
		textWrap: 'wrap',
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
export { Notifications };
