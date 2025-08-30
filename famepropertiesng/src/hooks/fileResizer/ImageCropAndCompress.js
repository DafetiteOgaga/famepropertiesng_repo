import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { useDeviceType } from "../deviceType";

// Utility: turn crop pixels into a File via canvas
const getCroppedImg = (imageSrc, cropPixels) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = imageSrc;
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = cropPixels.width;
			canvas.height = cropPixels.height;
			const ctx = canvas.getContext("2d");

			ctx.drawImage(
				img,
				cropPixels.x,
				cropPixels.y,
				cropPixels.width,
				cropPixels.height,
				0,
				0,
				cropPixels.width,
				cropPixels.height
			);

			canvas.toBlob((blob) => {
				if (!blob) return reject("Crop failed");
				resolve(new File([blob], "cropped.jpeg", { type: "image/jpeg" }));
			}, "image/jpeg");
		};
	});
};

const ImageCropAndCompress = forwardRef(({ onComplete, type, isImagePreview }, ref) => {
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [finalImageUrl, setFinalImageUrl] = useState(null);
	const [finalFile, setFinalFile] = useState(null);
	const [fileName, setFileName] = useState("No file chosen");
	const deviceType = useDeviceType();
	const isMobile = deviceType.width <= 576
	// console.log({type})

	let targetHeight // target height
	let targetWidth // target width
	if (type === "product") {
		targetHeight = 500;
		targetWidth = 500;
	} else if (type === "profilePhoto") {
		targetHeight = 200;
		targetWidth = 200;
	} else {
		targetHeight = 430;
		targetWidth = 1000;
	}
	const targetAspectRatio = targetWidth / targetHeight; // aspect ratio

	// handle crop done
	const handleCropComplete = useCallback((_, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	// handle file input
	const handleFileChange = (e) => {
		// console.log("File input changed:", e.target.files);
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			console.log("Selected file:", file);
			setFileName(file.name);
			const reader = new FileReader();
			reader.onload = () => setImageSrc(reader.result);
			reader.readAsDataURL(file);
		}
	};

	// Expose handleDone to parent via ref
	useImperativeHandle(ref, () => ({
		handleDone,
	}));
	
	// watch imageSrc separately
	useEffect(() => {
		isImagePreview(!!imageSrc);  // true if imageSrc exists, false otherwise
	}, [imageSrc]);

  	// crop + compress in one click
	const handleDone = async () => {
		try {
			// console.log("Cropping and compressing...");
			// Step 1: crop only after user confirms crop
			const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

			const sizeKB = croppedFile.size / 1024;
			let compressedFile

			if (sizeKB < 40) {
				// Case 1: already within range
				compressedFile = croppedFile; // return as-is
			} else {
				// Case 2: too large → compress
				const maxSizeKB = 50; // target 200 KB
				const maxSizeMB = maxSizeKB / 1024; // convert KB to MB
				const options = {
					maxSizeMB: maxSizeMB, // target ~300KB
					maxWidthOrHeight: targetWidth, // just in case
					useWebWorker: true,
				};

				// Step 2: compress
				compressedFile = await imageCompression(croppedFile, options);
			}

			// Preview & store final file
			setFinalFile(compressedFile);
			setFinalImageUrl(URL.createObjectURL(compressedFile));
			setImageSrc(null); // clear imageSrc after processing

			// console.log("Final file:", compressedFile);

			// 🔥 send file to parent
			if (onComplete) onComplete(compressedFile);

		} catch (err) {
			console.error(err);
		}
	};

	const handleDownload = () => {
		if (!finalFile) return;
	
		const link = document.createElement("a");
		link.href = URL.createObjectURL(finalFile);
		link.download = finalFile.name || "compressed.jpeg"; // default name
		link.click();
	};

	// console.log({imageSrc})
	return (
		<>
			{/* File input */}
			<div
			style={{
				marginBottom: '10px',
			}}>
				<label
				htmlFor="fileUpload"
				className="custom-upload-btn bg-dark"
				style={{
					marginBottom: 0,
				}}>
					Upload Image
				</label>
				<span
				className="ml-2"
				style={{
					fontSize: '0.9rem',
					textWrap: 'nowrap',
				}}>{fileName.length>15?fileName.slice(0, 15)+'... '+fileName.slice(fileName.lastIndexOf('.')):fileName}</span>
			</div>
			<input
			id="fileUpload"
			// className=" mb-2"
			type="file"
			accept="image/*" // accept images only
			// accept="video/*" // accept videos only
			style={{ display: "none" }} // hidden input
			onChange={handleFileChange} />

			{imageSrc && (
				<div
				style={{
					position: "relative",   // required
					width: "200px",         // set a width
					height: "200px",        // set a height
					background: "#333",     // optional: dark background
					borderRadius: "5px",   // optional: rounded edges
					overflow: "hidden",     // keeps crop area inside
					// position: "relative",
					// width: "100%",        // responsive width
					// height: "13vh",       // takes half viewport height
				}}
				>
					<Cropper
						image={imageSrc}
						crop={crop}
						zoom={zoom}
						aspect={targetAspectRatio} // fixed aspect ratio
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onCropComplete={handleCropComplete}
						cropShape={type==='profilePhoto'?'round':'rect'} // circle for profile photos
						showGrid={true}  // optional: hide grid lines
						minZoom={1}      // optional: minimum zoom level
						maxZoom={3}      // optional: maximum zoom level
					/>
				</div>
			)}

			{(imageSrc&&type!=='profilePhoto') && (
				<button
				onClick={handleDone}
				className="mt-3 px-4 py-2 rounded-lg"
				style={{
					// zIndex: 1000,
					position: "absolute",
					top: "30%",
				}}
				>
					Done (Crop + Compress)
				</button>
			)}

			{(finalImageUrl&&!imageSrc) && (
			<div
			style={{
				// position: "relative",   // required
				// width: "200px",         // set a width
				// height: "200px",        // set a height
				// background: "#333",     // optional: dark background
				borderRadius: "5px",   // optional: rounded edges
				// overflow: "hidden",     // keeps crop area inside
				// position: "relative",
				// width: "100%",        // responsive width
				// height: "13vh",       // takes half viewport height
			}}
			>
					{type!=='profilePhoto'&&<p>Final Preview:</p>}
					<img src={finalImageUrl}
					alt="Final"
					style={{
						width: "200px",         // set a width
						height: "200px",        // set a height
						// background: "#333",     // optional: dark background
						borderRadius: "50%",   // optional: rounded edges
						padding: type==='profilePhoto'?'2px':'0', // padding for profile photos
						border: type==='profilePhoto'?'1px solid #666':'none',
						// overflow: "hidden",     // keeps crop area inside
					}}
					className=""
					/>

					{type!=='profilePhoto'&&
					<button
					onClick={handleDownload}
					className="px-4 py-2 rounded-lg"
					style={{
						// zIndex: 1000,
						position: "absolute",
					}}
					>
						Download Final Image
					</button>}
				</div>
			)}
		</>
	);
});

export { ImageCropAndCompress }