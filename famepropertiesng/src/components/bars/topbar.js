import famousPropertiesNGLogo from '../../images/famouspropertiesngTransparent.png'

function TopBar() {
	return (
		<div className="container-fluid">
			{/* <div className="row bg-secondary py-1 px-xl-5"> */}
				{/* <div className="col-lg-6 d-none d-lg-block">
					<div className="d-inline-flex align-items-center h-100">
						<a className="text-body mr-3" href="##">About</a>
						<a className="text-body mr-3" href="##">Contact</a>
						<a className="text-body mr-3" href="##">Help</a>
						<a className="text-body mr-3" href="##">FAQs</a>
					</div>
				</div> */}
				{/* <div className="col-lg-6 text-center text-lg-right"> */}
					{/* <div className="d-inline-flex align-items-center">
						<div className="btn-group">
							<button type="button" className="btn btn-sm btn-light dropdown-toggle" data-toggle="dropdown">My Account</button>
							<div className="dropdown-menu dropdown-menu-right">
								<button className="dropdown-item" type="button">Sign in</button>
								<button className="dropdown-item" type="button">Sign up</button>
							</div>
						</div>
					</div> */}
					{/* <div className="d-inline-flex align-items-center d-block d-lg-none">
						<a href="##" className="btn px-0 ml-2">
							<i className="fas fa-heart text-dark"></i>
							<span className="badge text-dark border border-dark rounded-circle navbar-span">0</span>
						</a>
						<a href="##" className="btn px-0 ml-2">
							<i className="fas fa-shopping-cart text-dark"></i>
							<span className="badge text-dark border border-dark rounded-circle navbar-span">0</span>
						</a>
					</div> */}
				{/* </div> */}
			{/* </div> */}
			<div className="row align-items-center bg-light px-xl-5 d-none d-lg-flex"
			style={{justifyContent: 'space-between'}}>
				<div className="col-lg-5">
					<a href="##" className="text-decoration-none"
					style={{display: 'flex', alignItems: 'end'}}>
						<img src={famousPropertiesNGLogo} alt="famouspropertiesng" style={{width: '8%'}} />
						<div
						style={{marginLeft: 5}}>
							<span className="text-uppercase text-primary bg-dark px-2">famousproperties</span>
							<span className="text-uppercase text-dark bg-primary px-2 ml-n1">NG</span>
						</div>
					</a>
				</div>
				{/* <div className="col-lg-4 col-6 text-left">
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
				</div> */}
				<div className="col-lg-2"
				style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
					<button className="dropdown-item" type="button">Sign in/Sign up/Account settings</button>
					<div className="d-inline-flex align-items-center h-100">
						<a className="text-body mr-3" href="##">About</a>
						<a className="text-body mr-3" href="##">Contact</a>
						<a className="text-body mr-3" href="##">Help</a>
						<a className="text-body mr-3" href="##">FAQs</a>
					</div>
				</div>
			</div>
		</div>
	)
}
export { TopBar };
