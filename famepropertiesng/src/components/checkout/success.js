import { useState, useEffect } from "react";
import { Breadcrumb } from "../sections/breadcrumb";
// import { titleCase } from "../../hooks/changeCase";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useDeviceType } from "../../hooks/deviceType";
// import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { useNavigate, useOutletContext } from "react-router-dom";

function Success() {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576;
	const { handleClearCart } = useOutletContext();
	const navigate = useNavigate();
	// const { createLocal } = useCreateStorage();
	const { width, height } = useWindowSize();
	useEffect(() => {
		handleClearCart()

		const delay = setTimeout(() => {
			navigate('/');
			// window.location.replace('/');
		}, 6000);
		return () => clearTimeout(delay);
	}, [])

	return (
		<>
			{/* Breadcrumb Start */}
			<Breadcrumb page={'Welcome'} />

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
		</>
	)
}
export { Success }
