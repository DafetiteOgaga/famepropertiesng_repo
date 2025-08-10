import { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrollDetection } from '../../hooks/scrollDetection';
import famousPropertiesNGLogo from '../../images/famouspropertiesngTransparent.png';
import { useDeviceType } from '../../hooks/deviceType';

const headerMenuArr = [
	{
		menu: "Sign in"
		, link: ""
	},
	{
		menu: "Sign out",
		link: ""
	},
	{
		menu: "Sign up",
		link: ""
	},
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
function Header({mTop}) {
	// console.log({mTop})
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	// const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const renderdelay = () => {setTimeout(() => setShouldRender(false), 200)}
	const menuWrapperRef = useRef(null);
	let { scrollingDown } = useScrollDetection();
	// const [scrollUp, setScrollUp] = useState(scrollingDown)
	const deviceType = useDeviceType()
	const currentPage = useLocation().pathname.split('/').pop();
	const menuHandler = () => {
		setIsMenuOpen(prev=> {
			// console.log("Menu Opened:", !prev);
			if (prev) {
				renderdelay()
			} else setShouldRender(true);
			return !prev;
		});
	}
	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
			// setScrollUp(false); // Prevent scrolling when menu is open
		} else {
			document.body.style.overflow = "";
			// setScrollUp(scrollingDown); // Allow scrolling when menu is closed
		}
	}, [isMenuOpen]);
	useEffect(() => {
		if (isMenuOpen) {
			setIsMenuOpen(false);
			// setIsVisible(false);
			renderdelay();
		}
	}, [currentPage])

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				menuWrapperRef.current &&
				!menuWrapperRef.current.contains(event.target)
			) {
				setIsMenuOpen(false);
				// setIsVisible(false);
				renderdelay();
			}
		};
		if (isMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMenuOpen]);
	console.log({isMenuOpen})
	console.log('shouldRender:', shouldRender)
	return (
		<>
			<nav className={`container-fluid container-fluid-nav navbar bg-dark navbar-expand-lg navbar-dark py-3 py-lg-0 px-xl-5 ${isMenuOpen?'':!scrollingDown ? 'hidden' : ''}`}
			style={{
				height: '8%',
				flexWrap: 'nowrap',
				}}>
				{(deviceType.width<992) ?
				<>
					<span
					// style={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}
					>
						<Brand />
						<CartLink propStyle={"ml-3"} />
					</span>
					<button
					onClick={(e) => {
						e.stopPropagation();
						menuHandler();
					}}
					type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
						<span
						// className={`fas ${!isMenuOpen?'fa-bars':'fa-times'}`}
						className="navbar-toggler-icon"></span>
					</button>
				</>
				:
				<div className="navbar-collapse justify-content-between" id="navbarCollapse">
					<Brand />
					<MenuItems />
				</div>}
			</nav>
			{shouldRender && <MenuItems currentPage={currentPage} mTop={mTop} isMenuOpen={isMenuOpen} />}
		</>
	)
}

