export const SVG_MAX_FILE_BYTES = 500 * 1024;

export const DEFAULT_SVG_VIEW_BOX = '0 0 100 100';

export const SVG_DIMENSION_FALLBACK_WARNING =
  'O SVG enviado nao define dimensoes; usei uma area padrao e o logo pode aparecer com proporcao incorreta.';

const SVG_FILE_SIZE_ERROR = 'O SVG deve ter no maximo 500 KB para evitar travar a previa.';

const SVG_MIME_TYPES = new Set(['image/svg+xml']);

const SVG_FILE_EXTENSION_PATTERN = /\.svg$/i;

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const XLINK_NAMESPACE_URI = 'http://www.w3.org/1999/xlink';
const XMLNS_NAMESPACE_URI = 'http://www.w3.org/2000/xmlns/';

const ALLOWED_TAG_NAMES = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'defs',
  'lineargradient',
  'radialgradient',
  'stop',
  'clippath',
  'mask',
  'symbol',
  'use',
  'title',
  'desc',
]);

const GLOBAL_ATTRIBUTE_NAMES = new Set([
  'id',
  'class',
  'transform',
  'opacity',
  'fill',
  'fill-opacity',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'vector-effect',
  'clip-path',
  'mask',
  'display',
  'visibility',
]);

const ATTRIBUTE_NAMES_BY_TAG = {
  svg: new Set(['xmlns', 'xmlns:xlink', 'viewbox', 'preserveaspectratio', 'width', 'height', 'x', 'y']),
  g: new Set(),
  path: new Set(['d', 'pathlength']),
  circle: new Set(['cx', 'cy', 'r', 'pathlength']),
  ellipse: new Set(['cx', 'cy', 'rx', 'ry', 'pathlength']),
  rect: new Set(['x', 'y', 'width', 'height', 'rx', 'ry', 'pathlength']),
  line: new Set(['x1', 'y1', 'x2', 'y2', 'pathlength']),
  polyline: new Set(['points', 'pathlength']),
  polygon: new Set(['points', 'pathlength']),
  defs: new Set(),
  lineargradient: new Set([
    'x1',
    'y1',
    'x2',
    'y2',
    'gradientunits',
    'gradienttransform',
    'spreadmethod',
    'href',
    'xlink:href',
  ]),
  radialgradient: new Set([
    'cx',
    'cy',
    'r',
    'fx',
    'fy',
    'fr',
    'gradientunits',
    'gradienttransform',
    'spreadmethod',
    'href',
    'xlink:href',
  ]),
  stop: new Set(['offset', 'stop-color', 'stop-opacity']),
  clippath: new Set(['clippathunits']),
  mask: new Set(['x', 'y', 'width', 'height', 'maskunits', 'maskcontentunits']),
  symbol: new Set(['viewbox', 'preserveaspectratio', 'x', 'y', 'width', 'height']),
  use: new Set(['href', 'xlink:href', 'x', 'y', 'width', 'height']),
  title: new Set(),
  desc: new Set(),
};

const HREF_ALLOWED_TAG_NAMES = new Set(['use', 'lineargradient', 'radialgradient']);
const LOCAL_REFERENCE_PATTERN = /^#[^\s"'<>#]+$/;
const URL_FUNCTION_PATTERN = /url\(\s*(?:'([^']*)'|"([^"]*)"|([^'")]*))\s*\)/gi;
const VIEW_BOX_SEPARATOR_PATTERN = /[\s,]+/;

const getMarkupByteSize = (markup) => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(markup).byteLength;
  }

  return markup.length;
};

const enforceSvgSizeLimit = (byteSize) => {
  if (byteSize > SVG_MAX_FILE_BYTES) {
    throw new Error(SVG_FILE_SIZE_ERROR);
  }
};

const getElementTagName = (element) => (element.localName || element.tagName || '').toLowerCase();

const isAllowedSvgNamespace = (element) => !element.namespaceURI || element.namespaceURI === SVG_NAMESPACE_URI;

