const fs = require("fs");
const path = require("path");

const deleteProfilePictureFile = (profilePicturePath) => {
  if (!profilePicturePath) return;

  const filePath = path.join(__dirname,"..",
  "uploads","profile_pictures",
    path.basename(profilePicturePath)
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  deleteProfilePictureFile
};
