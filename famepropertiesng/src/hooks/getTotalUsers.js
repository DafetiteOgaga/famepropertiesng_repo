import { getBaseURL } from "./fetchAPIs";
import { useAuthFetch } from "../components/loginSignUpProfile/authFetch";

const baseURL = getBaseURL();
const useGetTotalUsers = () => {
	const authFetch = useAuthFetch();
	const getTotalUsers = async () => {
		try {
			const response = await authFetch(`users/total-users/`);
			// if (!response.ok) {
			// 	throw new Error("Network response was not ok");
			// }
			if (!response) return
			const data = await response // .json();
			console.log("Total users fetched:", data.total_users);
			sessionStorage.setItem('fpng-tot', data.total_users);
			return data.total_users;
		} catch (error) {
			console.error("Error fetching total users:", error);
			return null;
		}
	}
	return getTotalUsers
}
export { useGetTotalUsers };
