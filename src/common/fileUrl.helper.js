exports.buildImageUrl = (baseUrl, filePath) => {
    if (!filePath) return null;
  
    return `${baseUrl}/${filePath.replace(/\\/g, "/")}`;
  };
  