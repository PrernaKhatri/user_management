const fs = require("fs");
const path = require("path");

const deleteDegreePictureFile = (degreePicturePath) => {
  if (!degreePicturePath) return;

  const filePath = path.join(
    __dirname,"..","uploads","degree_pictures",path.basename(degreePicturePath)
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  deleteDegreePictureFile
};
