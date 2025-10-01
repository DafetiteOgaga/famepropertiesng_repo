import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDeviceType } from "../../hooks/deviceType";
import { getImage } from "../../hooks/baseImgUrl";
import { ProductAdvert } from "./carouselSections/productAdvert";
import { FeatureAdvert } from "./carouselSections/featureAdvert";
import { titleCase } from "../../hooks/changeCase";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { BouncingDots } from "../../spinners/spinner";

const baseURL = getBaseURL();

function Carousel() {
	// const [loading, setLoading] = useState(true);
	const [carouselsArr, setCarouselsArr] = useState([]);
	const [productsArr, setProductsArr] = useState([]);
	const [featuresArr, setFeaturesArr] = useState([]);
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const [carouselSelector, setCarouselSelector] = useState(0);
	const [productSelector, setProductSelector] = useState(0);
	const [featureSelector, setFeatureSelector] = useState(0);
	useEffect(() => {
		// console.log("Setting up intervals for carousel and adverts...");
		const carouselInterval = setInterval(() => {
			// console.log("Changing carousel slide1",
			// 	carouselsArr.length
			// );
			if (carouselsArr.length) {
				// console.log("Changing carousel slide2");
				setCarouselSelector(prev => (prev + 1) % carouselsArr.length);
			}
		}, 5000); // Change slide every 5 seconds

		const productInterval = setInterval(() => {
			// console.log("Changing product slide1",
			// 	productsArr.length
			// );
			if (productsArr.length) {
				// console.log("Changing product slide2");
				setProductSelector(prev => (prev + 1) % productsArr.length);
			}
			// setProductSelector(prev => (prev + 1) % productsArr.length);
		}, 4000); // Change slide every 4 seconds

		const featureInterval = setInterval(() => {
			// console.log("Changing feature slide1",
			// 	featuresArr.length
			// );
			if (featuresArr.length) {
				// console.log("Changing feature slide2");
				setFeatureSelector(prev => (prev + 1) % featuresArr.length);
			}
		}, 3500); // Change slide every 3.5 seconds

		return () => {
			clearInterval(carouselInterval);
			clearInterval(productInterval);
			clearInterval(featureInterval);
		}
	}, [carouselsArr.length, productsArr.length, featuresArr.length])
	const fetchServerData = async () => {
		try {
			// console.log("fetching ...".repeat(10));
			const [carouselsRes, productsRes, featuresRes] = await Promise.all([
				fetch(`${baseURL}/carousels/`),
				fetch(`${baseURL}/products-adverts/`),
				fetch(`${baseURL}/features-adverts/`),
			]);
			if (!carouselsRes.ok || !productsRes.ok || !featuresRes.ok) {
				throw new Error("Network response was not ok");
			}
			const [carouselsData, productsData, featuresData] = await Promise.all([
				carouselsRes.json(),
				productsRes.json(),
				featuresRes.json(),
			]);
			setCarouselsArr(carouselsData);
			setProductsArr(productsData);
			setFeaturesArr(featuresData);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		// console.log("Fetching server data...");
		fetchServerData();
	}, []);
	// console.log("Carousel Data:", carouselsArr, carouselsArr.length);
	// console.log("featuresArr:", featuresArr, featuresArr.length);
	// console.log({deviceType})
	// console.log('isMobile:', isMobile);
	// console.log("in carousel: ", {productsArr})
	// console.log("in carousel: ", {featuresArr})
	// console.log("Loading state:", loading);
	// console.log("Products length:", !!productsArr.length);
	// console.log("Features length:", !!featuresArr.length);
	const isLoading = (!productsArr.length || !featuresArr.length || !carouselsArr.length);
	// console.log("Is Loading:", isLoading);
	// const zero = 0
	// console.log("Zero check:", !!zero);
	// useEffect(() => {
	// 	// console.log("Updating loading state...");
	// 	if (isLoading) setLoading(isLoading);
	// 	else setLoading(false);
	// }, isLoading);
	// console.log("Final Loading state:", loading);
	return (
		<>
			{!isLoading ?
			<div className={`container-fluid mb-3 ${isMobile?'px-0':''}`}>
				{/* <div className="row"> */}
				<div className="column">
					<CarouselAdverts
					carouselsArr={carouselsArr}
					carouselSelector={carouselSelector}
					productSelector={productSelector}
					featureSelector={featureSelector}
					productsArr={productsArr}
					featuresArr={featuresArr} />

					{/* {!isMobile &&
					// <div className="col-lg-4"> */}
					<div className={`row ${isMobile?'mt-1':'mt-3'}`}
					style={isMobile?{
						flexWrap: 'nowrap',
						margin: 0,
						gap: '0.2rem',
						}:{}}>
						<ProductAndFeatureAdverts
							productSelector={productSelector}
							productsArr={productsArr}
							featureSelector={featureSelector}
							featuresArr={featuresArr} />
					</div>
					{/* } */}
				</div>
			</div>
			:
			<BouncingDots size={isMobile?"md":"xl"} color="#475569" p={isMobile?"10":"8"} />}  {/* shows dots only if loading */}
		</>
	)
}
function ProductAndFeatureAdverts({productSelector, productsArr, featureSelector, featuresArr}) {
	// console.log({productSelector, productsArr})
	// console.log("in p and f: ", {productsArr})
	// console.log("product and feature")
	return (
		<>
			<ProductAdvert productsArr={productsArr} productSelector={productSelector} />
			<FeatureAdvert featuresArr={featuresArr} featureSelector={featureSelector} />
		</>
	)
}

