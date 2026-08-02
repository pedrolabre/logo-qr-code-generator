const FORBIDDEN_TAG_NAMES = ['script', 'foreignObject', 'iframe', 'object', 'embed'];

const SVG_MIME_TYPES = new Set(['image/svg+xml']);

const SVG_FILE_EXTENSION_PATTERN = /\.svg$/i;

export const isSvgFile = (file) => {
  if (!(file instanceof File)) {
    return false;
  }

  return SVG_MIME_TYPES.has(file.type) || SVG_FILE_EXTENSION_PATTERN.test(file.name);
};

export const sanitizeSvgMarkup = (rawSvgMarkup) => {
  if (typeof rawSvgMarkup !== 'string' || rawSvgMarkup.trim() === '') {
    throw new Error('Envie um arquivo SVG valido.');
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(rawSvgMarkup, 'image/svg+xml');

  if (documentNode.querySelector('parsererror')) {
    throw new Error('Arquivo SVG com sintaxe XML invalida.');
  }

  const svgElement = documentNode.querySelector('svg');

  if (!svgElement) {
    throw new Error('O arquivo enviado nao contem um elemento <svg>.');
  }

  for (const tagName of FORBIDDEN_TAG_NAMES) {
    for (const element of Array.from(documentNode.getElementsByTagName(tagName))) {
      element.remove();
    }
  }

  for (const element of Array.from(documentNode.getElementsByTagName('*'))) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith('on')) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  return new XMLSerializer().serializeToString(documentNode);
};

export const readAndSanitizeSvgFile = async (file) => {
  if (!isSvgFile(file)) {
    throw new Error('Envie apenas arquivos SVG.');
  }

  const rawSvgMarkup = await file.text();

  return sanitizeSvgMarkup(rawSvgMarkup);
};