import multer from "multer";

const storage = multer.diskStorage({
  filename: function (req, file, callback) {

    callback(null, file.originalname);
  },
});
//this is make instance of multer
const upload = multer({ storage });

export default upload;
