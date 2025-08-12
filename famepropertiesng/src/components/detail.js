import { Fragment, useState } from "react";
import { Breadcrumb } from "./sections/breadcrumb";
import { Link } from 'react-router-dom';
import { useDeviceType } from "../hooks/deviceType";
import { getBaseUrl } from "../hooks/baseImgUrl";

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
const productStar = "fa fa-star"
// const images = require.context('../images/img', false, /\.(png|jpe?g|svg)$/);
// const getImage = (name) => (images(`./${name}`)) // to get a specific image by name
const getImage = (fileName) => getBaseUrl(`img/${fileName}`);
function Detail() {
	// const [qInput, setQInput] = useState('');
	const deviceType = useDeviceType().width <= 576;
	const [selectedTab, setSelectecTab] = useState('description');
	const [isNext, setIsNext] = useState(0)
	const [quantity, setQuantity] = useState(1);
	const handleImageTransition = (mode) => {
		if (mode === '+') {
			setIsNext(prev => prev < (productImagesArr.length-1) ? prev + 1 : productImagesArr.length - 1)
		} else if (mode === '-') {
			setIsNext(prev => prev > 1?(prev - 1): 0)
		}
	}
	const handleQInputChange = (e) => {
		e.preventDefault();
		const value = e.target.value;
		// setQInput(value);
		setQuantity(value ? parseInt(value, 10) : 0) // Ensure it's a number
	}
	const handleQuantityChange = (mode) => {
		if (mode === '+') {
			setQuantity(prev => prev + 1)
		} else if (mode === '-') {
			setQuantity(prev => prev > 1?(prev - 1): 1)
		}
	}
	const image = productImagesArr[isNext]
	const randomNumber = Math.floor(Math.random() * 6);
	// console.log({selectedTab})
	return (
		<>
			<Breadcrumb page={'Product'} />

			{/* <!-- Shop Detail Start --> */}
			<div className="container-fluid pb-5"style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}>
				<div className="row px-xl-5">
					<div className="col-lg-5 mb-30">
						<div  className="carousel slide">
							<div className="carousel-inner bg-light">
								<div className="carousel-item active">
									<img className="w-100 h-100" src={getImage(image)} alt={image}/>
								</div>
							</div>
							<span className="carousel-control-prev"
							onClick={()=>handleImageTransition('-')}>
								<span className="fa fa-2x fa-angle-left text-dark"></span>
							</span>
							<span className="carousel-control-next"
							onClick={()=>handleImageTransition('+')}>
								<span className="fa fa-2x fa-angle-right text-dark"></span>
							</span>
						</div>
					</div>

					<div className={`col-lg-7 h-auto mb-30`}>
						<div className={`h-100 bg-light ${deviceType?'':'p-30'}`}
						style={{
							borderRadius: '10px',
							padding: deviceType ? '15px 10px' : '',
						}}>
							<h3
							style={{color: '#475569'}}>Product Name Goes Here</h3>
							<div className="d-flex mb-3">
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
									{/* <small className="fas fa-star"></small>
									<small className="fas fa-star"></small>
									<small className="fas fa-star"></small>
									<small className="fas fa-star-half-alt"></small>
									<small className="far fa-star"></small> */}
								</div>
								<small className="pt-1">(99 Reviews)</small>
							</div>
							<h3 className="font-weight-semi-bold mb-4"
							style={{color: '#475569'}}>₦150.00</h3>
							<p className="mb-4">Volup erat ipsum diam elitr rebum et dolor. Est nonumy elitr erat diam stet sit
								clita ea. Sanc ipsum et, labore clita lorem magna duo dolor no sea
								Nonumy</p>
							{/* <div className="d-flex mb-3">
								<strong className="text-dark mr-3">Sizes:</strong>
								<form>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="size-1" name="size"/>
										<label className="custom-control-label" htmlFor="size-1">XS</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="size-2" name="size"/>
										<label className="custom-control-label" htmlFor="size-2">S</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="size-3" name="size"/>
										<label className="custom-control-label" htmlFor="size-3">M</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="size-4" name="size"/>
										<label className="custom-control-label" htmlFor="size-4">L</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="size-5" name="size"/>
										<label className="custom-control-label" htmlFor="size-5">XL</label>
									</div>
								</form>
							</div> */}
							{/* <div className="d-flex mb-4">
								<strong className="text-dark mr-3">Colors:</strong>
								<form>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="color-1" name="color"/>
										<label className="custom-control-label" htmlFor="color-1">Black</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="color-2" name="color"/>
										<label className="custom-control-label" htmlFor="color-2">White</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="color-3" name="color"/>
										<label className="custom-control-label" htmlFor="color-3">Red</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="color-4" name="color"/>
										<label className="custom-control-label" htmlFor="color-4">Blue</label>
									</div>
									<div className="custom-control custom-radio custom-control-inline">
										<input type="radio" className="custom-control-input" id="color-5" name="color"/>
										<label className="custom-control-label" htmlFor="color-5">Green</label>
									</div>
								</form>
							</div> */}
							<div className="d-flex align-items-center mb-4 pt-2">
								<div className="input-group quantity mr-3 detail-div-div1">
									<div className="input-group-btn">
										<button className="btn btn-primary btn-minus"
										onClick={()=>handleQuantityChange('-')}>
											<span className="fa fa-minus"></span>
										</button>
									</div>
									<input
									type="text"
									className="form-control bg-secondary border-0 text-center"
									onChange={(e)=>handleQInputChange(e)}
									value={quantity}/>
									<div className="input-group-btn">
										<button className="btn btn-primary btn-plus"
										onClick={()=>handleQuantityChange('+')}>
											<span className="fa fa-plus"></span>
										</button>
									</div>
								</div>
								<button className="btn btn-primary px-3"><i className="fa fa-shopping-cart mr-1"></i> Add To
									Cart</button>
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
									{/* <a className="text-dark px-2" href="##">
										<i className="fab fa-facebook-f"></i>
									</a>
									<a className="text-dark px-2" href="##">
										<i className="fab fa-twitter"></i>
									</a>
									<a className="text-dark px-2" href="##">
										<i className="fab fa-linkedin-in"></i>
									</a>
									<a className="text-dark px-2" href="##">
										<i className="fab fa-pinterest"></i>
									</a> */}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="row px-xl-5">
					<div className="col">
						<div className={`bg-light ${!deviceType && 'p-30'}`}
						style={{
							borderRadius: '10px',
							padding: deviceType ? '15px 10px' : '',
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
											padding: deviceType ? '5px 8px' : '',
										}}
										className={`nav-item nav-link text-dark ${isActive?'active':''}`}>{tab.title}</span>
									)
								})}
								{/* <span className="nav-item nav-link text-dark active">Description</span>
								<span className="nav-item nav-link text-dark">Information</span>
								<span className="nav-item nav-link text-dark">Reviews (0)</span> */}
							</div>
							<div className="">
								{tabPane.map((comp, index) => {
									// console.log("comp.title.toLowerCase() === selectedTab:", comp.title.toLowerCase() === selectedTab)
									return (
									<Fragment key={index}>
										{comp.title.toLowerCase() === selectedTab && <comp.component />}
									</Fragment>
								)})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

function ProductDescription() {
	return (
		<div className="tab-pane show active" id="tab-pane-1">
			<h4 className="mb-3">Product Description</h4>
			<p>Eos no lorem eirmod diam diam, eos elitr et gubergren diam sea. Consetetur vero aliquyam invidunt duo dolores et duo sit. Vero diam ea vero et dolore rebum, dolor rebum eirmod consetetur invidunt sed sed et, lorem duo et eos elitr, sadipscing kasd ipsum rebum diam. Dolore diam stet rebum sed tempor kasd eirmod. Takimata kasd ipsum accusam sadipscing, eos dolores sit no ut diam consetetur duo justo est, sit sanctus diam tempor aliquyam eirmod nonumy rebum dolor accusam, ipsum kasd eos consetetur at sit rebum, diam kasd invidunt tempor lorem, ipsum lorem elitr sanctus eirmod takimata dolor ea invidunt.</p>
			<p>Dolore magna est eirmod sanctus dolor, amet diam et eirmod et ipsum. Amet dolore tempor consetetur sed lorem dolor sit lorem tempor. Gubergren amet amet labore sadipscing clita clita diam clita. Sea amet et sed ipsum lorem elitr et, amet et labore voluptua sit rebum. Ea erat sed et diam takimata sed justo. Magna takimata justo et amet magna et.</p>
		</div>
	)
}
function ProductInformation() {
	return (
		<div className="tab-pane" id="tab-pane-2">
			<h4 className="mb-3">Additional Information</h4>
			<p>Eos no lorem eirmod diam diam, eos elitr et gubergren diam sea. Consetetur vero aliquyam invidunt duo dolores et duo sit. Vero diam ea vero et dolore rebum, dolor rebum eirmod consetetur invidunt sed sed et, lorem duo et eos elitr, sadipscing kasd ipsum rebum diam. Dolore diam stet rebum sed tempor kasd eirmod. Takimata kasd ipsum accusam sadipscing, eos dolores sit no ut diam consetetur duo justo est, sit sanctus diam tempor aliquyam eirmod nonumy rebum dolor accusam, ipsum kasd eos consetetur at sit rebum, diam kasd invidunt tempor lorem, ipsum lorem elitr sanctus eirmod takimata dolor ea invidunt.</p>
			<div className="row">
				<div className="col-md-6">
					<ul className="list-group list-group-flush">
						<li className="list-group-item px-0">
							Sit erat duo lorem duo ea consetetur, et eirmod takimata.
						</li>
						<li className="list-group-item px-0">
							Amet kasd gubergren sit sanctus et lorem eos sadipscing at.
						</li>
						<li className="list-group-item px-0">
							Duo amet accusam eirmod nonumy stet et et stet eirmod.
						</li>
						<li className="list-group-item px-0">
							Takimata ea clita labore amet ipsum erat justo voluptua. Nonumy.
						</li>
					</ul>
				</div>
				<div className="col-md-6">
					<ul className="list-group list-group-flush">
						<li className="list-group-item px-0">
							Sit erat duo lorem duo ea consetetur, et eirmod takimata.
						</li>
						<li className="list-group-item px-0">
							Amet kasd gubergren sit sanctus et lorem eos sadipscing at.
						</li>
						<li className="list-group-item px-0">
							Duo amet accusam eirmod nonumy stet et et stet eirmod.
						</li>
						<li className="list-group-item px-0">
							Takimata ea clita labore amet ipsum erat justo voluptua. Nonumy.
						</li>
					</ul>
				</div>
			</div>
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
						<img src={getImage("user.jpg")} alt="" className="img-fluid mr-3 mt-1 detail-div-div2"/>
						<div className="media-body">
							<h6>John Doe<small> - <i>01 Jan 2045</i></small></h6>
							<div className="text-primary mb-2">
								<i className="fas fa-star"></i>
								<i className="fas fa-star"></i>
								<i className="fas fa-star"></i>
								<i className="fas fa-star-half-alt"></i>
								<i className="far fa-star"></i>
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
							<i className="far fa-star"></i>
							<i className="far fa-star"></i>
							<i className="far fa-star"></i>
							<i className="far fa-star"></i>
							<i className="far fa-star"></i>
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
							<input type="submit" value="Leave Your Review" className="btn btn-primary px-3"/>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
export { Detail };
