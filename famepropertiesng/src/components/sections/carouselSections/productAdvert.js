import { getImage } from "../../../hooks/baseImgUrl";
import { useDeviceType } from "../../../hooks/deviceType";

function ProductAdvert({productSelector, productSelectorArr}) {
	// console.log({productSelector, productSelectorArr})
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const isSmallMobile = deviceType.width <= 400
	const isVerySmallMobile = deviceType.width <= 390
	return (
		<>
			{productSelectorArr?
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
							bottom: '-7%',
							borderTopRightRadius: 0,
							borderBottomLeftRadius: 0,
						}:{}
						}}>
						<img className="img-fluid" alt="" src={getImage(
							productItem.image, 'img'
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
		:undefined}
		</>
	)
}
export { ProductAdvert }
