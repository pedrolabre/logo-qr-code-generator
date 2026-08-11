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
    throw new Error('Envie um SVG válido para usar como logo.');
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(rawSvgMarkup, 'image/svg+xml');

  if (documentNode.querySelector('parsererror')) {
    throw new Error('Não consegui ler esse SVG. Exporte novamente e tente de novo.');
  }

  const svgElement = documentNode.querySelector('svg');

  if (!svgElement) {
    throw new Error('O arquivo precisa conter uma tag <svg>.');
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
    throw new Error('Escolha um arquivo .svg para usar como logo.');
  }

  const rawSvgMarkup = await file.text();

  return sanitizeSvgMarkup(rawSvgMarkup);
};

export const normalizeSvgMarkup = (sanitizedMarkup) => {
  if (typeof sanitizedMarkup !== 'string' || sanitizedMarkup.trim() === '') {
    throw new Error('O SVG está vazio depois da validação.');
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(sanitizedMarkup, 'image/svg+xml');

  if (documentNode.querySelector('parsererror')) {
    throw new Error('O SVG validado não pôde ser normalizado.');
  }

  const svgElement = documentNode.querySelector('svg');

  if (!svgElement) {
    throw new Error('O SVG validado não contém uma tag <svg>.');
  }

  const existingViewBox = svgElement.getAttribute('viewBox');
  const widthAttr = svgElement.getAttribute('width');
  const heightAttr = svgElement.getAttribute('height');

  if (!existingViewBox && widthAttr && heightAttr) {
    const numericWidth = parseFloat(widthAttr);
    const numericHeight = parseFloat(heightAttr);

    if (!Number.isNaN(numericWidth) && !Number.isNaN(numericHeight) && numericWidth > 0 && numericHeight > 0) {
      svgElement.setAttribute('viewBox', `0 0 ${numericWidth} ${numericHeight}`);
    }
  }

  svgElement.removeAttribute('width');
  svgElement.removeAttribute('height');

  return new XMLSerializer().serializeToString(documentNode);
};

export const svgMarkupToDataUrl = (normalizedMarkup) => {
  if (typeof normalizedMarkup !== 'string' || normalizedMarkup.trim() === '') {
    return null;
  }

  const encoded = btoa(unescape(encodeURIComponent(normalizedMarkup)));

  return `data:image/svg+xml;base64,${encoded}`;
};
