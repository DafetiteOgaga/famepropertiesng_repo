import { useEffect, useState } from "react";
import { useCreateStorage } from "./setupLocalStorage";
import { toast } from "react-toastify";

function useCheckLoginValidity() {
	// console.log('Checking login validity...');
	const { createLocal } = useCreateStorage()
	const [daysRemaining, setDaysRemaining] = useState(null);
	useEffect(() => {
		// console.log('useEffect triggered for login validity check');
		const lastLogin = createLocal.getItem("fpng-ctdw"); // time at login
		if (!lastLogin) return;

		const now = Date.now();
		const diffMs = now - lastLogin;
		const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

		// let daysRemaining

		if (diffMs >= fiveDaysMs) {
			const message = "Session Expired, please login again"
			console.warn(message); // countdown reached 0
			createLocal.removeAllItems();
			toast.info(message);
			setDaysRemaining(message)

		} else {
			const remaining = fiveDaysMs - diffMs;
			const days = Math.ceil(remaining / (1000 * 60 * 60 * 24))
			const message = `${days===1?'A':days} day${days===1?'':'s'} left before session expires and re-login required.`;
			setDaysRemaining(message)
			console.log(message);
		}
	}, []); // runs once when component mounts
	return daysRemaining;
}

export { useCheckLoginValidity };