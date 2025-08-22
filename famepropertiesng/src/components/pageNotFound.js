import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { UploadImageItem } from '../hooks/allAuth/imageKitUpload';
import { IKContext, IKUpload, IKImage } from "imagekitio-react";

function PageNotFound() {
	// const location = useLocation().pathname.split("/").pop();
	// const [products, setProducts] = useState([]);

	// useEffect(() => {
	// 	fetch("http://127.0.0.1:8000/products/") // Django API endpoint
	// 	.then(res => res.json())
	// 	.then(data => setProducts(data));
	// }, []);
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
		</>
	)
}
export { PageNotFound }
