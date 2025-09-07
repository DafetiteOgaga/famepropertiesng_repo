import { GoogleLogin } from "@react-oauth/google";

function GoogleAuthButtonAndSetup() {
	return (
		<GoogleLogin
			onSuccess={(credentialResponse) => {
			console.log("Login Success:", credentialResponse);
			fetch("http://localhost:8000/api/auth/google/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token: credentialResponse.credential }),
			})
				.then((res) => res.json())
				.then((data) => {
				console.log("Backend response:", data);
				});
			}}
			onError={() => {
			console.log("Login Failed");
			}}
		/>
	)
}
export { GoogleAuthButtonAndSetup };
