import { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useScrollDetection } from '../../hooks/scrollDetection';
// import famousPropertiesNGLogo from '../../images/famouspropertiesngTransparent.png';
import { useDeviceType } from '../../hooks/deviceType';
import { Sidebar } from '../bars/sidebar';
import { getImage } from '../../hooks/baseImgUrl';
// import { createLocal } from '../../hooks/setupLocalStorage';
import { useCreateStorage } from '../../hooks/setupLocalStorage';
import { useAuth } from '../../hooks/allAuth/authContext';
import { titleCase } from '../../hooks/changeCase';

const headerMenuArr = [
	// {
	// 	menu: "auth",
	// 	type: "button",
	// 	authItems: {
	// 		login: {
	// 			menu: "Login",
	// 			link: "/login"
	// 		},
	// 		logout: {
	// 			menu: "Logout",
	// 			link: "logout"
	// 		},
	// 		signup: {
	// 			menu: "Sign Up",
	// 			link: "/signup"
	// 		},
	// 	},
	// },
	{
		menu: "Logout",
		type: "button",
	},
	{
		menu: "Login",
		link: "/login",
		type: "link",
	},
	{
		menu: "Cart",
		type: "link",
		link: "cart"
	},
	{
		menu: "Categories",
		type: "button",
		angleD: "fas fa-angle-down",
		angleL: "fas fa-angle-left",
	},
	// {
	// 	menu: "Account Settings",
	// 	link: "/settings"
	// },
	{
		menu: "Admin Page",
		link: "/admin-page",
		type: "link",
	},
	{
		menu: "Contact",
		link: "/contact",
		type: "link",
	},
	{
		menu: "FAQs",
		link: "/faqs",
		type: "link",
	},
	{
		menu: "Clear Cart",
		type: "button",
	},
]
const dressesArr = [
	"men's dresses",
	"women's dresses",
	"baby's dresses"
]

