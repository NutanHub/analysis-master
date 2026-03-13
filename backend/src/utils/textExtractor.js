const axios = require('axios');
const pdf = require('pdf-parse');
const { cloudinary } = require('../config/cloudinary');

async function fetchBuffer(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

async function extractTextFromPdf(url) {
  const buffer = await fetchBuffer(url);
  const data = await pdf(buffer);
  return (data.text || '').trim();
}

async function extractTextFromImage(url) {
  // TODO: Integrate Tesseract.js for image OCR if needed.
  // For now, return empty to avoid misleading results.
  return '';
}

async function extractText(fileUrl, fileType, cloudinaryId) {
  try {
    if (fileType === 'pdf') {
      // For PDFs uploaded to Cloudinary
      if (cloudinaryId) {
        // Build correct raw URL for PDFs
        const rawUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${cloudinaryId}.pdf`;
        
        try {
          console.log(`📄 Trying raw PDF URL: ${rawUrl}`);
          const text = await extractTextFromPdf(rawUrl);
          console.log(`✅ Extracted ${text.length} characters from Cloudinary raw URL`);
          return text;
        } catch (rawErr) {
          console.warn(`Raw URL failed: ${rawErr.message}`);
          
          // Fallback: try the provided fileUrl
          try {
            console.log(`📄 Trying original fileUrl: ${fileUrl}`);
            const text = await extractTextFromPdf(fileUrl);
            console.log(`✅ Extracted ${text.length} characters from fileUrl`);
            return text;
          } catch (fileErr) {
            console.error(`Original fileUrl also failed: ${fileErr.message}`);
          }
        }
      } else {
        // No cloudinaryId, try direct URL
        const text = await extractTextFromPdf(fileUrl);
        console.log(`✅ Extracted ${text.length} characters from direct URL`);
        return text;
      }
    }
    
    if (fileType === 'image') {
      return await extractTextFromImage(fileUrl);
    }
    
    console.warn('⚠️ No text extracted - all methods failed or unsupported file type');
    return '';
  } catch (err) {
    console.error('❌ Text extraction error:', err.message);
    return '';
  }
}

module.exports = { extractText };
