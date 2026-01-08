const multer = require("multer"); //multer library import
const path = require("path"); //Built-in module() used to extract file extensions
const fs = require("fs");

const createUploader = ({folder, fieldName}) =>{

    const uploadPath = path.join(__dirname, "..", "uploads",folder);

    if(!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath,{recursive:true});
    }
    const storage = multer.diskStorage({ //Stores files on disk/server not in memory
    destination: (req,file,cb) =>{ //file : contains file info like name,size,ext. cb: used to return result to multer, format is cb(error,value))
        cb(null, uploadPath); //here, null means no error
    },
    filename: (req,file,cb) => {
        const ext = path.extname(file.originalname);
        const id = req.params.education_id || req.params.user_id || "file";
        cb(null, `${id}_${Date.now()}${ext}`);
        //In the above line the out put may be like :
        //user_5_174030288.png here date is used because if any user reuploads the same file but will considered different because we have took current time.
    }
});

const fileFilter = (req,file,cb) =>{
    if(!file.mimetype.startsWith("image/")){ 
        return cb(new Error("only image files are allowed"),false);
    }
    cb(null,true);
};

return multer({storage,limits: { fileSize: 2 * 1024 * 1024 },fileFilter}).single(fieldName);
};

module.exports = createUploader;

