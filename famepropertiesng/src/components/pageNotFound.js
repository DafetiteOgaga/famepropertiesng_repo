import { useLocation, Link } from 'react-router-dom';

function PageNotFound() {
	const location = useLocation().pathname.split("/").pop();
	// console.log("Current Location:", location);
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
				style={{color: '#475569',}}>Oopsy! <span className="text-uppercase">Page Not Found</span></h2>
			</div>
		</>
	)
}
export { PageNotFound }
