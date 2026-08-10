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

const buildExportFileName = (extension) => {
  const timestamp = Date.now();

  return `qr-code-${timestamp}.${extension}`;
};

export const downloadQRCode = async (qrInstance, extension) => {
  if (!qrInstance) {
    throw new Error('Instância do QR Code não disponível para exportação.');
  }

  const validExtensions = ['svg', 'png'];

  if (!validExtensions.includes(extension)) {
    throw new Error(`Formato de exportação "${extension}" não suportado.`);
  }

  const fileName = buildExportFileName(extension);

  try {
    await qrInstance.download({
      extension,
      name: fileName.replace(`.${extension}`, ''),
    });
  } catch (error) {
    console.error('Erro ao exportar QR Code:', error);

    throw new Error('Não foi possível exportar o QR Code. Tente novamente.');
  }
};
