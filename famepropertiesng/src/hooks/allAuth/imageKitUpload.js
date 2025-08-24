import React, { useEffect, useState } from "react";
import { IKContext, IKUpload, IKImage } from "imagekitio-react";
import { getBaseURL, useImageKitAPIs } from "../fetchAPIs";
import { toast } from 'react-toastify';

const baseURL = getBaseURL();
// console.log("Base URL:", baseURL);
const carouselInputObj = {
  heading: "",
  paragraph: "",
  anchor: "Shop Now",
}
const productAdvertInputsObj = {
  discount: "",
  paragraph: "",
  anchor: "Shop Now",
}
const featureInputObj = {
  heading: "",
  paragraph: "",
  anchor: "Shop Now",
}
const productsObj = {
  name: "",
  description: `Volup erat ipsum diam elitr rebum et dolor. Est nonumy elitr erat diam stet sit clita ea. Sanc ipsum et, labore clita lorem magna duo dolor no sea Nonumy`,
  fullDescription: `Eos no lorem eirmod diam diam, eos elitr et gubergren diam sea. Consetetur vero aliquyam invidunt duo dolores et duo sit. Vero diam ea vero et dolore rebum, dolor rebum eirmod consetetur invidunt sed sed et, lorem duo et eos elitr, sadipscing kasd ipsum rebum diam. Dolore diam stet rebum sed tempor kasd eirmod. Takimata kasd ipsum accusam sadipscing, eos dolores sit no ut diam consetetur duo justo est, sit sanctus diam tempor aliquyam eirmod nonumy rebum dolor accusam, ipsum kasd eos consetetur at sit rebum, diam kasd invidunt tempor lorem, ipsum lorem elitr sanctus eirmod takimata dolor ea invidunt.
                    Dolore magna est eirmod sanctus dolor, amet diam et eirmod et ipsum. Amet dolore tempor consetetur sed lorem dolor sit lorem tempor. Gubergren amet amet labore sadipscing clita clita diam clita. Sea amet et sed ipsum lorem elitr et, amet et labore voluptua sit rebum. Ea erat sed et diam takimata sed justo. Magna takimata justo et amet magna et.`,
  marketPrice: "",
  discountPrice: "",
  noOfReviewers: "",
}

