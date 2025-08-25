import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb } from './sections/breadcrumb';
import { UploadImageItem } from '../hooks/allAuth/imageKitUpload';
import { IKContext, IKUpload, IKImage } from "imagekitio-react";

function AdminPage() {
	return (
		<>
			{/* Breadcrumb Start */}
			<Breadcrumb page="Admin Page" />

			<div className="container-fluid row px-xl-5"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<div>
					<UploadImageItem type={'carousel'} />
					<br /><br />
				</div>
				<div>
					<UploadImageItem type={'products-advert'} />
					<br /><br />
				</div>
				<div>
					<UploadImageItem type={'features-advert'} />
					<br /><br />
				</div>
				<div>
					<UploadImageItem type={'product'} />
					<br /><br />
				</div>
			</div>

			

			{/* <div className="grid grid-cols-3 gap-4">
				<p className="text-center text-gray-500">{JSON.stringify(products)}</p>
				{products.map((product) => (
					<div key={product.id} className="p-4 border rounded">
					<IKImage
						urlEndpoint="https://ik.imagekit.io/dafetite001"
						src={`${product.image_url}?tr=w-200,h-200`}
						alt={product.name}
					/>
					<h3>{product.name}</h3>
					<p>{product.description}</p>
					<p>${product.price}</p>
					</div>
				))}
			</div> */}
		</>
	)
}
export { AdminPage }
