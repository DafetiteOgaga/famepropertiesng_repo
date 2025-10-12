import { titleCase } from "../../../hooks/changeCase";
import { useDeviceType } from "../../../hooks/deviceType";
import { BouncingDots } from "../../../spinners/spinner";

function ProductAdvert({productSelector, productsArr}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const isSmallMobile = deviceType.width <= 400
	const isVerySmallMobile = deviceType.width <= 390
	const isLoading = !productsArr.length;
	return (
		<>
			{!isLoading ?
			<>
				{productsArr.map((productItem, index) => {
					const isActive = productsArr[productSelector].id===productItem.id
					const evenIndex = index % 2 === 0;
					return (
						<div key={index} className="prod-y col-lg-6 product-offer carousel-div2"
						style={{
							...{display: isActive?'block':'none'},
							...isMobile?{
								maxHeight: 300,
								height: 70,
								padding: 0,
							}:{}
							}}>
							<img className="img-fluid"
							alt=""
							src={productItem.image_url}/>
								{/* } */}
							<div className="offer-text"
							style={
								isMobile?{
									top: 'auto',
									left: 'auto',
									right: 'auto',
									width: '100%',
									height: '100%',
									paddingTop: '1rem',
									}:{}}>
								<h6 className={`text-white text-uppercase ${isActive?evenIndex?'fadeInLeft':'fadeInRight':''}`}
								style={{
									fontSize: isVerySmallMobile?'1rem':isSmallMobile?'1.1rem':'',
									zIndex: 1,
									}}>{productItem.discount}</h6>
								<h5 className={`text-white mb-3 ${isActive?'bounceInDown':''}`}
								style={{
									fontSize: isMobile?'0.7rem':'',
									}}>{titleCase(productItem.paragraph)}</h5>
							</div>
						</div>
					)
				})}
			</>
			:
			<>
				<div className="product-offer mb-30 carousel-div2"
				style={{
					...{display: 'block'},
					...isMobile?{
						position: 'absolute',
						top: '70%',
						maxHeight: 300,
						height: 150,
						width: 170,
						left: isVerySmallMobile?'45%':'55%',
						bottom: '-7%',
						borderTopRightRadius: 0,
						borderBottomLeftRadius: 0,
					}:{}
					}}>
						<BouncingDots size={"sm"} color={isMobile?"#fff":"#475569"} p={isMobile?"4":"6"} />
				</div>
			</>}
		</>
	)
}
export { ProductAdvert }