function MenuItems({mTop, isMenuOpen}) {
	const deviceType = useDeviceType()
	return (
		<>
			{(deviceType.width>=992) ?
			<div className="navbar-nav ml-auto py-0 d-lg-flex">
				<div className="col-lg-2 pr-0"
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					// paddingRight: 'auto',
					}}>
					<div className="d-inline-flex align-items-center h-100">
						{headerMenuArr.map((menu, index) => {
							let button = false
							if (menu.menu.toLowerCase() === "sign in" || menu.menu.toLowerCase() === "sign out" || menu.menu.toLowerCase() === "sign up") {
								button = true;
							}
							return (
								<>
									{button ?
										<button className="dropdown-item" type="button">{menu.menu}</button>
										:
										<Link to={menu.link} key={index} className="text-body mr-3"
										style={{textWrap: 'nowrap'}}>{menu.menu}</Link>}
								</>
							)
						})}
					</div>
				</div>
				<CartLink />
			</div>
		:
		<div className={`${isMenuOpen?'slideInRight':'slideOutRight'}`}
		style={{
			position: 'fixed',
			top: `${30-mTop}%`,
			left: 0,
			backgroundColor: 'rgba(0, 0, 0, 0.51)',
			zIndex: 20,
			height: '100vh',
			width: '100vw',
			overflowY: 'auto',
		}}>
			<div className={`col-lg-2 ${isMenuOpen?'slideInRight':'slideOutRight'}`}
			style={{
				display: 'flex',
				justifyContent: 'flex-end',
				alignItems: 'center',
				// backgroundColor: 'rgba(0, 0, 0, 0.82)',
				}}>
				<div className="h-100 pt-0"
				style={{
					backgroundColor: 'rgba(0, 0, 0, 0.62)',
					marginRight: '-1rem',
				}}>
					{headerMenuArr.map((menu, index) => {
						const lastItem = index === headerMenuArr.length - 1;
						let button = false
						// if (menu.menu.toLowerCase() === "sign in" || menu.menu.toLowerCase() === "sign out" || menu.menu.toLowerCase() === "sign up") {
						// 	button = true;
						// }
						return (
							<Fragment key={index}>
								{/* {button ? */}
									{/* <button className="dropdown-item slideInRight" type="button"
									style={{
										animationDelay: `${index * 0.1}s`,
										textWrap: 'nowrap',
										fontWeight: 'bold',
										color: '#E2E8F0',
										textAlign: 'center',
										padding: '0 2rem',
										marginLeft: 0,
										marginRight: 0,
										marginTop: menu.menu.toLowerCase() === "contact" ? '25rem' : '',
										marginBottom: lastItem ? '5rem' : '',
										border: '4px outset buttonborder',
										borderTopLeftRadius: 0,
										borderTopRightRadius: 0,
										height: '3.7rem',
										}}>{menu.menu}</button> */}
									{/* : */}
									<Link to={menu.link} className="dropdown-item mr-3"
									style={{
										alignContent: 'center',
										animationDelay: `${index * 0.1}s`,
										textWrap: 'nowrap',
										// fontWeight: 'bold',
										color: '#E2E8F0',
										textAlign: 'center',
										padding: '0 1rem',
										marginLeft: 0,
										marginRight: 0,
										marginTop: menu.menu.toLowerCase() === "contact" ? '23rem' : '',
										marginBottom: lastItem ? '1rem' : '',
										border: '2px outset buttonborder',
										borderTopLeftRadius: 0,
										borderTopRightRadius: 0,
										borderBottomLeftRadius: 10,
										borderBottomRightRadius: 10,
										height: '3.7rem',
										}}>
										{menu.menu}
									</Link>
									{/* } */}
							</Fragment>
						)
					})}
				</div>
			</div>
		</div>}
		</>
	)
}
function Brand() {
	return (
		<Link to={"/"}
		className="text-decoration-none"
		style={{
			// display: 'flex',
			// width: '11.3%',
			// paddingRight: '1%',
			cursor: 'pointer',
			}}>
			<img src={famousPropertiesNGLogo} alt="famouspropertiesng"
			style={{width: '13%', backgroundColor: '#f5f5f5', borderRadius: '5%'}} />
			<span
			style={{alignSelf: 'center'}}>
				<span className="text-uppercase text-primary bg-dark px-2 bold-text">famousproperties</span>
				<span className="text-uppercase text-dark bg-primary px-2 bold-text ml-n1">NG</span>
			</span>
		</Link>
	)
}
function CartLink({propStyle}) {
	return (
		<Link to={"cart"} className={`btn px-0 ml-0 ${propStyle}`}>
			<span className="fas fa-shopping-cart fa-lg text-success"></span>
			<span className="badge text-secondary border border-secondary rounded-circle navbar-span">0</span>
		</Link>
	)
}
export { Header };
