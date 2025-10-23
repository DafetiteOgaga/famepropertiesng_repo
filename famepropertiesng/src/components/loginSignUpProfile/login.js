import { useState, useEffect } from "react";
import { Breadcrumb } from "../sections/breadcrumb"
import { useDeviceType } from "../../hooks/deviceType"
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthFetch } from "./authFetch";
import { GoogleAuthButtonAndSetup } from "../../hooks/allAuth/googleAuthButtonAndSetup";
import { titleCase } from "../../hooks/changeCase";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { BouncingDots } from "../../spinners/spinner";

const baseURL = getBaseURL();
const initialFormData = {
	email: '',
	password: '',
}
const inputArr = [
	{
		name: 'email',
		placeholder: 'example@email.com',
		autoComplete: "email"
	},
	{
		name: 'password',
		placeholder: 'password',
		autoComplete: "current-password"
	}
]

function LogIn() {
	const [isMounting, setIsMounting] = useState(true);
	const [loading, setLoading] = useState(false);
	const authFetch = useAuthFetch()
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const [isError, setIsError] = useState(null);
	const [formData, setFormData] = useState(initialFormData);
	const deviceType = useDeviceType().width <= 576;
	const marginX = deviceType ? '-10%' : '-10%';
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}
	const isNotRotKey = !localStorage.getItem("fpng-rot")

	// Check if all required fields are filled
	const isFieldsValid = () => {
		const requiredFields = ['email', 'password'];
		return requiredFields.every((field) => formData[field].trim() !== "");
	};

	// handle form submission
	const onSubmitHandler = async (e) => {
		e.preventDefault();
		setLoading(true);
		if (!isFieldsValid()) {
			console.warn('Form is invalid');
			toast.error('Error! Login Failed. Invalid form data');
			return;
		}

		try {
			const response = await authFetch(`api/token/`, {
				method: "POST",
				body: {
					email: formData.email.trim(),
					password: formData.password.trim()
				},
			}, true);

			const data = await response;
			if (data === "/login/") {
				console.log("you need to sign in again")
				navigate(data);
				return;
			}

			if (data?.access) {
				setFormData(initialFormData);
				toast.success('Login Successful!');
				navigate('/#')
				// window.location.replace('/');
			}
			if (!data) return

			return data;
		} catch (error) {
			console.error("Error during login:", error);
			toast.error('Error! Login Failed. Please try again.');
			return null;
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		if (isError) {
			const delay = setTimeout(() => {
				setIsError(null)
			}, 3000);
			return ()=>clearTimeout(delay)
		}
	}, [isError])
	useEffect(() => {
		setIsMounting(false);
	}, []);
	return (
		<>
			{!isMounting ?
			<form onSubmit={onSubmitHandler}
			className=""
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
				<h5 className="text-uppercase mb-0 mt-5">
					<span className=""
					style={{color: '#475569'}}>
						Log In
					</span>
				</h5>
				<div className="pt-3">
					{inputArr.map((input, index) => {
						return (
							<div key={index}
							className="form-group"
							style={{
								marginLeft: marginX,
								marginRight: marginX,
								}}>
								<label>{titleCase(input.name)}<span>*</span></label>
								<div style={{ position: "relative", width: "100%" }}>
									<input
									name={input.name}
									onChange={onChangeHandler}
									value={formData[input.name]}
									className="form-control"
									type={input.name==='password'?(showPassword?'text':input.name):input.name}
									placeholder={input.placeholder}
									style={{borderRadius: '5px'}}
									autoComplete={input.autoComplete}
									required/>
									{input.name === "password" && (
										<span
										className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
										onClick={() => setShowPassword((prev) => !prev)} // toggle state
										style={{
											position: "absolute",
											top: "50%",
											right: "10px",
											transform: "translateY(-50%)",
											cursor: "pointer",
										}}
										/>
									)}
								</div>
							</div>
						)
					})}
					<div className="form-group"
					style={{
						marginLeft: marginX,
						marginRight: marginX,
						}}>
						<button
						className={`btn btn-block btn-auth font-weight-bold ${!loading?'py-3':'pt-3'}`}
						disabled={isNotRotKey||!isFieldsValid()||loading}
						>
							{!loading?'Log In':<BouncingDots size="sm" color="#fff" p="1" />}
						</button>
					</div>
					{<>
						<LinkToSignUp />
						<LinkToForgotPassword />
						{isError && <ShowErrorFromServer isError={isError} />}
					</>}
				</div>
				{/* <GoogleAuthButtonAndSetup /> */}
			</form>
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"14"} />}
		</>
	)
}

function LinkToSignUp() {
	return (
		<>
			<p
			className="mb-1"
			style={{
				color: '#475569',
				textAlign: 'center',
			}}>Don't have an account?
				<Link
				to="/signup"
				style={{
					paddingLeft: '0.5rem',
					color: '#475569',
					fontStyle: 'italic',
					textDecoration: 'underline',
				}}>
					Create one
				</Link>
			</p>
		</>
	)
}
function LinkToForgotPassword() {
	return (
		<>
			<p
			style={{
				color: '#475569',
				textAlign: 'center',
				fontSize: '0.9rem',
				fontStyle: 'italic',
			}}>Forgot Password?
				<Link
				style={{
					paddingLeft: '0.5rem',
					color: '#475569',
					textDecoration: 'underline',
				}}>
					Reset
				</Link>
			</p>
		</>
	)
}
function ShowErrorFromServer({isError}) {
	return (
		<>
			<p
			style={{
				color: '#BC4B51',
				textAlign: 'center',
				fontWeight: "bold",
				fontStyle: 'italic',
				fontSize: '0.9rem',
			}}>
				{isError}
			</p>
		</>
	)
}
export { LogIn }
