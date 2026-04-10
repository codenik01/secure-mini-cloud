const Minio = require('minio');
const crypto = require('crypto');
const Log = require('../models/logModel');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'secure-cloud';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes for AES-256
const IV_LENGTH = 16;

// Initialize bucket if it doesn't exist
async function initBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket ${BUCKET_NAME} created successfully.`);
    }
  } catch (err) {
    console.error('Error initializing bucket:', err);
  }
}
initBucket();

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    
    // Encrypt file buffer
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encryptedBuffer = Buffer.concat([cipher.update(req.file.buffer), cipher.final()]);
    
    // Prepend IV to the encrypted file buffer so it can be decrypted later
    const finalBuffer = Buffer.concat([iv, encryptedBuffer]);
    const objectName = `${Date.now()}_${req.file.originalname}`;

    await minioClient.putObject(BUCKET_NAME, objectName, finalBuffer, finalBuffer.length, {
      'Content-Type': 'application/octet-stream'
    });

    // Logging the action
    await Log.create({ user: req.user.username, action: 'file_upload', ip: req.ip, details: { filename: objectName } });
    
    res.json({ message: 'File uploaded and encrypted successfully.', filename: objectName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const objectName = req.params.filename;

    const dataStream = await minioClient.getObject(BUCKET_NAME, objectName);
    let chunks = [];
    dataStream.on('data', chunk => chunks.push(chunk));
    dataStream.on('end', async () => {
      const fileBuffer = Buffer.concat(chunks);
      
      // Extract IV and encrypted data
      const iv = fileBuffer.slice(0, IV_LENGTH);
      const encryptedData = fileBuffer.slice(IV_LENGTH);
      
      // Decrypt
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let decryptedBuffer;
      try {
        decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      } catch (decErr) {
        return res.status(500).json({ error: 'Decryption failed.' });
      }

      // Logging the action
      await Log.create({ user: req.user.username, action: 'file_download', ip: req.ip, details: { filename: objectName } });

      res.setHeader('Content-Disposition', `attachment; filename="${objectName.replace(/^\d+_/, '')}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(decryptedBuffer);
    });
    
    dataStream.on('error', (err) => {
      res.status(404).json({ error: 'File not found.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download file.' });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const objectsList = [];
    const stream = minioClient.listObjects(BUCKET_NAME, '', true);
    stream.on('data', function (obj) { objectsList.push(obj); });
    stream.on('end', function () {
      res.json(objectsList);
    });
    stream.on('error', function (err) {
      res.status(500).json({ error: 'Failed to list files.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files.' });
  }
};
