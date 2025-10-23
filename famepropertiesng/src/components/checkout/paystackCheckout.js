import { useState, useEffect, useRef } from "react";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { BouncingDots } from "../../spinners/spinner";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthFetch } from "../loginSignUpProfile/authFetch";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { toast } from 'react-toastify';

const baseURL = getBaseURL();

const PaystackCheckout = ({ checkoutData }) => {
	// console.log('entry:', {checkoutData})
	const timerRef = useRef(null);
	const currPage = useLocation().pathname
	// console.log({currPage})
	const referenceRef = useRef(false); // to ensure reference generation runs only once
	const authFetch = useAuthFetch();
	const { createSession } = useCreateStorage();
	const navigate = useNavigate();
	const [seconds, setSeconds] = useState(0);
	const [minutes, setMinutes] = useState(0);
	const [showOverlay, setShowOverlay] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState("pending"); // new state
  	const [details, setDetails] = useState(null); // product + thumbnail
	useEffect(() => {
		if (checkoutData?.reference) {
			handlePay()
		}
	}, [])
	// console.log({ref_sent: checkoutData?.reference})
	if (!checkoutData?.reference) return null;

	const isPK = createSession.getItem('fpng-pspk')
	// console.log({isPK})
	const pollPaymentStatus = (reference) => {
		const interval = setInterval(async () => {
			try {
				const res = await authFetch(`verify-payment/${reference}/`);

				const data = await res // .json();
				if (!data) return
				// console.log("Polled payment status:", data);

				setPaymentStatus(data?.status);
				setDetails(data?.productDetails);

				if (data.status === "completed" || data.status === "failed") {
					const completed = data.status === "completed";
					clearInterval(interval); // stop polling when resolved
					stopTimer(); // stop the timer
					setShowOverlay(false);
					if (!data.status) {
						toast.error("Transaction failed.");
					}
					navigate(completed?"success" : "/cart");
				}
			} catch (error) {
				console.error("Error polling payment status:", error);
			}
		}, 3000); // poll every 3s
	};
	const startTimer = () => {
		// console.log("Starting 15-minute timer...");
		let sec = 0
		let min = 0
		timerRef.current = setInterval(() => {
			sec++;
			setSeconds(sec);
			if (sec === 60) {
				min++;
				setMinutes(min);
				sec = 0;
				setSeconds(0);
				console.log("One minute passed...");
			}
			if (min === 5) {
				console.log("2 minutes passed, stopping timer and closing overlay...");
				stopTimer();
				// alert("Oopsy! something went wrong. Please try again.");
				setShowOverlay(false);
			
				// consider removing the navigation
				if (currPage.includes('cart/checkout')) {
					console.log('navigating to cart from checkout page...')
					navigate("/cart");
				}
			}
		}, 1000);
		// return () => clearInterval(timer);
	}

	// Stop timer manually if needed
	const stopTimer = () => {
		console.log("Stopping timer manually...");
		console.log('stp'.repeat(40))
		clearInterval(timerRef.current);
	};

	const handlePay = async () => {
		// console.log("Initiating payment in handlePay fxn...");
		// console.log('initial refrence:', checkoutData?.reference)
		if (referenceRef.current) return; // prevent multiple calls
		referenceRef.current = true; // set to true to prevent re-entry
		if (checkoutData?.reference === "installmental_payment") {
			// console.log("installmental_payment reference detected...");
			// console.log("Generating new unique reference from backend...");
			try {
				const newRef = await authFetch(`generate-reference/`);

				if (!newRef) return
				// console.log("new reference:", newRef);

				checkoutData.reference = newRef?.reference;
				referenceRef.current = false; // ensure this block runs only once
			} catch (error) {
				console.error("Error polling payment status:", error);
			}
		}
		// console.log("Using reference:", checkoutData?.reference);
		if (!checkoutData?.reference && checkoutData?.reference!=="installmental_payment") {
			toast.info("Reference not ready yet!");
			return;
		}
		// return; // temp disable
		const handler = window.PaystackPop.setup({
			key: isPK, // use your test public key
			email: checkoutData?.email,
			amount: parseInt(checkoutData?.amount) * 100, // amount in kobo (N500 = 50000)
			currency: "NGN",
			ref: checkoutData?.reference, // unique transaction reference from backend
			metadata: {
				checkoutHexID: checkoutData?.checkout_reference,
				// custom_fields: [
				// 	{
				// 		display_name: "Checkout ID",
				// 		variable_name: "checkout_id",
				// 		value: checkoutData?.checkoutID, // send your custom ID
				// 	},
				// 	{
				// 		display_name: "User ID",
				// 		variable_name: "user_id",
				// 		value: checkoutData?.user_id, // if applicable
				// 	},
				// ],
				// extra_info: {
				// 	// optional — for arbitrary extra data
				// 	type: "installment",
				// 	initiated_from: "ReactApp",
				// },
			},
			callback: function (response) {
				// console.log("Payment complete (callback):", response);

				// instead of verify-payment, start polling backend
				pollPaymentStatus(response.reference);
			},
			onClose: function() {
				toast.error("Transaction was not completed, window closed.");
				setShowOverlay(false); // hide overlay if user closes
			},
		});
		// console.log("Opening Paystack iframe with ref:", checkoutData.reference, "...");
		setShowOverlay(true); // show your overlay now
		startTimer(); // start 15-min countdown
		handler.openIframe();
	};
	// console.log({
	// 	showOverlay,
	// 	paymentStatus,
	// 	details,
	// })
	return (
		<>
			{showOverlay && (
				<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					backgroundColor: "rgba(0, 0, 0, 0.6)", // translucent black
					zIndex: 9998, // one less than Paystack iframe
				}}
				>
					<div
					className="d-flex justify-content-center align-items-center text-white"
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)"
					}}
					>
						<div className="d-flex flex-column justify-content-center align-items-center">
							<div className="d-flex flex-row justify-content-center align-items-center">
								<span className="mb-2 font-italic">Please, wait <span
								style={{fontSize: '12px'}}>
									({seconds}s)</span>
								</span>
								<BouncingDots size={"ts"} color="#fff" p={"1"} />
							</div>
							{minutes>=1 && <span
											className="mb-2 font-italic"
											style={{textAlign: 'center'}}>
												Make sure third-part cookie is enabled in your browser setting
											</span>}
						</div>
					</div>
				</div>
			)}

			{/* show payment status after polling */}
			{/* {paymentStatus !== "pending" && (
				<div className="mt-3 text-center">
				<h4>Payment Status: {paymentStatus}</h4>
				{details?.map((product, prodIdx) => {
					return (
						<div key={product.productName+prodIdx}>
							<p>Product: {product.productName}</p>
							<img
							src={product.thumbnail}
							alt={product.productName}
							width={100}
							style={{ borderRadius: "8px", marginTop: "8px" }}
							/>
						</div>
					)
				})}
				</div>
			)} */}
		</>
	);
};

export { PaystackCheckout };
