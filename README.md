# Encodr Chrome Extension

A powerful Chrome extension that provides a comprehensive suite of encoding, decoding, and hash analysis tools, all within your browser. Convert text between various formats with a clean, modern interface.

![Extension Screenshot](images/screenshot.png)

## Features

### Comprehensive Encoding Methods

#### Common Formats
- **Base64**: Standard base64 encoding/decoding
- **Base58**: Used in Bitcoin to represent large numbers in a compact, human-readable format, using a 58-character alphabet
- **Base32**: RFC 4648 compliant Base32 encoding
- **URL Encoding**: Encode/decode URLs and URI components
- **HTML Entities**: Convert special characters to/from HTML entities

#### Cryptographic Formats
- **JWT**: JSON Web Token encoding/decoding
- **Caesar Cipher**: Classical shift cipher (default shift: 3)
- **Vigenère Cipher**: Polyalphabetic substitution cipher using a keyword
- **Hill Cipher**: Polygraphic substitution cipher using linear algebra

#### Legacy & Special Formats
- **ROT13**: Simple letter substitution cipher
- **ASCII85**: Compact encoding used in PostScript
- **Binary**: Text to binary conversion
- **Morse Code**: International Morse Code conversion
- **Hexadecimal**: Text to hex conversion
- **Playfair Cipher**: Historical digraph substitution cipher
  - Invented in 1854 by Charles Wheatstone
  - Used by British forces in both World Wars

### Hash Detection & Analysis
Automatically detect and analyze various hash formats:
- **MD5**: 32 characters
- **SHA1**: 40 characters
- **SHA256**: 64 characters
- **SHA512**: 128 characters
- **RIPEMD160**: 40 characters
- **BCrypt**: Including salt and cost factor
- **Argon2**: Modern password hashing
- **NTLM**: Windows authentication
- **MySQL**: Both v4 and v5 formats

For each detected hash, the tool provides:
- Hash type identification
- Confidence level
- Format specifications
- Technical description
- Common usage context

### Technical Features
- Real-time encoding/decoding
- Intelligent hash format detection
- Error handling and validation
- Support for special characters
- UTF-8 compatibility
- No external dependencies
- Offline functionality

### User Interface
- Clean, modern dark theme
- Monospace font (JetBrains Mono)
- Context-aware controls
- Dynamic mode switching
- Copy to clipboard functionality
- Clear all fields with one click
- Visual feedback for actions
- Custom scrollbar design
- Responsive layout

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/base64-converter/mbmknbmpajagofnlcaoajkgammegbblg?authuser=0&hl=fr&pli=1)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/kOaDT/encodr.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked"
5. Select the directory containing the extension files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Select your desired operation from the dropdown menu:
   - Common encoding formats
   - Cryptographic formats
   - Legacy formats
   - Hash detection
3. Based on your selection:
   - For encoding/decoding: Enter text and click respective button
   - For Vigenère cipher: Enter text and provide an encryption key
   - For hash detection: Enter hash and click "Detect Hash"
4. Additional actions:
   - Use "Copy" to copy the result to your clipboard
   - Use "Clear" to reset both input and output fields

## Technical Details

### Encoding Implementations
- Base64: Standard btoa/atob implementation
- Base58: 58-character alphabet, omitting easily confused characters like 0, O, I, and l
- Base32: RFC 4648 compliant implementation
- JWT: Basic JWT structure with header and payload
- Caesar Cipher: Customizable shift parameter (default: 3)
- Vigenère Cipher: Polyalphabetic substitution using a keyword
- ASCII85: Adobe-style ASCII85 encoding
- Playfair Cipher: Classical digraph substitution cipher
  * Uses 5x5 matrix derived from keyword
  * Combines I/J to fit alphabet in matrix
  * Handles special cases (double letters, odd length)
  * Historically significant in military communications
- Hill Cipher: Polygraphic substitution cipher using linear algebra
  * Uses a key matrix for encryption/decryption
  * Operates on blocks of letters
  * Strong against frequency analysis

### Hash Detection Algorithm
- Pattern matching using regular expressions
- Multiple hash format support
- Probability-based detection
- Specific format validation
- Comprehensive hash information

### Security Considerations
- All processing is done locally in the browser
- No data is sent to external servers
- No data persistence between sessions
- Input validation for all formats

## Browser Compatibility

- Google Chrome (Version 88+)
- Chromium-based browsers:
  - Microsoft Edge
  - Brave
  - Opera
  - Vivaldi

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have suggestions:
1. Check the [Issues](https://github.com/kOaDT/encodr/issues) page
2. Create a new issue if needed
3. Provide detailed information about the problem
