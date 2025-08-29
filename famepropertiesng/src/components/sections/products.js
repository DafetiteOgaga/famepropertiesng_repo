import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDeviceType } from '../../hooks/deviceType';
import { getImage } from '../../hooks/baseImgUrl';
import { digitSeparator, titleCase } from '../../hooks/changeCase';
import { getBaseURL } from '../../hooks/fetchAPIs';
import { useCreateStorage } from '../../hooks/setupLocalStorage';

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
	},
	{
		icon: "far fa-heart",
		url: '',
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
	}
]
const productStar = "fa fa-star"
function Products() {
	const { createLocal } = useCreateStorage();
	const [productItemArr, setProductItemArr] = useState([]);
	const parameters = useParams();
	const deviceType = useDeviceType();
	// console.log('parameters:', parameters);
	const fetchServerData = async () => {
		try {
			const prodRes = await (fetch(`${baseURL}/products/`));
			if (!prodRes.ok) {
				throw new Error("Network response was not ok");
			}
			const prodData = await prodRes.json();
			setProductItemArr(prodData);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		// console.log("Fetching server data...");
		fetchServerData();
		// console.log("productItemArr:", productItemArr, productItemArr.length);
	}, []);
	// if (productItemArr.length) console.log("productItemArr:", productItemArr, productItemArr.length);
	// if (productItemArr.length) console.log("last item:", productItemArr[productItemArr.length-1]);
	// console.log('product component rendered')
	// createLocal.setItem('fpng-product-str', 'products');
	// createLocal.setItem('fpng-product-arr', ['one', 'two', 'three']);
	// createLocal.setItem('fpng-product-obj', {name: 'Product One', price: 1000});
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
							style={deviceType.width<=576 ?
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
												return (
													<Link to={`${action.url}/${productObjItem.id}`} key={actionIndex}
													style={{textDecoration: 'none'}}>
														<span className="btn btn-outline-dark btn-square"><span className={`${action.icon}`}></span></span>
													</Link>
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
										<div className="d-flex align-items-center justify-content-center mb-1">
											{Array.from({length: 5}, (_, starIndex) => {
												const isStar = (starIndex+1) <= randomNumber;
												const halfStar = randomNumber%2!==0&&(starIndex+1)===randomNumber
												// console.log({isStar}, {starIndex}, {randomNumber})
												return (
													<small
													key={starIndex}
													className={`${productStar}${(halfStar?'-half-alt':'')} ${isStar?'text-warning':'text-secondary'} mr-1`}></small>
												)
											})}
											<small>({productObjItem.noOfReviewers})</small>
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
			undefined}
		</div>
	)
}
export { Products };
