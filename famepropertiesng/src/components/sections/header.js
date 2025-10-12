import { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useScrollDetection } from '../../hooks/scrollDetection';
import { useDeviceType } from '../../hooks/deviceType';
import { Sidebar } from '../bars/sidebar';
import { getImage } from '../../hooks/baseImgUrl';
import { useCreateStorage } from '../../hooks/setupLocalStorage';
import { titleCase } from '../../hooks/changeCase';

const headerMenuArr = [
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
		link: "/cart"
	},
	{
		menu: "Categories",
		type: "button",
		angleD: "fas fa-angle-down",
		angleL: "fas fa-angle-left",
	},
	{
		menu: "Register Store",
		link: "/register-store/id",
		type: "link",
	},
	{
		menu: "Post Products",
		link: "/post-products/id",
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

function Header({mTop, numberOfProductsInCart, handleClearCart}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const renderdelay = () => {setTimeout(() => setShouldRender(false), 200)}
	const overlayRef = useRef(null); // not exactly in use
	const menuRef = useRef(null);
	const menuIconRef = useRef(null);
	const categoryMenuRef = useRef(null);
	let { scrollingDown } = useScrollDetection();
	const deviceType = useDeviceType()
	const currentPage = useLocation().pathname;
	const menuHandler = () => {
		setIsMenuOpen(prev=> {
			if (prev) {
				renderdelay()
			} else setShouldRender(true);
			return !prev;
		});
	}

	useEffect(() => {
		if (isMenuOpen) {
			document.documentElement.style.overflow = "hidden";
			document.body.style.overflow = "hidden";
		} else {
			document.documentElement.style.overflow = "";
			document.body.style.overflow = "";
		}

		const handleClickToCloseMenu = (e) => {
			// if you clicked on the menu itself or any of its children, do nothing
			if (menuRef.current && menuRef.current.contains(e.target)) return;
			if (categoryMenuRef.current && categoryMenuRef.current.contains(e.target)) return;

			if (!menuIconRef.current.contains(e.target)) {
				setIsMenuOpen(false);
				renderdelay(); // your animation cleanup
			}

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
	return (
		<>
			<nav className={`container-fluid container-fluid-nav navbar bg-dark navbar-expand-lg navbar-dark py-3 py-lg-0 px-xl-5 ${isMenuOpen?'':!scrollingDown ? 'hidden' : ''}`}
			style={{
				top: -1,
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
						className={`${!isMenuOpen?'fa fa-bars':'fa fa-times'}`}></span>
					</button>
				</>
				:
				// desktop
				<div className="navbar-collapse justify-content-between" id="navbarCollapse">
					<Brand />
					<MenuItems
					handleClearCart={handleClearCart}
					currentPage={currentPage}
					numberOfProductsInCart={numberOfProductsInCart}
					/>
				</div>}
			</nav>
			{shouldRender &&
				// mobile
				<MenuItems
				currentPage={currentPage}
				mTop={mTop}
				isMenuOpen={isMenuOpen}
				overlayRef={overlayRef}
				menuRef={menuRef}
				categoryMenuRef={categoryMenuRef}
				numberOfProductsInCart={numberOfProductsInCart}
				handleClearCart={handleClearCart}
				/>}
		</>
	)
}

function MenuItems({mTop, isMenuOpen, overlayRef,
					menuRef, categoryMenuRef,
					currentPage, numberOfProductsInCart,
					handleClearCart}) {
	const { createLocal, createSession } = useCreateStorage();
	const [isUserDetected, setIsUserDetected] = useState(null)
	const [stateHeaderMenu, setStateHeaderMenu] = useState(headerMenuArr)
	const userInfo = createLocal.getItem('fpng-user');
	const navigate = useNavigate();

	useEffect(() => {
		if (!userInfo?.is_seller) {
			setStateHeaderMenu(headerMenuArr.filter(header => {
				return header?.menu.toLowerCase()!=='post products'
			}))
		} else {
			setStateHeaderMenu(headerMenuArr)
		}
		setIsUserDetected(!!userInfo)
	}, [userInfo])
	const [itemClicked, setItemClicked] = useState(false);
	const handleMenuItemClick = () => {
		setItemClicked(prev => !prev);
	}
	const handleSidbarMenuButtonClick = (statusLink) => {
		if (statusLink.toLowerCase()==='logout') {
			createSession.removeItem('fpng-pspk');
			createLocal.removeAllItems();
			navigate('/')
		} else if (statusLink.toLowerCase()==='clear cart') {
			handleClearCart()
		} else {
			navigate(statusLink)
		}
	}
	function moveItem(array, from, toIndex) {
		let fromIndex = from;
		if (typeof fromIndex === 'string') {
			fromIndex = array.findIndex(obj => obj.menu.toLowerCase() === 'clear cart')
		}
		const newArray = [...array]; // copy to avoid mutating original
		const [movedItem] = newArray.splice(fromIndex, 1); // remove item
		newArray.splice(toIndex, 0, movedItem); // insert at new index
		return newArray;
	}
	// usage;
	// const reordered = moveItem(menuArrItems, 2, 1);
	let resortedMobile = moveItem(stateHeaderMenu, 'clear cart', 3);
	let resortedPc

	let isLoggedIn = false
	if (!isUserDetected) {
		// not logged in - remove logout button, keep login button
		// remove register user and post products buttons if not logged in
		resortedMobile = resortedMobile.filter(obj => (
			obj.menu.toLowerCase() !== 'logout'&&
			obj.menu.toLowerCase() !== 'register store'&&
			obj.menu.toLowerCase() !== 'post products'
		));
		resortedPc = stateHeaderMenu.filter(obj => (
			obj.menu.toLowerCase() !== 'logout'&&
			obj.menu.toLowerCase() !== 'register store'&&
			obj.menu.toLowerCase() !== 'post products'
		));
	} else {
		// logged in - remove login button, keep logout button
		// add user id to the link for register store and post products
		isLoggedIn = true
		resortedMobile = resortedMobile.filter(obj => {
			if (obj?.menu.toLowerCase() === 'register store'||
				obj?.menu.toLowerCase() === 'post products') {
				obj.link = obj?.link.substring(0, obj?.link.lastIndexOf('/') + 1) + userInfo?.id;
			}
			return (obj.menu.toLowerCase() !== 'login'&&
					obj.menu.toLowerCase() !== 'register store'
					)
		});
		resortedPc = stateHeaderMenu.filter(obj => {
			if (obj?.menu.toLowerCase() === 'register store'||
				obj?.menu.toLowerCase() === 'post products') {
				obj.link = obj?.link.substring(0, obj?.link.lastIndexOf('/') + 1) + userInfo?.id;
			}
			return (obj.menu.toLowerCase() !== 'login'&&
					obj.menu.toLowerCase() !== 'register store')
		});
	}
	const page = currentPage.split('/')[1].toLowerCase();
	const cartPage = page === 'cart'||page === 'detail'
	if (cartPage) {
		// remove cart from menu if on cart page
		resortedMobile = resortedMobile.filter(obj => obj.menu.toLowerCase() !== 'clear cart');
		resortedPc = resortedPc.filter(obj => obj.menu.toLowerCase() !== 'clear cart');
	}
	const handleIsActive = (menu) => {
		const page = currentPage.split('/')[1];
		const link = menu?.link?.split('/')[1];
		if (menu.type==='button'&&
			menu.menu.toLowerCase()==='categories'&&
			itemClicked) {
			return itemClicked
		}
		return page === link;
	}
	return (
		<>
			{/* mobile container */}
			<div className="mobile-container">
				<div
				className={`${isMenuOpen?'slidePageInRight':'slidePageOutRight'}`}
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
					ref={overlayRef}
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'center',
						}}>
						{itemClicked &&
						<span
						style={{
							position: 'relative',
							top: '-3rem',
						}}><Sidebar mobileStyle={'rgba(0, 0, 0, 0.71)'} categoryMenuRef={categoryMenuRef} />
						</span>}
						<div className="w-35 pt-0"
						ref={menuRef}
						style={{
							height: '95vh',
							backgroundColor: 'rgba(0, 0, 0, 0.62)',
							marginRight: '-1rem',
							borderBottomLeftRadius: 20,
							display: 'flex',
							flexDirection: 'column',
							alignSelf: 'flex-start',
							overflowY: 'auto',
						}}>
							{userInfo &&
							<>
								<Link to={"/profile"}
								className={`dropdown-item slideInRight mr-0 ${handleIsActive({menu: 'Profile', link:"/profile"})?'active':''}`} // removed mr-3 to mr-0
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
											}}
											/>
										</div>
										:<span
										className="fas fa-user-circle mr-2"
										style={{
											fontSize: '2.8rem',
											marginBottom: '0.5rem',
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
									const lastItem = index === stateHeaderMenu.length - 1;
									if (!numberOfProductsInCart&&menu.menu.toLowerCase()==='clear cart') return null
									const isActive = handleIsActive(menu);
									return (
										<Fragment key={index}>
											{menu?.type==='button'?
												<span
												onClick={(e) => {
													if (menu?.menu?.toLowerCase() === 'categories') {
														e.stopPropagation();
														handleMenuItemClick();
													}
													else if (menu.menu.toLowerCase() === 'logout') {
														e.stopPropagation();
														handleSidbarMenuButtonClick(menu.menu.toLowerCase())
													}
													else if (menu.menu.toLowerCase()==='clear cart') {
														e.stopPropagation();
														handleSidbarMenuButtonClick(menu.menu.toLowerCase())
													}
												}}
												className={`dropdown-item slideInRight mr-0 ${isActive?'active':''}`} // removed mr-3 to mr-0
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
												className={`dropdown-item slideInRight mr-0 ${isActive?'active':''}`} // removed mr-3 to mr-0
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
													marginTop: menu?.menu?.toLowerCase()==="contact"?(isLoggedIn?'6rem':'20rem'):'',
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
			</div>

			{/* desktop container */}
			<div className="desktop-container">
				<div className="navbar-nav ml-auto py-0 d-lg-flex">
					<div className="col-lg-2 pr-0"
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						}}>
						{userInfo &&
						<Link to={"/profile"}
						className='profile-name-link'
						style={{
							textWrap: 'nowrap',
							color: '#F8F6F2',
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
								}}
								/>
								:<span
								className="fas fa-user-circle mr-2"
								style={{
									fontSize: '2.3rem',
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
								const isActive = handleIsActive(menu);
								return (
									<Fragment key={index}>
										{menu.type==='button' ?
											<button
											style={{
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
											<Link to={menu.link} className={`text-body head-item ${isActive?'active':''}`}
											style={{textWrap: 'nowrap'}}>{menu.menu}</Link>}
									</Fragment>
								)
							})}
						</div>
					</div>
					<CartLink numberOfProductsInCart={numberOfProductsInCart} />
				</div>
			</div>
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
	const deviceType = useDeviceType()
	const removeLabelName = deviceType.width<400
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
