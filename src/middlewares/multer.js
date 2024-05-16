import multer from "multer";

const storageUploads = multer.diskStorage({
    destination: function (req, file, cb) {
        const dirProfile = `src/data/profiles`;
        const dirProducts = `src/data/products`;
        const dirIdDoc = `src/data/documents/idDocs`;
        const dirAdressDoc = `src/data/documents/adressDocs`;
        const dirAccountDoc = `src/data/documents/accountDocs`;
        if (file.fieldname === "avatar") return cb(null, dirProfile)
        if (file.fieldname === "prodPic") return cb(null, dirProducts)
        if (file.fieldname === "adressDoc") return cb(null, dirAdressDoc)
        if (file.fieldname === "accountDoc") return cb(null, dirAccountDoc)
        if (file.fieldname === "idDoc") return cb(null, dirIdDoc)
        cb(null, dirDocuments);
    },
    filename: function (req, file, cb) {
        const date = new Date();
        const fileName = (file.originalname).replaceAll(" ", "_");
        cb(null, req.user.email +"_"+ date.getDate() +"_"+ (date.getMonth() + 1) +"_"+ date.getFullYear() +"_"+ fileName)
    }
})

const fileExtFilter = function (req, file, cb) {
    try {
        const ext = file.mimetype.slice(-4)
        if (file && (file.fieldname === "avatar" || file.fieldname === "prodPic") && ext !== '/png' && ext !== '/jpg' && ext !== '/gif' && ext !== 'jpeg') {
            cb(new Error("Imagen no reconocida. (png, jpg, gif, jpeg)"))
            return
        } else if (file && ext !== '/pdf' && ext !== '/doc' && ext !== 'docx' && ext !== '/png' && ext !== '/jpg' && ext !== '/gif' && ext !== 'jpeg') {
            cb(new Error("Tipo de archivo no permitido. (pdf, doc, docx, png, jpg, gif, jpeg)"))
            return
        }
        cb(null, true)
    } catch (error) {
        cb(error, null)
    }

}

export const uploads = multer({ fileFilter: fileExtFilter, storage: storageUploads })