function UploadImageItem({type}) {
  // const [baseAPIURL, setbaseAPIURL] = useState(null)
  // let apiData
  // const HandleAPI = () => {
  //   const { data:apiData } = useImageKitAPIs();
  // }
  // if (!apiData) HandleAPI()
  // useEffect(() => {
  //   if (!apiData) HandleAPI()
  // }, [apiData])
  const baseAPIURL = useImageKitAPIs()?.data;
  // console.log("Base API URL 11111:", baseAPIURL);
  const [selectedImage, setSelectedImage] = useState(null);
  const [productPreview, setProductPreview] = useState([]);
  const [reloadSection, setReloadSection] = useState(null);
  // const [imageCategory, setImageCategory] = useState(type);
  const [itemsInputs, setItemInputs] = useState(
    type==='carousel'?carouselInputObj:
    type==='products-advert'?productAdvertInputsObj:
    type==='features-advert'?featureInputObj:
    type==='product'&&productsObj
  );
  const [imageUrl, setImageUrl] = useState("");
  // const [imageID, setImageID] = useState("");
  // const [imageName, setImageName] = useState("");

  const fetchServerData = async (section=null) => {
		try {
      let serverUrls
      if (section) {
        serverUrls = await (fetch(`${baseURL}/${section}s/`));
      } else {
        serverUrls = await (fetch(`${baseURL}/${type}s/`));
      }
			if (!serverUrls.ok) {
        const errorText = "Network response was not ok"
        toast.error(errorText);
				throw new Error(errorText);
			}
			const serverData = await serverUrls.json();
			setProductPreview(serverData);
      console.log("Server Data fetched successfully");
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		// console.log("Fetching server data...");
		if (reloadSection) {
      fetchServerData(reloadSection);
      setReloadSection(null); // reset after fetching
    } else {
      fetchServerData();
    }
		// console.log("productItemArr:", productItemArr, productItemArr.length);
	}, [reloadSection]);

  const handleUploadSuccess = async (res) => {
    try {
      // console.log("Uploaded:", res);
      let bodyDataUsed
      if (type === 'carousel') {
        bodyDataUsed = {
          heading: itemsInputs.heading,
          paragraph: itemsInputs.paragraph,
          anchor: itemsInputs.anchor,
          image_url: res.url, // ✅ use res.url instead of imageUrl
          fileId: res.fileId, // Optional: if you want to store the fileId
        }
      } else if (type === 'products-advert') {
        bodyDataUsed = {
          discount: itemsInputs.discount,
          paragraph: itemsInputs.paragraph,
          anchor: itemsInputs.anchor,
          image_url: res.url, // ✅ use res.url instead of imageUrl
          fileId: res.fileId, // Optional: if you want to store the fileId
        }
      } else if (type === 'features-advert') {
        bodyDataUsed = {
          heading: itemsInputs.heading,
          paragraph: itemsInputs.paragraph,
          anchor: itemsInputs.anchor,
          // image_url: res.url, // ✅ use res.url instead of imageUrl
          // fileId: res.fileId, // Optional: if you want to store the fileId
        }
      } else if (type === 'product') {
        bodyDataUsed = {
          name: itemsInputs.name,
          description: itemsInputs.description,
          fullDescription: itemsInputs.fullDescription,
          marketPrice: itemsInputs.marketPrice,
          discountPrice: itemsInputs.discountPrice,
          noOfReviewers: itemsInputs.noOfReviewers,
          image_url: res.url, // ✅ use res.url instead of imageUrl
          fileId: res.fileId, // Optional: if you want to store the fileId
        }
      }

      // Save to state for preview
      setImageUrl(res.url); // Use res.url for preview
      // setImageID(res.fileId); // Save the fileId for potential deletion later

      // Send to Django server
      const response = await fetch(`${baseURL}/${type}s/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyDataUsed),
      })
      if (!response.ok) {
        const errorText = "Network response was not ok"
        toast.error(errorText);
				throw new Error(errorText);
      }
      const data = await response.json();
      // console.log("Response from Django:", data);
      setItemInputs(
        type==='carousel'?carouselInputObj:
        type==='products-advert'?productAdvertInputsObj:
        type==='features-advert'?featureInputObj:
        type==='product'&&productsObj
      ); // Reset inputs after successful upload
      const successText = `${type} file uploaded to image-cloud and data to server successfully!`
      console.log(successText);
      toast.success(successText);
      setReloadSection(type); // trigger re-fetch
    } catch (error) {
      console.error("Error uploading image to Django:", error);
      // Optionally, you can handle the error state here
      // setItemInputs(carouselInputObj); // Reset inputs on error
    }
  };

  const authenticator = async () => {
    try {
      const response = await fetch(`${baseURL}/imagekit-auth/`);
      if (!response.ok) {
        const errorText = "Failed to authenticate with ImageKit"
        toast.error(errorText);
        throw new Error(errorText);
      }
      const data = await response.json();
      console.log("Authentication data received");
      // console.log("Authentication data:", data);
      return data;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  };
  const inputHandler = (e) => {
    // console.log('typing ...')
    e.preventDefault();
    const { name, value } = e.target;
    setItemInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  // console.log("Inputs:", itemsInputs);

  const handleDeleteImage = async () => {
    // console.log("Selected image ID:", selectedImage);
    // console.log("Type:", type);
    // console.log("Deleting image with ID:", imageID);
    try {
      const response = await fetch(`${baseURL}/delete-${type}s/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedImage.fileId }), // must have been saved earlier
      });
      if (!response.ok) {
        const errorText = "Failed to delete image"
        toast.error(errorText);
        throw new Error(errorText);
      }
      const successText = `${type} file deleted successfully!`
      console.log(successText);
      setSelectedImage(null); // clear preview
      setReloadSection(type); // trigger re-fetch
      toast.success(successText);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSoldDesignation = async () => {
    // console.log("Selected image ID:", selectedImage);
    // console.log("Type:", type);
    // console.log("Deleting image with ID:", imageID);
    try {
      const response = await fetch(`${baseURL}/sold-${type}s/${selectedImage.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedImage.id }), // must have been saved earlier
      });
      if (!response.ok) {
        const errorText = "Failed to designate item as sold"
        toast.error(errorText);
        throw new Error(errorText);
      }
      const successText = `${type} item designated as sold successfully!`
      console.log(successText);
      setSelectedImage(null); // clear preview

      // handle notifications here
      toast.success(successText);


    } catch (error) {
      console.error("Error designating item as sold:", error);
    }
  };

  const productAdvertsType = type === 'products-advert';
  const productType = type === 'product';
  // console.log("selectedImage:", selectedImage);
  // console.log({type})
  // const input1 = itemsInputs.heading||itemsInputs.discount;
  // const input2 = itemsInputs.paragraph;
  // const input3 = itemsInputs.anchor;
  return (
    <div className="p-4 max-w-md mx-auto border rounded-xl shadow-md space-y-4"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}>
      <h2 className="text-xl font-bold">Add New {type}</h2>

      {!productType ?
        <>
          <input
            type="text"
            name={!productAdvertsType?"heading":"discount"}
            placeholder={`Enter ${!productAdvertsType?"heading":"discount"}`}
            value={itemsInputs?.heading??itemsInputs?.discount}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />

          <textarea
            name="paragraph"
            rows={3}
            placeholder="Enter paragraph"
            value={itemsInputs.paragraph||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="anchor"
            placeholder="Enter anchor text"
            value={itemsInputs.anchor||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />
        </>
        :
        <>
          <input
            type="text"
            name={"name"}
            placeholder={`Enter product name`}
            value={itemsInputs.name||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            rows={7}
            placeholder="Enter product's description"
            value={itemsInputs.description||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />
          <textarea
            name="fullDescription"
            rows={10}
            placeholder="Enter product's full description here"
            value={itemsInputs.fullDescription||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />
          {/* <input
            type="text"
            name={"description"}
            placeholder={`Enter product description`}
            value={itemsInputs.description||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          /> */}
          <input
            type="text"
            name={"marketPrice"}
            placeholder={`Enter market price`}
            value={itemsInputs.marketPrice||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name={"discountPrice"}
            placeholder={`Enter discount price`}
            value={itemsInputs.discountPrice||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name={"noOfReviewers"}
            placeholder={`Enter no of reviewers`}
            value={itemsInputs.noOfReviewers||""}
            onChange={inputHandler}
            className="w-full p-2 border rounded"
          />
        </>}

      <IKContext
        publicKey={baseAPIURL?.IMAGEKIT_PUBLIC_KEY}
        urlEndpoint={baseAPIURL?.IMAGEKIT_URL_ENDPOINT}
        authenticator={authenticator}
      >
        {type !== "features-advert" ?
          <IKUpload
          fileName={`${type}.jpg`}
          folder={`/${type}s`}
          onSuccess={handleUploadSuccess}
          onError={(err) => console.error("Upload error:", err)}
          className="p-2 border rounded cursor-pointer"
        />
      :
        (
          <button
            onClick={handleUploadSuccess}
            className="p-2 border rounded text-white cursor-pointer"
            style={{ backgroundColor: "#4A90E2" }} // Example color
          >
            Trigger Upload Success
          </button>
        )
        //  : null
      }
      </IKContext>

      {/* preview image */}
      {/* {imageUrl && <IKImage src={imageUrl} alt="Uploaded" width="200" />} */}
      {imageUrl && (
        <div className="mt-1">
          <p className="font-medium mb-0">Upload Success:</p>
          <IKImage
            src={imageUrl}
            alt="Uploaded"
            urlEndpoint={baseAPIURL?.IMAGEKIT_URL_ENDPOINT}
            transformation={[
              { width: 100, height: 100, crop: "fill" },
              { quality: 80 },
              { format: "webp" }
            ]}
          />
        </div>
      )}
      {(productPreview&&type!=='features-advert') && (
        <div className="mt-4">
          <p className="font-medium mb-0">Uploaded Images:</p>
          {productPreview.map((image, index) => {
            // console.log("Image URL:", image);
            return (
              <div key={index}
              style={{
                margin: '0.5rem',
                display: 'inline-flex'
                }}>
                <img
                  className="rounded"
                  src={image.image_url}
                  alt="Preview"
                  onClick={()=>setSelectedImage({
                    fileId: image.fileId,
                    fileUrl: image.image_url,
                    id: image.id,
                  })}
                  style={{
                    width: 100,
                    height: 100,
                    crop: "fill",
                    cursor: 'pointer',
                  }}
                />
                </div>)})}
        </div>
      )}
      {selectedImage?.fileUrl &&
        <div>
          <p className="font-medium mb-0 mt-3">Selected Image:</p>
          <img
            className="rounded"
            src={selectedImage.fileUrl}
            alt="Preview"
            style={{
              border: "3px solid #4A90E2",
              width: 100,
              height: 100,
              crop: "fill",
            }}
          />
        </div>}
        {
        type==='product' &&
        <button
        onClick={handleSoldDesignation}
        className="p-2 border rounded text-white cursor-pointer"
        style={{ backgroundColor: "#4A90E2" }}>
          Designate as Sold
        </button>}
        <button
        onClick={handleDeleteImage}
        className="p-2 border rounded text-white cursor-pointer"
        style={{ backgroundColor: "#4A90E2" }}>
          Delete
        </button>
    </div>
  );
}

export { UploadImageItem };
