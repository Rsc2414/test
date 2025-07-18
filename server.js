const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection 
// coment
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Image Model
const Image = mongoose.model('Image', {
  filename: String,
  path: String,
  uploadDate: { type: Date, default: Date.now }
});

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Upload Endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const newImage = new Image({
      filename: req.file.filename,
      path: req.file.path
    });
    await newImage.save();
    res.status(201).send('Image uploaded successfully');
  } catch (err) {
    res.status(500).send('Upload failed');
  }
});

// Dashboard Endpoint
app.get('/dashboard', async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadDate: -1 });
    res.send(`
      <h1>Image Dashboard</h1>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        ${images.map(img => `
          <div style="border: 1px solid #ccc; padding: 10px;">
            <img src="/${img.path}" width="200" />
            <p>${img.filename}</p>
            <small>${img.uploadDate}</small>
          </div>
        `).join('')}
      </div>
    `);
  } catch (err) {
    res.status(500).send('Error loading dashboard');
  }
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));