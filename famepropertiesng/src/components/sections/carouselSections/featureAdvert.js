import { getImage } from "../../../hooks/baseImgUrl";
import { useDeviceType } from "../../../hooks/deviceType";

function FeatureAdvert({featureSelector, featuresArr}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	// console.log("feature component")
	// console.log({featureSelector, featuresArr})
	return (
		<>
			{featuresArr?
				<>
				{featuresArr.map((featureItem, index) => {
					const isActive = featuresArr[featureSelector].id===featureItem.id
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
								zIndex: 1,
								// backgroundColor: 'rgba(0, 0, 0, 0)',
							}:{}
							}}>
							{!isMobile &&
							<img className="img-fluid" alt=""
							src={getImage("story-bg-1.jpg", 'img')}/>}
							<div className={`d-flex align-items-center mb-4 feature-div justify-content-center`}
							style={{
								// position: isMobile?'absolute':'',
								flexDirection: 'column',
								}}>
								<span className={`${featureItem.heading} fa-7x ${isActive?evenIndex?'fadeInLeftIcon':'fadeInRightIcon':''} ${isMobile?'mb-1 ml-3':'m-0'} mr-3 text-white`}
								style={{
									fontSize: isMobile?'2rem':'',
									marginTop: '-1.5rem',
									// color: isMobile?'whitesmoke':''
								}}> </span>
								<h5 className={`font-weight-semi-bold m-0 ${isActive?'bounceInDown':''}`}
								style={{
									zIndex: 1,
									color: '#fff',
									fontSize: isMobile?'0.7rem':'',
									textAlign: 'center',
									textWrap: featureItem.paragraph.length<=15?'nowrap':'wrap',
									}}>{featureItem.paragraph}</h5>
							</div>
						</div>
					)
				})}
			</>
			:undefined}
		</>
	)
}
export { FeatureAdvert }
