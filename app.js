const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

const multer = require('multer');
const { s3Uploadv3 } = require('./s3service');

// Memory storage for Multer (files will be stored in memory)
const storage = multer.memoryStorage();

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", false));  // Only allow images
  }
};

// Multer setup: limits, storage, and fileFilter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10000000, files: 2 }  // Adjust the file size limit (currently 10MB)
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('uploaded_file'), async (req, res) => {
  try {
    const file = req.file;  // Access the single uploaded file (not req.files)
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Call the s3Uploadv3 function to upload the file to S3
    const result = await s3Uploadv3(file);
    res.json({ status: 'Success', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file' , message:error});
  }
});

// Global error handler for Multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.log('Multer Error:', error);
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