const isAllowedElement = (element) => ALLOWED_TAG_NAMES.has(getElementTagName(element)) && isAllowedSvgNamespace(element);

const getAttributeName = (attribute) => {
  if (attribute.namespaceURI === XLINK_NAMESPACE_URI && attribute.localName === 'href') {
    return 'xlink:href';
  }

  return attribute.name.toLowerCase();
};

const isLocalReference = (value) => LOCAL_REFERENCE_PATTERN.test(value.trim());

const getUrlReferences = (value) =>
  Array.from(value.matchAll(URL_FUNCTION_PATTERN), (match) => (match[1] ?? match[2] ?? match[3] ?? '').trim());

const hasOnlyLocalUrlReferences = (value) => {
  if (!/url\s*\(/i.test(value)) {
    return true;
  }

  const references = getUrlReferences(value);

  return references.length > 0 && references.every(isLocalReference);
};

const isSafeAttributeValue = (tagName, attributeName, value) => {
  const trimmedValue = value.trim();

  if (/expression\s*\(|@import/i.test(trimmedValue)) {
    return false;
  }

  if ((attributeName === 'href' || attributeName === 'xlink:href') && !HREF_ALLOWED_TAG_NAMES.has(tagName)) {
    return false;
  }

  if (attributeName === 'href' || attributeName === 'xlink:href') {
    return isLocalReference(trimmedValue);
  }

  return hasOnlyLocalUrlReferences(trimmedValue);
};

const isAllowedNamespaceDeclaration = (tagName, attribute, attributeName) => {
  if (tagName !== 'svg' || attribute.namespaceURI !== XMLNS_NAMESPACE_URI) {
    return false;
  }

  if (attributeName === 'xmlns') {
    return attribute.value === SVG_NAMESPACE_URI;
  }

  if (attributeName === 'xmlns:xlink') {
    return attribute.value === XLINK_NAMESPACE_URI;
  }

  return false;
};

const isAllowedAttribute = (tagName, attribute) => {
  const attributeName = getAttributeName(attribute);

  if (attributeName.startsWith('on') || attributeName === 'style') {
    return false;
  }

  if (attributeName.startsWith('xmlns')) {
    return isAllowedNamespaceDeclaration(tagName, attribute, attributeName);
  }

  if (attribute.namespaceURI && attribute.namespaceURI !== XLINK_NAMESPACE_URI) {
    return false;
  }

  const tagAttributeNames = ATTRIBUTE_NAMES_BY_TAG[tagName] ?? new Set();
  const hasAllowedName = GLOBAL_ATTRIBUTE_NAMES.has(attributeName) || tagAttributeNames.has(attributeName);

  return hasAllowedName && isSafeAttributeValue(tagName, attributeName, attribute.value);
};

const removeUnsafeDocumentNodes = (documentNode) => {
  if (documentNode.doctype) {
    documentNode.removeChild(documentNode.doctype);
  }

  const walker = documentNode.createTreeWalker(documentNode, 64 | 128);
  const nodesToRemove = [];

  while (walker.nextNode()) {
    nodesToRemove.push(walker.currentNode);
  }

  for (const node of nodesToRemove) {
    node.parentNode?.removeChild(node);
  }
};

const sanitizeElementTree = (documentNode) => {
  // The root problem is SVG's large network-capable surface area, so this is a positive
  // allowlist for logo primitives. Unknown future tags/attributes are removed by default.
  for (const element of Array.from(documentNode.getElementsByTagName('*'))) {
    if (!isAllowedElement(element)) {
      element.remove();
      continue;
    }

    const tagName = getElementTagName(element);

    for (const attribute of Array.from(element.attributes)) {
      if (!isAllowedAttribute(tagName, attribute)) {
        element.removeAttribute(attribute.name);
      }
    }
  }
};

export const isSvgFile = (file) => {
  if (typeof File === 'undefined' || !(file instanceof File)) {
    return false;
  }

  return SVG_MIME_TYPES.has(file.type) || SVG_FILE_EXTENSION_PATTERN.test(file.name);
};

export const sanitizeSvgMarkup = (rawSvgMarkup) => {
  if (typeof rawSvgMarkup !== 'string' || rawSvgMarkup.trim() === '') {
    throw new Error('Envie um SVG valido para usar como logo.');
  }

  // Reject before DOMParser so an oversized SVG cannot stall the preview render path.
  enforceSvgSizeLimit(getMarkupByteSize(rawSvgMarkup));

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(rawSvgMarkup, 'image/svg+xml');

  if (documentNode.querySelector('parsererror')) {
    throw new Error('Nao consegui ler esse SVG. Exporte novamente e tente de novo.');
  }

  const svgElement = documentNode.documentElement;

  if (!svgElement || getElementTagName(svgElement) !== 'svg' || !isAllowedSvgNamespace(svgElement)) {
    throw new Error('O arquivo precisa conter uma tag <svg> como elemento raiz.');
  }

  removeUnsafeDocumentNodes(documentNode);
  sanitizeElementTree(documentNode);

  return new XMLSerializer().serializeToString(documentNode);
};

export const readAndSanitizeSvgFile = async (file) => {
  if (!isSvgFile(file)) {
    throw new Error('Escolha um arquivo .svg para usar como logo.');
  }

  enforceSvgSizeLimit(file.size);

  const rawSvgMarkup = await file.text();

  return sanitizeSvgMarkup(rawSvgMarkup);
};

const parseSvgDimension = (value) => {
  if (!value) {
    return null;
  }

  const numericValue = parseFloat(value);

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
};

export const isValidSvgViewBox = (value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  const parts = value.trim().split(VIEW_BOX_SEPARATOR_PATTERN).filter(Boolean);

  if (parts.length !== 4) {
    return false;
  }

  const numbers = parts.map(Number);

  return numbers.every(Number.isFinite) && numbers[2] > 0 && numbers[3] > 0;
};

export const normalizeSvgMarkupWithInfo = (sanitizedMarkup) => {
  if (typeof sanitizedMarkup !== 'string' || sanitizedMarkup.trim() === '') {
    throw new Error('O SVG esta vazio depois da validacao.');
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(sanitizedMarkup, 'image/svg+xml');

  if (documentNode.querySelector('parsererror')) {
    throw new Error('O SVG validado nao pode ser normalizado.');
  }

  const svgElement = documentNode.documentElement;

  if (!svgElement || getElementTagName(svgElement) !== 'svg') {
    throw new Error('O SVG validado nao contem uma tag <svg>.');
  }

  const existingViewBox = svgElement.getAttribute('viewBox');
  const widthAttr = svgElement.getAttribute('width');
  const heightAttr = svgElement.getAttribute('height');

  if (!isValidSvgViewBox(existingViewBox)) {
    const numericWidth = parseSvgDimension(widthAttr);
    const numericHeight = parseSvgDimension(heightAttr);

    if (numericWidth && numericHeight) {
      svgElement.setAttribute('viewBox', `0 0 ${numericWidth} ${numericHeight}`);
    }
  }

  let warning = '';

  if (!isValidSvgViewBox(svgElement.getAttribute('viewBox'))) {
    // The fallback fixes the rendering contract instead of leaving the browser to invent
    // its 300x150 default, while the warning keeps the possible aspect-ratio issue visible.
    svgElement.setAttribute('viewBox', DEFAULT_SVG_VIEW_BOX);
    warning = SVG_DIMENSION_FALLBACK_WARNING;
  }

  svgElement.removeAttribute('width');
  svgElement.removeAttribute('height');

  return {
    markup: new XMLSerializer().serializeToString(documentNode),
    warning,
  };
};

export const normalizeSvgMarkup = (sanitizedMarkup) => normalizeSvgMarkupWithInfo(sanitizedMarkup).markup;

export const svgMarkupToDataUrl = (normalizedMarkup) => {
  if (typeof normalizedMarkup !== 'string' || normalizedMarkup.trim() === '') {
    return null;
  }

  const encoded = btoa(unescape(encodeURIComponent(normalizedMarkup)));

  return `data:image/svg+xml;base64,${encoded}`;
};
