// // hooks/useImageCompression.js
// import imageCompression from "browser-image-compression";

// export const useImageCompression = () => {
//   // Function to resize image to exact width & height
//   const resizeImage = (file, width, height) => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       const reader = new FileReader();

//       reader.onload = (e) => {
//         img.src = e.target.result;
//       };

//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = width;
//         canvas.height = height;

//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0, width, height); // force exact size

//         canvas.toBlob((blob) => {
//           if (blob) {
//             resolve(new File([blob], file.name, { type: file.type }));
//           } else {
//             reject(new Error("Canvas resize failed"));
//           }
//         }, file.type);
//       };

//       reader.readAsDataURL(file);
//     });
//   };

//   // Resize & crop to exact width/height (keep aspect ratio, crop overflow)
//   const cropResizeImage = (file, targetWidth, targetHeight) => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       const reader = new FileReader();

//       reader.onload = (e) => {
//         img.src = e.target.result;
//       };

//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = targetWidth;
//         canvas.height = targetHeight;

//         const ctx = canvas.getContext("2d");

//         // Calculate scaling
//         const scale = Math.max(
//           targetWidth / img.width,
//           targetHeight / img.height
//         );

//         const x = (targetWidth / 2) - (img.width / 2) * scale;
//         const y = (targetHeight / 2) - (img.height / 2) * scale;

//         // Draw cropped image
//         ctx.drawImage(
//           img,
//           x, y, // position
//           img.width * scale,
//           img.height * scale
//         );

//         canvas.toBlob((blob) => {
//           if (blob) {
//             resolve(new File([blob], file.name, { type: file.type }));
//           } else {
//             reject(new Error("Canvas crop/resize failed"));
//           }
//         }, file.type);
//       };

//       reader.readAsDataURL(file);
//     });
//   };

//   // // user decidess Resize & crop to exact width/height (keep aspect ratio, crop overflow)
//   // const cropResizeImage = (file, targetWidth, targetHeight, cropX = "center", cropY = "center") => {
//   //   return new Promise((resolve, reject) => {
//   //     const img = new Image();
//   //     const reader = new FileReader();
  
//   //     reader.onload = (e) => {
//   //       img.src = e.target.result;
//   //     };
  
//   //     img.onload = () => {
//   //       const canvas = document.createElement("canvas");
//   //       canvas.width = targetWidth;
//   //       canvas.height = targetHeight;
  
//   //       const ctx = canvas.getContext("2d");
  
//   //       // Scaling factor (cover target)
//   //       const scale = Math.max(
//   //         targetWidth / img.width,
//   //         targetHeight / img.height
//   //       );
  
//   //       const scaledWidth = img.width * scale;
//   //       const scaledHeight = img.height * scale;
  
//   //       // Default center crop
//   //       let x = (targetWidth - scaledWidth) / 2;
//   //       let y = (targetHeight - scaledHeight) / 2;
  
//   //       // Adjust X crop
//   //       if (cropX === "left") x = 0;
//   //       if (cropX === "right") x = targetWidth - scaledWidth;
  
//   //       // Adjust Y crop
//   //       if (cropY === "top") y = 0;
//   //       if (cropY === "bottom") y = targetHeight - scaledHeight;
  
//   //       ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  
//   //       canvas.toBlob((blob) => {
//   //         if (blob) {
//   //           resolve(new File([blob], file.name, { type: file.type }));
//   //         } else {
//   //           reject(new Error("Canvas crop/resize failed"));
//   //         }
//   //       }, file.type);
//   //     };
  
//   //     reader.readAsDataURL(file);
//   //   });
//   // };


//   const compressImage = async (file) => {
    
//     // const options = {
//     //   maxSizeMB: maxSizeMB,          // target max size (1MB)
//     //   maxWidthOrHeight: 1024, // resize if larger than 1024px
//     //   useWebWorker: true,
//     // };

//     try {
//       // Step 1: resize to 1000x430
//       const resizedFile = await resizeImage(file, 1000, 430);

//       // Step 1: crop + resize to 1000x430
//       // const resizedFile = await cropResizeImage(file, 1000, 430);

//       const maxSizeKB = 50; // target 200 KB
//       const maxSizeMB = maxSizeKB / 1024; // convert KB to MB

//       // Step 2: compress
//       const options = {
//         maxSizeMB: maxSizeMB, // target ~300KB
//         useWebWorker: true,
//       };

//       const compressedFile = await imageCompression(resizedFile, options);
//       console.log("Original:", (file.size / 1024).toFixed(2), "KB");
//       console.log("Compressed:", (compressedFile.size / 1024).toFixed(2), "KB");
//       return compressedFile;
//     } catch (error) {
//       console.error("Compression error:", error);
//       throw error;
//     }
//   };

//   return { compressImage };
// };

// // npm install browser-image-compression

// // import { useImageCompression } from "../hooks/useImageCompression";

// // function Upload() {
// //   const { compressImage } = useImageCompression();

// //   const handleFile = async (e) => {
// //     const file = e.target.files[0];
// //     const compressed = await compressImage(file);
// //     console.log("Compressed File:", compressed);
// //   };

// //   return <input type="file" onChange={handleFile} />;
// // }