// buzzUploader.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const parentId = 'eb9vp5huhihi'; // Movies folder ID

async function uploadToBuzzHeavier(filePath, onProgress) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;

  let uploaded = 0;
  let lastPercent = 0;

  const config = {
    headers: {
      'Authorization': `Bearer ${process.env.BUZZHEAVIER_API_KEY}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileSize
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
        if (percent !== lastPercent) {
          lastPercent = percent;
          onProgress(percent);
        }
      }
    }
  };

  try {
    const url = `https://w.buzzheavier.com/${parentId}/${encodeURIComponent(fileName)}`;
    const response = await axios.put(url, fileBuffer, config);

    if (String(response.status).startsWith('2') && response.data && response.data.data && response.data.data.id) {
      return `https://buzzheavier.com/${response.data.data.id}`;
    } else {
      console.error('Upload succeeded but no valid file ID returned:', response.data);
      throw new Error('Upload succeeded but file ID not found in response');
    }
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.warn('⚠️ File may already exist on server. Trying to fetch existing file ID.');
      try {
        const lookupRes = await axios.get(`https://buzzheavier.com/api/fs/${parentId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.BUZZHEAVIER_API_KEY}`,
          }
        });

        const files = lookupRes.data?.children || [];
        const existingFile = files.find(f => f.name === fileName);

        if (existingFile && existingFile.id) {
          return `https://buzzheavier.com/${existingFile.id}`;
        } else {
          throw new Error('File already exists but ID not found.');
        }
      } catch (lookupErr) {
        console.error('Error fetching existing file ID:', lookupErr.message);
        throw lookupErr;
      }
    } else {
      console.error('Error uploading to BuzzHeavier:', err.message);
      throw err;
    }
  } finally {
    // ✅ Clean up the temp file after upload attempt
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('⚠️ Failed to delete temp file:', err);
        else console.log('🧹 Temp file deleted:', filePath);
      });
    }
  }
}

module.exports = { uploadToBuzzHeavier };
