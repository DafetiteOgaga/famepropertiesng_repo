import { getImage } from "../../../hooks/baseImgUrl";
import { titleCase } from "../../../hooks/changeCase";
import { useDeviceType } from "../../../hooks/deviceType";

function ProductAdvert({productSelector, productsArr}) {
	// console.log({productSelector, productsArr})
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const isSmallMobile = deviceType.width <= 400
	const isVerySmallMobile = deviceType.width <= 390
	// const isVeryVerySmallMobile = deviceType.width <= 375
	// console.log({productsArr})
	return (
		<>
			{productsArr?
			<>
			{productsArr.map((productItem, index) => {
				const isActive = productsArr[productSelector].id===productItem.id
				const evenIndex = index % 2 === 0;
				// console.log(
				// 	'productItem:', productItem, 'isActive:', isActive, 'index:', index, 'evenIndex:', evenIndex
				// )
				return (
					<div key={index} className="product-offer mb-30 carousel-div2"
					style={{
						...{display: isActive?'block':'none'},
						...isMobile?{
							position: 'absolute',
							// top: isVeryVerySmallMobile?'70%':(isVerySmallMobile?'40%':'70%'),
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
						{!isMobile&&
						<img className="img-fluid" alt="" src={
							productItem.image_url
							// getImage(
							// productItem.image, 'img'
							// 'carousel-1.jpg', 'img'
							// )
							}/>}
						<div className="offer-text"
						style={
							isMobile?{
							background: 'transparent',
							padding: '0.5rem 0.5rem',
							// top: '0%',
							// bottom: '0%',
							}:{}}>
							<h6 className={`text-white text-uppercase ${isActive?evenIndex?'fadeInLeft':'fadeInRight':''}`}
							style={{
								fontSize: isVerySmallMobile?'1rem':isSmallMobile?'1.1rem':'',
								// color: '#fff',
								zIndex: 1,
								}}>{productItem.discount}</h6>
							<h3 className={`text-white mb-3 ${isActive?'bounceInDown':''}`}
							style={{
								fontSize: isVerySmallMobile?'1rem':isSmallMobile?'1.1rem':'',
								textAlign: 'center',
								zIndex: 1,
								// textWrap: productItem.paragraph.length<=10?'nowrap':'wrap',
								}}>{titleCase(productItem.paragraph)}</h3>
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
