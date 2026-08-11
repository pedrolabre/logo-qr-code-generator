import { toPng } from 'html-to-image';

const buildCardFileName = () => {
  const timestamp = Date.now();

  return `card-${timestamp}.png`;
};

/**
 * Exporta o card completo como PNG de alta resolução.
 *
 * @param {string} elementId - ID do elemento DOM a capturar.
 * @param {string} backgroundColor - Cor de fundo sólida para forçar na exportação.
 * @returns {Promise<void>}
 */
export const exportCardAsPng = async (elementId, backgroundColor) => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Elemento com ID "${elementId}" não encontrado.`);
  }

  const options = {
    quality: 0.95,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
      boxShadow: 'none',
      backgroundColor: backgroundColor || '#ffffff',
    },
    filter: (node) => {
      if (!node.classList) {
        return true;
      }

      return !node.classList.contains('exclude-from-export');
    },
  };

  await new Promise((resolve) => setTimeout(resolve, 150));

  const dataUrl = await toPng(element, options);

  const link = document.createElement('a');

  link.download = buildCardFileName();
  link.href = dataUrl;
  link.click();
};
