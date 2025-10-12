import { toast } from 'react-toastify';
import { authenticator } from '../loginSignUpProfile/dynamicFetchSetup';
import { useImageKitAPIs } from '../../hooks/fetchAPIs';

function useUploadToImagekit () {
	const baseAPIURL = useImageKitAPIs()?.data;

	const uploadImageToImagekit = async ({selectedFile, fileName, folder}) => {
		console.log('uploading image to ImageKit with file:', selectedFile);
		try {
			const authData = await authenticator();
			if (!authData) throw new Error("Failed to get ImageKit auth data");
			// console.log("Auth data for upload:", authData);
			// console.log({baseAPIURL})

			const imageFormData = new FormData();
			imageFormData.append("file", selectedFile); // actual file
			imageFormData.append("fileName", fileName);
			imageFormData.append("folder", folder);
			imageFormData.append("publicKey", baseAPIURL?.IMAGEKIT_PUBLIC_KEY);
			imageFormData.append("signature", authData.signature);
			imageFormData.append("expire", authData.expire);
			imageFormData.append("token", authData.token);

			// upload to imagekit
			const uploadResponse = await fetch(
				"https://upload.imagekit.io/api/v1/files/upload", {
					method: "POST",
					body: imageFormData,
				}
			);

			if (!uploadResponse.ok) {
				const errorText = "Upload failed"
				toast.error(errorText);
				throw new Error(errorText);
			}
			const result = await uploadResponse.json();
			console.log("image upload successful:", result);
			return result; // return upload result

		} catch (err) {
			toast.error('Upload failed. Please try again.');
			console.error("Upload failed:", err);
			return null;
		} finally {
			console.log("Upload process completed.");
		}
	}
	return uploadImageToImagekit;
}
export { useUploadToImagekit };
