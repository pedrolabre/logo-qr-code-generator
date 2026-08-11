/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SVG_VIEW_BOX,
  SVG_DIMENSION_FALLBACK_WARNING,
  SVG_MAX_FILE_BYTES,
  isValidSvgViewBox,
  normalizeSvgMarkup,
  normalizeSvgMarkupWithInfo,
  readAndSanitizeSvgFile,
  sanitizeSvgMarkup,
} from './svg';

const XLINK_NAMESPACE_URI = 'http://www.w3.org/1999/xlink';

const parseSvg = (markup) => new DOMParser().parseFromString(markup, 'image/svg+xml');

describe('sanitizeSvgMarkup', () => {
  it('removes image tags so remote href values cannot be fetched', () => {
    const sanitizedMarkup = sanitizeSvgMarkup(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <image href="https://evil.com/x.png" width="10" height="10" />
        <path d="M0 0h10v10H0z" fill="#000" />
      </svg>
    `);
    const documentNode = parseSvg(sanitizedMarkup);

    expect(documentNode.getElementsByTagName('image')).toHaveLength(0);
    expect(documentNode.getElementsByTagName('path')).toHaveLength(1);
    expect(sanitizedMarkup).not.toContain('evil.com');
  });

  it('removes style tags instead of trying to blacklist CSS fetch vectors', () => {
    const sanitizedMarkup = sanitizeSvgMarkup(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>@import url("https://evil.com/track.css"); path { fill: red; }</style>
        <path d="M0 0h10v10H0z" />
      </svg>
    `);
    const documentNode = parseSvg(sanitizedMarkup);

    expect(documentNode.getElementsByTagName('style')).toHaveLength(0);
    expect(documentNode.getElementsByTagName('path')).toHaveLength(1);
    expect(sanitizedMarkup).not.toContain('evil.com');
  });

  it('keeps use elements but strips external href and xlink:href values', () => {
    const sanitizedMarkup = sanitizeSvgMarkup(`
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XLINK_NAMESPACE_URI}" viewBox="0 0 10 10">
        <defs><path id="mark" d="M0 0h10v10H0z" /></defs>
        <use href="https://evil.com/logo.svg#mark" xlink:href="https://evil.com/logo.svg#mark" />
      </svg>
    `);
    const documentNode = parseSvg(sanitizedMarkup);
    const useElement = documentNode.getElementsByTagName('use')[0];

    expect(useElement).toBeDefined();
    expect(useElement.hasAttribute('href')).toBe(false);
    expect(useElement.hasAttribute('xlink:href')).toBe(false);
    expect(useElement.getAttributeNS(XLINK_NAMESPACE_URI, 'href')).toBe(null);
    expect(sanitizedMarkup).not.toContain('evil.com');
  });

  it('allows only local references in use href values', () => {
    const sanitizedMarkup = sanitizeSvgMarkup(`
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XLINK_NAMESPACE_URI}" viewBox="0 0 10 10">
        <defs><path id="mark" d="M0 0h10v10H0z" /></defs>
        <use href="#mark" xlink:href="#mark" />
      </svg>
    `);
    const documentNode = parseSvg(sanitizedMarkup);
    const useElement = documentNode.getElementsByTagName('use')[0];

    expect(useElement.getAttribute('href')).toBe('#mark');
    expect(useElement.getAttributeNS(XLINK_NAMESPACE_URI, 'href')).toBe('#mark');
  });

  it('rejects SVG files above the size limit before parsing', async () => {
    const oversizeMarkup = `<svg xmlns="http://www.w3.org/2000/svg">${' '.repeat(SVG_MAX_FILE_BYTES + 1)}</svg>`;
    const oversizeFile = new File([oversizeMarkup], 'oversize.svg', {
      type: 'image/svg+xml',
    });

    expect(() => sanitizeSvgMarkup(oversizeMarkup)).toThrow(/500 KB/);
    await expect(readAndSanitizeSvgFile(oversizeFile)).rejects.toThrow(/500 KB/);
  });
});

describe('normalizeSvgMarkup', () => {
  it('adds a default valid viewBox when the SVG has no dimensions', () => {
    const result = normalizeSvgMarkupWithInfo(`
      <svg xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h10v10H0z" />
      </svg>
    `);
    const documentNode = parseSvg(result.markup);
    const svgElement = documentNode.documentElement;

    expect(svgElement.getAttribute('viewBox')).toBe(DEFAULT_SVG_VIEW_BOX);
    expect(isValidSvgViewBox(svgElement.getAttribute('viewBox'))).toBe(true);
    expect(result.warning).toBe(SVG_DIMENSION_FALLBACK_WARNING);
  });

  it('continues deriving viewBox from numeric width and height', () => {
    const normalizedMarkup = normalizeSvgMarkup(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="32">
        <path d="M0 0h64v32H0z" />
      </svg>
    `);
    const documentNode = parseSvg(normalizedMarkup);
    const svgElement = documentNode.documentElement;

    expect(svgElement.getAttribute('viewBox')).toBe('0 0 64 32');
    expect(svgElement.hasAttribute('width')).toBe(false);
    expect(svgElement.hasAttribute('height')).toBe(false);
  });
});
