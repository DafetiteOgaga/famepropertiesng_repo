import { Fragment, useState, useEffect, useRef } from "react";
import { Breadcrumb } from "../sections/breadcrumb";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDeviceType } from "../../hooks/deviceType";
import { getImage } from "../../hooks/baseImgUrl";
import { digitSeparator, titleCase } from "../../hooks/changeCase";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useCreateStorage } from "../../hooks/setupLocalStorage";
import { BouncingDots } from "../../spinners/spinner";
import { useOutletContext } from 'react-router-dom';

const baseURL = getBaseURL();

const socials = [
	{
		icon: "fab fa-facebook-f",
		url: 'https://www.facebook.com',
	},
	{
		icon: "fab fa-twitter",
		url: 'https://www.twitter.com',
	},
	{
		icon: "fab fa-linkedin-in",
		url: 'https://www.linkedin.com',
	},
	{
		icon: "fab fa-pinterest",
		url: 'https://www.pinterest.com',
	},
]
const tabPane = [
	{
		title: "description",
		component: ProductDescription,
	},
	{
		title: "information",
		component: ProductInformation,
	},
	{
		title: "review (0)",
		component: ProductReview,
	},
]
const randomNumber = Math.floor(Math.random() * 6);
const productStar = "fa fa-star"
function Detail() {
	const { createLocal, createSession } = useCreateStorage();
	const navigate = useNavigate();
	const imgRef = useRef(null);
	const { handleAddToCart } = useOutletContext();
	const [inputValue, setInputValue] = useState([]);
	const [reload, setReload] = useState(false);
	// const [imageIdx, setImageIdx] = useState(0);
	const [isImageLoading, setIsImageLoading] = useState(true);
	const [transitionEffect, setTransitionEffect] = useState('') // slideInRight, slideInLeft
	const [productItem, setProductItem] = useState(null);
	const id = useParams().id;
	// console.log('id:', id);
	// const [qInput, setQInput] = useState('');
	const deviceSpec = useDeviceType();
	const isMobile = deviceSpec.width <= 576;
	const deviceWidth = deviceSpec.width;
	const [selectedTab, setSelectecTab] = useState('description');
	const [transition, setTransition] = useState(0)
	const userInfo = createLocal.getItem('fpng-user');
	

	const fetchServerData = async () => {
		// console.log("Fetching product data from server...");
		try {
			const url = `${baseURL}/products/${id}/`;
			// console.log("Fetching product data from:", url);
			const prodRes = await (fetch(url));
			if (!prodRes.ok) {
				// console.log("Response not ok:", prodRes);
				throw new Error("Network response was not ok");
			}
			const prodData = await prodRes.json();
			// console.log("Product data fetched:", prodData);
			setProductItem(prodData);

			const sessionProducts = createLocal.getItem('fpng-prod'); // already parsed for you

			if (prodData) {
				if (sessionProducts) {
					// console.log('Session products exist, checking for new products to add...');
					// Extract product IDs already in session
					const existingIds = new Set(sessionProducts.map(p => p.id));
					// console.log('Existing product IDs in session:', existingIds);
	
					// Filter new products (those not in session)
					const newProduct = existingIds.has(prodData.id) ? [] : [prodData];
					// console.log('New products to add:', newProduct?.[0]?.id);
	
					if (newProduct.length > 0) {
						// console.log(`Found ${newProduct.length} new products, updating session...`);
						const updatedSession = [...sessionProducts, ...newProduct];
						createLocal.setItem('fpng-prod', updatedSession);
						createLocal.setItemRaw('fpng-tprd', updatedSession.length);
					}
				} else {
					// First time, just save all
					console.log('Saving products to session for the first time...');
					// const totalProds = prodData.results.length;
					// console.log({totalProds})
					createLocal.setItem('fpng-prod', [prodData]);
					createLocal.setItemRaw('fpng-tprd', [prodData]?.length);
				}
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		// console.log("Fetching server data...");
		fetchServerData();
		// console.log("productItem:", productItem);
	}, []);

	useEffect(() => {
		const cartInStorage = createLocal.getItemRaw('fpng-cart')||[]
		// console.log({cartInStorage})
		// console.log('11111'.repeat(10))
		setInputValue(cartInStorage);
	}, [reload]);

	const handleInputChange = (e, cart, id) => {
		e.preventDefault();
		console.log("Input changed:", e.target.value);
		let value = e.target.value;

		// only allow digits
		if (!/^\d*$/.test(value)) return;
		console.log('Valid input:', value);

		const index = inputValue?.findIndex(item=>item?.prdId===parseInt(id));
		// handle empty string (let user clear before typing a new number)
		if (value === "") {
			console.log('Input cleared');
			setInputValue(prev => {
				const updated = [...prev];
				updated[index] = { ...updated[index], nop: "" };
				createLocal.setItemRaw("fpng-cart", updated);
				return updated;
			});
			return;
		}

		// parse number and auto-correct 0 → 1
		let newValue = Math.max(1, parseInt(value, 10));

		// update state and localStorage with typed value
		setInputValue(prev => {
			console.log('Updating inputValue at index', index, 'to', newValue);
			const updated = [...prev];
			updated[index] = { ...updated[index], nop: newValue };
			createLocal.setItemRaw("fpng-cart", updated);
			return updated;
		});
	};

	// on input blur, if empty reset to 1
	const handleInputBlur = (cart, id) => {
		setInputValue(prev => {
			const updated = [...prev];
			const index = updated?.findIndex(item=>item?.prdId===parseInt(id));
			let currentValue = updated[index].nop;

			// if user left it empty, reset to 1
			if (currentValue === "" || currentValue === undefined) {
				updated[index] = { ...updated[index], nop: 1 };
				createLocal.setItemRaw("fpng-cart", updated);
			}

			return updated;
		});
	};

	const handleStateFuncOnClicks = (prev, id, mode, product) => {
		console.log("Handling state update for id:", id, "with mode:", mode);
		console.log({prev})
		let computedCurrVal
		const updated = [...prev];
		console.log({updated})
		// find index of item with matching id
		let itemIndex = updated?.findIndex(item => item?.prdId === parseInt(id));
		console.log({itemIndex})
		if (mode === 'x') {
			// remove item from cart
			updated.splice(itemIndex, 1);
		} else {
			if (itemIndex === -1 && mode === '+') {
				// item not found, nothing to update
				console.log("Item not found in cart for id:", id);
				console.log('creating local copy of cart for this item')
				updated.push({
					prdId: product?.id,
					nop: 2,
					image: product?.image_url_0,
					name: product?.name,
					price: product?.discountPrice,
				});
				setInputValue(updated)
				setReload(prev => !prev)
				return updated;
			}
			const currentValue = updated[itemIndex]?.nop || 1;
			if (mode === '+') {
				computedCurrVal = currentValue + 1;
			} else if (mode === '-') {
				computedCurrVal = currentValue - 1;
			}
			const newValue = Math.max(1, computedCurrVal);
			updated[itemIndex] = { ...updated[itemIndex], nop: newValue };
		}
		// createLocal.setItemRaw("fpng-cart", updated);
		setInputValue(updated)
		return updated;
	}

	// const image = productImagesArr[transition]
	// const randomNumber = Math.floor(Math.random() * 6);
	// const productImages = {}
	const productImages = productItem?
		Object.entries(productItem)
			.filter(([key, val]) => key.startsWith('image_url')&&Boolean(val))
			.map(([_, url]) => url):null

	const handleImageTransition = (mode) => {
		// console.log("Transitioning image:", mode);
		// console.log('this transition index calc may not be accurate')
		if (mode === '+') {
			console.log("transitioning index from:", transition, "to", transition + 1);
			setTransition(prev => prev < (productImages.length-1) ? prev + 1 : productImages.length - 1)
			setTransitionEffect('slideInRight')
			// setTransitionEffect('slideInLeft')
		} else if (mode === '-') {
			console.log("transitioning index from:", transition, "to", transition - 1);
			setTransition(prev => prev > 1?(prev - 1): 0)
			setTransitionEffect('slideInLeft')
			// setTransitionEffect('slideInRight')
		}
	}

	useEffect(() => {
		// whenever transition changes → new image starts loading
		setIsImageLoading(true);

		if (!imgRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				// console.log("Observed size:", entry.contentRect.width, entry.contentRect.height);
			}
		});
		observer.observe(imgRef.current);
		return () => observer.disconnect();
	}, [transition]);

	const cartItems = createLocal.getItemRaw('fpng-cart');
	const isItemAdded = cartItems?.find(item => item?.prdId === productItem?.id);
	// console.log({isItemAdded})

	// console.log({productImages, isImageLoading})

	// console.log({productImages})
	// console.log({selectedTab})
	// console.log({image})
	// console.log({randomNumber})
	// console.log("productItem:", productItem);
	// console.log({transition, len: productImages?.length})
	// console.log({transitionEffect})

	const loadingImg = isImageLoading


	// console.log({inputValue})
	// console.log({isMobile})
	// console.log({loadingImg})
	// console.log({deviceWidth})
	// console.log({userInfo})
	// console.log('id:', id);
	return (
		<>
			<Breadcrumb page={`Product / ${titleCase(productItem?.name)}`} slash={false} />

			{/* <!-- Shop Detail Start --> */}
			<div className="container-fluid mt-3 pb-5"style={{
				paddingLeft: isMobile ? 0 : '',
				paddingRight: isMobile ? 0 : '',
			}}>
				{productItem ?
				<>
					<div className="row px-xl-5">
					<div className="col-lg-5 mb-30">
						<div  className="carousel slide">
							{(productImages&&deviceWidth) ?
								<>
									<div className="carousel-inner bg-light">
										<div className="carousel-item active"
										style={{
											...isMobile?
												// this dimension aids smooth transition without
												// layout shift on small devices
												{
													height: deviceWidth-35,
													width: deviceWidth-35,
												}
												:
												{
													height: '480px',
													width: '480px',
												},
											}}>

											{loadingImg && (
											<div
											style={{
												width: '100%',
												height: '100%',
											}}>
												<BouncingDots size="sm" color="#475569" p={"10"} />
											</div>
											)}
											<img
											ref={imgRef}
											key={transition}
											src={productImages[transition]}
											alt={productItem?.name||'product image'}
											className={`w-100 h-100 details-img ${transitionEffect} ${loadingImg ? "d-none" : "block"}`}
											// style={{
											// 	maxWidth: "100%",   // prevents overflow
											// 	maxHeight: "100%",  // ensures it fits
											// 	objectFit: "cover", // keeps aspect ratio
											// 	margin: "auto",     // ensures centering
											// }}
											onLoad={(e) => {
												setIsImageLoading(false);

												// Natural size of the image file
												// console.log("natural size:", e.target.naturalWidth, e.target.naturalHeight);

												// // Rendered size in the DOM (after CSS scaling)
												// console.log("rendered size:", e.target.offsetWidth, e.target.offsetHeight);
											}}
											/>
										</div>
									</div>

									<>
										{!loadingImg&&
										<>
											{transition?
											<span
											className="carousel-control-prev"
											onClick={()=> {
												setIsImageLoading(true);
												handleImageTransition('-');
											}}>
												<span
												style={{border: '1px solid #475569', borderRadius: '10%', padding: '2px 10px'}}
												className="fa fa-3x fa-angle-left text-dark" />
											</span>:undefined}
											{transition<(productImages.length-1)?
											<span className="carousel-control-next"
											onClick={()=> {
												setIsImageLoading(true);
												handleImageTransition('+');
											}}>
												<span
												style={{border: '1px solid #475569', borderRadius: '10%', padding: '2px 10px'}}
												className="fa fa-3x fa-angle-right text-dark" />
											</span>:undefined}
										</>}
									</>
								</>
							:
							<BouncingDots size={"sm"} color="#475569" p={isMobile?"10":"14"} />}
						</div>
					</div>

					<div className={`col-lg-7 h-auto mb-30`}>
						<div className={`h-100 bg-light ${isMobile?'':'p-30'}`}
						style={{
							borderRadius: '10px',
							padding: isMobile ? '15px 10px' : '',
						}}>
							<h3 className="mb-0"
							style={{color: '#475569'}}>{titleCase(productItem.name)}</h3>
							<small>
								{productItem.numberOfItems} {productItem.numberOfItems>1?'quantities':'item'} {productItem.numberOfItems<=10?'remaining':'available'}
							</small>
							<div className="d-flex mb-3 mt-1">
								<div className="text-primary mr-2">
									{Array.from({length: 5}, (_, starIndex) => {
										const isStar = (starIndex+1) <= randomNumber;
										const halfStar = randomNumber%2!==0&&(starIndex+1)===randomNumber
										// console.log({isStar}, {starIndex}, {randomNumber}, {halfStar})
										// console.log({})
										return (
											<small
											key={starIndex}
											className={`${productStar}${(halfStar?'-half-alt':'')} ${isStar?'text-warning':'text-secondary'} mr-1`}></small>
										)
									})}
								</div>
								<small className="pt-1">({productItem?.noOfReviewers||'No'} Reviews)</small>
							</div>
							<h3 className="font-weight-semi-bold mb-4"
							style={{color: '#475569'}}>₦{digitSeparator(productItem.discountPrice)}<p className="text-muted"
							style={{fontSize: 14}}><del>₦{digitSeparator(productItem.marketPrice)}</del></p></h3>

							<p className="mb-4">{productItem.description}</p>

							<div className="d-flex align-items-center mb-4 pt-2">
								<div className="input-group quantity mr-3 detail-div-div1">
									<div className="input-group-btn">
										<button className="btn btn-primary btn-minus"
										// onClick={()=>{
										// 	handleQuantityChange('-');
										// 	handleAddToCart(productItem, '-');
										// }}>
										onClick={() => {
											console.log('clicked with id:', id)
											console.log('inputValue before set:', inputValue)
											handleStateFuncOnClicks(inputValue, id, '-', productItem);
											console.log('inputValue after set:', inputValue)
											handleAddToCart(productItem, '-')
											setReload(prev => !prev)}}>
											<span className="fa fa-minus"></span>
										</button>
									</div>
									<input
									type="text"
									className="form-control bg-secondary border-0 text-center"
									// onChange={(e)=>handleQInputChange(e)}
									onChange={(e) => handleInputChange(e, productItem, id)}
									onBlur={() => handleInputBlur(productItem, id)}
									// value={quantity}/
									value={inputValue?.[inputValue?.findIndex(item=>item?.prdId===parseInt(id))]?.nop ?? "1"}/>
									<div className="input-group-btn">
										<button className="btn btn-primary btn-plus"
										// onClick={()=>{
										// 	handleQuantityChange('+');
										// 	handleAddToCart(productItem, '+');
										// }}>
										onClick={() => {
											console.log('clicked with id:', id)
											console.log('inputValue before set:', inputValue)
											handleStateFuncOnClicks(inputValue, id, '+', productItem);
											handleAddToCart(productItem, '+');
											console.log('inputValue after set:', inputValue)
											setReload(prev => !prev)}}>
											<span className="fa fa-plus"></span>
										</button>
									</div>
								</div>
								<button
								onClick={()=>{
									handleAddToCart(productItem, 'add');
								}}
								disabled={Boolean(isItemAdded)}
								className="btn btn-primary px-3">
									<span className="fa fa-shopping-cart mr-1"/>{` ${Boolean(isItemAdded)?'Added to Cart':'Add To Cart'}`}
								</button>
							</div>
							<div className="d-flex flex-row flex-gap-2">
								{(cartItems?.length>0)&&
								<div className="d-flex align-items-center mb-4 pt-2">
									<button
									onClick={()=>navigate('/cart')}
									disabled={!cartItems?.length}
									className="btn btn-primary px-3">
										<span className="fa fa-shopping-cart mr-1"/>{` Go to Cart (${cartItems?.length||0})`}
									</button>
								</div>}

								{(productItem?.store?.user?.id===userInfo?.id && userInfo?.is_seller)&&
								<div className="d-flex align-items-center mb-4 pt-2">
									<button
									onClick={()=>navigate(`/${userInfo?.id}/product/${id}`)}
									// disabled={!cartItems?.length}
									className="btn btn-primary px-3">
										<span className="fa fa-pen mr-1"/>{` Update Product`}
									</button>
								</div>}
							</div>
							<div className="d-flex pt-2">
								<strong className="text-dark mr-2">Share on:</strong>
								<div className="d-inline-flex">
									{socials.map((social, index) => {
										return (
											<Link key={index} to={social.url} className="text-dark px-2">
												<span className={social.icon}></span>
											</Link>
										)
									})}
								</div>
							</div>
						</div>
					</div>
					</div>
					<div className="row px-xl-5">
						<div className="col">
							<div className={`bg-light ${!isMobile && 'p-30'}`}
							style={{
								borderRadius: '10px',
								padding: isMobile ? '15px 10px' : '',
								}}>
								<div className="nav nav-tabs mb-4">
									{tabPane.map((tab, index) => {
										// console.log({tab})
										const isActive = tab.title.toLowerCase() === selectedTab;
										// console.log({isActive})
										return (
											<span key={index}
											onClick={() => setSelectecTab(tab.title.toLowerCase())}
											style={{
												cursor: 'pointer',
												textTransform: 'capitalize',
												padding: isMobile ? '5px 8px' : '',
											}}
											className={`nav-item nav-link text-dark ${isActive?'active':''}`}>
												{tab.title}
											</span>
										)
									})}
								</div>
								<div className="">
									{tabPane.map((comp, index) => {
										// console.log("comp.title.toLowerCase() === selectedTab:", comp.title.toLowerCase() === selectedTab)
										return (
										<Fragment key={index}>
											{comp.title.toLowerCase() === selectedTab && <comp.component productItem={productItem} />}
										</Fragment>
									)})}
								</div>
							</div>
						</div>
					</div>
				</>
				:
				<BouncingDots size={isMobile?"sm":"lg"} color="#475569" p={isMobile?"10":"14"} />}
			</div>
		</>
	)
}

