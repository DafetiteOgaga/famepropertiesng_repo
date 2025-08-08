import { Link, useParams } from 'react-router-dom';

const productImagesArr = [
	"product-1.jpg",
	"product-2.jpg",
	"product-3.jpg",
	"product-4.jpg",
	"product-5.jpg",
	"product-6.jpg",
	"product-7.jpg",
	"product-8.jpg",
	"product-3.jpg",
	"product-4.jpg",
	"product-5.jpg",
	"product-6.jpg",
]
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
const images = require.context('../../images/img', false, /\.(png|jpe?g|svg)$/);
const getProductImage = (name) => (images(`./${name}`))
function Products({getImage = getProductImage}) {
	const parameters = useParams();
	// console.log('parameters:', parameters);
	// console.log('product component rendered')
	return (
		<div className="container-fluid pb-3">
			<h2 className="section-title position-relative text-uppercase mb-4"><span className="bg-secondary pr-3"
			style={{color: '#475569'}}>{parameters?.productname?parameters.productname:'Products'}</span></h2>
			<div className="row">
				{productImagesArr.map((productImage, index) => {
					const randomNumber = Math.floor(Math.random() * 6);
					// console.log({randomNumber})
					return (
						<div to={"detail"} key={index} className="col-lg-3 col-md-4 col-sm-6 pb-1">
							<div className="product-item bg-light mb-4"
							style={{borderRadius: '10px'}}>
								<div className="product-img position-relative overflow-hidden">
									<img className="img-fluid w-100" alt="" src={getImage(productImage)}/>
									<div className="product-action">
										{productsActionArr.map((action, actionIndex) => {
											return (
												<Link to={action.url} key={actionIndex}
												style={{textDecoration: 'none'}}>
													<span className="btn btn-outline-dark btn-square"><span className={`${action.icon}`}></span></span>
												</Link>
											)
										})}
									</div>
								</div>
								<div className="text-center py-4">
									<p className="h6 text-decoration-none text-truncate">Product Name Goes Here</p>
									<div className="d-flex align-items-center justify-content-center mt-2">
										<h5>₦123.00</h5><h6 className="text-muted ml-2"><del>₦123.00</del></h6>
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
										<small>(99)</small>
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
		</div>
	)
}
export { Products };
