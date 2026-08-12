<div align="right">
  <a href="./README.md">🇧🇷 Português</a> &nbsp;•&nbsp; 🇺🇸 <b>English</b>
</div>

<div align="center">

![Logo QR Code Generator Banner](./assets/banner-animated.en.svg)

</div>

<div align="center">

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=3000&pause=1000&color=0B5FFF&center=true&vCenter=true&width=750&lines=Corporate+QR+Code+generation;Centered+vector+logos;Export+to+SVG+and+PNG)

</div>

<div align="center">

[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#-planned-technologies)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#-planned-technologies)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://logo-qr-code-generator-tool.vercel.app/)

</div>

---

Logo QR Code Generator is a client-side SPA for generating corporate QR Codes with centered vector (SVG) logos, accompanied by visual cards ready for physical and digital media. The project operates entirely in the user's browser, without a backend. Processing, validation, and export happen in real-time, without any data being sent to external servers.

<div align="center">

<table>
  <tr>
    <td align="center" valign="middle" width="80">
      <img src="./public/favicon.svg" alt="Logo QR Code Generator Icon" width="60" height="60">
    </td>
    <td>
      <strong>Logo QR Code Generator</strong><br/>
      <small>Branded QR Code generation, high vector quality, and scanning reliability.</small><br/>
      <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank">
        <img src="https://img.shields.io/badge/Deploy%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy on Vercel" height="20">
      </a>
    </td>
  </tr>
</table>

</div>

---

## 📌 Table of Contents

1. [🎯 The Problem](#-the-problem)
2. [💡 Proposed Solution](#-proposed-solution)
3. [📸 Examples](#-examples)
4. [✨ Planned Features](#-planned-features)
5. [⚡ Planned Technologies](#-planned-technologies)
6. [🚀 How to Run Locally](#-how-to-run-locally)
7. [📁 Project Structure](#-project-structure)

---

## 🎯 The Problem

Traditional QR Codes are functional but aesthetically cold. Most companies insert them into materials without any alignment with the brand's visual identity.

Furthermore, free generators available online frequently display excessive ads, require a subscription for quality exports, or produce rasterized images that degrade in graphic printing.

---

## 💡 Proposed Solution

A fast, high-quality, open-source tool for generating branded QR Codes:

- **Unified branding:** incorporates the brand's logo and colors directly into the QR Code and the support card.
- **Reading security:** applies safeguards based on the ISO/IEC 18004 standard to ensure the logo insertion does not corrupt the code data.
- **Print ready:** native exports in vector SVG, ensuring fidelity of lines and curves at any scale.
- **Total privacy:** no data leaves the user's browser.

---

## 📸 Examples

<div align="center">

| Logo QR Code Generator | Subscription Lifecycle Supervisor | Price Simulator |
| :---: | :---: | :---: |
| <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank"><img src="./assets/examples/qr-code-LQrcodegenerator.svg" width="300" alt="Example Logo QR Code Generator" /></a> | <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank"><img src="./assets/examples/qr-code-SLS.svg" width="300" alt="Example SLS" /></a> | <a href="https://logo-qr-code-generator-tool.vercel.app/" target="_blank"><img src="./assets/examples/qr-code-Price-Simulator.svg" width="300" alt="Example Price Simulator" /></a> |

</div>

---

## ✨ Planned Features

- URL validation with automatic detection of the link type (WhatsApp, Instagram, Google Maps, among others).
- SVG upload with sanitization of potentially malicious content before use.
- Color customization for QR Code modules, background, and eyes.
- Proportional logo scale slider with scannability traffic light.
- Real-time preview of the complete card with configurable text and positioning.
- Pure QR Code export in SVG and PNG.
- Complete card export in high-resolution PNG.

---

## ⚡ Planned Technologies

The implementation will be guided by the internal project plan and should use:

- React with modern JavaScript.
- Vite.
- Native CSS with design tokens.
- Zod for form validation.
- `qr-code-styling` for QR Code rendering.
- `html-to-image` for card export.
- Lucide-react and Simple-icons for icons and brand logos.

---

## 🚀 How to Run Locally

```bash
npm install
npm run dev
```

To generate the production build:

```bash
npm run build
```

To preview the build locally:

```bash
npm run preview
```

---

## 📁 Project Structure

Current structure:

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

This section only tracks the actual public structure of the project and will be updated as files and directories are created, removed, or renamed during implementation.

---

<div align="center">
Developed by <b>Pedro Labre</b>
</div>