function ProductDescription({productItem=null}) {
	return (
		<div className="tab-pane show active" id="tab-pane-1">
			<h4 className="mb-3">Product Description</h4>
			{productItem?
				<div className="row">
					<div className="col-md-6">
						<ul className="list-group list-group-flush">
							<li className="list-group-item px-0">
								{productItem.fullDescription||'Description 1 not supplied.'}
							</li>
							<li className="list-group-item px-0">
								{productItem.marketingDescription||'Description 2 not supplied.'}
							</li>
						</ul>
					</div>
				</div>
				:<BouncingDots size="sm" color="#475569" p="4" />}
		</div>
	)
}
function ProductInformation({productItem=null}) {
	return (
		<div className="tab-pane" id="tab-pane-2">
			<h4 className="mb-3">Additional Information</h4>
			{productItem?
				<>
					<p>{productItem.technicalDescription||'Information not supplied.'}</p>
					<div className="row">
						<div className="col-md-6">
							<ul className="list-group list-group-flush">
								{Array.from({length: 5}, (_, idx) => {
									return (
										<li key={idx} className="list-group-item px-0">
											{productItem[`techFeature_${idx+1}`]||``}
										</li>
									)})}
							</ul>
						</div>
					</div>
				</>
				:<BouncingDots size="sm" color="#475569" p="4" />}
		</div>
	)
}
function ProductReview() {
	return (
		<div className="tab-pane" id="tab-pane-3">
			<div className="row">
				<div className="col-md-6">
					<h4 className="mb-4">1 review for "Product Name"</h4>
					<div className="media mb-4">
						<img src={getImage("user.jpg", 'img')} alt="" className="img-fluid mr-3 mt-1 detail-div-div2"/>
						<div className="media-body">
							<h6>John Doe<small> - <span>01 Jan 2045</span></small></h6>
							<div className="text-primary mb-2">
								<span className="fas fa-star"></span>
								<span className="fas fa-star"></span>
								<span className="fas fa-star"></span>
								<span className="fas fa-star-half-alt"></span>
								<span className="far fa-star"></span>
							</div>
							<p>Diam amet duo labore stet elitr ea clita ipsum, tempor labore accusam ipsum et no at. Kasd diam tempor rebum magna dolores sed sed eirmod ipsum.</p>
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<h4 className="mb-4">Leave a review</h4>
					<small>Your email address will not be published. Required fields are marked *</small>
					<div className="d-flex my-3">
						<p className="mb-0 mr-2">Your Rating * :</p>
						<div className="text-primary">
							<span className="far fa-star"></span>
							<span className="far fa-star"></span>
							<span className="far fa-star"></span>
							<span className="far fa-star"></span>
							<span className="far fa-star"></span>
						</div>
					</div>
					<form>
						<div className="form-group">
							<label htmlFor="message">Your Review *</label>
							<textarea id="message" cols="30" rows="5" className="form-control"></textarea>
						</div>
						<div className="form-group">
							<label htmlFor="name">Your Name *</label>
							<input type="text" className="form-control" id="name"/>
						</div>
						<div className="form-group">
							<label htmlFor="email">Your Email *</label>
							<input type="email" className="form-control" id="email"/>
						</div>
						<div className="form-group mb-0">
							<input
							disabled
							type="submit"
							value="Leave Your Review"
							className="btn btn-primary px-3"/>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
export { Detail };
