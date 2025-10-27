import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeviceInfo } from '../hooks/deviceType';
import { useCheckLoginValidity } from '../hooks/checkLoginValidity';
import { ToggleButton } from '../hooks/buttons';

// function toggleDebugOutlines() {
// 	document.body.classList.toggle('debug-outline');
// }

// document.addEventListener('keydown', (e) => {
// 	if (e.ctrlKey && e.key.toLowerCase() === '.') { // Alt + O
// 		toggleDebugOutlines();
// 	}
// });

function PageNotFound() {
	const [debugMode, setDebugMode] = useState(false)
	const deviceInfo = useDeviceInfo()
	const checkLoginValidity = useCheckLoginValidity()
	useEffect(() => {
		if (debugMode) {
			document.body.classList.add('debug-outline');
		} else {
			document.body.classList.remove('debug-outline');
		}
	}, [debugMode])
	// console.log({debugMode})
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
			</div>
			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
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

			<div className="container-fluid d-flex align-items-center justify-content-center my-3"
			>
				<h6
				className="mr-2"
				style={{color: '#475569',}}>Toggle Debug Mode</h6>
				<div className='d-flex align-self-baseline'>
					<ToggleButton
					onChange={(e)=>setDebugMode(e.target.checked)}
					checked={debugMode}
					/>
				</div>
			</div>
		</>
	)
}
export { PageNotFound }
