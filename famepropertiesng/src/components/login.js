import { useState } from "react";
import { Breadcrumb } from "./sections/breadcrumb"
import { useDeviceType } from "../hooks/deviceType"
import { createSession } from "../hooks/setupLocalStorage";
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const initialFormData = {
	email: '',
	password: '',
}
function LogIn() {
	const navigate = useNavigate();
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
	const onSubmitHandler = (e) => {
		e.preventDefault();
		if (formData.email.trim()==="" || formData.password.trim()==="") {
			console.warn('Form is invalid');
			toast.error('Error! Login Failed. Invalid form data');
			return;
		}
		// console.log('Form submitted:', formData);
		createSession.setItem('fpng-status', formData.email, 1000*60);
		// Here you can handle the login logic, e.g., API call
		// Reset form after submission
		setFormData(initialFormData);
		toast.success('Login Successful!');
		navigate('/')
	}
	return (
		<>
			<form onSubmit={onSubmitHandler}
			className=""style={{
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
					<div className="form-group"
					style={{
						marginLeft: marginX,
						marginRight: marginX,
						}}>
						<label>Email</label>
						<input
						name="email"
						onChange={onChangeHandler}
						value={formData.email}
						className="form-control"
						type="text"
						placeholder="example@email.com"
						style={{}}
						required/>
					</div>
					<div className="form-group"
					style={{
						marginLeft: marginX,
						marginRight: marginX,
						}}>
						<label>Password</label>
						<input
						name="password"
						onChange={onChangeHandler}
						value={formData.password}
						className="form-control"
						type="password"
						placeholder="Password"
						style={{}}
						required/>
					</div>
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
				</div>
			</form>
		</>
	)
}
export { LogIn }
