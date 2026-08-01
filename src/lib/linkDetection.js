export const LINK_TYPES = Object.freeze(['website', 'whatsapp', 'instagram', 'facebook', 'maps', 'forms', 'menu']);

export const DEFAULT_LINK_TYPE = 'website';

const LINK_TYPE_MATCHERS = [
  {
    type: 'whatsapp',
    patterns: [/wa\.me/i, /whatsapp\.com/i, /api\.whatsapp\.com/i],
  },
  {
    type: 'instagram',
    patterns: [/instagram\.com/i],
  },
  {
    type: 'facebook',
    patterns: [/facebook\.com/i, /fb\.com/i],
  },
  {
    type: 'maps',
    patterns: [/maps\.google\.com/i, /google\.com\/maps/i, /goo\.gl\/maps/i],
  },
  {
    type: 'forms',
    patterns: [/forms\.gle/i, /google\.com\/forms/i],
  },
  {
    type: 'menu',
    patterns: [/linktr\.ee/i, /menu/i],
  },
];

export const normalizeUrlInput = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

export const detectLinkType = (url) => {
  const normalizedUrl = normalizeUrlInput(url);

  if (!normalizedUrl) {
    return DEFAULT_LINK_TYPE;
  }

  for (const matcher of LINK_TYPE_MATCHERS) {
    if (matcher.patterns.some((pattern) => pattern.test(normalizedUrl))) {
      return matcher.type;
    }
  }

  return DEFAULT_LINK_TYPE;
};

export const getLinkTypeLabel = (linkType) => {
  switch (linkType) {
    case 'whatsapp':
      return 'WhatsApp';
    case 'instagram':
      return 'Instagram';
    case 'facebook':
      return 'Facebook';
    case 'maps':
      return 'Google Maps';
    case 'forms':
      return 'Forms';
    case 'menu':
      return 'Menu';
    default:
      return 'Website';
  }
};

export const getSuggestedLinkTheme = (linkType) => {
  switch (linkType) {
    case 'whatsapp':
      return {
        qrColor: '#128c7e',
        bgColor: '#ffffff',
        eyeColor: '#075e54',
        textColor: '#0f172a',
      };
    case 'instagram':
      return {
        qrColor: '#c13584',
        bgColor: '#ffffff',
        eyeColor: '#833ab4',
        textColor: '#0f172a',
      };
    case 'facebook':
      return {
        qrColor: '#1877f2',
        bgColor: '#ffffff',
        eyeColor: '#0a3d91',
        textColor: '#0f172a',
      };
    case 'maps':
      return {
        qrColor: '#0f9d58',
        bgColor: '#ffffff',
        eyeColor: '#0b6b3a',
        textColor: '#0f172a',
      };
    case 'forms':
      return {
        qrColor: '#6a1b9a',
        bgColor: '#ffffff',
        eyeColor: '#4a148c',
        textColor: '#0f172a',
      };
    case 'menu':
      return {
        qrColor: '#ef6c00',
        bgColor: '#ffffff',
        eyeColor: '#e65100',
        textColor: '#0f172a',
      };
    default:
      return {
        qrColor: '#0b5fff',
        bgColor: '#ffffff',
        eyeColor: '#0f172a',
        textColor: '#0f172a',
      };
  }
};