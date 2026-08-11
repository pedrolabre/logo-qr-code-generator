export const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

export const isHexColor = (value) => typeof value === 'string' && HEX_COLOR_PATTERN.test(value.trim());

const normalizeHex = (value) => {
  if (!isHexColor(value)) {
    return null;
  }

  const hex = value.trim().slice(1);

  if (hex.length === 3) {
    return hex
      .split('')
      .map((character) => `${character}${character}`)
      .join('');
  }

  return hex;
};

export const hexToRgb = (value) => {
  const normalizedHex = normalizeHex(value);

  if (!normalizedHex) {
    return null;
  }

  return {
    red: Number.parseInt(normalizedHex.slice(0, 2), 16),
    green: Number.parseInt(normalizedHex.slice(2, 4), 16),
    blue: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
};

export const getRelativeLuminance = (value) => {
  const rgb = hexToRgb(value);

  if (!rgb) {
    return null;
  }

  const convertChannel = (channelValue) => {
    const normalizedChannel = channelValue / 255;

    if (normalizedChannel <= 0.03928) {
      return normalizedChannel / 12.92;
    }

    return ((normalizedChannel + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * convertChannel(rgb.red) +
    0.7152 * convertChannel(rgb.green) +
    0.0722 * convertChannel(rgb.blue)
  );
};

export const getContrastRatio = (foreground, background) => {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);

  if (foregroundLuminance === null || backgroundLuminance === null) {
    return 0;
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

export const isReadableColorPair = (foreground, background, minimumRatio = 4.5) =>
  getContrastRatio(foreground, background) >= minimumRatio;

export const getReadableTextColor = (
  background,
  { lightColor = '#ffffff', darkColor = '#0f172a', minimumRatio = 4.5 } = {},
) => {
  const lightColorRatio = getContrastRatio(lightColor, background);
  const darkColorRatio = getContrastRatio(darkColor, background);

  if (lightColorRatio >= minimumRatio) {
    return lightColor;
  }

  if (darkColorRatio >= minimumRatio) {
    return darkColor;
  }

  return lightColorRatio >= darkColorRatio ? lightColor : darkColor;
};

export const QR_MIN_CONTRAST_RATIO = 3.0;

export const getContrastFeedback = (value) => {
  if (value >= 4.5) {
    return {
      label: 'Contraste bom',
      tone: 'good',
      surface: 'rgba(22, 163, 74, 0.12)',
      border: 'rgba(22, 163, 74, 0.28)',
    };
  }

  if (value >= QR_MIN_CONTRAST_RATIO) {
    return {
      label: 'Contraste no limite',
      tone: 'warning',
      surface: 'rgba(245, 158, 11, 0.14)',
      border: 'rgba(245, 158, 11, 0.3)',
    };
  }

  return {
    label: 'Contraste baixo',
    tone: 'danger',
    surface: 'rgba(220, 38, 38, 0.14)',
    border: 'rgba(220, 38, 38, 0.3)',
  };
};

export const getScannabilityStatus = (qrContrastRatio) => {
  if (qrContrastRatio >= 4.5) {
    return {
      level: 'safe',
      label: 'Leitura segura',
      message: 'Cores prontas para baixar. Teste em um celular antes de imprimir.',
      canExport: true,
    };
  }

  if (qrContrastRatio >= QR_MIN_CONTRAST_RATIO) {
    return {
      level: 'acceptable',
      label: 'Leitura aceitável',
      message: 'O contraste está no limite. Faça um teste de leitura antes de usar.',
      canExport: true,
    };
  }

  return {
    level: 'blocked',
    label: 'Leitura comprometida',
    message: 'Aumente o contraste entre QR e fundo para liberar os downloads.',
    canExport: false,
  };
};
