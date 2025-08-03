

function Checkout() {
	return (
		<body>
			{/* <!-- Topbar Start --> */}
			<div className="container-fluid">
				<div className="row bg-secondary py-1 px-xl-5">
					<div className="col-lg-6 d-none d-lg-block">
						<div className="d-inline-flex align-items-center h-100">
							<a className="text-body mr-3" href="##">About</a>
							<a className="text-body mr-3" href="##">Contact</a>
							<a className="text-body mr-3" href="##">Help</a>
							<a className="text-body mr-3" href="##">FAQs</a>
						</div>
					</div>
					<div className="col-lg-6 text-center text-lg-right">
						<div className="d-inline-flex align-items-center">
							<div className="btn-group">
								<button type="button" className="btn btn-sm btn-light dropdown-toggle" data-toggle="dropdown">My Account</button>
								<div className="dropdown-menu dropdown-menu-right">
									<button className="dropdown-item" type="button">Sign in</button>
									<button className="dropdown-item" type="button">Sign up</button>
								</div>
							</div>
							<div className="btn-group mx-2">
								<button type="button" className="btn btn-sm btn-light dropdown-toggle" data-toggle="dropdown">USD</button>
								<div className="dropdown-menu dropdown-menu-right">
									<button className="dropdown-item" type="button">EUR</button>
									<button className="dropdown-item" type="button">GBP</button>
									<button className="dropdown-item" type="button">CAD</button>
								</div>
							</div>
							<div className="btn-group">
								<button type="button" className="btn btn-sm btn-light dropdown-toggle" data-toggle="dropdown">EN</button>
								<div className="dropdown-menu dropdown-menu-right">
									<button className="dropdown-item" type="button">FR</button>
									<button className="dropdown-item" type="button">AR</button>
									<button className="dropdown-item" type="button">RU</button>
								</div>
							</div>
						</div>
						<div className="d-inline-flex align-items-center d-block d-lg-none">
							<a href="##" className="btn px-0 ml-2">
								<i className="fas fa-heart text-dark"></i>
								<span className="badge text-dark border border-dark rounded-circle checkout-span-span">0</span>
							</a>
							<a href="##" className="btn px-0 ml-2">
								<i className="fas fa-shopping-cart text-dark"></i>
								<span className="badge text-dark border border-dark rounded-circle checkout-span-span">0</span>
							</a>
						</div>
					</div>
				</div>
				<div className="row align-items-center bg-light py-3 px-xl-5 d-none d-lg-flex">
					<div className="col-lg-4">
						<a href="##" className="text-decoration-none">
							<span className="h1 text-uppercase text-primary bg-dark px-2">Multi</span>
							<span className="h1 text-uppercase text-dark bg-primary px-2 ml-n1">Shop</span>
						</a>
					</div>
					<div className="col-lg-4 col-6 text-left">
						<form action="">
							<div className="input-group">
								<input type="text" className="form-control" placeholder="Search for products"/>
								<div className="input-group-append">
									<span className="input-group-text bg-transparent text-primary">
										<i className="fa fa-search"></i>
									</span>
								</div>
							</div>
						</form>
					</div>
					<div className="col-lg-4 col-6 text-right">
						<p className="m-0">Customer Service</p>
						<h5 className="m-0">+012 345 6789</h5>
					</div>
				</div>
			</div>
			{/* <!-- Topbar End --> */}


			{/* <!-- Navbar Start --> */}
			<div className="container-fluid bg-dark mb-30">
				<div className="row px-xl-5">
					<div className="col-lg-3 d-none d-lg-block">
						<a className="btn d-flex align-items-center justify-content-between bg-primary w-100 checkout-anchor-a" data-toggle="collapse" href="#navbar-vertical">
							<h6 className="text-dark m-0"><i className="fa fa-bars mr-2"></i>Categories</h6>
							<i className="fa fa-angle-down text-dark"></i>
						</a>
						<nav className="collapse position-absolute navbar navbar-vertical navbar-light align-items-start p-0 bg-light checkout-nav-v" id="navbar-vertical">
							<div className="navbar-nav w-100">
								<div className="nav-item dropdown dropright">
									<a href="##" className="nav-link dropdown-toggle" data-toggle="dropdown">Dresses <i className="fa fa-angle-right float-right mt-1"></i></a>
									<div className="dropdown-menu position-absolute rounded-0 border-0 m-0">
										<a href="##" className="dropdown-item">Men's Dresses</a>
										<a href="##" className="dropdown-item">Women's Dresses</a>
										<a href="##" className="dropdown-item">Baby's Dresses</a>
									</div>
								</div>
								<a href="##" className="nav-item nav-link">Shirts</a>
								<a href="##" className="nav-item nav-link">Jeans</a>
								<a href="##" className="nav-item nav-link">Swimwear</a>
								<a href="##" className="nav-item nav-link">Sleepwear</a>
								<a href="##" className="nav-item nav-link">Sportswear</a>
								<a href="##" className="nav-item nav-link">Jumpsuits</a>
								<a href="##" className="nav-item nav-link">Blazers</a>
								<a href="##" className="nav-item nav-link">Jackets</a>
								<a href="##" className="nav-item nav-link">Shoes</a>
							</div>
						</nav>
					</div>
					<div className="col-lg-9">
						<nav className="navbar navbar-expand-lg bg-dark navbar-dark py-3 py-lg-0 px-0">
							<a href="##" className="text-decoration-none d-block d-lg-none">
								<span className="h1 text-uppercase text-dark bg-light px-2">Multi</span>
								<span className="h1 text-uppercase text-light bg-primary px-2 ml-n1">Shop</span>
							</a>
							<button type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
								<span className="navbar-toggler-icon"></span>
							</button>
							<div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
								<div className="navbar-nav mr-auto py-0">
									<a href="index.html" className="nav-item nav-link">Home</a>
									<a href="shop.html" className="nav-item nav-link">Shop</a>
									<a href="detail.html" className="nav-item nav-link">Shop Detail</a>
									<div className="nav-item dropdown">
										<a href="##" className="nav-link dropdown-toggle active" data-toggle="dropdown">Pages <i className="fa fa-angle-down mt-1"></i></a>
										<div className="dropdown-menu bg-primary rounded-0 border-0 m-0">
											<a href="cart.html" className="dropdown-item">Shopping Cart</a>
											<a href="checkout.html" className="dropdown-item active">Checkout</a>
										</div>
									</div>
									<a href="contact.html" className="nav-item nav-link">Contact</a>
								</div>
								<div className="navbar-nav ml-auto py-0 d-none d-lg-block">
									<a href="##" className="btn px-0">
										<i className="fas fa-heart text-primary"></i>
										<span className="badge text-secondary border border-secondary rounded-circle checkout-span-span">0</span>
									</a>
									<a href="##" className="btn px-0 ml-3">
										<i className="fas fa-shopping-cart text-primary"></i>
										<span className="badge text-secondary border border-secondary rounded-circle checkout-span-span">0</span>
									</a>
								</div>
							</div>
						</nav>
					</div>
				</div>
			</div>
			{/* <!-- Navbar End --> */}


			{/* <!-- Breadcrumb Start --> */}
			<div className="container-fluid">
				<div className="row px-xl-5">
					<div className="col-12">
						<nav className="breadcrumb bg-light mb-30">
							<a className="breadcrumb-item text-dark" href="##">Home</a>
							<a className="breadcrumb-item text-dark" href="##">Shop</a>
							<span className="breadcrumb-item active">Checkout</span>
						</nav>
					</div>
				</div>
			</div>
			{/* <!-- Breadcrumb End --> */}


			{/* <!-- Checkout Start --> */}
			<div className="container-fluid">
				<div className="row px-xl-5">
					<div className="col-lg-8">
						<h5 className="section-title position-relative text-uppercase mb-3"><span className="bg-secondary pr-3">Billing Address</span></h5>
						<div className="bg-light p-30 mb-5">
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
								<div className="col-md-12 form-group">
									<div className="custom-control custom-checkbox">
										<input type="checkbox" className="custom-control-input" id="newaccount"/>
										<label className="custom-control-label" for="newaccount">Create an account</label>
									</div>
								</div>
								<div className="col-md-12">
									<div className="custom-control custom-checkbox">
										<input type="checkbox" className="custom-control-input" id="shipto"/>
										<label className="custom-control-label" for="shipto"  data-toggle="collapse" data-target="#shipping-address">Ship to different address</label>
									</div>
								</div>
							</div>
						</div>
						<div className="collapse mb-5" id="shipping-address">
							<h5 className="section-title position-relative text-uppercase mb-3"><span className="bg-secondary pr-3">Shipping Address</span></h5>
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
					<div className="col-lg-4">
						<h5 className="section-title position-relative text-uppercase mb-3"><span className="bg-secondary pr-3">Order Total</span></h5>
						<div className="bg-light p-30 mb-5">
							<div className="border-bottom">
								<h6 className="mb-3">Products</h6>
								<div className="d-flex justify-content-between">
									<p>Product Name 1</p>
									<p>$150</p>
								</div>
								<div className="d-flex justify-content-between">
									<p>Product Name 2</p>
									<p>$150</p>
								</div>
								<div className="d-flex justify-content-between">
									<p>Product Name 3</p>
									<p>$150</p>
								</div>
							</div>
							<div className="border-bottom pt-3 pb-2">
								<div className="d-flex justify-content-between mb-3">
									<h6>Subtotal</h6>
									<h6>$150</h6>
								</div>
								<div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Shipping</h6>
									<h6 className="font-weight-medium">$10</h6>
								</div>
							</div>
							<div className="pt-2">
								<div className="d-flex justify-content-between mt-2">
									<h5>Total</h5>
									<h5>$160</h5>
								</div>
							</div>
						</div>
						<div className="mb-5">
							<h5 className="section-title position-relative text-uppercase mb-3"><span className="bg-secondary pr-3">Payment</span></h5>
							<div className="bg-light p-30">
								<div className="form-group">
									<div className="custom-control custom-radio">
										<input type="radio" className="custom-control-input" name="payment" id="paypal"/>
										<label className="custom-control-label" for="paypal">Paypal</label>
									</div>
								</div>
								<div className="form-group">
									<div className="custom-control custom-radio">
										<input type="radio" className="custom-control-input" name="payment" id="directcheck"/>
										<label className="custom-control-label" for="directcheck">Direct Check</label>
									</div>
								</div>
								<div className="form-group mb-4">
									<div className="custom-control custom-radio">
										<input type="radio" className="custom-control-input" name="payment" id="banktransfer"/>
										<label className="custom-control-label" for="banktransfer">Bank Transfer</label>
									</div>
								</div>
								<button className="btn btn-block btn-primary font-weight-bold py-3">Place Order</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* <!-- Checkout End --> */}


			{/* <!-- Footer Start --> */}
			<div className="container-fluid bg-dark text-secondary mt-5 pt-5">
				<div className="row px-xl-5 pt-5">
					<div className="col-lg-4 col-md-12 mb-5 pr-3 pr-xl-5">
						<h5 className="text-secondary text-uppercase mb-4">Get In Touch</h5>
						<p className="mb-4">No dolore ipsum accusam no lorem. Invidunt sed clita kasd clita et et dolor sed dolor. Rebum tempor no vero est magna amet no</p>
						<p className="mb-2"><i className="fa fa-map-marker-alt text-primary mr-3"></i>123 Street, New York, USA</p>
						<p className="mb-2"><i className="fa fa-envelope text-primary mr-3"></i>info@example.com</p>
						<p className="mb-0"><i className="fa fa-phone-alt text-primary mr-3"></i>+012 345 67890</p>
					</div>
					<div className="col-lg-8 col-md-12">
						<div className="row">
							<div className="col-md-4 mb-5">
								<h5 className="text-secondary text-uppercase mb-4">Quick Shop</h5>
								<div className="d-flex flex-column justify-content-start">
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Home</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Our Shop</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Shop Detail</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Shopping Cart</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Checkout</a>
									<a className="text-secondary" href="##"><i className="fa fa-angle-right mr-2"></i>Contact Us</a>
								</div>
							</div>
							<div className="col-md-4 mb-5">
								<h5 className="text-secondary text-uppercase mb-4">My Account</h5>
								<div className="d-flex flex-column justify-content-start">
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Home</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Our Shop</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Shop Detail</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Shopping Cart</a>
									<a className="text-secondary mb-2" href="##"><i className="fa fa-angle-right mr-2"></i>Checkout</a>
									<a className="text-secondary" href="##"><i className="fa fa-angle-right mr-2"></i>Contact Us</a>
								</div>
							</div>
							<div className="col-md-4 mb-5">
								<h5 className="text-secondary text-uppercase mb-4">Newsletter</h5>
								<p>Duo stet tempor ipsum sit amet magna ipsum tempor est</p>
								<form action="">
									<div className="input-group">
										<input type="text" className="form-control" placeholder="Your Email Address"/>
										<div className="input-group-append">
											<button className="btn btn-primary">Sign Up</button>
										</div>
									</div>
								</form>
								<h6 className="text-secondary text-uppercase mt-4 mb-3">Follow Us</h6>
								<div className="d-flex">
									<a className="btn btn-primary btn-square mr-2" href="##"><i className="fab fa-twitter"></i></a>
									<a className="btn btn-primary btn-square mr-2" href="##"><i className="fab fa-facebook-f"></i></a>
									<a className="btn btn-primary btn-square mr-2" href="##"><i className="fab fa-linkedin-in"></i></a>
									<a className="btn btn-primary btn-square" href="##"><i className="fab fa-instagram"></i></a>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="row border-top mx-xl-5 py-4 checkout-footer-div">
					<div className="col-md-6 px-xl-0">
						<p className="mb-md-0 text-center text-md-left text-secondary">
							&copy; <a className="text-primary" href="##">Domain</a>. All Rights Reserved. Designed
							by
							<a className="text-primary" href="https://htmlcodex.com">HTML Codex</a>
						</p>
					</div>
					<div className="col-md-6 px-xl-0 text-center text-md-right">
						<img className="img-fluid" src="img/payments.png" alt=""/>
					</div>
				</div>
			</div>
			{/* <!-- Footer End --> */}


			{/* <!-- Back to Top --> */}
			<a href="##" className="btn btn-primary back-to-top"><i className="fa fa-angle-double-up"></i></a>


			{/* <!-- JavaScript Libraries --> */}
			<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
			<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js"></script>
			<script src="lib/easing/easing.min.js"></script>
			<script src="lib/owlcarousel/owl.carousel.min.js"></script>

			{/* <!-- Contact Javascript File --> */}
			<script src="mail/jqBootstrapValidation.min.js"></script>
			<script src="mail/contact.js"></script>

			{/* <!-- Template Javascript --> */}
			<script src="js/main.js"></script>
		</body>
	)
}
export { Checkout }
