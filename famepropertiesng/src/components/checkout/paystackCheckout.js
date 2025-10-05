import { useState, useEffect } from "react";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { BouncingDots } from "../../spinners/spinner";
import { useNavigate } from "react-router-dom";
import { useCreateStorage } from "../../hooks/setupLocalStorage";


const baseURL = getBaseURL();

const PaystackCheckout = ({ checkoutData }) => {
	const { createSession } = useCreateStorage();
	const navigate = useNavigate();
	console.log({ checkoutData });
	// const [loading, setLoading] = useState(false);
	const [showOverlay, setShowOverlay] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState("pending"); // new state
  	const [details, setDetails] = useState(null); // product + thumbnail
	useEffect(() => {
		if (checkoutData?.reference) {
			handlePay()
		}
	}, [checkoutData?.reference])
	console.log("PaystackCheckout component rendered with props\n:", { checkoutData, amount: checkoutData?.amount });
	if (!checkoutData?.reference) return null;

	// return null

	const isPK = createSession.getItem('fpng-pspk')
	const pollPaymentStatus = (reference) => {
		const interval = setInterval(async () => {
			try {
				const res = await fetch(`${baseURL}/checkout-status/${reference}/`);
				if (!res.ok) throw new Error("Network response was not ok");
		
				const data = await res.json();
				console.log("Polled payment status:", data);
		
				setPaymentStatus(data.status);
				setDetails(data.productDetails);
		
				if (data.status === "completed" || data.status === "failed") {
					const completed = data.status === "completed";
					clearInterval(interval); // stop polling when resolved
					// setLoading(false);
					setShowOverlay(false);
					navigate(completed?"success" : "/cart");
				}
			} catch (error) {
				console.error("Error polling payment status:", error);
			}
		}, 3000); // poll every 3s
	};

	const handlePay = async () => {
		console.log("Initiating payment in handlePay fxn...");
		if (!checkoutData?.reference) {
			alert("Reference not ready yet!");
			return;
		}
		const handler = window.PaystackPop.setup({
			key: isPK, // use your test public key
			email: checkoutData?.email,
			amount: parseInt(checkoutData?.amount) * 100, // amount in kobo (₦500 = 50000)
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
				console.log("Payment callback:", response);
				// setLoading(true);
				// ✅ instead of verify-payment, start polling backend
				pollPaymentStatus(response.reference);
			},
			// callback: function (response) {
			// 	(async () => {
			// 		try {
			// 			setLoading(true); // show loading state
			
			// 			// send reference to your Django backend for verification
			// 			const res = await fetch(`${baseURL}/verify-payment/`, {
			// 				method: "POST",
			// 				headers: { "Content-Type": "application/json" },
			// 				body: JSON.stringify({ reference: response.reference }),
			// 			});
			
			// 			if (!res.ok) {
			// 				throw new Error(`Server responded with status ${res.status}`);
			// 			}
			
			// 			const data = await res.json();
			// 			console.log("Verification response:", data);
			
			// 			if (data.success) {
			// 				console.log("Payment verified successfully");
			// 				// ✅ success toast/redirect can go here
			// 			} else {
			// 				console.warn("Payment verification failed", data);
			// 				// ❌ failure toast/message here
			// 			}
			// 		} catch (error) {
			// 			console.error("Error verifying payment:", error.message);
			// 		} finally {
			// 			setLoading(false); // always reset
			// 			setShowOverlay(false); // hide overlay when done
			// 		}
			// 	})();
			// },
			onClose: function() {
				alert("Transaction was not completed, window closed.");
				setShowOverlay(false); // hide overlay if user closes
			},
		});
		console.log("Opening Paystack iframe...");
		// setShowOverlay(true); // show overlay when opening iframe
		handler.openIframe();
		// Observe DOM changes to detect Paystack iframe
		const observer = new MutationObserver(() => {
			const iframe = document.querySelector("iframe[src*='paystack']");
			if (iframe) {
			setShowOverlay(true);  // show overlay only when iframe is there
			observer.disconnect(); // stop watching
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	};
	console.log({
		// loading,
		showOverlay,
		paymentStatus,
		details,
	})
	return (
		<>
			{/* {reference && <div/>} */}
			{showOverlay && (
				<div
				// id="custom-overlay"
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
						<span className="mb-2 font-italic">Please, wait</span>
						<BouncingDots size={"ts"} color="#fff" p={"1"} />
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
