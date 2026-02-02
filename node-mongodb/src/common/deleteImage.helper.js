const fs = require("fs");
const path = require("path");

const deleteFile = (folder, filePathFromDb) => {
  if(!filePathFromDb) return;


const fullPath = path.join(__dirname,"..","uploads", folder, path.basename(filePathFromDb));

if(fs.existsSync(fullPath)){
  fs.unlinkSync(fullPath);
}
};

module.exports = {
  deleteFile
};