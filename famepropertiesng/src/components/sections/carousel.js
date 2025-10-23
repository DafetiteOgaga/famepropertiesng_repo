import React, { useState, useEffect } from "react";
import { useDeviceType } from "../../hooks/deviceType";
import { ProductAdvert } from "./carouselSections/productAdvert";
import { FeatureAdvert } from "./carouselSections/featureAdvert";
import { titleCase } from "../../hooks/changeCase";
import { getBaseURL } from "../../hooks/fetchAPIs";
import { useAuthFetch } from "../loginSignUpProfile/authFetch";
import { BouncingDots } from "../../spinners/spinner";

const baseURL = getBaseURL();

function Carousel() {
	const authFetch = useAuthFetch();
	const [carouselsArr, setCarouselsArr] = useState([]);
	const [productsArr, setProductsArr] = useState([]);
	const [featuresArr, setFeaturesArr] = useState([]);
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const [carouselSelector, setCarouselSelector] = useState(0);
	const [productSelector, setProductSelector] = useState(0);
	const [featureSelector, setFeatureSelector] = useState(0);
	useEffect(() => {
		const carouselInterval = setInterval(() => {
			if (carouselsArr.length) {
				setCarouselSelector(prev => (prev + 1) % carouselsArr.length);
			}
		}, 5000); // Change slide every 5 seconds

		const productInterval = setInterval(() => {
			if (productsArr.length) {
				setProductSelector(prev => (prev + 1) % productsArr.length);
			}
		}, 4000); // Change slide every 4 seconds

		const featureInterval = setInterval(() => {
			if (featuresArr?.featuresAdvert?.length) {
				setFeatureSelector(prev => (prev + 1) % featuresArr?.featuresAdvert?.length);
			}
		}, 3500); // Change slide every 3.5 seconds

		return () => {
			clearInterval(carouselInterval);
			clearInterval(productInterval);
			clearInterval(featureInterval);
		}
	}, [carouselsArr.length, productsArr.length, featuresArr?.featuresAdvert?.length])
	const fetchServerData = async () => {
		try {
			const [carouselsRes, productsRes, featuresRes] = await Promise.all([
				authFetch(`carousels/`),
				authFetch(`products-adverts/`),
				authFetch(`features-adverts/`),
			]);
			if (!carouselsRes || !productsRes|| !featuresRes) {
				return
			}
			const [carouselsData, productsData, featuresData] = await Promise.all([
				carouselsRes, // .json(),
				productsRes, // .json(),
				featuresRes, // .json(),
			]);
			// console.log("Fetched data from server.",
			// 	{carouselsData, productsData, featuresData}
			// );
			setCarouselsArr(carouselsData);
			setProductsArr(productsData);
			setFeaturesArr(featuresData);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		fetchServerData();
	}, []);
	const isLoading = (!productsArr.length || !featuresArr?.featuresAdvert?.length || !carouselsArr.length);
	return (
		<>
			{!isLoading ?
			<div className={`container-fluid mb-3 ${isMobile?'px-0':''}`}>
				<div className="column">
					<CarouselAdverts
					carouselsArr={carouselsArr}
					carouselSelector={carouselSelector}
					/>

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
	return (
		<>
			<ProductAdvert productsArr={productsArr} productSelector={productSelector} />
			<FeatureAdvert featuresArr={featuresArr} featureSelector={featureSelector} />
		</>
	)
}

function CarouselAdverts({carouselsArr, carouselSelector}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	return (
		// <>
		<div className="col-lg-12" // px-xl-4"
		style={{padding: 0}}>
			<div id="header-carousel" className={`carousel slide carousel-fade ${isMobile?'mb-0':'mb-30'} mb-lg-0`}>
				<ol className="carousel-indicators"
				style={{bottom: isMobile?'-10%':''}}>
					{carouselsArr.map((caroSelector, index) => {
						const isActive = carouselSelector===(index)
						return (
							<li key={index}
							className={isActive?'active':''}
							style={{
								height: isMobile?'10px':'',
							}}>{caroSelector.index}</li>
						)
					})}
				</ol>
				<div className="carousel-inner">
					{carouselsArr.map((carouselItem, index) => {
						const isActive = carouselsArr[carouselSelector].id===carouselItem.id
						return (
							<div key={index} className={`carousel-item position-relative ${isActive?'active carousel-item-next':'carousel-item-prev'} ${isMobile?'':'carousel-div1'}`}
							style={{height: isMobile?'150px':''}}>
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt={carouselItem.image} src={carouselItem.image_url}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center"
								>
									<div className={`${isMobile?'':'p-3'} carousel-div1-inner`}>
										<h1 className={`display-4 text-white ${isMobile?'mb-0':'mb-3'} ${isActive?'fadeInDown':''}`}>{titleCase(carouselItem.heading)}</h1>
										<p className={`mx-md-5 px-5 ${isActive?'bounceIn':''}`}>{isMobile?carouselItem.paragraph.slice(0, 95):carouselItem.paragraph}</p>
									</div>
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
