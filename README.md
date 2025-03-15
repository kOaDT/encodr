<div align="center">
  
# 🔐 Encodr

**The Swiss Army Knife for Encoding, Decoding & Hash Analysis**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/mbmknbmpajagofnlcaoajkgammegbblg.svg)](https://chromewebstore.google.com/detail/base64-converter/mbmknbmpajagofnlcaoajkgammegbblg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/kOaDT/encodr/pulls)

![Extension Screenshot](images/screenshot.png)

</div>

## 📋 Overview

Encodr is a powerful, privacy-focused Chrome extension that brings professional-grade encoding, decoding, and hash analysis tools directly to your browser. Whether you're a developer, security professional, or crypto enthusiast, Encodr provides the tools you need with zero dependencies and complete offline functionality.

## ✨ Key Features

<table>
  <tr>
    <td width="33%">
      <h3 align="center">🔄 Encoding & Decoding</h3>
      <p align="center">Support for 15+ formats from Base64 to complex ciphers</p>
    </td>
    <td width="33%">
      <h3 align="center">🔍 Hash Analysis</h3>
      <p align="center">Automatic detection and detailed breakdown of hash types</p>
    </td>
    <td width="33%">
      <h3 align="center">🛡️ Privacy-First</h3>
      <p align="center">100% local processing with no data transmission</p>
    </td>
  </tr>
</table>

## 🧰 Supported Formats

### Common Encodings
- **Base64** - Standard encoding for binary data
  - Example: `Hello` → `SGVsbG8=`
- **Base58** - Bitcoin-style compact format (58-character alphabet)
  - Example: `Hello` → `9Ajdvzr`
- **Base45** - Used in COVID-19 digital certificates
  - Example: `Hello` → `96%DV 2L`
- **Base32** - RFC 4648 compliant encoding
  - Example: `Hello` → `JBSWY3DP`
- **Hexadecimal** - Base-16 representation of binary data
  - Example: `Hello` → `48656c6c6f`
- **Binary** - Base-2 representation of data
  - Example: `Hello` → `01001000 01100101 01101100 01101100 01101111`
- **Morse Code** - Telegraph communication system using dots and dashes
  - Example: `Hello` → `.... . .-.. .-.. ---`
- **URL Encoding** - For URLs and URI components
  - Example: `Hello World` → `Hello%20World`
- **HTML Entities** - Special character conversion
  - Example: `<script>` → `&lt;script&gt;`
- **Punycode** - IDN encoding (RFC 3492)
  - Example: `مثال.جوردان` → `xn--mgbh0fb.xn--mgbjjh1ii`

### Cryptographic & Historical Ciphers
- **JWT** - JSON Web Token encoding/decoding
  - Example: `{"user":"john"}` → `eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiJ9.Gpz_UF_YoEEwn4O8U9X0iG1Y_UqvQQYU1gQy7Gxw2BI`
- **Caesar Cipher** - Classical shift cipher
  - Example: `Hello` → `Khoor` (shift: 3)
- **Vigenère Cipher** - Polyalphabetic substitution
  - Example: `Hello` → `Rijvs` (key: "KEY")
- **Hill Cipher** - Matrix-based polygraphic substitution
  - Example: `Hello` → `AXDDTC` (key matrix: [[2,3],[1,4]])
- **ADFGVX Cipher** - WWI German military cipher
  - Example: `Attack` → `VGVADADVGAGA` (key: "KEY")
- **ROT13** - Simple letter substitution
  - Example: `Hello` → `Uryyb`
- **Playfair Cipher** - Historical digraph substitution (1854)
  - Example: `Hello` → `KGAA` (key: "PLAYFAIR")
- **ASCII85** - Compact PostScript encoding
  - Example: `Hello` → `<~87cURDZ~>`

## 🔍 Hash Analysis

Encodr automatically detects and analyzes hash formats with detailed insights:

- **Hash Types**: MD5, SHA1, SHA256, SHA512, RIPEMD160, BCrypt, Argon2, NTLM, MySQL, BLAKE2
- **Analysis Details**: Format identification, specifications, technical description, and usage context
- **Confidence Levels**: Probability-based format identification

## ⚡ Technical Advantages

- **Zero Dependencies**: Completely self-contained
- **Offline Support**: Works without internet connection
- **UTF-8 Compatible**: Full support for international characters
- **Real-Time Processing**: Instant results as you type
- **Lightweight**: Minimal browser resource usage

## 🚀 Getting Started

### Installation

<table>
  <tr>
    <td width="60%">
      <h4>Chrome Web Store (Recommended)</h4>
      <p>
        <a href="https://chromewebstore.google.com/detail/base64-converter/mbmknbmpajagofnlcaoajkgammegbblg">
          <img src="https://img.shields.io/badge/Chrome%20Web%20Store-Add%20to%20Chrome-green" alt="Chrome Web Store" />
        </a>
      </p>
      <ol>
        <li>Visit the <a href="https://chromewebstore.google.com/detail/base64-converter/mbmknbmpajagofnlcaoajkgammegbblg">Chrome Web Store</a></li>
        <li>Click "Add to Chrome"</li>
        <li>Confirm the installation</li>
      </ol>
    </td>
    <td width="40%">
      <h4>Developer Mode</h4>
      <pre><code>
# Clone the repository
git clone https://github.com/kOaDT/encodr.git
# Then:
# 1. Open Chrome → chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the encodr directory
      </code></pre>
    </td>
  </tr>
</table>

### Quick Usage

1. Click the Encodr icon in your Chrome toolbar
2. Select your desired operation (encoding/decoding or hash detection)
3. Enter your text or hash
4. View results instantly
5. Use "Copy" to copy results to clipboard

## 🧩 Implementation Details

Encodr uses efficient, standards-compliant implementations:

- **Base Encodings**: Optimized algorithms for Base64, Base58, Base45, and Base32
- **Cryptographic Ciphers**: Authentic implementations of historical and modern ciphers
- **Hash Detection**: Pattern matching with regular expressions and format-specific validation
- **Performance**: Optimized for speed with minimal memory footprint

## 🌐 Browser Compatibility

Encodr works seamlessly across all Chromium-based browsers:

- Google Chrome (v88+)
- Microsoft Edge
- Brave
- Opera
- Vivaldi

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Feedback

Having issues or suggestions?

1. Check existing [Issues](https://github.com/kOaDT/encodr/issues)
2. Create a new issue with detailed information

---

<div align="center">
  <p>Made by <a href="https://github.com/kOaDT">kOaDT</a></p>
</div>