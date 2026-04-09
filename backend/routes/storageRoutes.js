const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Store file in memory to encrypt it before saving
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/upload', authMiddleware, upload.single('file'), storageController.uploadFile);
router.get('/download/:filename', authMiddleware, storageController.downloadFile);
router.get('/', authMiddleware, storageController.listFiles);

module.exports = router;
