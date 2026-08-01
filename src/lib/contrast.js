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