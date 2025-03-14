# Encodr

> A powerful Chrome extension providing comprehensive encoding, decoding, and hash analysis tools directly in your browser.

![Extension Screenshot](images/screenshot.png)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/mbmknbmpajagofnlcaoajkgammegbblg.svg)](https://chromewebstore.google.com/detail/base64-converter/mbmknbmpajagofnlcaoajkgammegbblg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Features

### 🔄 Encoding & Decoding

<details>
<summary><strong>Common Formats</strong></summary>

- **Base64**: Standard base64 encoding/decoding
- **Base58**: Bitcoin-style compact format (58-character alphabet)
- **Base45**: Used in COVID-19 digital certificates
- **Base32**: RFC 4648 compliant encoding
- **URL Encoding**: For URLs and URI components
- **HTML Entities**: Special character conversion
</details>

<details>
<summary><strong>Cryptographic Formats</strong></summary>

- **JWT**: JSON Web Token encoding/decoding
- **Caesar Cipher**: Classical shift cipher (default: 3)
- **Vigenère Cipher**: Polyalphabetic substitution with keyword
- **Hill Cipher**: Matrix-based polygraphic substitution
- **ADFGVX Cipher**: WWI German military cipher
  - Combined substitution and transposition
  - 6×6 grid with A, D, F, G, V, X coordinates
  - Designed for Morse code distinctiveness (1918)
</details>

<details>
<summary><strong>Legacy & Special Formats</strong></summary>

- **ROT13**: Simple letter substitution
- **ASCII85**: Compact PostScript encoding
- **Binary**: Text-to-binary conversion
- **Morse Code**: International standard
- **Hexadecimal**: Text-to-hex conversion
- **Playfair Cipher**: Historical digraph substitution (1854)
</details>

### 🔍 Hash Analysis

Automatically detect and analyze hash formats including:
- MD5, SHA1, SHA256, SHA512, RIPEMD160
- BCrypt, Argon2, NTLM, MySQL (v4/v5)

For each hash, receive:
- Type identification with confidence level
- Format specifications
- Technical description
- Common usage context

## ⚙️ Technical Highlights

- **Privacy-Focused**: All processing happens locally
- **No Dependencies**: Completely self-contained
- **Offline Support**: Works without internet
- **UTF-8 Compatible**: Handles special characters
- **Real-Time Processing**: Instant results

## 💻 Installation

### From Chrome Web Store

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Add%20to%20Chrome-green)](https://chromewebstore.google.com/detail/base64-converter/mbmknbmpajagofnlcaoajkgammegbblg)

1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/base64-converter/mbmknbmpajagofnlcaoajkgammegbblg)
2. Click "Add to Chrome"
3. Confirm the installation

### Developer Mode

```bash
# Clone the repository
git clone https://github.com/kOaDT/encodr.git

# Then:
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the encodr directory
```

## 🔧 Usage

1. Click the Encodr icon in your Chrome toolbar
2. Select your desired operation:
   - Encoding/decoding formats
   - Hash detection
3. Enter your text or hash
4. View results instantly
5. Use "Copy" to copy results to clipboard

## 🧩 Implementation Details

<details>
<summary><strong>Encoding Algorithms</strong></summary>

- **Base64**: Standard btoa/atob implementation
- **Base58**: 58-character alphabet (omits 0, O, I, l)
- **Base45**: Byte-pair to triple-digit transformation
- **JWT**: Header + payload structure
- **Caesar/Vigenère**: Classical implementation
- **Playfair**: 5×5 matrix with I/J combined
- **Hill Cipher**: Matrix-based block operation
- **ADFGVX**: Two-step process (substitution + transposition)
</details>

<details>
<summary><strong>Hash Detection</strong></summary>

- Pattern matching with regular expressions
- Probability-based format identification
- Format-specific validation rules
- Comprehensive metadata display
</details>

## 🌐 Browser Compatibility

- Google Chrome (v88+)
- Microsoft Edge (Chromium-based)
- Brave
- Opera
- Vivaldi

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Having issues or suggestions?

1. Check existing [Issues](https://github.com/kOaDT/encodr/issues)
2. Create a new issue with detailed information