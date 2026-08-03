import QRCodeStyling from 'qr-code-styling';

const QR_SIZE = 800;
const ERROR_CORRECTION_LEVEL = 'H';
const IMAGE_MARGIN = 6;

const BASE_OPTIONS = Object.freeze({
  width: QR_SIZE,
  height: QR_SIZE,
  type: 'canvas',
  qrOptions: {
    typeNumber: 0,
    mode: 'Byte',
    errorCorrectionLevel: ERROR_CORRECTION_LEVEL,
  },
  dotsOptions: {
    type: 'rounded',
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    hideBackgroundDots: true,
    margin: IMAGE_MARGIN,
  },
});

export const buildQRCodeOptions = (config, logoDataUrl) => ({
  data: config.url || 'https://logoqrcodegenerator.com',
  image: logoDataUrl || undefined,
  dotsOptions: {
    type: 'rounded',
    color: config.qrColor,
  },
  backgroundOptions: {
    color: config.bgColor,
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    hideBackgroundDots: true,
    imageSize: config.logoScale,
    margin: IMAGE_MARGIN,
  },
  cornersSquareOptions: {
    color: config.eyeColor || config.qrColor,
    type: 'extra-rounded',
  },
  cornersDotOptions: {
    color: config.eyeColor || config.qrColor,
    type: 'dot',
  },
});

export const createQRCodeInstance = (config, logoDataUrl) => {
  const dynamicOptions = buildQRCodeOptions(config, logoDataUrl);

  return new QRCodeStyling({
    ...BASE_OPTIONS,
    ...dynamicOptions,
  });
};
