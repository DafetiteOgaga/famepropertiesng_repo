// File: ImageCropAndCompress.js

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";

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

function ImageCropAndCompress({ onComplete, type }) {
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [finalImageUrl, setFinalImageUrl] = useState(null);
	const [finalFile, setFinalFile] = useState(null);

	let targetHeight // target height
	let targetWidth // target width
	if (type === "product") {
		targetHeight = 500;
		targetWidth = 500;
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
			const reader = new FileReader();
			reader.onload = () => setImageSrc(reader.result);
			reader.readAsDataURL(file);
		}
	};

  	// crop + compress in one click
	const handleDone = async () => {
		try {
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
		<div>
			<input type="file" accept="image/*" onChange={handleFileChange} />

			{imageSrc && (
				<div className="relative w-[500px] h-[250px] bg-black">
					<Cropper
						image={imageSrc}
						crop={crop}
						zoom={zoom}
						aspect={targetAspectRatio} // fixed aspect ratio
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onCropComplete={handleCropComplete}
					/>
				</div>
			)}

			{imageSrc && (
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

			{finalImageUrl && (
				<div className="mt-3">
					<p>Final Preview:</p>
					<img src={finalImageUrl} alt="Final" className="border rounded" />

					<button
					onClick={handleDownload}
					className="px-4 py-2 rounded-lg"
					style={{
						// zIndex: 1000,
						position: "absolute",
					}}
					>
						Download Final Image
					</button>
				</div>
			)}
		</div>
	);
}

export { ImageCropAndCompress }