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
import { parse } from '@fortawesome/fontawesome-svg-core';

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
	const hasValue = useRef(false);
	const { handleAddToCart } = useOutletContext();
	const { createLocal } = useCreateStorage();
	const [productItemArr, setProductItemArr] = useState([]);
	const [isLike, setIsLike] = useState(null);
	const [productRatingArr, setProductRatingArr] = useState(null);
	const parameters = useParams();
	const deviceType = useDeviceType();
	const isMobile = deviceType.width<=576
	const userInfo = createLocal.getItem('fpng-user');
	const isNotLoggedIn = !userInfo;
	// console.log({isNotLoggedIn})
	// if (userInfo) {
	// 	setProductRatingArr(userInfo.product_ratings);
	// }
	// console.log('parameters:', parameters);
	const fetchServerData = async (endpoint="products") => {
		// console.log(`Fetching data from endpoint: ${endpoint}`);
		const config = {
			method: isLike?'POST':'GET',
			body: isLike?JSON.stringify({
				userId: userInfo.id,
				productId: isLike,
				liked: true,
			}):null,
		}
		try {
			const prodRes = await (fetch(`${baseURL}/${endpoint}/`,
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
					return prev.map(item=>{
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
				setProductRatingArr(prevArr);
				setIsLike(null);
				return
			}
			// console.log("fetch on mount ...")
			setProductItemArr(prodData);
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
	// console.log({userInfo})
	// console.log('totalUsers:', totalUsers);
	return (
		<div className="container-fluid pb-3">
			<h2 className="section-title position-relative text-uppercase mb-4"><span className="bg-secondary pr-3"
			style={{color: '#475569'}}>{parameters?.productname?parameters.productname:'Products'}</span></h2>
			{productItemArr.length ?
				<div className="row">
					{productItemArr&&productItemArr.map((productObjItem, index) => {
						// const randomNumber = Math.floor(Math.random() * 6);
						// const no = totalNoOfReviewers(productRatingArr);
						// const numberOfLikes = convertLikesToStars(productObjItem.total_liked, 10)
						// console.log({productObjItem})
						// console.log('numberOfLikes:', numberOfLikes, productObjItem.id);
						// console.log({randomNumber})
						return (
							<div to={"detail"} key={index} className="col-lg-3 col-md-4 col-sm-6 pb-1"
							style={isMobile ?
								{
									paddingLeft: 0,
									paddingRight: 0,
								}:{}}>
								<div className={`${productObjItem.sold?'':'product-item'} bg-light mb-4`}
								style={{borderRadius: '10px'}}>
									<div className="product-img position-relative overflow-hidden">
										<img className="img-fluid w-100" alt="" src={
											// getImage(productObjItem, 'img')
											productObjItem.image_url
											}/>

										{/* SOLD Overlay */}
										{productObjItem.sold && (
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

										{!productObjItem.sold&&
										<div className="product-action">
											{productsActionArr.map((action, actionIndex) => {
												// console.log({productObjItem})
												const isPrevLiked = checkproductRating(productObjItem.id, productRatingArr)&&
																	action.click==='like';
												if (isNotLoggedIn&&action.click==='like') return null;
												// console.log({isPrevLiked}, productObjItem.id)
												return (
													<Fragment key={actionIndex}>
														{action.type==='link'?
														<Link
														to={`${action.url}/${productObjItem.id}`}
														style={{textDecoration: 'none'}}>
															<span className="btn btn-outline-dark btn-square">
																<span className={`${action.icon}`}></span>
															</span>
														</Link>
														:
														<>
															<span
															className={`${isPrevLiked?'d-none':''}`}
															onClick={()=>{
																if (action.click==='cart') {
																	handleAddToCart(productObjItem);
																} else if (action.click==='like') {
																	setIsLike(productObjItem.id);
																	// toast.info(`${titleCase(productObjItem.name)} Rated`);
																}
															}}
															style={{textDecoration: 'none'}}>
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
											<h5>₦{digitSeparator(productObjItem.discountPrice)}</h5>
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
								<li className="page-item disabled"><a className="page-link" href="##"><span>Previous</span></a></li>
								<li className="page-item active"><a className="page-link" href="##">1</a></li>
								<li className="page-item"><a className="page-link" href="##">2</a></li>
								<li className="page-item"><a className="page-link" href="##">3</a></li>
								<li className="page-item"><a className="page-link" href="##">Next</a></li>
							</ul>
						</nav>
					</div>
				</div>
				:
				(isMobile?
					((Array.from({length: 2})).map((_, index) => {
					return (
						<div to={"detail"} key={index} className="col-lg-3 col-md-4 col-sm-6 pb-1"
						style={{paddingLeft: 0,
								paddingRight: 0,}}>
								{(Array.from({length: 4}).map((_, innerIndex) => {
									return (
											<div key={innerIndex} className={`product-item bg-light mb-4`}
											style={{borderRadius: '10px'}}>
												<BouncingDots size={"lg"} color={"#475569"} p={"10"} />
											</div>
								)}))}
						</div>
					)
					}))
				:
				<BouncingDots size={"lg"} color={"#475569"} p={"12"} />)
			}
		</div>
	)
}
export { Products };
