import imagekitSetup from "../Config/imagekit.config.js";

// Helper Function
const getFileIdFromUrl = async (fileUrl) => {
  try {
    const files = await imagekitSetup.listFiles({
      url: fileUrl,
    });

    if (files.length === 0) {
      throw new Error("No file found for the provided URL");
    }

    return files[0].fileId;
  } catch (error) {
    console.error("Error retrieving fileId:", error.message);
    throw new Error("Failed to retrieve fileId from URL");
  }
};

//   Image kit operations
export const uploadToIMagekit = async (file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const uploadedFile = await imagekitSetup.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/uploads",
    });

    console.log("upload image success");
    return uploadedFile.url;
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteFromImageKitByUrl = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    const fileId = await getFileIdFromUrl(fileUrl);

    const response = await imagekitSetup.deleteFile(fileId);
    console.log("Image deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("Error deleting image:", error.message);
    throw new Error("Failed to delete image from ImageKit");
  }
};
