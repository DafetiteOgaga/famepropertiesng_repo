import React, { useEffect, useState } from "react";
import { IKContext, IKUpload, IKImage } from "imagekitio-react";
import { getBaseURL, useImageKitAPIs } from "../../hooks/fetchAPIs";
import { useAuthFetch } from "../loginSignUpProfile/authFetch";
import { toast } from 'react-toastify';
import { titleCase } from "../../hooks/changeCase";
import { authenticator } from "../loginSignUpProfile/dynamicFetchSetup";

const baseURL = getBaseURL();
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

function UploadImageItem({type}) {
  const authFetch = useAuthFetch();
  const baseAPIURL = useImageKitAPIs()?.data;
  const [selectedImage, setSelectedImage] = useState(null);
  const [productPreview, setProductPreview] = useState([]);
  const [reloadSection, setReloadSection] = useState(null);
  const [itemsInputs, setItemInputs] = useState(
    type==='carousel'?carouselInputObj:
    type==='products-advert'?productAdvertInputsObj:
    type==='features-advert'&&featureInputObj
  );
  const [imageUrl, setImageUrl] = useState("");

  const fetchServerData = async (section=null) => {
    console.log({type})
		try {
      let serverUrls
      if (section) {
        serverUrls = await authFetch(`${baseURL}/${section}s/${section==='product'?`all/`:''}`);
      } else {
        serverUrls = await authFetch(`${baseURL}/${type}s/${type==='product'?`all/`:''}`);
      }
			const serverData = await serverUrls;
      if (!serverData) return
      console.log({serverData, type})
			setProductPreview(type==="features-advert"?[serverData?.featureAdvert_image]:serverData);
      console.log("Server Data fetched successfully");
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		if (reloadSection) {
      fetchServerData(reloadSection);
      setReloadSection(null); // reset after fetching
    } else {
      fetchServerData();
    }
	}, [reloadSection]);

  const handleUploadSuccess = async (res, featureAdv=false) => {
    try {
      console.log("Uploaded:", res);
      console.log({featureAdv})
      let bodyDataUsed
      if (!featureAdv) {
        if (type === 'carousel') {
          console.log("Handling carousel upload");
          bodyDataUsed = {
            heading: itemsInputs.heading,
            paragraph: itemsInputs.paragraph,
            anchor: itemsInputs.anchor,
            image_url: res.url, // use res.url instead of imageUrl
            fileId: res.fileId, // Optional: if you want to store the fileId
          }
        } else if (type === 'products-advert') {
          console.log("Handling products-advert upload");
          bodyDataUsed = {
            discount: itemsInputs.discount,
            paragraph: itemsInputs.paragraph,
            anchor: itemsInputs.anchor,
            image_url: res.url, // use res.url instead of imageUrl
            fileId: res.fileId, // Optional: if you want to store the fileId
          }
        } else if (type === 'features-advert') {
          console.log("Handling features-advert upload");
          bodyDataUsed = {
            heading: itemsInputs.heading,
            paragraph: itemsInputs.paragraph,
            anchor: itemsInputs.anchor,
            text_fields: !!(
              itemsInputs.paragraph||
              itemsInputs.heading||
              (itemsInputs.anchor&&
                itemsInputs.anchor.toLowerCase()!=='shop now'
              )
            ),
          }
        }
      } else {
        console.log("Handling features-advert upload - image only");
        // only image for features advert
        bodyDataUsed = {
          heading: itemsInputs.heading,
          paragraph: itemsInputs.paragraph,
          anchor: itemsInputs.anchor,
          image_url: res.url, // use res.url instead of imageUrl
          fileId: res.fileId, // Optional: if you want to store the fileId
          text_fields: !!(
            itemsInputs.paragraph||
            itemsInputs.heading||
            (itemsInputs.anchor&&
              itemsInputs.anchor.toLowerCase()!=='shop now'
            )
          ),
        }
        console.log({bodyDataUsed} )
      }

      // Save to state for preview
      setImageUrl(res.url); // Use res.url for preview

      // Send to Django server
      const response = await authFetch(`${baseURL}/${type}s/`, {
        method: "POST",
        body: bodyDataUsed,
      })

      const data = await response
      if (!data) return
      console.log("Response from Django:", data);
      setItemInputs(
        type==='carousel'?carouselInputObj:
        type==='products-advert'?productAdvertInputsObj:
        type==='features-advert'&&featureInputObj
      ); // Reset inputs after successful upload
      const successText = `${titleCase(type)} file uploaded to image-cloud and data to server successfully!`
      toast.success(successText);
      setReloadSection(type); // trigger re-fetch
    } catch (error) {
      console.error("Error uploading image to Django:", error);
    }
  };

  const inputHandler = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setItemInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleDeleteImage = async () => {
    try {
      const response = await authFetch(`${baseURL}/delete-${type}s/`, {
        method: "POST",
        body: { fileId: selectedImage.fileId }, // must have been saved earlier
      });

      if (!response) return
      const successText = `${type} file deleted successfully!`
      setSelectedImage(null); // clear preview
      setReloadSection(type); // trigger re-fetch
      toast.success(successText);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const productAdvertsType = type === 'products-advert';
  return (
    <div className="p-4 max-w-md mx-auto border rounded-xl shadow-md space-y-4"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}>
      <h2 className="text-xl font-bold">Add New {type}</h2>

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
          (<>
              <button
                onClick={handleUploadSuccess}
                className="p-2 border rounded text-white cursor-pointer"
                style={{ backgroundColor: "#4A90E2" }} // Example color
              >
                Trigger Upload Success
              </button>

              <IKUpload
              fileName={`${type}.jpg`}
              folder={`/${type}s`}
              onSuccess={(res)=>handleUploadSuccess(res, true)}
              onError={(err) => console.error("Upload error:", err)}
              className="p-2 border rounded cursor-pointer"
              />
              </>
          )
        }
      </IKContext>

      {/* preview image */}
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
      {(productPreview) && (
        <div className="mt-4">
          <p className="font-medium mb-0">Uploaded Images:</p>
          {productPreview.map((image, index) => {
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
