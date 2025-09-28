import { getImage } from "../../../hooks/baseImgUrl";
import { titleCase } from "../../../hooks/changeCase";
import { useDeviceType } from "../../../hooks/deviceType";
import { BouncingDots } from "../../../spinners/spinner";

function FeatureAdvert({featureSelector, featuresArr}) {
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	const isLoading = !featuresArr.length;
	// console.log({isLoading})
	// console.log("feature component")
	// console.log({featureSelector, featuresArr})
	return (
		<>
			{!isLoading ?
				<>
					{featuresArr.map((featureItem, index) => {
						const isActive = featuresArr[featureSelector].id===featureItem.id
						const evenIndex = index % 2 === 0;
						return (
							<div key={index} className={`feat-x col-lg-6 product-offer ${isMobile?'':'carousel-div2'}`}
							style={{
								...{display: isActive?'block':'none'},
								...isMobile?{
									// position: 'absolute',
									height: 70,
									padding: 0,
									// width: 'auto%',
									// left: '',
									// top: '0%',
									// borderTopRightRadius: 0,
									// borderBottomLeftRadius: 0,
									// zIndex: 1,
									// background: 'green',
									// backgroundColor: 'rgba(0, 0, 0, 0)',
								}:{}
								}}>
								{/* {!isMobile && */}
								<img className="img-fluid" alt=""
								style={isMobile?{
									zIndex: 0,
									position: 'absolute',
								}:{}}
								src={getImage("story-bg-1.jpg", 'img')}/>
								{/* } */}
								<div className={`d-flex align-items-${isMobile?'end':'center'} ${isMobile?'':'mt-2'} justify-content-center`}
								style={{
									// position: isMobile?'absolute':'',
									// flexDirection: 'column',
									// zIndex: 900,
									// background: isMobile?'green':'',
									position: isMobile?'':'absolute',
									top: isMobile?'':0,
									left: isMobile?'':'30%',
									}}>
									<span className={`${featureItem.heading} fa-5x ${isActive?evenIndex?'fadeInLeftIcon':'fadeInRightIcon':''} ${isMobile?'':'m-0'} mr-3 text-white`}
									style={{
										fontSize: isMobile?'2rem':'',
										marginTop: isMobile?'1rem':'-1.5rem',
										// color: isMobile?'whitesmoke':''
									}}> </span>
									<h5 className={`font-weight-semi-bold ${isActive?'bounceInDown':''}`}
									style={{
										zIndex: 1,
										color: '#fff',
										fontSize: isMobile?'0.7rem':'',
										textAlign: 'center',
										textWrap: featureItem.paragraph.length<=15?'nowrap':'wrap',
										}}>{titleCase(featureItem.paragraph)}</h5>
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
							<span
							style={isMobile?{
								position: 'absolute',
								margin: -20
							}:{}}>
							<BouncingDots size={"sm"} color={isMobile?"#fff":"#475569"} p={isMobile?"4":"6"} />
							</span>
					</div>
				</>

			}
		</>
	)
}
export { FeatureAdvert }
