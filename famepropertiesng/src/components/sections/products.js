import { act } from "react"

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
	"fa fa-shopping-cart",
	"far fa-heart",
	"fa fa-sync-alt",
	"fa fa-search",
]
const productStar = "fa fa-star"
function Products({getImage}) {
	// console.log('product component rendered')
	return (
		<div className="pb-3">
			<h2 className="section-title position-relative text-uppercase mb-4"><span className="bg-secondary pr-3">Products</span></h2>
			<div className="row">
				{productImagesArr.map((productImage, index) => {
					const randomNumber = Math.floor(Math.random() * 6);
					// console.log({randoNumer})
					return (
						<div key={index} className="col-lg-3 col-md-4 col-sm-6 pb-1">
							<div className="product-item bg-light mb-4"
							style={{borderRadius: '10px'}}>
								<div className="product-img position-relative overflow-hidden">
									<img className="img-fluid w-100" alt="" src={getImage(productImage)}/>
									<div className="product-action">
										{productsActionArr.map((action, actionIndex) => {
											return (
												<span key={actionIndex} className="btn btn-outline-dark btn-square"><span className={`${action}`}></span></span>
											)
										})}
									</div>
								</div>
								<div className="text-center py-4">
									<a className="h6 text-decoration-none text-truncate" href="##">Product Name Goes Here</a>
									<div className="d-flex align-items-center justify-content-center mt-2">
										<h5>$123.00</h5><h6 className="text-muted ml-2"><del>$123.00</del></h6>
									</div>
									<div className="d-flex align-items-center justify-content-center mb-1">
										{Array.from({length: 5}, (_, starIndex) => {
											const isStar = starIndex <= randomNumber;
											// console.log({isStar}, {starIndex}, {randomNumber})
											return (
												<small
												key={starIndex}
												className={`${productStar} ${isStar?'text-warning':'text-secondary'} mr-1`}></small>
											)
										})}
										<small>(99)</small>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
export { Products };
