import { useState, useEffect } from "react";
import { Breadcrumb } from "../sections/breadcrumb";
// import { titleCase } from "../../hooks/changeCase";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useDeviceType } from "../../hooks/deviceType";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { useNavigate, useOutletContext } from "react-router-dom";

function Success() {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576;
	const { handleClearCart } = useOutletContext();
	const navigate = useNavigate();
	const { createLocal } = useCreateStorage();
	const { width, height } = useWindowSize();
	useEffect(() => {
		handleClearCart()
		// const updateUser = createLocal.getItem('fpng-chot');
		// console.log('updateUser-fpng-chot:', updateUser);
		// const userInfo = createLocal.getItem('fpng-user');
		// if (updateUser?.addToUser&&userInfo) {
		// 	console.log('updating user info with unfulfilled installments...');
		// 	if (updateUser?.addToUser) {
		// 		console.log('Adding to user info...');
		// 		const updatedUser = {
		// 			...userInfo,
		// 			has_unfulfilled_installments: true,
		// 			unfulfilled_checkout_ids: [
		// 				...(userInfo.unfulfilled_checkout_ids||[]),
		// 				updateUser.reference
		// 			]
		// 		};
		// 		console.log('done updating user info:', updatedUser);
		// 		createLocal.setItem('fpng-user', updatedUser);
		// 		console.log('done saving user info in localStorage');
		// 		createLocal.removeItem('fpng-chot'); // clear temp checkout data
		// 		console.log('done removing fpng-chot from localStorage');
		// 	}
		// }
		const delay = setTimeout(() => {
			navigate('/');
		}, 6000);
		return () => clearTimeout(delay);
	}, [])
	// const [showConfetti, setShowConfetti] = useState(true);

	// useEffect(() => {
	// 	// Stop the confetti after 4 seconds
	// 	const timer = setTimeout(() => setShowConfetti(false), 4000);
	// 	return () => clearTimeout(timer);
	// }, []);
	return (
		<>
			{/* Breadcrumb Start */}
			<Breadcrumb page={'Welcome'} />

			{/* <div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<h2
				style={{color: '#475569',}}>{titleCase('successful!')}</h2>
			</div> */}
			{/* <div className="container-fluid d-flex justify-content-center align-items-center flex-column"
				style={{ minHeight: "60vh" }}>
				<h2 style={{ color: "#475569" }}>🎉 { "Successful!" }</h2>

				{showExplosion && (
					<div className="emoji-explosion">
						{["💥", "🎊", "🎉", "✨", "💫"].map((emoji, i) => {
							return (
								<span key={i}
								// style={{
								// 	"--x": Math.random(),
								// 	"--y": Math.random(),
								// 	left: "0px",
								// 	top: "0px",
								// }}
								className="emoji">
									{emoji}
								</span>
							)})}
					</div>
				)}
			</div> */}
			<Confetti
			width={width}
			height={height}
			numberOfPieces={400}
			gravity={0.2}
			// recycle={false}
			/>
			<div className={`container-fluid d-flex ${isMobile?'justify-content-center':'justify-content-center'} align-items-center flex-column`}
			style={{
				minHeight: "60vh",
			}}>
				<h2 style={{
					color: "#475569",
					marginBottom: isMobile?"70%":"15%",
				}}>🎉 Successful! 🎊</h2>
			</div>
			{/* <div
				className="container-fluid d-flex justify-content-center align-items-center flex-column"
				style={{ minHeight: "60vh" }}
			>
				{showConfetti && (
					<Confetti
						width={width}
						height={height}
						numberOfPieces={300}
						gravity={0.2}
						recycle={false} // ❗ prevents looping forever
					/>
				)}

				<h2 style={{ color: "#475569" }}>🎉 Successful!</h2>
			</div> */}
		</>
	)
}
export { Success }
