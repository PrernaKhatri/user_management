exports.buildImageUrl = (baseUrl, folder, filePath) => {
    if (!filePath) return null;
  
    return `${baseUrl}/uploads/${folder}/${filePath.replace(/\\/g, "/")}`;
};
  