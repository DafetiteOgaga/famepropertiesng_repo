import { useState, useEffect, Fragment, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDeviceType } from '../../hooks/deviceType';
import { getImage } from '../../hooks/baseImgUrl';
import { digitSeparator, titleCase } from '../../hooks/changeCase';
import { getBaseURL } from '../../hooks/fetchAPIs';
import { useCreateStorage } from '../../hooks/setupLocalStorage';
import { BouncingDots } from '../../spinners/spinner';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import { StarRating, convertLikesToStars } from '../../hooks/handleStars';
import { Pagination } from '../../hooks/pagination';

const baseURL = getBaseURL();
const productsActionArr = [
	{
		icon: "fa fa-shopping-cart",
		url: '',
		click: 'cart',
		type: 'button'
	},
	{
		icon: "far fa-heart",
		url: '',
		click: 'like',
		type: 'button'
	},
	// {
	// 	icon: "fa fa-sync-alt",
	// 	url: '#####',
	// },
	// "fa fa-search",
	// "fa fa-search-plus",
	// {
	// 	icon: "fa fa-images",
	// 	url: 'detail',
	// },
	{
		icon: "fa fa-expand",
		url: "detail",
		click: 'detail',
		type: 'link'
	},
	{
		icon: "fa fa-pen",
		url: "id-product",
		click: 'editProduct',
		type: 'link'
	}
]
const checkproductRating = (productId, productRatingArr) => {
	if (productRatingArr?.length) {
		const found = productRatingArr.find((item) => item.product === productId);
		// console.log({found, productId})
		return found ? true : false;
	}
	return false;
}
const totalNoOfReviewers = (arr) => {
	if (!arr?.length) return 0;

	return arr.reduce((acc, curr) => {
		return acc + (curr.liked ? 1 : 0)
	}, 0);
}
// const productStar = "fa fa-star"
function Products() {
	const [activeProductId, setActiveProductId] = useState(null);
	const hasValue = useRef(false);
	const { handleAddToCart } = useOutletContext();
	const { createLocal, createSession } = useCreateStorage();
	const [productItemArr, setProductItemArr] = useState([]);
	const [isLike, setIsLike] = useState(null);
	const [load, setLoad] = useState(0);
	const [loadingImages, setLoadingImages] = useState({});
	const [categoryArr, setCategoryArr] = useState([]);
	const [pagination, setPagination] = useState({
		prev: null,
		next: null,
		count: null,
		total_pages: null,
	});
	const [productRatingArr, setProductRatingArr] = useState(null);
	const parameters = useParams();
	const deviceType = useDeviceType();
	const isMobile = deviceType.width<=576
	const userInfo = createLocal.getItem('fpng-user');
	const isNotLoggedIn = !userInfo;
	const categoryName = parameters?.productname
	// ?.split('-').join(' ');

	// useEffect(() => {
	// 	sessionStorage.removeItem('fpng-prod'); // to force re-fetch of total users on next login
	// }, []);
	// console.log({userInfo})

	// handles image loading state
	const handleImageLoad = (id) => {
		setLoadingImages(prev => ({ ...prev, [id]: false }));
	};

	const handleImageStart = (id) => {
		setLoadingImages(prev => ({ ...prev, [id]: true }));
	};

	const fetchServerData = async (endpoint="products") => {
		// console.log({endpoint})
		if (!endpoint||(!categoryName&&endpoint?.split('/')?.includes('category'))) return
		if (categoryName&&endpoint?.split('/')?.includes('products')) return
		// console.log(`Fetching data from endpoint: ${endpoint}`);
		const config = {
			method: isLike?'POST':'GET',
			body: isLike?JSON.stringify({
				userId: userInfo.id,
				productId: isLike,
				liked: true,
			}):null,
		}
		// console.log({isLike})
		try {
			const prodRes = await (fetch(`${baseURL}/${endpoint}${endpoint.includes('?')?'':'/'}`,
				{
					...config,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			));
			if (!prodRes.ok) {
				throw new Error("Network response was not ok");
			}
			const prodData = await prodRes.json();
			if (isLike) {
				// console.log('Response from server:', prodData);
				// console.log({productItemArr})
				const prevArr = [...userInfo.product_ratings, prodData]
				createLocal.setItem('fpng-user', {...userInfo, product_ratings: prevArr});
				setProductItemArr(prev=>{
					return prev.map(item => {
						if (item.id===prodData.product) {
							return {
								...item,
								total_liked: item.total_liked + 1,
								total_reviewed: item.total_reviewed + 1,
							}
						}
						return item
					})
				})

				// Update session storage products too
				const sessionProducts = createLocal.getItem('fpng-prod');
				if (sessionProducts) {
					const updatedSession = sessionProducts.map(item => {
						if (item.id === prodData.product) {
							// Replace the existing product with updated data
							return {
								...item,
								total_liked: item.total_liked + 1,
								total_reviewed: item.total_reviewed + 1,
							};
						}
						return item;
					});
					createLocal.setItem('fpng-prod', updatedSession);
					createLocal.setItemRaw('fpng-tprd', updatedSession.length);
				}

				setProductRatingArr(prevArr);
				setIsLike(null);
				return
			}
			// console.log("fetch on mount ...")
			setPagination({
				prev: prodData?.previous,
				next: prodData?.next,
				count: prodData?.count,
				total_pages: prodData?.total_pages,
				load: load,
			});
			setLoad(prev=>prev+1);
			if (categoryName) {
				// console.log('response from server', prodData)
				setCategoryArr(prodData?.results);
			} else {
				setProductItemArr(prodData?.results);
				// check if item exists in session storage, if not or updates available,
				// save/update else pass
				const sessionProducts = createLocal.getItem('fpng-prod'); // already parsed for you

				if (sessionProducts) {
					// console.log('Session products exist, checking for new products to add...');
					// Extract product IDs already in session
					const existingIds = new Set(sessionProducts.map(p => p.id));

					// Filter new products (those not in session)
					const newProducts = prodData.results.filter(p => !existingIds.has(p.id));

					if (newProducts.length > 0) {
						// console.log(`Found ${newProducts.length} new products, updating session...`);
						const updatedSession = [...sessionProducts, ...newProducts];
						createLocal.setItem('fpng-prod', updatedSession);
						createLocal.setItemRaw('fpng-tprd', updatedSession.length);
					}
				} else {
					// First time, just save all
					// console.log('Saving products to session for the first time...');
					// const totalProds = prodData.results.length;
					// console.log({totalProds})
					createLocal.setItem('fpng-prod', prodData.results);
					createLocal.setItemRaw('fpng-tprd', prodData.results.length);
				}
			}
			
			// console.log({sessionProducts, prodData})
			// setProductRatingArr(prodData.product_ratings);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		// console.log("Fetching data from server on mount...");
		fetchServerData();
		// console.log("productItemArr:", productItemArr, productItemArr.length);
	}, []);
	useEffect(() => {
		// console.log("Fetching data from server on mount...");
		fetchServerData(`category/${parameters?.productname}`);
		// console.log("productItemArr:", productItemArr, productItemArr.length);
	}, [parameters?.productname]);
	useEffect(() => {
		// if (isLike) {
		// 	// console.log("Fetching like-product data...");
		// 	fetchServerData(`product-rating/${isLike}`);
		// }
		if (userInfo && isLike) {
			// console.log("Fetching like-product data...");
			// fetchServerData(`product-rating/${isLike}`);
			fetchServerData(`product-rating-create/${userInfo.id}`);
		}
		if (userInfo && !hasValue.current) {
			setProductRatingArr(userInfo.product_ratings);
			hasValue.current = true;
		}
		// console.log("productItemArr:", productItemArr, productItemArr.length);
	}, [isLike, userInfo, hasValue.current]);
	const totalUsers = sessionStorage.getItem('fpng-tot');
	if (totalUsers) parseInt(totalUsers, 10);
	const handlePagination = (page) => {
		// console.log('Pagination to:', page);
		if (!page) return;
		// console.log({page})
		const appEndpoint = categoryName?`category/${categoryName}`:'products';
		fetchServerData(`${appEndpoint}/?page=${page}`);
	}
	const handleProductPrevAddedToCart = (product) => {
		// toast.info('Please login to add products to cart.');
		const cartExist = createLocal.getItemRaw('fpng-cart');
		if (cartExist) {
			const isProductExist = cartExist?.find(item=>item?.prdId===product?.id);
			if (isProductExist) {
				// toast.info(`${titleCase(product.name)} is already in cart.`);
				return true;
			}
		}
		return false;
	}

	// console.log({productItemArr, categoryArr})
	const productArray = categoryName ? categoryArr : productItemArr
	// console.log({productItemArr, pagination})
	// console.log(
	// 	'\nprev:', pagination?.prev,
	// 	'\nnext:', pagination?.next,
	// 	'\ncount:', pagination?.count,
	// 	'\ntotal_pages:', pagination?.total_pages,
	// )
	// console.log({userInfo})
	// console.log('totalUsers:', totalUsers);
	// const editprod = productsActionArr[3].url.split('-').join(' ');
	// console.log({editprod})
	// console.log({productArray})
	// console.log({categoryName})
	return (
		<div className="container-fluid pb-3">
			<h2 className="section-title position-relative text-uppercase mb-4"><span className="bg-secondary pr-3"
			style={{color: '#475569'}}>{categoryName??'Products'}</span></h2>
			{productArray.length ?
				<div className="row">
					{productArray&&productArray.map((productObjItem, index) => {
						// const randomNumber = Math.floor(Math.random() * 6);
						// const no = totalNoOfReviewers(productRatingArr);
						// const numberOfLikes = convertLikesToStars(productObjItem.total_liked, 10)
						// console.log({productObjItem, userInfo})
						// console.log({id:productObjItem.id, productObjItem})
						// console.log('numberOfLikes:', numberOfLikes, productObjItem.id);
						// console.log({randomNumber})
						// console.log({productObjItem})
						const imageLoading = loadingImages[productObjItem?.id]
						const isProductActive = activeProductId === productObjItem.id;
						// console.log({isProductActive, id: productObjItem.id, activeProductId})
						return (
							<div to={"detail"} key={index} className={`col-lg-3 col-md-4 col-sm-6 ${isMobile?'':'pb-1'} mobile-item`}
							style={isMobile ?
								{
									// paddingLeft: 0,
									// paddingRight: 0,
								}:{}}>
								<div className={`${(productObjItem.numberOfItems<1)?'':'product-item'} ${isProductActive ? 'active' : ''} bg-light ${isMobile?'mb-2':'mb-4'}`}
								style={{borderRadius: '10px'}}
								onClick={() => {
									setActiveProductId(prev => prev === productObjItem.id ? null : productObjItem.id);
								}}>
									<div className="product-img position-relative overflow-hidden">
										<>
											{imageLoading && (
											<BouncingDots size="sm" color="#475569" p="8" />)}
											<img
											key={productObjItem.id}
											className={`img-fluid w-100 ${imageLoading?'d-none':'opacy'}`}
											alt={productObjItem.name}
											src={productObjItem?.thumbnail_url_0||productObjItem.image_url_0}
											onLoad={() => handleImageLoad(productObjItem?.id)}
											onError={() => handleImageLoad(productObjItem?.id)} // stop loader on error too
											onLoadStart={() => handleImageStart(productObjItem?.id)}
										/>
										</>

										{/* SOLD Overlay */}
										{((productObjItem.numberOfItems<1)&&!imageLoading) && (
											<div
											style={{
												position: "absolute",
												top: "0",
												left: "0",
												width: "100%",
												height: "100%",
												backgroundColor: "rgba(0,0,0,0.5)", // dim effect
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												color: "white",
												fontSize: "2rem",
												fontWeight: "bold",
												textTransform: "uppercase",
												borderRadius: "10px",
											}}
											>
											SOLD OUT
											</div>
										)}

										{((productObjItem.numberOfItems>=1)&&!imageLoading)&&
										<div className="product-action">
											{productsActionArr.map((action, actionIndex) => {
												// console.log({productObjItem})
												const isPrevLiked = checkproductRating(productObjItem.id, productRatingArr)&&
																	action.click==='like';
												if (isNotLoggedIn&&action.click==='like') return null;
												const isAddedToCart = handleProductPrevAddedToCart(productObjItem)&&
																	action.click==='cart';
												if (isAddedToCart) return null;
												const canEdit = productObjItem?.store?.user?.id===userInfo?.id && userInfo?.is_seller
												// const nl = '\n'
												// console.log({
												// 	canEdit,
												// 	click: action.click,
												// 	url: action.url,
												// 	type: action.type,
												// })

												// enable this when edit product component page is done
												if (!canEdit&&action.click==='editProduct') return null;

												let productActionUrl = action.url;
												if (action.click==='editProduct') {
													productActionUrl = userInfo?.id+'/'+action.url.split('-')[1]
													// productActionUrl = `${userInfo?.id}/${productActionUrl}`;
												}
												// console.log({productActionUrl})

												// console.log({isAddedToCart}, productObjItem.id)
												// console.log({isPrevLiked}, productObjItem.id)
												return (
													<Fragment key={actionIndex}>
														{action.type==='link'?
														<Link
														to={`${productActionUrl}/${productObjItem.id}`}
														style={{
															textDecoration: 'none',
															pointerEvents: isProductActive? 'auto':'none'
														}}
														onClick={(e) => {
															e.stopPropagation(); // prevent parent click from firing
															if (!isProductActive) {
															  e.preventDefault(); // block navigation if inactive
															}
														}}>
															<span className="btn btn-outline-dark btn-square">
																<span className={`${action.icon}`}></span>
															</span>
														</Link>
														:
														<>
															<span
															className={`${isPrevLiked?'d-none':''}`}
															style={{
																textDecoration: 'none',
																pointerEvents: isProductActive? 'auto':'none'
															}}
															onClick={(e)=>{
																e.stopPropagation(); // prevent parent click from firing
																if (!isProductActive) return; // bail out early if inactive
																if (action.click==='cart') {
																	handleAddToCart(productObjItem, 'add');
																} else if (action.click==='like') {
																	setIsLike(productObjItem.id);
																	// toast.info(`${titleCase(productObjItem.name)} Rated`);
																}
															}}>
																<span className="btn btn-outline-dark btn-square">
																	<span className={`${action.icon}`}></span>
																</span>
															</span>
														</>}
													</Fragment>
												)
											})}
										</div>}
									</div>
									<div className="text-center py-4">
										<p className="h6 text-decoration-none text-truncate px-2">{titleCase(productObjItem.name)}</p>
										<div className="d-flex align-items-center justify-content-center mt-2"
										style={{
											display: 'flex',
											flexDirection: 'column'
										}}>
											<div className="d-flex align-items-center justify-content-center">
												<h5>₦{digitSeparator(productObjItem.discountPrice)}</h5>
												{productObjItem.numberOfItems?<sub style={{whiteSpace: 'pre'}}> ({productObjItem.numberOfItems})</sub>:undefined}
											</div>
											<h6 className="text-muted ml-0"
											style={{fontSize: '0.9rem'}}>
												<del>₦{digitSeparator(productObjItem.marketPrice)}</del>
											</h6>
										</div>
										<div className="d-flex flex-column align-items-center justify-content-center mb-1">
											{/* star rating */}
											{totalUsers ?
												(<>
													<StarRating rating={productObjItem.total_liked} maxLikes={totalUsers} />
													{productObjItem.total_reviewed ?
														(<small>
														({convertLikesToStars(productObjItem.total_liked, totalUsers)} from {productObjItem.total_reviewed} like{`${productObjItem.total_reviewed > 1 ? 's' : ''}`})
														</small>)
														: <small>(No review yet)</small>
													}
												</>)
												:
												(<BouncingDots size={"ts"} color={"#475569"} p={"0"} />)
												}
										</div>
									</div>
								</div>
							</div>
						)
					})}
					<div className="col-12">
						<nav>
							<ul className="pagination justify-content-center">
								<Pagination pagination={pagination} onPageChange={handlePagination} />
							</ul>
						</nav>
					</div>
				</div>
				:
				// (isMobile?
				// 	((Array.from({length: 2})).map((_, index) => {
				// 	return (
				// 		<div to={"detail"} key={index} className="col-lg-3 col-md-4 col-sm-6 pb-1"
				// 		style={{paddingLeft: 0,
				// 				paddingRight: 0,}}>
				// 				{(Array.from({length: 4}).map((_, innerIndex) => {
				// 					return (
				// 							<div key={innerIndex} className={`product-item bg-light mb-4`}
				// 							style={{borderRadius: '10px'}}>
				// 								<BouncingDots size={"lg"} color={"#475569"} p={"10"} />
				// 							</div>
				// 				)}))}
				// 		</div>
				// 	)
				// 	}))
				// :
				<BouncingDots size={isMobile?"sm":"lg"} color={"#475569"} p={isMobile?"8":"12"} />
			}
		</div>
	)
}
export { Products };
