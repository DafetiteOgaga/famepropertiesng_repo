// import pica from "pica";

// const picaInstance = pica();

// export const resizeWithPica = async (file, width = 800, height = 800) => {
//   const img = await createImageBitmap(file);
//   const canvas = document.createElement("canvas");
//   canvas.width = width;
//   canvas.height = height;

//   try {
//     await picaInstance.resize(img, canvas);
//     const blob = await picaInstance.toBlob(canvas, "image/jpeg", 0.8);
//     return new File([blob], file.name, { type: "image/jpeg" });
//   } catch (error) {
//     console.error("Pica resize error:", error);
//     throw error;
//   }
// };

// // npm install pica

// // import { resizeWithPica } from "../utils/picaResizer";

// // function Upload() {
// //   const handleFile = async (e) => {
// //     const file = e.target.files[0];
// //     const resized = await resizeWithPica(file, 1000, 1000);
// //     console.log("Pica Resized:", resized);
// //   };

// //   return <input type="file" onChange={handleFile} />;
// // }
