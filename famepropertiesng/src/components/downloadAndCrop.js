import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageCropAndCompress } from '../hooks/fileResizer/ImageCropAndCompress';
import { Breadcrumb } from './sections/breadcrumb';

const optionsArr = [
	"select an option",
	"product",
	"carousel",
	"features-advert",
	"products-advert",
]
function ProcessImage() {
	const [returnedFile, setReturnedFile] = useState(null);
	const [processFor, setProcessFor] = useState(null);
	const handleChange = (e) => {
		const selectedValue = e.target.value;
		// console.log("User selected:", selectedValue);
	  
		// run your compression/resizing logic here
		setProcessFor(selectedValue);
	};
	// const location = useLocation().pathname.split("/").pop();
	// const [products, setProducts] = useState([]);

	// useEffect(() => {
	// 	fetch("http://127.0.0.1:8000/products/") // Django API endpoint
	// 	.then(res => res.json())
	// 	.then(data => setProducts(data));
	// }, []);
	// console.log("Current Location:", location);
	// console.log("Returned File:", returnedFile);
	return (
		<>
			{/* Breadcrumb Start */}
			<Breadcrumb page="Process Image Page" />

			<div className="container-fluid row px-xl-5"
			style={{
				display: 'flex',
				justifyContent: 'center',
				// flexDirection: 'column',
				}}>
				<div
				style={{flexDirection: 'column',}}>
					<h1 className="text-xl font-bold mb-4">Download & Crop Image{processFor?' for '+processFor+'s':''}</h1>
	
					{/* Render your component here */}
					{processFor &&
					<>
						<ImageCropAndCompress onComplete={setReturnedFile} type={processFor} />
						{/* <button
						onClick={handleClick}
						className="mt-3 px-4 py-2 rounded-lg"
						style={{
							// zIndex: 1000,
							position: "absolute",
						}}
						>
							Accept Crop
						</button> */}
					</>}
					
					<select
					onChange={handleChange}
					value={processFor||optionsArr[0]}
					className="mt-3 px-4 py-2 rounded-lg"
					style={{
						// zIndex: 1000,
						position: "absolute",
						top: "40%",
					}}
					>
						{optionsArr.map((option, index) => {
							return (
								<option key={index} value={option} disabled={!index}>
									{`${index?'process image for ':''}${option}`}
								</option>
							)
						})}
					</select>
				</div>
			</div>

			
		</>
	)
}
export { ProcessImage }
