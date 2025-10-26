import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDeviceInfo } from '../hooks/deviceType';
import { useCheckLoginValidity } from '../hooks/checkLoginValidity';
import { toast } from 'react-toastify';

function Unauthorised() {
	const hasRendered = useRef(false);
	const deviceInfo = useDeviceInfo()
	const checkLoginValidity = useCheckLoginValidity()
	useEffect(() => {
		if (hasRendered.current) return;
		toast.error("Unauthorized access!");
		hasRendered.current = true;
	}, [])
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
				<h2 className='text-uppercase'
				style={{color: '#475569',}}>Unauthorised!</h2>
			</div>
			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<h2
				className="text-center"
				style={{color: '#475569',}}>You do not have the permission to view this page</h2>
			</div>



			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				}}>
				<h3 style={{color: '#475569', fontSize: 16}}>{`Device type: ${deviceInfo.deviceInfo}`}</h3>
				<h3 style={{color: '#475569', fontSize: 16}}>{`Device width: ${deviceInfo.width}px`}</h3>
			</div>
			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				}}>
				<h3 style={{color: '#475569', fontSize: 16, textAlign: 'center'}}>{checkLoginValidity}</h3>
			</div>
		</>
	)
}
export { Unauthorised }
