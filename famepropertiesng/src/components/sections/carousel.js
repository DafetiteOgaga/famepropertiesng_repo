import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDeviceType } from "../../hooks/deviceType";
import { getBaseUrl } from "../../hooks/baseImgUrl";
import { ProductAdvert } from "./carouselSections/productAdvert";
import { FeatureAdvert } from "./carouselSections/featureAdvert";

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

const getImage = (fileName) => getBaseUrl(`img/${fileName}`);
function Carousel() {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const [carouselSelector, setCarouselSelector] = useState(0);
	const [productSelector, setProductSelector] = useState(0);
	const [featureSelector, setFeatureSelector] = useState(0);
	useEffect(() => {
		const carouselInterval = setInterval(() => {
			setCarouselSelector(prev => (prev + 1) % carouselSelectorArr.length);
		}, 5000); // Change slide every 5 seconds

		const productInterval = setInterval(() => {
			setProductSelector(prev => (prev + 1) % productSelectorArr.length);
		}, 4000); // Change slide every 4 seconds

		const featureInterval = setInterval(() => {
			setFeatureSelector(prev => (prev + 1) % featureSelectorArr.length);
		}, 3500); // Change slide every 3.5 seconds

		return () => {
			clearInterval(carouselInterval);
			clearInterval(productInterval);
			clearInterval(featureInterval);
		}
	}, [])
	// console.log({deviceType})
	// console.log('isMobile:', isMobile);
	return (
		<div className="container-fluid mb-3">
			<div className="row">
				<CarouselAdverts carouselSelector={carouselSelector} productSelector={productSelector} featureSelector={featureSelector} />
				{!isMobile &&
				<div className="col-lg-4">
					<ProductAndFeatureAdverts
						productSelector={productSelector}
						productSelectorArr={productSelectorArr}
						featureSelector={featureSelector}
						featureSelectorArr={featureSelectorArr} />
				</div>}
			</div>
		</div>
	)
}
function ProductAndFeatureAdverts({productSelector, productSelectorArr, featureSelector, featureSelectorArr}) {
	// console.log({productSelector, productSelectorArr})
	return (
		<>
			<ProductAdvert productSelectorArr={productSelectorArr} productSelector={productSelector} />
			<FeatureAdvert featureSelectorArr={featureSelectorArr} featureSelector={featureSelector} />
		</>
	)
}

function CarouselAdverts({carouselSelector, productSelector, featureSelector}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	return (
		<div className="col-lg-8 px-xl-4"
		style={{padding: 0}}>
			<div id="header-carousel" className={`carousel slide carousel-fade ${isMobile?'mb-0':'mb-30'} mb-lg-0`}>
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
						// console.log('image url:', getImage(carouselSelectorArr[carouselSelector].image));
						return (
							<div key={index} className={`carousel-item position-relative ${isActive?'active carousel-item-next':'carousel-item-prev'} carousel-div1`}>
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt={carouselItem.image} src={getImage(
									carouselItem.image
									// 'carousel-1.jpg'
									)}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
									<div className="p-3 carousel-div1-inner">
										<h1 className={`display-4 text-white mb-3 ${isActive?'fadeInDown':''}`}>{carouselItem.heading}</h1>
										<p className={`mx-md-5 px-5 ${isActive?'bounceIn':''}`}>{carouselItem.paragraph}</p>
										{/* button */}
										{/* <span className={`btn btn-outline-light py-2 px-4 mt-3 ${isActive?'fadeInUp':''}`}>{carouselItem.anchor}</span> */}
									</div>
								</div>
								{isMobile &&
								<div className="">
									<ProductAndFeatureAdverts productSelector={productSelector} featureSelector={featureSelector} />
								</div>}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
export { Carousel };
