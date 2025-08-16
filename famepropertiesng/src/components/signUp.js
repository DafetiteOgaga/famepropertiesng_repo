import { Breadcrumb } from "./sections/breadcrumb"
import { useDeviceType } from "../hooks/deviceType"
import { Link } from 'react-router-dom';

function SignUp() {
	const deviceType = useDeviceType().width <= 576;
	return (
		<>
			{/* <Breadcrumb page={'Sign Up'} /> */}

			{/* <div className=""style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}> */}
				<div className="row px-xl-5"
				style={{
					display: 'flex',
					justifyContent: 'center',
				}}>
					<div className=""
					style={{
						padding: '0 2rem',
						width: deviceType?'':'60%',
					}}>
						<h5 className="text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Sign Up
							</span>
						</h5>
						<div className="bg-light p-30 mb-5"
						style={{borderRadius: '10px'}}>
							<div className="row">
								<div className="col-md-6 form-group">
									<label>First Name<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="text"
									placeholder="John"/>
								</div>
								
								<div className="col-md-6 form-group">
									<label>Last Name<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="text"
									placeholder="Doe"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Middle Name</label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="text"
									placeholder="Dolly"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Username<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="text"
									placeholder="Dols"/>
								</div>
								
								<div className="col-md-6 form-group">
									<label>Address<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="text"
									placeholder="No.3, 123 crescent, Addo, Ajah"/>
								</div>
								
								{/* <div className="col-md-6 form-group">
									<label>Address Line 1</label>
									<input
									style={{borderRadius: '5px'}} className="form-control" type="text" placeholder="123 Street"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Address Line 2</label>
									<input
									style={{borderRadius: '5px'}} className="form-control" type="text" placeholder="123 Street"/>
								</div> */}
								
								{/* ¹²³€½½¾{[]}\¸`~¸~`¨þø→↓←ŧ¶eł@æßðđŋħˀĸł´^ ̣·─µn”“¢»« */}
								<div className="col-md-6 form-group">
									<label>City</label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="text"
									placeholder="Ajah"/>
								</div>
								<div className="col-md-6 form-group">
									<label>State<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="text"
									placeholder="Lagos"/>
								</div>
								<div
								className="col-md-6 form-group">
									<label>Country<span>*</span></label>
									<select
									style={{borderRadius: '5px'}}
									className="custom-select">
										<option selected>Nigeria</option>
										<option>Ghana</option>
										<option>Cameroon</option>
										<option>Algeria</option>
									</select>
								</div>
								<div className="col-md-6 form-group">
									<label>Email<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="email"
									placeholder="example@email.com"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Mobile No<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="tel"
									inputmode="numeric"   // <!-- brings up number keypad on mobile -->
									// pattern="[0-9]{7,11}" <!-- only numbers, length 7 to 11 -->
									minlength="7"
									maxlength="14"
									pattern="[0-9]{7,14}" // allows only numbers and between 7 and 14 characters
									placeholder="+234 806 000 1111"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Password<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="password"
									placeholder="password"/>
								</div>
								<div className="col-md-6 form-group">
									<label>Password Confirmation<span>*</span></label>
									<input
									style={{borderRadius: '5px'}}
									className="form-control"
									type="password"
									placeholder="password confirmation"/>
								</div>
								{/* <div className="col-md-6 form-group">
									<label>ZIP Code</label>
									<input
									style={{borderRadius: '5px'}} className="form-control" type="text" placeholder="123"/>
								</div> */}
								{/* <div className="col-md-12 form-group">
									<div className="custom-control custom-checkbox">
										<input
										style={{borderRadius: '5px'}} type="checkbox" className="custom-control-input" id="newaccount"/>
										<label className="custom-control-label" htmlFor="newaccount">Create an account</label>
									</div>
								</div>
								<div className="col-md-12">
									<div className="custom-control custom-checkbox">
										<input
										style={{borderRadius: '5px'}} type="checkbox" className="custom-control-input" id="shipto"/>
										<label className="custom-control-label" htmlFor="shipto"  data-toggle="collapse" data-target="#shipping-address">Ship to different address</label>
									</div>
								</div> */}
							</div>
							<button
							className="btn btn-block btn-auth font-weight-bold py-3">
								Sign Up
							</button>
							{/* <span
							style={{
								fontSize: '0.7rem',
							}}>Labels marked with * must be filled</span> */}
							<p className="pt-3"
							style={{
								display: 'flex',
								justifyContent: 'center',
								color: '#475569',
							}}>Have an account?
								<Link
								to="/login"
								style={{
									paddingLeft: '0.5rem',
									color: '#475569',
								}}>
									Log in
								</Link>
							</p>
						</div>
						
						<div className="collapse mb-5" id="shipping-address">
							<h5 className="section-title position-relative text-uppercase mb-3">
								<span className="bg-secondary pr-3"
								style={{color: '#475569'}}>
									Shipping Address
								</span>
							</h5>
							<div className="bg-light p-30">
								<div className="row">
									<div className="col-md-6 form-group">
										<label>First Name</label>
										<input className="form-control" type="text" placeholder="John"/>
									</div>
									<div className="col-md-6 form-group">
										<label>Last Name</label>
										<input className="form-control" type="text" placeholder="Doe"/>
									</div>
									<div className="col-md-6 form-group">
										<label>E-mail</label>
										<input className="form-control" type="text" placeholder="example@email.com"/>
									</div>
									<div className="col-md-6 form-group">
										<label>Mobile No</label>
										<input className="form-control" type="text" placeholder="+123 456 789"/>
									</div>
									<div className="col-md-6 form-group">
										<label>Address Line 1</label>
										<input className="form-control" type="text" placeholder="123 Street"/>
									</div>
									<div className="col-md-6 form-group">
										<label>Address Line 2</label>
										<input className="form-control" type="text" placeholder="123 Street"/>
									</div>
									<div className="col-md-6 form-group">
										<label>Country</label>
										<select className="custom-select">
											<option selected>United States</option>
											<option>Afghanistan</option>
											<option>Albania</option>
											<option>Algeria</option>
										</select>
									</div>
									<div className="col-md-6 form-group">
										<label>City</label>
										<input className="form-control" type="text" placeholder="New York"/>
									</div>
									<div className="col-md-6 form-group">
										<label>State</label>
										<input className="form-control" type="text" placeholder="New York"/>
									</div>
									<div className="col-md-6 form-group">
										<label>ZIP Code</label>
										<input className="form-control" type="text" placeholder="123"/>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* <div className="col-lg-4">
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Order Total
							</span>
						</h5>
						<div className="bg-light p-30 mb-5">
							<div className="border-bottom">
								<h6 className="mb-3">Products</h6>
								<div className="d-flex justify-content-between">
									<p>Product Name 1</p>
									<p>₦150</p>
								</div>
								<div className="d-flex justify-content-between">
									<p>Product Name 2</p>
									<p>₦150</p>
								</div>
								<div className="d-flex justify-content-between">
									<p>Product Name 3</p>
									<p>₦150</p>
								</div>
							</div>
							<div className="border-bottom pt-3 pb-2">
								<div className="d-flex justify-content-between mb-3">
									<h6>Subtotal</h6>
									<h6>₦150</h6>
								</div>
								<div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Shipping</h6>
									<h6 className="font-weight-medium">₦10</h6>
								</div>
							</div>
							<div className="pt-2">
								<div className="d-flex justify-content-between mt-2">
									<h5>Total</h5>
									<h5>₦160</h5>
								</div>
							</div>
						</div>
						<div className="mb-5">
							<h5 className="section-title position-relative text-uppercase mb-3">
								<span className="bg-secondary pr-3"
								style={{color: '#475569'}}>
									Payment
								</span>
							</h5>
							<div className="bg-light p-30">
								<div className="form-group mb-4">
									<div className="custom-control custom-radio">
										<input type="radio" className="custom-control-input" name="payment" id="banktransfer"/>
										<label className="custom-control-label" htmlFor="banktransfer">Bank Transfer</label>
									</div>
								</div>
								<div className="form-group">
									<div className="custom-control custom-radio">
										<input type="radio" className="custom-control-input" name="payment" id="directcheck"/>
										<label className="custom-control-label" htmlFor="directcheck">Pay on Delivery</label>
									</div>
								</div>
								<button className="btn-block btn-auth font-weight-bold py-3">Place Order</button>
							</div>
						</div>
					</div> */}
				</div>
			{/* </div> */}
		</>
	)
}
export { SignUp }
