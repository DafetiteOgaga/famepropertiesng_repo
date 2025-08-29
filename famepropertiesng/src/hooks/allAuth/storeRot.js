import { useCreateStorage } from "../setupLocalStorage";

function useRotStorage() {
	console.log('useRotStorage called');
	const { createLocal } = useCreateStorage();
	const rNum = createLocal.getItem("fpng-rot");
	const rchars = createLocal.getItem("fpng-rchars");
	const accessToken = createLocal.getItem('fpng-acc');
	const userInfo = createLocal.getItem('fpng-user');
	const refreshToken = createLocal.getItem('fpng-ref');
	console.log('Retrieved rot from storage:', rNum);
	console.log('Retrieved rchars from storage:', rchars);
	console.log({accessToken}, {userInfo})
	console.log({refreshToken})
	const rots = {
		rot: rNum ? parseInt(rNum) : 0,
		rchars: rchars ? rchars : null,
	}
	return rots
}
export { useRotStorage };
