import { getBaseURL } from "./fetchAPIs";

const baseURL = getBaseURL();
const getTotalUsers = async () => {
	try {
		const response = await fetch(`${baseURL}/users/total-users/`);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = await response.json();
		console.log("Total users fetched:", data.total_users);
		sessionStorage.setItem('fpng-tot', data.total_users);
		return data.total_users;
	} catch (error) {
		console.error("Error fetching total users:", error);
		return null;
	}
}
export { getTotalUsers };