function Header({mTop, numberOfProductsInCart, handleClearCart}) {
	// console.log({numberOfProductsInCart})
	// console.log({isUserDetected})
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	// const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	// const [numberOfProductsInCart, setNumberOfProductsInCart] = useState(0)
	const renderdelay = () => {setTimeout(() => setShouldRender(false), 200)}
	const overlayRef = useRef(null); // not exactly in use
	const menuRef = useRef(null);
	const menuIconRef = useRef(null);
	const categoryMenuRef = useRef(null);
	// const menuWrapperRef = useRef(null);
	let { scrollingDown } = useScrollDetection();
	// const [scrollUp, setScrollUp] = useState(scrollingDown)
	const deviceType = useDeviceType()
	const currentPage = useLocation().pathname.split('/').pop();
	const navigate = useNavigate();
	const menuHandler = () => {
		setIsMenuOpen(prev=> {
			// console.log("Menu Opened:", !prev);
			if (prev) {
				renderdelay()
			} else setShouldRender(true);
			return !prev;
		});
	}

	// const { createLocal } = useCreateStorage()
	// const productsInCart = createLocal.getItemRaw('fpng-cart');
	// useEffect(() => {
	// 	if (productsInCart) {
	// 		const numberOfItems = productsInCart.length
	// 		setNumberOfProductsInCart(numberOfItems)
	// 	}
	// }, [productsInCart])
	
	useEffect(() => {
		// console.log("is Menu Opened:", isMenuOpen);
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		const handleClickToCloseMenu = (e) => {
			// console.log("Clicked:", e.target);

			// close menu overlay when logout is clicked
			// const anchor = e.target;
			// const span = anchor.querySelector('span');
			// const spanId = span?.id?.toLowerCase();
			// console.log('spanId:', spanId);
			// if (spanId==='logout') {
			// 	// console.log("Clicked on overlay, closing menu");
			// 	setIsMenuOpen(false);
			// 	renderdelay(); // your animation cleanup
			// 	// console.log('logout process initiated and navigating to home')
			// 	// navigate('/')
			// }

			// if you clicked on the menu itself or any of its children, do nothing
			if (menuRef.current && menuRef.current.contains(e.target)) return;
			if (categoryMenuRef.current && categoryMenuRef.current.contains(e.target)) return;

			// if you clicked inside overlayRef (background area), close the menu
			// else {
			// 	console.log("Clicked anywhere else, closing menu");
			// 	setIsMenuOpen(false);
			// 	renderdelay(); // your animation cleanup
			// }

			if (!menuIconRef.current.contains(e.target)) {
				// console.log("Clicked on overlay, closing menu");
				setIsMenuOpen(false);
				renderdelay(); // your animation cleanup
			}

			// if (
			// 	// menuWrapperRef.current &&
			// 	event.target === menuWrapperRef.current ||
			// 	!menuWrapperRef.current.contains(event.target)
			// ) {
			// 	setIsMenuOpen(false);
			// 	renderdelay();
			// }
		};
		if (isMenuOpen) {
			document.addEventListener('mousedown', handleClickToCloseMenu);
		} else {
			document.removeEventListener('mousedown', handleClickToCloseMenu);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickToCloseMenu);
		};
	}, [isMenuOpen]);
	useEffect(() => {
		if (isMenuOpen) {
			setIsMenuOpen(false);
			renderdelay();
		}
	}, [currentPage])

	const removeLabelName = deviceType.width<400
	// console.log({isMenuOpen})
	// console.log('shouldRender:', shouldRender)
	return (
		<>
			<nav className={`container-fluid container-fluid-nav navbar bg-dark navbar-expand-lg navbar-dark py-3 py-lg-0 px-xl-5 ${isMenuOpen?'':!scrollingDown ? 'hidden' : ''}`}
			style={{
				height: '8%',
				flexWrap: 'nowrap',
				}}>
				{(deviceType.width<992) ?
				// mobile
				<>
					<span
					style={removeLabelName ?
						{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: '100%'}
						:
						{}
					}
					>
						<Brand />
						<CartLink propStyle={"ml-3"} numberOfProductsInCart={numberOfProductsInCart} />
					</span>
					<button
					onClick={(e) => {
						e.stopPropagation();
						menuHandler();
					}}
					ref={menuIconRef}
					type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
						<span
						// className={`fas ${!isMenuOpen?'fa-bars':'fa-times'}`}
						className={`${!isMenuOpen?'fa fa-bars':'fa fa-times'}`}></span>
					</button>
				</>
				:
				// desktop
				<div className="navbar-collapse justify-content-between" id="navbarCollapse">
					<Brand />
					<MenuItems handleClearCart={handleClearCart}
					numberOfProductsInCart={numberOfProductsInCart}
					// isUserDetected={isUserDetected}
					/>
				</div>}
			</nav>
			{shouldRender && <MenuItems
								currentPage={currentPage}
								mTop={mTop}
								isMenuOpen={isMenuOpen}
								// menuWrapperRef={menuWrapperRef}
								overlayRef={overlayRef}
								menuRef={menuRef}
								categoryMenuRef={categoryMenuRef}
								numberOfProductsInCart={numberOfProductsInCart}
								handleClearCart={handleClearCart}
								// isUserDetected={isUserDetected}
								/>}
		</>
	)
}

