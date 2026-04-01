const QRCode = require('qrcode');

const generateQR = async (data) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = generateQR;

