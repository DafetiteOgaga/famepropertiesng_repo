import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const carouselSelectorArr = [
	{
		index: 0,
		image: "carousel-1.jpg",
		heading: "Men Fashion",
		paragraph: `Lorem rebum magna amet lorem magna erat diam stet.
					Sadips duo stet amet amet ndiam elitr ipsum diam`,
		anchor: "Shop Now",
	},
	{
		index: 1,
		image: "carousel-2.jpg",
		heading: "Women Fashion",
		paragraph: `Lorem rebum magna amet lorem magna erat diam stet.
					Sadips duo stet amet amet ndiam elitr ipsum diam`,
		anchor: "Shop Now",
	},
	{
		index: 2,
		image: "carousel-3.jpg",
		heading: "Kids Fashion",
		paragraph: `Lorem rebum magna amet lorem magna erat diam stet.
					Sadips duo stet amet amet ndiam elitr ipsum diam`,
		anchor: "Shop Now",
	},
];
const productSelectorArr = [
	{
		index: 0,
		image: "offer-1.jpg",
		discount: "Save 40%",
		paragraph: `Special Offer`,
		anchor: "Shop Now",
	},
	{
		index: 1,
		image: "offer-2.jpg",
		discount: "Save 50%",
		paragraph: `Special Offer`,
		anchor: "Shop Now",
	},
];
const featureSelectorArr = [
	{
		index: 0,
		image: "offer-1.jpg",
		heading: "fa fa-check",
		paragraph: `Quality Product`,
		// anchor: "Shop Now",
	},
	{
		index: 1,
		image: "offer-2.jpg",
		heading: "fa fa-shipping-fast",
		paragraph: `Free Shipping`,
		// anchor: "Shop Now",
	},
	{
		index: 2,
		image: "offer-1.jpg",
		heading: "fas fa-exchange-alt",
		paragraph: `7-Days Return`,
		// anchor: "Shop Now",
	},
	{
		index: 3,
		image: "offer-2.jpg",
		heading: "fa fa-phone-volume",
		paragraph: `24/7 Support`,
		// anchor: "Shop Now",
	},
];
function Carousel({getImage}) {
	const [carouselSelector, setCarouselSelector] = useState(0);
	const [productSelector, setProductSelector] = useState(0);
	const [featureSelector, setFeatureSelector] = useState(0);
	useEffect(() => {
		const carouselInterval = setInterval(() => {
			setCarouselSelector(prev => (prev + 1) % carouselSelectorArr.length);
		}, 5000); // Change slide every 5 seconds

		const productInterval = setInterval(() => {
			setProductSelector(prev => (prev + 1) % productSelectorArr.length);
		}, 4000); // Change slide every 5 seconds

		const featureInterval = setInterval(() => {
			setFeatureSelector(prev => (prev + 1) % featureSelectorArr.length);
		}, 5000); // Change slide every 5 seconds

		return () => {
			clearInterval(carouselInterval);
			clearInterval(productInterval);
			clearInterval(featureInterval);
		}
	}, [])
	return (
		<div className="container-fluid mb-3">
			<div className="row px-xl-5">
				<div className="col-lg-8">
					<div id="header-carousel" className="carousel slide carousel-fade mb-30 mb-lg-0">
						<ol className="carousel-indicators">
							{carouselSelectorArr.map((caroSelector, index) => {
								const isActive = carouselSelectorArr[carouselSelector].index===index
								return (
									<li key={index} className={isActive?'active':''}>{caroSelector.index}</li>
								)
							})}
						</ol>
						<div className="carousel-inner">
							{carouselSelectorArr.map((carouselItem, index) => {
								const isActive = carouselSelectorArr[carouselSelector].index===carouselItem.index
								return (
									<div key={index} className={`carousel-item position-relative ${isActive?'active carousel-item-next':'carousel-item-prev'} carousel-div1`}>
										<img className="position-absolute w-100 h-100 carousel-div1-image" alt={carouselItem.image} src={getImage(carouselItem.image)}/>
										<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
											<div className="p-3 carousel-div1-inner">
												<h1 className={`display-4 text-white mb-3 ${isActive?'fadeInDown':''}`}>{carouselItem.heading}</h1>
												<p className={`mx-md-5 px-5 ${isActive?'bounceIn':''}`}>{carouselItem.paragraph}</p>
												<span className={`btn btn-outline-light py-2 px-4 mt-3 ${isActive?'fadeInUp':''}`}>{carouselItem.anchor}</span>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</div>
				<div className="col-lg-4">
				{productSelectorArr.map((productItem, index) => {
					const isActive = productSelectorArr[productSelector].index===productItem.index
					const evenIndex = index % 2 === 0;
					return (
						<div key={index} className="product-offer mb-30 carousel-div2"
						style={{display: isActive?'block':'none'}}>
							<img className="img-fluid" alt="" src={getImage(productItem.image)}/>
							<div className="offer-text">
								<h6 className={`text-white text-uppercase ${isActive?evenIndex?'fadeInLeft':'fadeInRight':''}`}>{productItem.discount}</h6>
								<h3 className={`text-white mb-3 ${isActive?'bounceInDown':''}`}>{productItem.paragraph}</h3>
								<span className="btn btn-primary">{productItem.anchor}</span>
							</div>
						</div>
					)
				})}

				{featureSelectorArr.map((featureItem, index) => {
					const isActive = featureSelectorArr[featureSelector].index===featureItem.index
					const evenIndex = index % 2 === 0;
					return (
						<div key={index} className="product-offer mb-30 carousel-div2"
						style={{display: isActive?'block':'none'}}>
							<img className="img-fluid" alt=""
							src={getImage("offer-1.jpg")}/>
							<div className="d-flex align-items-center bg-light mb-4 feature-div justify-content-center"
							style={{flexDirection: 'column'}}>
								<span className={`${featureItem.heading} fa-7x ${isActive?evenIndex?'fadeInLeftIcon':'fadeInRightIcon':''} text-primary m-0 mr-3`}> </span>
								<h5 className={`font-weight-semi-bold m-0 ${isActive?'bounceInDown':''}`}
								style={{zIndex: 1, color: '#F8F6F2'}}>{featureItem.paragraph}</h5>
							</div>
						</div>
					)
				})}
				</div>
			</div>
		</div>
	)
}
export { Carousel };
