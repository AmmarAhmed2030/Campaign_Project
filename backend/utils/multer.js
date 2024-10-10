import multer, { diskStorage } from "multer";
import { extname } from "path";

const upload = multer({
  storage: diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Eror("File type is not supported", false));
      return;
    }
    cb(null, true);
  },
});

const multipleUpload = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "about", maxCount: 1 },
]);
export { multipleUpload };
export default upload;
