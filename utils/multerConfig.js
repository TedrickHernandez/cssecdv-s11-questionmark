// middleware/multerConfig.js
const multer = require('multer');
const path = require('path');
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/json'];

// Function to create a new Multer configuration
const createMulterConfig = (uploadPath) => {
    let dynamicUploadPath = uploadPath || ''; // Initialize with the provided upload path or an empty string

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            // Use the dynamicUploadPath here
            cb(null, dynamicUploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        },
    });

    // Function to determine file filter based on MIME types
    const filter = (req, file, callback) => {
        callback(null, allowedMimeTypes.includes(file.mimetype));
    };

    // upload is now a Multer object
    const upload = multer({
        storage: storage,
        fileFilter: filter,
    });

    return { upload };
};

module.exports = createMulterConfig;
