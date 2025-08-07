import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import famousPropertiesNGLogo from '../../images/famouspropertiesngTransparent.png';

const headerMenuArr = [
	{
		menu: "Account Settings",
		link: "/settings"
	},
	{
		menu: "Contact",
		link: "/contact"
	},
	{
		menu: "FAQs",
		link: "/faqs"
	},
]
const dressesArr = [
	"men's dresses",
	"women's dresses",
	"baby's dresses"
]
function Header() {
	const [showNavbar, setShowNavbar] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	// handles display and hiding of the navbars
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
		
			if (currentScrollY > lastScrollY) {
				setShowNavbar(false); // hide when scrolling down
			} else {
				setShowNavbar(true); // show when scrolling up
			}
			setLastScrollY(currentScrollY);
		};
	
		window.addEventListener('scroll', handleScroll);
	
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollY]);
	return (
		<div className={`container-fluid px-xl-5 container-fluid-nav bg-dark ${!showNavbar ? 'hidden' : ''}`}>
			{/* <div className="row"> */}
				{/* <div className="col-lg-3 d-none d-lg-flex"> */}
					{/* <span className="text-decoration-none"
					style={{
						display: 'flex',
						width: '11.3%',
						paddingRight: '1%',
						cursor: 'pointer',
						}}>
						<img src={famousPropertiesNGLogo} alt="famouspropertiesng" style={{width: '100%', backgroundColor: '#f5f5f5', borderRadius: '5%'}} />
						<div
						style={{alignSelf: 'center'}}>
							<span className="text-uppercase text-primary bg-dark px-2 bold-text">famousproperties</span>
							<span className="text-uppercase text-dark bg-primary px-2 bold-text ml-n1">NG</span>
						</div>
					</span> */}
				{/* </div> */}
				<div className="">
					<nav className="navbar navbar-expand-lg bg-dark navbar-dark py-3 py-lg-0 px-0">
						<a href="##" className="text-decoration-none d-block d-lg-none">
							<span className="h1 text-uppercase text-dark bg-light px-2">Multi</span>
							<span className="h1 text-uppercase text-light bg-primary px-2 ml-n1">Shop</span>
						</a>
						<button type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
							<span className="navbar-toggler-icon"></span>
						</button>
						<div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
							<Link to={"/"}
							className="text-decoration-none"
							style={{
								display: 'flex',
								// width: '11.3%',
								// paddingRight: '1%',
								cursor: 'pointer',
								}}>
								<img src={famousPropertiesNGLogo} alt="famouspropertiesng"
								style={{width: '13%', backgroundColor: '#f5f5f5', borderRadius: '5%'}} />
								<div
								style={{alignSelf: 'center'}}>
									<span className="text-uppercase text-primary bg-dark px-2 bold-text">famousproperties</span>
									<span className="text-uppercase text-dark bg-primary px-2 bold-text ml-n1">NG</span>
								</div>
							</Link>
							{/* <div className="navbar-nav py-0">
								<a href="index.html" className="nav-item nav-link active">Home</a>
								<a href="shop.html" className="nav-item nav-link">Shop</a>
								<a href="detail.html" className="nav-item nav-link">Shop Detail</a>
							</div> */}
							<div className="navbar-nav ml-auto py-0 d-none d-lg-flex">
								<div className="col-lg-2"
								style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									<button className="dropdown-item" type="button">Sign in/Sign up</button>
									<div className="d-inline-flex align-items-center h-100">
										{headerMenuArr.map((menu, index) => {
											return (
												<Link to={menu.link} key={index} className="text-body mr-3"
												style={{textWrap: 'nowrap'}}>{menu.menu}</Link>
											)
										})}
										{/* <a className="text-body mr-3" href="##">About</a>
										<a className="text-body mr-3" href="##">Contact</a>
										<a className="text-body mr-3" href="##">Help</a>
										<a className="text-body mr-3" href="##">FAQs</a> */}
									</div>
								</div>
								{/* <a href="##" className="btn px-0">
									<i className="fas fa-heart text-primary"></i>
									<span className="badge text-secondary border border-secondary rounded-circle navbar-span">0</span>
								</a> */}
								<Link to={"cart"} className="btn px-0 ml-3">
									<i className="fas fa-shopping-cart fa-lg text-success"></i>
									<span className="badge text-secondary border border-secondary rounded-circle navbar-span">0</span>
								</Link>
							</div>
						</div>
					</nav>
				</div>
			{/* </div> */}
		</div>
	)
}
export { Header };
