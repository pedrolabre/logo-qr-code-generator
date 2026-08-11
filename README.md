# Logo QR Code Generator

Logo QR Code Generator é uma SPA client-side para geração de QR Codes corporativos com logos vetoriais (SVG) centralizados, acompanhados de cards visuais prontos para mídia física e digital.

O projeto opera inteiramente no navegador do usuário, sem backend. Processamento, validação e exportação acontecem em tempo real, sem que nenhum dado seja enviado a servidores externos.

---

## O Problema

QR Codes tradicionais são funcionais, mas esteticamente frios. A maioria das empresas os insere em materiais sem nenhum alinhamento com a identidade visual da marca.

Além disso, os geradores gratuitos disponíveis online frequentemente apresentam anúncios excessivos, exigem assinatura para exportações de qualidade ou produzem imagens rasterizadas que se degradam na impressão gráfica.

## A Solução Pretendida

Uma ferramenta open-source, rápida e de alta qualidade para geração de QR Codes com branding:

- **Branding unificado:** incorpora o logo e as cores da marca diretamente no QR Code e no card de suporte.
- **Segurança de leitura:** aplica salvaguardas baseadas no padrão ISO/IEC 18004 para garantir que a inserção do logo não corrompa os dados do código.
- **Pronto para impressão:** exportações nativas em SVG vetorial, garantindo fidelidade de linhas e curvas em qualquer escala.
- **Privacidade total:** nenhum dado sai do navegador do usuário.

## Funcionalidades Planejadas

- Validação de URL com detecção automática do tipo de link (WhatsApp, Instagram, Google Maps, entre outros).
- Upload de SVG com sanitização de conteúdo potencialmente malicioso antes do uso.
- Customização de cores dos módulos, fundo e olhos do QR Code.
- Slider proporcional de escala da logo com semáforo de escaneabilidade.
- Preview em tempo real do card completo com texto e posicionamento configuráveis.
- Exportação do QR Code puro em SVG e PNG.
- Exportação do card completo em PNG de alta resolução.

## Tecnologias Previstas

A implementação será guiada pelo plano interno do projeto e deve usar:

- React com JavaScript moderno.
- Vite.
- CSS nativo com design tokens.
- Zod para validação de formulário.
- `qr-code-styling` para renderização do QR Code.
- `html-to-image` para exportação do card.
- Lucide-react e Simple-icons para ícones e logotipos de marcas.

## Como Executar Localmente

```bash
npm install
npm run dev
```

Para gerar a build de produção:

```bash
npm run build
```

Para visualizar a build localmente:

```bash
npm run preview
```

## Estrutura do Projeto

Estrutura atual:

```text
logo-qr-code-generator/
  README.md
  package.json
  package-lock.json
  index.html
  vite.config.js
  src/
    App.jsx
    main.jsx
    types.js
    lib/
      cardExport.js
      contrast.js
      linkDetection.js
      qr.js
      svg.js
    styles/
      global.css
```

Esta seção acompanha apenas a estrutura pública real do projeto e será atualizada conforme arquivos e diretórios forem criados, removidos ou renomeados durante a implementação.