function CarouselAdverts({carouselsArr, carouselSelector, productSelector, featureSelector, productsArr, featuresArr}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	// const isLoading = (!productsArr.length || !featuresArr.length || !carouselsArr.length);
	// console.log("Is Loading:", isLoading);
	// console.log({productsArr, featuresArr})
	// console.log("Carousel Selector:", carouselsArr[carouselSelector].image_url);
	return (
		// <>
		<div className="col-lg-12" // px-xl-4"
		style={{padding: 0}}>
			<div id="header-carousel" className={`carousel slide carousel-fade ${isMobile?'mb-0':'mb-30'} mb-lg-0`}>
				<ol className="carousel-indicators"
				style={{bottom: isMobile?'-10%':''}}>
					{carouselsArr.map((caroSelector, index) => {
						// console.log('carouselsArr:', carouselsArr);
						// console.log('carouselSelector:', carouselSelector);
						// console.log(
						// 	'\ncarouselsArr[carouselSelector].id:', carouselsArr[carouselSelector].id,
						// 	'index+1:', (index),
						// )
						const isActive = carouselSelector===(index)
						return (
							<li key={index}
							className={isActive?'active':''}
							style={{
								// width: isMobile?'10px':'',
								height: isMobile?'10px':'',
							}}>{caroSelector.index}</li>
						)
					})}
				</ol>
				<div className="carousel-inner">
					{carouselsArr.map((carouselItem, index) => {
						const isActive = carouselsArr[carouselSelector].id===carouselItem.id
						// console.log('image url:', getImage(carouselsArr[carouselSelector].image));
						// console.log('carouselItem:', (isActive && carouselItem));
						return (
							<div key={index} className={`carousel-item position-relative ${isActive?'active carousel-item-next':'carousel-item-prev'} ${isMobile?'':'carousel-div1'}`}
							style={{height: isMobile?'150px':''}}>
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt={carouselItem.image} src={
									carouselItem.image_url
									// getImage(
									// carouselItem.image, 'img'
									// // 'carousel-1.jpg'
									// )
									}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center"
								// style={{zIndex: 0}}
								>
									<div className={`${isMobile?'':'p-3'} carousel-div1-inner`}>
										<h1 className={`display-4 text-white ${isMobile?'mb-0':'mb-3'} ${isActive?'fadeInDown':''}`}>{titleCase(carouselItem.heading)}</h1>
										<p className={`mx-md-5 px-5 ${isActive?'bounceIn':''}`}>{isMobile?carouselItem.paragraph.slice(0, 95):carouselItem.paragraph}</p>
										{/* button */}
										{/* <span className={`btn btn-outline-light py-2 px-4 mt-3 ${isActive?'fadeInUp':''}`}>{carouselItem.anchor}</span> */}
									</div>
								</div>
								{/* {console.log(
									{isMobile, productsArr, featuresArr}
								)} */}
								{/* {(isMobile&&productsArr&&featuresArr) &&
								<div className="">
									<ProductAndFeatureAdverts
										productSelector={productSelector}
										productsArr={productsArr}
										featureSelector={featureSelector}
										featuresArr={featuresArr} />
								</div>} */}
							</div>
						)
					})}
				</div>
			</div>
		</div>
		// {isLoading && <BouncingDots size="lg" color="#475569" />}  shows dots only if loading
		// </>
	)
}
export { Carousel };
