import { toast } from "react-toastify";
import { getBaseURL } from "../../hooks/fetchAPIs";

const baseURL = getBaseURL();
const authenticator = async () => {
	try {
		const response = await fetch(`${baseURL}/imagekit-auth/`);
		if (!response.ok) {
			const errorText = "Failed to authenticate with ImageKit"
			toast.error(errorText);
			throw new Error(errorText);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		throw new Error(`Authentication failed: ${error.message}`);
	}
};
export { authenticator };
