const multer = require("multer"); 
const path = require("path"); 
const fs = require("fs");

const createUploader = ({folder, fieldName}) =>{

    const uploadPath = path.join(__dirname, "..", "uploads",folder);

    if(!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath,{recursive:true});
    }
    const storage = multer.diskStorage({ 
    destination: (req,file,cb) =>{ 
        cb(null, uploadPath); 
    },
    filename: (req,file,cb) => {
        const ext = path.extname(file.originalname);
        const id = req.params.education_id || req.params.user_id || "file";
        cb(null, `user_${id}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req,file,cb) =>{
    if(!file.mimetype.startsWith("image/")){ 
        return cb(new Error("only image files are allowed"),false);
    }
    cb(null,true);
};

// return multer({storage,limits: { fileSize: 2 * 1024 * 1024 },fileFilter}).single(fieldName);

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter
  }).array(fieldName, 1);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            message: `Only one image is allowed and the field name must be '${fieldName}'`
          });
        }

        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Image size must be less than 2MB"
          });
        }

        return res.status(400).json({
          message: err.message || "Image upload failed"
        });
      }

      req.file = req.files?.[0] || null;

      next();
    });
  };
};

module.exports = createUploader;

