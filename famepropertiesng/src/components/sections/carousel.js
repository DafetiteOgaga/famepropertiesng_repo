import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDeviceType } from "../../hooks/deviceType";

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
		}, 4000); // Change slide every 5 seconds

		const featureInterval = setInterval(() => {
			setFeatureSelector(prev => (prev + 1) % featureSelectorArr.length);
		}, 3500); // Change slide every 5 seconds

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
											<ProductAdvert productSelector={productSelector} getImage={getImage} />
											<FeatureAdvert featureSelector={featureSelector} getImage={getImage} />
										</div>}
									</div>
								)
							})}
						</div>
					</div>
				</div>
				{!isMobile &&
				<div className="col-lg-4">
					<ProductAdvert productSelector={productSelector} getImage={getImage} />
					<FeatureAdvert featureSelector={featureSelector} getImage={getImage} />
				</div>}
			</div>
		</div>
	)
}
function ProductAdvert({productSelector, getImage}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const isSmallMobile = deviceType.width <= 400
	const isVerySmallMobile = deviceType.width <= 390
	return (
		<>
			{productSelectorArr.map((productItem, index) => {
				const isActive = productSelectorArr[productSelector].index===productItem.index
				const evenIndex = index % 2 === 0;
				return (
					<div key={index} className="product-offer mb-30 carousel-div2"
					style={{
						...{display: isActive?'block':'none'},
						...isMobile?{
							position: 'absolute',
							height: 110,
							width: 170,
							left: isVerySmallMobile?'45%':'55%',
							bottom: '-6%',
							borderTopRightRadius: 0,
							borderBottomLeftRadius: 0,
						}:{}
						}}>
						<img className="img-fluid" alt="" src={getImage(
							productItem.image
							// 'carousel-1.jpg'
							)}/>
						<div className="offer-text">
							<h6 className={`text-white text-uppercase ${isActive?evenIndex?'fadeInLeft':'fadeInRight':''}`}
							style={{fontSize: isVerySmallMobile?'1rem':isSmallMobile?'1.1rem':''}}>{productItem.discount}</h6>
							<h3 className={`text-white mb-3 ${isActive?'bounceInDown':''}`}
							style={{fontSize: isVerySmallMobile?'1rem':isSmallMobile?'1.1rem':''}}>{productItem.paragraph}</h3>
							{/* button */}
							{/* <span className="productbtn btn btn-primary">{productItem.anchor}</span> */}
						</div>
					</div>
				)
			})}
		</>
	)
}
function FeatureAdvert({featureSelector, getImage}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	return (
		<>
			{featureSelectorArr.map((featureItem, index) => {
				const isActive = featureSelectorArr[featureSelector].index===featureItem.index
				const evenIndex = index % 2 === 0;
				return (
					<div key={index} className="product-offer mb-30 carousel-div2"
					style={{
						...{display: isActive?'block':'none'},
						...isMobile?{
							position: 'absolute',
							height: 70,
							width: 120,
							left: '-3%',
							top: '0%',
							borderTopRightRadius: 0,
							borderBottomLeftRadius: 0,
							// backgroundColor: 'rgba(0, 0, 0, 0)',
						}:{}
						}}>
					{/* style={{display: isActive?'block':'none'}}> */}
						{!isMobile &&
						<img className="img-fluid" alt=""
						src={getImage("story-bg-1.jpg")}/>}
						<div className={`d-flex align-items-center ${!isMobile && 'bg-light'} mb-4 feature-div justify-content-center`}
						style={{
							// position: isMobile?'absolute':'',
							flexDirection: 'column',
							}}>
							<span className={`${featureItem.heading} fa-7x ${isActive?evenIndex?'fadeInLeftIcon':'fadeInRightIcon':''} text-white ${isMobile?'mb-1 ml-3':'m-0'} mr-3`}
							style={{
								fontSize: '2rem',
								marginTop: '-1.5rem',
								// color: isMobile?'whitesmoke':''
							}}> </span>
							<h5 className={`font-weight-semi-bold m-0 ${isActive?'bounceInDown':''}`}
							style={{
								zIndex: 1,
								color: '#F8F6F2',
								fontSize: isMobile?'0.7rem':'',
								textWrap: 'nowrap',
								}}>{featureItem.paragraph}</h5>
						</div>
					</div>
				)
			})}
		</>
	)
}
export { Carousel };
