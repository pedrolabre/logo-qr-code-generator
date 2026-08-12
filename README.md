<div align="right">
  🇧🇷 <b>Português</b> &nbsp;•&nbsp; <a href="./README.en.md">🇺🇸 English</a>
</div>

<div align="center">

![Logo QR Code Generator Banner](./assets/banner-animated.svg)

</div>

<div align="center">

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=3000&pause=1000&color=0B5FFF&center=true&vCenter=true&width=750&lines=Gera%C3%A7%C3%A3o+de+QR+Codes+corporativos;Logos+vetoriais+centralizados;Exporta%C3%A7%C3%A3o+para+SVG+e+PNG)

</div>

<div align="center">

[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#-tecnologias-previstas)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#-tecnologias-previstas)
[![Deploy na Vercel](https://img.shields.io/badge/Deploy%20na%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://logo-qr-code-generator-tool.vercel.app/)

</div>

---

Logo QR Code Generator é uma SPA client-side para geração de QR Codes corporativos com logos vetoriais (SVG) centralizados, acompanhados de cards visuais prontos para mídia física e digital. O projeto opera inteiramente no navegador do usuário, sem backend. Processamento, validação e exportação acontecem em tempo real, sem que nenhum dado seja enviado a servidores externos.

<div align="center">

<table>
  <tr>
    <td align="center" valign="middle" width="80">
      <img src="./public/favicon.svg" alt="Logo QR Code Generator Icon" width="60" height="60">
    </td>
    <td>
      <strong>Logo QR Code Generator</strong><br/>
      <small>Geração de QR Codes com branding, alta qualidade vetorial e segurança de leitura.</small><br/>
      <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank">
        <img src="https://img.shields.io/badge/Deploy%20na%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy na Vercel" height="20">
      </a>
    </td>
  </tr>
</table>

</div>

---

## 📌 Índice Geral

1. [🎯 O Problema](#-o-problema)
2. [💡 A Solução Pretendida](#-a-solução-pretendida)
3. [📸 Exemplos](#-exemplos)
4. [✨ Funcionalidades Planejadas](#-funcionalidades-planejadas)
5. [⚡ Tecnologias Previstas](#-tecnologias-previstas)
6. [🚀 Como Executar Localmente](#-como-executar-localmente)
7. [📁 Estrutura do Projeto](#-estrutura-do-projeto)

---

## 🎯 O Problema

QR Codes tradicionais são funcionais, mas esteticamente frios. A maioria das empresas os insere em materiais sem nenhum alinhamento com a identidade visual da marca.

Além disso, os geradores gratuitos disponíveis online frequentemente apresentam anúncios excessivos, exigem assinatura para exportações de qualidade ou produzem imagens rasterizadas que se degradam na impressão gráfica.

---

## 💡 A Solução Pretendida

Uma ferramenta open-source, rápida e de alta qualidade para geração de QR Codes com branding:

- **Branding unificado:** incorpora o logo e as cores da marca diretamente no QR Code e no card de suporte.
- **Segurança de leitura:** aplica salvaguardas baseadas no padrão ISO/IEC 18004 para garantir que a inserção do logo não corrompa os dados do código.
- **Pronto para impressão:** exportações nativas em SVG vetorial, garantindo fidelidade de linhas e curvas em qualquer escala.
- **Privacidade total:** nenhum dado sai do navegador do usuário.

---

## 📸 Exemplos

<div align="center">

| Logo QR Code Generator | Subscription Lifecycle Supervisor | Price Simulator |
| :---: | :---: | :---: |
| <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank"><img src="./assets/examples/qr-code-LQrcodegenerator.svg" width="300" alt="Exemplo Logo QR Code Generator" /></a> | <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank"><img src="./assets/examples/qr-code-SLS.svg" width="300" alt="Exemplo SLS" /></a> | <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank"><img src="./assets/examples/qr-code-Price-Simulator.svg" width="300" alt="Exemplo Price Simulator" /></a> |

</div>

---

## ✨ Funcionalidades Planejadas

- Validação de URL com detecção automática do tipo de link (WhatsApp, Instagram, Google Maps, entre outros).
- Upload de SVG com sanitização de conteúdo potencialmente malicioso antes do uso.
- Customização de cores dos módulos, fundo e olhos do QR Code.
- Slider proporcional de escala da logo com semáforo de escaneabilidade.
- Preview em tempo real do card completo com texto e posicionamento configuráveis.
- Exportação do QR Code puro em SVG e PNG.
- Exportação do card completo em PNG de alta resolução.

---

## ⚡ Tecnologias Previstas

A implementação será guiada pelo plano interno do projeto e deve usar:

- React com JavaScript moderno.
- Vite.
- CSS nativo com design tokens.
- Zod para validação de formulário.
- `qr-code-styling` para renderização do QR Code.
- `html-to-image` para exportação do card.
- Lucide-react e Simple-icons para ícones e logotipos de marcas.

---

## 🚀 Como Executar Localmente

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

---

## 📁 Estrutura do Projeto

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

---

<div align="center">
Desenvolvido por <b>Pedro Labre</b>
</div>
