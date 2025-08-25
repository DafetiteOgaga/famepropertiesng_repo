import { useState, useEffect } from "react";
import { Breadcrumb } from "./sections/breadcrumb"
import { useDeviceType } from "../hooks/deviceType"
import { createLocal } from "../hooks/setupLocalStorage";
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthFetch } from "../hooks/authFetch";
import { GoogleAuthButtonAndSetup } from "../hooks/allAuth/googleAuthButtonAndSetup";
import { titleCase } from "../hooks/changeCase";
import { useAuth } from "../hooks/allAuth/authContext";

const initialFormData = {
	email: '',
	password: '',
}
const inputArr = [
	{
		name: 'email',
		placeholder: 'example@email.com',
	},
	{
		name: 'password',
		placeholder: 'password',
	}
]

function LogIn() {
	const authFetch = useAuthFetch()
	// const { accessToken, updateToken } = useAuth();
	const navigate = useNavigate();
	const [isError, setIsError] = useState(null);
	const [formData, setFormData] = useState(initialFormData);
	const deviceType = useDeviceType().width <= 576;
	const marginX = deviceType ? '-10%' : '-10%';
	const onChangeHandler = (e) => {
		e.preventDefault();
		const { name, value } = e.target
		// console.log({name})
		// console.log({value})
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}
	const onSubmitHandler = async (e) => {
		e.preventDefault();
		// console.log('Submitting form with data:');
		if (formData.email.trim()==="" || formData.password.trim()==="") {
			console.warn('Form is invalid');
			toast.error('Error! Login Failed. Invalid form data');
			return;
		}

		try {
			const response = await authFetch("http://127.0.0.1:8000/api/token/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: {
					email: formData.email.trim(),
					password: formData.password.trim()
				},
			});

			const data = await response;
			// console.log({data})
			if (data === "/login/") {
				console.log("you need to sign in again")
				navigate(data);
				return;
			}
			// console.log("Login Response:", data);

			if (data?.access) {
				// Store tokens
				// createLocal.setItem('fpng-status', formData.email, 1000*60);
				createLocal.setItem('fpng-access', data.access);
				// updateToken(data.access);
				// createLocal.setItem('fpng-refresh', data.refresh);
				// localStorage.setItem("access", data.access);
				// localStorage.setItem("refresh", data.refresh);
				setFormData(initialFormData);
				toast.success('Login Successful!');
				navigate('/')
			} else {
				setIsError(data?.error)
				toast.error(data?.error||'Login Error!');
				return;
			}

			return data;
		} catch (error) {
			console.error("Error during login:", error);
			toast.error('Error! Login Failed. Please try again.');
			return null;
		}
		// console.log('Form submitted:', formData);
		// createLocal.setItem('fpng-status', formData.email, 1000*60);
		// Here you can handle the login logic, e.g., API call
		// Reset form after submission
	}
	useEffect(() => {
		if (isError) {
			const delay = setTimeout(() => {
				setIsError(null)
			}, 3000);
			return ()=>clearTimeout(delay)
		}
	}, [isError])
	return (
		<>
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
								<input
								name={input.name}
								onChange={onChangeHandler}
								value={formData[input.name]}
								className="form-control"
								type={input.name}
								placeholder={input.placeholder}
								style={{borderRadius: '5px'}}
								required/>
							</div>
						)
					})}
					{/* <div className="form-group"
					style={{
						marginLeft: marginX,
						marginRight: marginX,
						}}>
						<label>Email<span>*</span></label>
						<input
						name="email"
						onChange={onChangeHandler}
						value={formData.email}
						className="form-control"
						type="email"
						placeholder="example@email.com"
						style={{borderRadius: '5px'}}
						required/>
					</div>
					<div className="form-group"
					style={{
						marginLeft: marginX,
						marginRight: marginX,
						}}>
						<label>Password<span>*</span></label>
						<input
						name="password"
						onChange={onChangeHandler}
						value={formData.password}
						className="form-control"
						type="password"
						placeholder="password"
						style={{borderRadius: '5px'}}
						required/>
					</div> */}
					<div className="form-group"
					style={{
						marginLeft: marginX,
						marginRight: marginX,
						}}>
						{/* <label>Password</label> */}
						<button
						className="btn btn-block btn-auth font-weight-bold py-3">
							Log In
						</button>
						
					</div>
					<p
					style={{
						color: '#475569',
					}}>Don't have an account?
						<Link
						to="/signup"
						style={{
							paddingLeft: '0.5rem',
							color: '#475569',
						}}>
							Create one
						</Link>
					</p>
					{isError &&
					<p
					style={{
						color: '#BC4B51',
						textAlign: 'center',
						fontWeight: "bold",
						fontStyle: 'italic',
						fontSize: '0.9rem',
					}}>
						{isError}
					</p>}
				</div>
				{/* <GoogleAuthButtonAndSetup /> */}
			</form>
		</>
	)
}
export { LogIn }