function MenuItems({mTop, isMenuOpen, overlayRef,
					menuRef, categoryMenuRef,
					currentPage, numberOfProductsInCart,
					handleClearCart}) {
	const { createLocal } = useCreateStorage();
	const [isUserDetected, setIsUserDetected] = useState(null)
	const accessToken = createLocal.getItem('fpng-acc');
	const userInfo = createLocal.getItem('fpng-user');
	const refreshToken = createLocal.getItem('fpng-ref');
	// console.log({accessToken}, {userInfo})
	// console.log({refreshToken})
	const deviceType = useDeviceType()
	const navigate = useNavigate();

	useEffect(() => {
		setIsUserDetected(!!userInfo)
	}, [userInfo])
	let status = accessToken
	// console.log('fpng-status:', status)
	status = status??null;
	const [itemClicked, setItemClicked] = useState(false);
	const handleMenuItemClick = () => {
		setItemClicked(prev => !prev);
	}
	const handleSidbarMenuButtonClick = (statusLink) => {
		// console.log('handleSidbarMenuButtonClick', {statusLink})
		if (statusLink.toLowerCase()==='logout') {
			// console.log('logout process initiated')
			createLocal.removeAllItems();
			// console.log('navigating to home')
			navigate('/')
		} else if (statusLink.toLowerCase()==='clear cart') {
			// console.log('clearing cart ...')
			handleClearCart()
		} else {
			// console.log('navigate click')
			navigate(statusLink)
		}
	}
	function moveItem(array, fromIndex, toIndex) {
		const newArray = [...array]; // copy to avoid mutating original
		const [movedItem] = newArray.splice(fromIndex, 1); // remove item
		newArray.splice(toIndex, 0, movedItem); // insert at new index
		return newArray;
	}
	// usage;
	// const reordered = moveItem(menuArrItems, 2, 1);
	let resortedMobile = moveItem(headerMenuArr, 7, 3);
	let resortedPc
	// console.log({headerMenuArr})
	// console.log({resortedMobile})
	// console.log({resortedPc})
	// console.log({isUserDetected})
	// console.log({menuRef})

	if (!isUserDetected) {
		// console.log('removing logout')
		resortedMobile = resortedMobile.filter(obj => obj.menu.toLowerCase() !== 'logout');
		resortedPc = headerMenuArr.filter(obj => obj.menu.toLowerCase() !== 'logout');
	} else {
		// console.log('removing login')
		resortedMobile = resortedMobile.filter(obj => obj.menu.toLowerCase() !== 'login');
		resortedPc = headerMenuArr.filter(obj => obj.menu.toLowerCase() !== 'login');
	}
	// console.log('filtered:', {resortedMobile})
	// else {
	// 	// Remove item
	// 	resortedMobile = resortedMobile.filter(obj => obj.menu !== 'logout');
	// }
	// console.log({overlayRef, menuRef})
	return (
		<>
			{(deviceType.width<992) ?
				// mobile
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
					// cursor: 'pointer',
				}}>
					<div className={`col-lg-2 ${isMenuOpen?'slideInRight':'slideOutRight'}`}
					ref={overlayRef}
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'center',
						// backgroundColor: 'rgba(0, 0, 0, 0.82)',
						}}>
						{itemClicked && <span
						style={{
							position: 'relative',
							top: '3rem',
						}}><Sidebar mobileStyle={'rgba(0, 0, 0, 0.71)'} categoryMenuRef={categoryMenuRef} /></span>}
						<div className="h-100 pt-0"
						ref={menuRef}
						style={{
							// position: 'absolute',
							backgroundColor: 'rgba(0, 0, 0, 0.62)',
							marginRight: '-1rem',
							borderBottomLeftRadius: 20,
							display: 'flex',
							flexDirection: 'column',
							alignSelf: 'flex-start'
						}}>
							{userInfo &&
							<>
								<Link to={"/profile"}
								className={`dropdown-item slideInRight mr-0`} // removed mr-3 to mr-0
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									flexDirection: 'column',
									animationDelay: `${0.1}s`,
									textWrap: 'nowrap',
									fontSize: '0.8rem',
									color: '#E2E8F0',
									textAlign: 'center',
									padding: '3.5rem 0.8rem 3.3rem 0.8rem',
									// paddingTop: '1rem',
									// paddingBottom: '2rem',
									marginLeft: 0,
									marginRight: 0,
									marginTop: '',
									marginBottom: '',
									border: '2px outset buttonborder',
									borderTopLeftRadius: 0,
									borderTopRightRadius: 0,
									borderBottomLeftRadius: 9,
									borderBottomRightRadius: 9,
									height: '3.3rem',
									fontWeight: 'bold',
									}}>
										{
										userInfo.image_url
										// false
										?
										<div style={{
											marginBottom: '0.3rem',
										}}>
											<img
											src={userInfo.image_url}
											alt={userInfo.first_name}
											style={{
												width: '3.2rem',
												height: '3.2rem',
												objectFit: 'cover',
												borderRadius: '50%',
												marginRight: '0.5rem',
												padding: 2,
												border: '1px solid #F8F6F2',
												// textDecoration: 'none',
											}}
											/>
										</div>
										:<span
										className="fas fa-user-circle mr-2"
										style={{
											fontSize: '2.8rem',
											marginBottom: '0.5rem',
											// textDecoration: 'none',
										}}
										/>}
										<span
										style={{
											fontSize: '1rem',
											fontStyle: 'italic',
										}}>{titleCase(userInfo.first_name)}</span>
									</Link>
							</>}
								{resortedMobile.map((menu, index) => {
									const lastItem = index === headerMenuArr.length - 1;
									// console.log('isUserDetected:', isUserDetected)
									if (!numberOfProductsInCart&&menu.menu.toLowerCase()==='clear cart') return null
									return (
										<Fragment key={index}>
											{menu?.type==='button'?
												<span
												onClick={(e) => {
													// const logout = status?.toLowerCase()
													// const clearCart = menu?.clear?.toLowerCase()
													// console.log("Clicked on");
													// console.log({menu, status, logout, clearCart, statusLink})
													
													// console.log('menu.clear:', logoutOrClearCart)
													if (menu?.menu?.toLowerCase() === 'categories') {
														// console.log("Clicked on Categories");
														e.stopPropagation();
														handleMenuItemClick();
													}
													else if (menu.menu.toLowerCase() === 'logout') {
														// console.log("Clicked on auth");
														// console.log({statusLink})
														// console.log('logout 414 clicked')
														e.stopPropagation();
														handleSidbarMenuButtonClick(menu.menu.toLowerCase())
													}
													else if (menu.menu.toLowerCase()==='clear cart') {
														// console.log("Clicked on auth");
														// console.log({statusLink})
														// console.log('clear cart 414 clicked')
														e.stopPropagation();
														handleSidbarMenuButtonClick(menu.menu.toLowerCase())
													}
												}}
												// onClick={handleMenuItemClick}
												className={`dropdown-item slideInRight mr-0`} // removed mr-3 to mr-0
												style={{
													display: 'flex',
													justifyContent: 'center',
													alignItems: 'center',
													animationDelay: `${index * 0.1}s`,
													textWrap: 'nowrap',
													fontSize: '0.8rem',
													color: '#E2E8F0',
													textAlign: 'center',
													padding: '0rem 1rem',
													marginLeft: 0,
													marginRight: 0,
													// marginTop: menu?.menu?.toLowerCase() === "contact" ? '14rem' : '',
													marginBottom: lastItem ? '60%' : '',
													border: '2px outset buttonborder',
													borderTopLeftRadius: 0,
													borderTopRightRadius: 0,
													borderBottomLeftRadius: 9,
													borderBottomRightRadius: 9,
													height: '3.3rem',
													cursor: 'pointer',
													}}>
														<span className={`${menu?.angleD&&!itemClicked?menu.angleD:(itemClicked?menu.angleL:'')}`}
														id={menu.menu.toLowerCase()}
														style={{marginRight: 8, fontSize: '1rem'}} />
															{menu.menu}
															{menu.menu.toLowerCase()==='cart'&&
															<>
																<span style={{whiteSpace: 'pre'}}> </span>
																<span className="fas fa-shopping-cart fa-xs"
																style={{
																	color: '#F8F6F2',
																}}></span>
															</>}
												</span>
												:
												<Link to={menu.link}
												// onClick={handleMenuItemClick}
												className={`dropdown-item slideInRight mr-0`} // removed mr-3 to mr-0
												style={{
													display: 'flex',
													justifyContent: 'center',
													alignItems: 'center',
													animationDelay: `${index * 0.1}s`,
													textWrap: 'nowrap',
													fontSize: '0.8rem',
													color: '#E2E8F0',
													textAlign: 'center',
													padding: '0rem 1rem',
													marginLeft: 0,
													marginRight: 0,
													marginTop: menu?.menu?.toLowerCase() === "contact" ? '14rem' : '',
													marginBottom: lastItem ? '60%' : '',
													border: '2px outset buttonborder',
													borderTopLeftRadius: 0,
													borderTopRightRadius: 0,
													borderBottomLeftRadius: 9,
													borderBottomRightRadius: 9,
													height: '3.3rem',
													}}>
														<span className={''}
														id={menu.menu.toLowerCase()}
														style={{marginRight: 8, fontSize: '1rem'}} />
															{menu.menu}
															{menu.menu.toLowerCase()==='cart'&&
															<>
																<span style={{whiteSpace: 'pre'}}> </span>
																<span className="fas fa-shopping-cart fa-xs"
																style={{
																	color: '#F8F6F2',
																}}></span>
															</>}
												</Link>}
										</Fragment>
									)
								})}
						</div>
					</div>
				</div>
				:
				// desktop
				<div className="navbar-nav ml-auto py-0 d-lg-flex">
					<div className="col-lg-2 pr-0"
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						// paddingRight: 'auto',
						}}>
						{userInfo &&
						<Link to={"/profile"}
						className='profile-name-link'
						style={{
							textWrap: 'nowrap',
							color: '#F8F6F2',
							// fontSize: '0.9rem',
							// fontStyle: 'italic',
							fontWeight: 'bold',
							display: 'flex',
							alignItems: 'center',
							textDecoration: 'none',
							}}>
								{userInfo.image_url ?
								<img
								src={userInfo.image_url}
								alt={userInfo.first_name}
								style={{
									width: '2.4rem',
									height: '2.4rem',
									objectFit: 'cover',
									borderRadius: '50%',
									marginRight: '0.5rem',
									padding: 1,
									border: '1px solid #F8F6F2',
									// textDecoration: 'none',
								}}
								/>
								:<span
								className="fas fa-user-circle mr-2"
								style={{
									fontSize: '2.3rem',
									// textDecoration: 'none',
								}}
								/>}
								<span
								className='profile-name-text'>{titleCase(userInfo.first_name)}</span>
						</Link>}
						<div className="d-inline-flex align-items-center h-100">
							{resortedPc.map((menu, index) => {
								if (menu?.menu?.toLowerCase() === "cart") return null;
								if (menu?.menu?.toLowerCase() === "categories") return null;
								if (!numberOfProductsInCart&&menu.menu.toLowerCase()==='clear cart') return null
								// let button = false
								// let statusLink = null;
								// let logout = menu.authItems?.logout?.menu?.toLowerCase()==='logout'
								// console.log('auth-logout:', !!logout, `${menu.menu}`, `${(logout)?logout:''}`)
								
								// if (menu?.menu?.toLowerCase() === "auth") {
								// 	button = true;
								// 	// console.log('login:', !!menu.authItems.login)
								// 	// console.log('logout:', !!menu.authItems.logout)
								// 	// if (menu.authItems.logout) logout = true
								// 	// console.log({logout})
								// 	// console.log({status})
								// 	statusLink = status? menu.authItems.logout.link : menu.authItems.login.link;
								// 	status = status? menu.authItems.logout.menu : menu.authItems.login.menu;
								// 	// console.log({status})
									
								// 	// console.log({statusLink})
								// }
								// if (menu?.clear) {
								// 	button = true
								// 	status = menu.clear
								// 	if (!numberOfProductsInCart) return null;
								// }
								// if (menu?.menu?.toLowerCase() === "categories") return null;
								// console.log({logout}, `${menu.menu}`)
								return (
									<Fragment key={index}>
										{menu.type==='button' ?
											<button
											style={{
												// paddingRight: '1rem',
												color: '#F8F6F2',
												border: '1px solid rgba(248, 246, 242, 0.23)',
												borderRadius: '3px',
											}}
											onClick={()=>handleSidbarMenuButtonClick(menu.menu)}
											className="dropdown-item"
											type="button">
												{menu.menu}
											</button>
											:
											<Link to={menu.link} className="text-body mr-3"
											style={{textWrap: 'nowrap'}}>{menu.menu}</Link>}
									</Fragment>
								)
							})}
							{/* {numberOfProductsInCart &&
							<button
							style={{
								color: '#F8F6F2',
								border: '1px solid rgba(248, 246, 242, 0.23)',
								borderRadius: '3px',
							}}
							onClick={()=>handleClearCart()}
							className="dropdown-item"
							type="button">
								Clear Cart
							</button>} */}
						</div>
					</div>
					<CartLink numberOfProductsInCart={numberOfProductsInCart} />
				</div>}
		</>
	)
}
function Brand() {
	const deviceType = useDeviceType()
	const removeLabelName = deviceType.width<400
	return (
		<Link to={"/"}
		className="text-decoration-none"
		style={{
			// display: 'flex',
			// width: '11.3%',
			// paddingRight: '1%',
			cursor: 'pointer',
			}}>
			<img src={getImage('famouspropertiesngTransparent.png')} alt="famouspropertiesng"
			style={{width: removeLabelName?'40%':'13%', backgroundColor: '#f5f5f5', borderRadius: '5%'}} />
			{!removeLabelName &&
			<span
			style={{alignSelf: 'center'}}>
				<span className="text-uppercase text-primary bg-dark px-2 bold-text">famousproperties</span>
				<span className="text-uppercase text-dark bg-primary px-2 bold-text ml-n1">NG</span>
			</span>}
		</Link>
	)
}
function CartLink({propStyle, numberOfProductsInCart}) {
	// const [numberOfProductsInCart, setNumberOfProductsInCart] = useState(0)
	const deviceType = useDeviceType()
	const removeLabelName = deviceType.width<400
	// const { createLocal } = useCreateStorage()
	// const productsInCart = createLocal.getItemRaw('fpng-cart');
	// useEffect(() => {
	// 	if (productsInCart) {
	// 		const numberOfItems = productsInCart.length
	// 		setNumberOfProductsInCart(numberOfItems)
	// 	}
	// }, [productsInCart])
	return (
		<Link to={"cart"} className={`btn px-0 ml-0 ${propStyle} ${removeLabelName?'pr-3':''}`}>
			<span className="fas fa-shopping-cart fa-lg"
			style={{
				color: '#F8F6F2',
			}}></span>
			<span className="badge text-secondary border border-secondary rounded-circle navbar-span">{numberOfProductsInCart}</span>
		</Link>
	)
}
export { Header };
