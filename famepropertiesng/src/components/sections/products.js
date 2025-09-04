import { useState, useEffect, Fragment } from 'react';
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

const baseURL = getBaseURL();
// const produc8tImagesArr = [
// 	"product-1.jpg",
// 	"product-2.jpg",
// 	"product-3.jpg",
// 	"product-4.jpg",
// 	"product-5.jpg",
// 	"product-6.jpg",
// 	"product-7.jpg",
// 	"product-8.jpg",
// 	"product-3.jpg",
// 	"product-4.jpg",
// 	"product-5.jpg",
// 	"product-6.jpg",
// ]
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
const productStar = "fa fa-star"
function Products() {
	const { handleAddToCart } = useOutletContext();
	const { createLocal } = useCreateStorage();
	const [productItemArr, setProductItemArr] = useState([]);
	const [isLike, setIsLike] = useState(null);
	const parameters = useParams();
	const deviceType = useDeviceType();
	const isMobile = deviceType.width<=576
	// console.log('parameters:', parameters);
	const fetchServerData = async (endpoint="products") => {
		// console.log(`Fetching data from endpoint: ${endpoint}`);
		try {
			const prodRes = await (fetch(`${baseURL}/${endpoint}/`));
			if (!prodRes.ok) {
				throw new Error("Network response was not ok");
			}
			const prodData = await prodRes.json();
			if (isLike) {
				// console.log('Response from server:', prodData);
				// console.log({productItemArr})
				const prevArr = productItemArr?.map((item) => {
					if (item.id === prodData.id) {
						return { ...item, noOfReviewers: prodData.noOfReviewers };
					}
					return item;
				});
				setProductItemArr(prevArr);
				setIsLike(null);
				return
			}
			// console.log("fetch on mount ...")
			setProductItemArr(prodData);
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
		if (isLike) {
			// console.log("Fetching like-product data...");
			fetchServerData(`like-product/${isLike}`);
		}
		// console.log("productItemArr:", productItemArr, productItemArr.length);
	}, [isLike]);
	// if (productItemArr.length) console.log("productItemArr:", productItemArr, productItemArr.length);
	// if (productItemArr.length) console.log("last item:", productItemArr[productItemArr.length-1]);
	// console.log('product component rendered')
	// createLocal.setItem('fpng-product-str', 'products');
	// createLocal.setItem('fpng-product-arr', ['one', 'two', 'three']);
	// createLocal.setItem('fpng-product-obj', {name: 'Product One', price: 1000});
	// const handleAddToCart = (product) => {
	// 	// Retrieve existing cart from localStorage
	// 	const existingCart = createLocal.getItemRaw('fpng-cart');
	// 	let cart = existingCart??[];

	// 	// Check if product already exists in cart
	// 	const isProductExist = cart.find(item => item.prdId === product.id);
	// 	const productIndex = cart.findIndex(item => item.prdId === product.id);
	// 	if (isProductExist) {
	// 		// If it exists, increment the quantity
	// 		cart[productIndex].nop += 1;
	// 	} else {
	// 		// If it doesn't exist, add it with quantity 1
	// 		cart.push({ prdId: product.id, nop: 1 });
	// 	}

	// 	// Save updated cart back to localStorage
	// 	createLocal.setItemRaw('fpng-cart', cart);
	// 	toast.success(`${product.name} has been added to your cart.`);
	// 	// Optionally, you can provide feedback to the user
	// 	// alert(`${product.name} has been added to your cart.`);
	// }
	return (
		<div className="container-fluid pb-3">
			<h2 className="section-title position-relative text-uppercase mb-4"><span className="bg-secondary pr-3"
			style={{color: '#475569'}}>{parameters?.productname?parameters.productname:'Products'}</span></h2>
			{productItemArr.length ?
				<div className="row">
					{productItemArr&&productItemArr.map((productObjItem, index) => {
						const randomNumber = Math.floor(Math.random() * 6);
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
														<span
														onClick={()=>{
															if (action.click==='cart') {
																handleAddToCart(productObjItem);
															} else if (action.click==='like') {
																setIsLike(productObjItem.id);
																toast.info(`${titleCase(productObjItem.name)} Rated`);
															}
														}}
														style={{textDecoration: 'none'}}>
															<span className="btn btn-outline-dark btn-square">
																<span className={`${action.icon}`}></span>
															</span>
														</span>}
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
											<StarRating rating={productObjItem.noOfReviewers} />
											{/* {Array.from({length: 5}, (_, starIndex) => {
												const isStar = (starIndex+1) <= randomNumber;
												const halfStar = randomNumber%2!==0&&(starIndex+1)===randomNumber
												// console.log({isStar}, {starIndex}, {randomNumber})
												return (
													<Fragment key={starIndex}>
														<StarRating rating={productObjItem.noOfReviewers} />
													</Fragment>
													// <small
													// key={starIndex}
													// className={`${productStar}${(halfStar?'-half-alt':'')} ${isStar?'text-warning':'text-secondary'} mr-1`}></small>
												)
											})} */}
											<small>({convertLikesToStars(productObjItem.noOfReviewers)} from {productObjItem.noOfReviewers} likes)</small>
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
