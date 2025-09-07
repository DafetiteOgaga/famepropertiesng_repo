import { Link } from 'react-router-dom';
import { useDeviceInfo } from '../hooks/deviceType';
// import { TestSpinners } from '../spinners/spinner';
// import { StarRating } from '../hooks/handleStars';

function PageNotFound() {
	const deviceInfo = useDeviceInfo()
	// console.log({deviceInfo})
	// const location = useLocation().pathname.split("/").pop();
	// const [products, setProducts] = useState([]);
	return (
		<>
			{/* Breadcrumb Start */}
			<div className="container-fluid">
				<div className="row px-xl-5">
					<div className="col-12">
						<nav className="breadcrumb bg-light mb-30"
						style={{borderRadius: '8px', gap: 5}}>
							<span className="breadcrumb-item active">Return</span>
							<Link to={"/"} className="text-dark">Home</Link>
						</nav>
					</div>
				</div>
			</div>

			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<h2
				style={{color: '#475569',}}>Oopsy!</h2>
				{/* <h2
				className="text-uppercase"
				style={{color: '#475569',}}>Page Not Found</h2> */}
			</div>
			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				{/* <h2
				style={{color: '#475569',}}>Oopsy!</h2> */}
				<h2
				className="text-uppercase"
				style={{color: '#475569',}}>Page Not Found</h2>
			</div>



			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				}}>
				<h3 style={{color: '#475569', fontSize: 20}}>{`Device type: ${deviceInfo.deviceInfo}`}</h3>
				<h3 style={{color: '#475569', fontSize: 20}}>{`Device width: ${deviceInfo.width}px`}</h3>
			</div>
			{/* <div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<StarRating rating={63} />
			</div> */}
			{/* <TestSpinners /> */}
		</>
	)
}
export { PageNotFound }
