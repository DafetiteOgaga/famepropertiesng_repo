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
		heading: "Save 20%",
		paragraph: `Special Offer`,
		anchor: "Shop Now",
	},
	{
		index: 1,
		image: "offer-2.jpg",
		heading: "Save 20%",
		paragraph: `Special Offer`,
		anchor: "Shop Now",
	},
];
function Carousel({getImage}) {
	const [carouselSelector, setCarouselSelector] = useState(0);
	useEffect(() => {
		const carouselInterval = setInterval(() => {
			setCarouselSelector(prev => (prev + 1) % carouselSelectorArr.length);
			// setCarouselImage(getImage(imageArr[(carouselSelector + 1) % carouselSelectorArr.length]));
		}, 5000); // Change slide every 5 seconds

		return () => clearInterval(carouselInterval); // Clear interval on component unmount
	}, [])
	// console.log({carouselSelector})
	// console.log('image:', imageArr[carouselSelector])
	// console.log('getImage:', getImage(imageArr[carouselSelector]))
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
							{/* <li data-target="#header-carousel" data-slide-to="0" className="active"></li>
							<li data-target="#header-carousel" data-slide-to="1"></li>
							<li data-target="#header-carousel" data-slide-to="2"></li> */}
						</ol>
						<div className="carousel-inner">
							{carouselSelectorArr.map((carouselItem, index) => {
								// console.log({index})
								// console.log('carouselSelectorArr[carouselSelector]:', carouselSelectorArr[carouselSelector])
								// console.log('carouselSelectorArr[carouselSelector].index:', carouselSelectorArr[carouselSelector].index)
								// console.log({_})
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
							{/* <div className="carousel-item position-relative active carousel-div1">
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt="" src={getImage("carousel-1.jpg")}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
									<div className="p-3 carousel-div1-inner">
										<h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Men Fashion</h1>
										<p className="mx-md-5 px-5 animate__animated animate__bounceIn">Lorem rebum magna amet lorem magna erat diam stet. Sadips duo stet amet amet ndiam elitr ipsum diam</p>
										<a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="##">Shop Now</a>
									</div>
								</div>
							</div> */}
							{/* <div className="carousel-item position-relative carousel-div1">
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt="" src={getImage("carousel-2.jpg")}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
									<div className="p-3 carousel-div1-inner">
										<h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Women Fashion</h1>
										<p className="mx-md-5 px-5 animate__animated animate__bounceIn">Lorem rebum magna amet lorem magna erat diam stet. Sadips duo stet amet amet ndiam elitr ipsum diam</p>
										<a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="##">Shop Now</a>
									</div>
								</div>
							</div> */}
							{/* <div className="carousel-item position-relative carousel-div1">
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt="" src={getImage("carousel-3.jpg")}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
									<div className="p-3 carousel-div1-inner">
										<h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Kids Fashion</h1>
										<p className="mx-md-5 px-5 animate__animated animate__bounceIn">Lorem rebum magna amet lorem magna erat diam stet. Sadips duo stet amet amet ndiam elitr ipsum diam</p>
										<a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="##">Shop Now</a>
									</div>
								</div>
							</div> */}
						</div>
					</div>
				</div>
				<div className="col-lg-4">
					{productSelectorArr.map((productSlector, index) => {
						return (
							<div className="product-offer mb-30 carousel-div2">
								<img className="img-fluid" alt="" src={getImage(productSlector.image)}/>
								<div className="offer-text">
									<h6 className="text-white text-uppercase">{productSlector.heading}</h6>
									<h3 className="text-white mb-3">{productSlector.paragraph}</h3>
									<span className="btn btn-primary">{productSlector.anchor}</span>
								</div>
							</div>
						)
					})}
					{/* <div className="product-offer mb-30 carousel-div2">
						<img className="img-fluid" alt="" src={getImage("offer-1.jpg")}/>
						<div className="offer-text">
							<h6 className="text-white text-uppercase">Save 20%</h6>
							<h3 className="text-white mb-3">Special Offer</h3>
							<a href="##" className="btn btn-primary">Shop Now</a>
						</div>
					</div> */}
					{/* <div className="product-offer mb-30 carousel-div2">
						<img className="img-fluid" alt="" src={getImage("offer-2.jpg")}/>
						<div className="offer-text">
							<h6 className="text-white text-uppercase">Save 20%</h6>
							<h3 className="text-white mb-3">Special Offer</h3>
							<a href="##" className="btn btn-primary">Shop Now</a>
						</div>
					</div> */}
				</div>
			</div>
		</div>
	)
}
export { Carousel };
