const INPUT_VALIDATION = {
    MAX_LENGTH: 100000,
    MIN_LENGTH: 1,
    VALID_JSON_SIZE: 10000,
};

function validateInput(text, options = {}) {
    const {
        maxLength = INPUT_VALIDATION.MAX_LENGTH,
        minLength = INPUT_VALIDATION.MIN_LENGTH,
        allowedChars,
    } = options;

    if (typeof text !== 'string') {
        throw new Error(`Input must be a string, received ${typeof text}`);
    }

    if (text.length > maxLength) {
        throw new Error(`Input too long (max ${maxLength} characters)`);
    }

    if (text.length < minLength) {
        throw new Error(`Input too short (min ${minLength} characters)`);
    }

    if (allowedChars && !new RegExp(`^[${allowedChars}]*$`).test(text)) {
        throw new Error(`Input contains invalid characters. Allowed: ${allowedChars}`);
    }

    return text;
}

const BASE45_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

export const encodingFunctions = {
    // Base45 encoding: Converts binary data to a compact, human-readable format using a 45-character alphabet
    // Each character represents 4.5 bits of data, making it more compact than Base64
    // Used in EU COVID Cert
    base45: {
        encode: (text) => {
            // Convert string to Uint8Array
            const data = new TextEncoder().encode(text);
            let result = '';
            
            // Process pairs of bytes
            for (let i = 0; i < data.length; i += 2) {
                if (i + 1 < data.length) {
                    // Process two bytes
                    const x = (data[i] << 8) + data[i + 1];
                    // Convert to base45 (3 digits)
                    const e = x % 45;
                    const d = ((x - e) / 45) % 45;
                    const c = ((x - e - d * 45) / 2025);
                    result += BASE45_CHARSET[c] + BASE45_CHARSET[d] + BASE45_CHARSET[e];
                } else {
                    // Process single byte
                    const x = data[i];
                    const d = x % 45;
                    const c = ((x - d) / 45);
                    result += BASE45_CHARSET[c] + BASE45_CHARSET[d];
                }
            }
            return result;
        },
        
        decode: (text) => {
            if (!text.match(/^[0-9A-Z $%*+\-./:]+$/)) {
                throw new EncodrError('Invalid Base45 string', 'error');
            }
    
            const result = [];
            
            // Process triplets of characters
            for (let i = 0; i < text.length; i += 3) {
                if (i + 2 < text.length) {
                    // Process three characters (two bytes)
                    const c = BASE45_CHARSET.indexOf(text[i]);
                    const d = BASE45_CHARSET.indexOf(text[i + 1]);
                    const e = BASE45_CHARSET.indexOf(text[i + 2]);
                    
                    if (c === -1 || d === -1 || e === -1) {
                        throw new EncodrError('Invalid Base45 character', 'error');
                    }
                    
                    const x = c * 2025 + d * 45 + e;
                    result.push((x >> 8) & 255, x & 255);
                } else if (i + 1 < text.length) {
                    // Process two characters (one byte)
                    const c = BASE45_CHARSET.indexOf(text[i]);
                    const d = BASE45_CHARSET.indexOf(text[i + 1]);
                    
                    if (c === -1 || d === -1) {
                        throw new EncodrError('Invalid Base45 character', 'error');
                    }
                    
                    const x = c * 45 + d;
                    result.push(x);
                }
            }
            
            // Convert byte array back to string
            return new TextDecoder().decode(new Uint8Array(result));
        }
    },
    // Base64 encoding: Converts binary data to a string format using 64 characters (A-Z, a-z, 0-9, +, /)
    // Uses built-in btoa/atob functions for encoding/decoding
    base64: {
        encode: (text) => {
            text = validateInput(text);
            return btoa(text);
        },
        decode: (text) => {
            text = validateInput(text, {
                allowedChars: 'A-Za-z0-9+/=',
                type: 'base64'
            });
            return atob(text);
        }
    },

    // URL encoding: Encodes special characters in URLs to make them safe for transmission
    // Replaces unsafe characters with %XX sequences
    uri: {
        encode: (text) => encodeURIComponent(text),
        decode: (text) => decodeURIComponent(text)
    },

    // Hexadecimal encoding: Converts each character to its 2-digit hexadecimal representation
    // Each byte is represented as two hex digits (00-FF)
    hex: {
        encode: (text) => Array.from(text).map(char => char.charCodeAt(0).toString(16)).join(''),
        decode: (text) => text.match(/.{1,2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join('') || ''
    },

    // Binary encoding: Converts each character to its 8-bit binary representation
    // Each character becomes a sequence of 8 bits (0s and 1s)
    binary: {
        encode: (text) => Array.from(text).map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
        decode: (text) => text.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('')
    },

    // Morse code: Converts text to dots and dashes according to international Morse code standard
    // Includes support for letters, numbers, and basic spacing
    morse: {
        encode: (text) => {
            const morseCode = {
                'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
                'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
                'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
                'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
                'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
                '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
                '8': '---..', '9': '----.', ' ': '/'
            };
            return text.toUpperCase().split('').map(char => morseCode[char] || char).join(' ');
        },
        decode: (text) => {
            const morseCode = {
                '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
                '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
                '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
                '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
                '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
                '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
                '---..': '8', '----.': '9', '/': ' '
            };
            return text.split(' ').map(code => morseCode[code] || code).join('');
        }
    },

    // ROT13 cipher: Simple substitution cipher that replaces each letter with one 13 positions after it
    // Symmetric encryption (encoding and decoding use the same operation)
    rot13: {
        encode: (text) => text.replace(/[a-zA-Z]/g, c => 
            String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) 
            ? c : c - 26)),
        decode: (text) => text.replace(/[a-zA-Z]/g, c => 
            String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) 
            ? c : c - 26))
    },

    // Base32 encoding: Converts binary data using a 32-character alphabet (A-Z, 2-7)
    // More verbose than Base64 but more resistant to transcription errors
    base32: {
        encode: (text) => {
            // Validate input and convert to UTF-8 bytes
            text = validateInput(text);
            const bytes = new TextEncoder().encode(text);
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let bits = 0;
            let value = 0;
            let output = '';
            
            // Process each byte
            for (let i = 0; i < bytes.length; i++) {
                value = (value << 8) | bytes[i];
                bits += 8;
                while (bits >= 5) {
                    output += alphabet[(value >>> (bits - 5)) & 31];
                    bits -= 5;
                }
            }
            
            // Handle remaining bits and add padding
            if (bits > 0) {
                output += alphabet[(value << (5 - bits)) & 31];
            }
            
            // Calculate and add padding
            const padLength = [0, 6, 4, 3, 1][bytes.length % 5];
            return output + '='.repeat(padLength);
        },
        decode: (text) => {
            // Validate input format
            text = validateInput(text, {
                allowedChars: 'A-Z2-7=',
                type: 'base32'
            });
            
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            text = text.replace(/=+$/, '');
            
            let bits = 0;
            let value = 0;
            let bytes = [];
            
            for (let i = 0; i < text.length; i++) {
                const index = alphabet.indexOf(text[i].toUpperCase());
                if (index === -1) continue;
                
                value = (value << 5) | index;
                bits += 5;
                
                if (bits >= 8) {
                    bytes.push((value >>> (bits - 8)) & 255);
                    bits -= 8;
                }
            }
            
            // Convert bytes back to UTF-8 string
            return new TextDecoder().decode(new Uint8Array(bytes));
        }
    },

    // JWT (JSON Web Token): Creates and verifies tokens using HMAC-SHA256 signature
    // Consists of three parts: header, payload, and signature
    jwt: {
        encode: async (text, secretKey) => {
            text = validateInput(text, {
                maxLength: INPUT_VALIDATION.VALID_JSON_SIZE
            });
            
            try {
                JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid JSON format for JWT payload');
            }

            secretKey = validateInput(secretKey, {
                minLength: 3,
                maxLength: 1024,
                type: 'secret'
            });

            if (!secretKey) {
                throw new Error('Secret key is required');
            }

            const base64url = str => {
                let bytes;
                if (str instanceof Uint8Array) {
                    bytes = str;
                } else {
                    bytes = new TextEncoder().encode(str);
                }
                return btoa(String.fromCharCode(...bytes))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');
            };

            try {
                const payload = JSON.parse(text);
                const now = Math.floor(Date.now() / 1000);
                payload.iat = payload.iat || now;
                payload.exp = payload.exp || now + 3600;
                
                const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
                const encodedPayload = base64url(JSON.stringify(payload));
                
                const encoder = new TextEncoder();
                const data = encoder.encode(`${header}.${encodedPayload}`);
                const keyData = encoder.encode(secretKey);
                const key = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['sign']
                );
                const signature = await crypto.subtle.sign(
                    'HMAC',
                    key,
                    data
                );
                const signatureBase64 = base64url(new Uint8Array(signature));

                const token = `${header}.${encodedPayload}.${signatureBase64}`;
                return token;
            } catch (e) {
                throw new Error('JWT encoding error: ' + e.message);
            }
        },
        decode: async (text, verify = true, secretKey, options = {}) => {
            text = validateInput(text, {
                allowedChars: 'A-Za-z0-9._-',
                type: 'jwt'
            });

            if (verify && secretKey) {
                secretKey = validateInput(secretKey, {
                    minLength: 8,
                    maxLength: 1024,
                    type: 'secret'
                });
            }

            try {
                if (!text.match(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)) {
                    throw new Error('Invalid JWT format');
                }

                const [headerB64, payloadB64, signatureB64] = text.split('.');

                const base64UrlDecode = str => {
                    try {
                        str = str
                            .replace(/-/g, '+')
                            .replace(/_/g, '/');
                        
                        // Add padding
                        while (str.length % 4) {
                            str += '=';
                        }
                        
                        return atob(str);
                    } catch (e) {
                        throw new Error('Invalid base64url encoding');
                    }
                };

                // Decode header
                const headerStr = base64UrlDecode(headerB64);
                const header = JSON.parse(headerStr);
                
                if (header.alg !== 'HS256') {
                    throw new Error('Unsupported algorithm: ' + header.alg);
                }

                // Decode payload
                const payloadStr = base64UrlDecode(payloadB64);
                const payload = JSON.parse(payloadStr);

                // Validate claims
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < now) {
                    throw new Error('Token has expired');
                }
                if (payload.nbf && payload.nbf > now) {
                    throw new Error('Token not yet valid');
                }

                // Additional claims validation
                if (options.issuer && payload.iss !== options.issuer) {
                    throw new Error('Invalid issuer');
                }
                if (options.audience && payload.aud !== options.audience) {
                    throw new Error('Invalid audience');
                }
                if (options.subject && payload.sub !== options.subject) {
                    throw new Error('Invalid subject');
                }

                if (verify) {
                    if (!secretKey) {
                        throw new Error('Secret key is required for verification');
                    }

                    const encoder = new TextEncoder();
                    const data = encoder.encode(`${headerB64}.${payloadB64}`);
                    const keyData = encoder.encode(secretKey);
                    const key = await crypto.subtle.importKey(
                        'raw',
                        keyData,
                        { name: 'HMAC', hash: 'SHA-256' },
                        false,
                        ['verify']
                    );

                    // Convert base64url signature to ArrayBuffer
                    const signatureStr = base64UrlDecode(signatureB64);
                    const signatureData = new Uint8Array(signatureStr.length);
                    for (let i = 0; i < signatureStr.length; i++) {
                        signatureData[i] = signatureStr.charCodeAt(i);
                    }

                    const isValid = await crypto.subtle.verify(
                        'HMAC',
                        key,
                        signatureData,
                        data
                    );

                    if (!isValid) {
                        throw new Error('Invalid signature');
                    }
                }

                return JSON.stringify(payload, null, 2);
            } catch (e) {
                throw new Error('JWT error: ' + e.message);
            }
        }
    },

    // HTML encoding: Converts special characters to their HTML entity equivalents
    // Prevents XSS attacks by escaping potentially dangerous characters
    html: {
        encode: (text) => {
            text = validateInput(text, {
                maxLength: INPUT_VALIDATION.MAX_LENGTH * 0.25 // Limite plus stricte car l'encodage HTML augmente la taille
            });
            return text.replace(/[&<>"'`\/{}\=\[\]\(\)]|[\u00A0-\u9999]/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '`': '&#96;',
                '/': '&#x2F;',
                '{': '&#x7B;',
                '}': '&#x7D;',
                '=': '&#x3D;',
                '[': '&#x5B;',
                ']': '&#x5D;',
                '(': '&#x28;',
                ')': '&#x29;'
            }[char] || `&#${char.charCodeAt(0)};`))
        },
        decode: (text) => {
            text = validateInput(text, {
                maxLength: INPUT_VALIDATION.MAX_LENGTH,
                type: 'html'
            });
            return text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&#96;/g, '`')
                .replace(/&#x2F;/g, '/')
                .replace(/&#x7B;/g, '{')
                .replace(/&#x7D;/g, '}')
                .replace(/&#x3D;/g, '=')
                .replace(/&#x5B;/g, '[')
                .replace(/&#x5D;/g, ']')
                .replace(/&#x28;/g, '(')
                .replace(/&#x29;/g, ')')
                .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
        }
    },

    // Caesar cipher: Classical substitution cipher that shifts letters by a specified amount
    // Default shift is 3 positions (as used by Julius Caesar)
    caesar: {
        encode: (text, shift = 3) => {
            shift = ((shift % 26) + 26) % 26;
            return text.replace(/[a-zA-Z]/g, char => {
                const code = char.charCodeAt(0);
                const isUpperCase = code >= 65 && code <= 90;
                const base = isUpperCase ? 65 : 97;
                return String.fromCharCode(((code - base + shift) % 26) + base);
            });
        },
        decode: (text, shift = 3) => {
            return encodingFunctions.caesar.encode(text, -shift);
        }
    },

    // ASCII85 encoding: More efficient than Base64, uses 85 printable ASCII characters
    // Commonly used in PDF files and Adobe products, also known as Base85
    ascii85: {
        encode: (text) => {
            text = validateInput(text);
            let result = '<~';
            const bytes = new TextEncoder().encode(text);
            
            // Process 4 bytes at a time using BigInt for large numbers
            for (let i = 0; i < bytes.length; i += 4) {
                let value = 0n;
                let chunk = bytes.slice(i, Math.min(i + 4, bytes.length));
                
                // Convert chunk to value
                for (let j = 0; j < chunk.length; j++) {
                    value = value * 256n + BigInt(chunk[j]);
                }
                
                // Pad with zeros if necessary
                for (let j = chunk.length; j < 4; j++) {
                    value *= 256n;
                }
                
                // Special case for zero
                if (chunk.length === 4 && value === 0n) {
                    result += 'z';
                    continue;
                }
                
                // Convert to base-85
                const chars = [];
                for (let j = 0; j < 5; j++) {
                    chars.unshift(String.fromCharCode(Number(value % 85n) + 33));
                    value = value / 85n;
                }
                
                // Only add the necessary characters for the last chunk
                result += chunk.length < 4 
                    ? chars.slice(0, chunk.length + 1).join('')
                    : chars.join('');
            }
            
            return result + '~>';
        },
        decode: (text) => {
            text = validateInput(text, {
                allowedChars: '!-uz~<>',
                type: 'ascii85'
            });
            
            if (!text.startsWith('<~') || !text.endsWith('~>')) {
                throw new Error('Invalid ASCII85 format');
            }
            
            // Remove delimiters and whitespace
            text = text.slice(2, -2).replace(/\s/g, '');
            
            const bytes = [];
            let i = 0;
            
            while (i < text.length) {
                // Handle 'z' shorthand for four zero bytes
                if (text[i] === 'z') {
                    bytes.push(0, 0, 0, 0);
                    i++;
                    continue;
                }
                
                // Get up to 5 characters
                let chunk = text.slice(i, Math.min(i + 5, text.length));
                i += chunk.length;
                
                // Convert 5 characters to 4 bytes
                let value = 0n;
                for (let j = 0; j < chunk.length; j++) {
                    const charCode = chunk.charCodeAt(j) - 33;
                    if (charCode < 0 || charCode > 84) {
                        throw new Error('Invalid ASCII85 character');
                    }
                    value = value * 85n + BigInt(charCode);
                }
                
                // Pad with 'u' characters if necessary
                for (let j = chunk.length; j < 5; j++) {
                    value = value * 85n + 84n; // 'u' is 117-33=84
                }
                
                // Extract bytes
                const chunkBytes = [];
                for (let j = 0; j < 4; j++) {
                    chunkBytes.unshift(Number(value & 0xFFn));
                    value = value >> 8n;
                }
                
                // Only add the necessary bytes for the last chunk
                const bytesToAdd = chunk.length === 5 ? 4 : chunk.length - 1;
                bytes.push(...chunkBytes.slice(-bytesToAdd));
            }
            
            return new TextDecoder().decode(new Uint8Array(bytes));
        }
    },

    // Vigenère cipher: Polyalphabetic substitution cipher using a keyword
    // Each letter is shifted based on the corresponding letter in the keyword
    vigenere: {
        encode: (text, key) => {
            if (!key) throw new Error('Encryption key is required for Vigenère cipher');
            
            key = validateInput(key, {
                allowedChars: 'A-Za-z',
                type: 'vigenere-key'
            });

            // Convert key to uppercase and remove non-alphabetic characters
            key = key.toUpperCase().replace(/[^A-Z]/g, '');
            if (key.length === 0) {
                throw new Error('Key must contain at least one letter');
            }

            return text.replace(/[a-zA-Z]/g, (char, index) => {
                const isUpperCase = char === char.toUpperCase();
                const baseChar = isUpperCase ? 'A' : 'a';
                const keyChar = key[index % key.length].toUpperCase();
                
                // Calculate shift based on key character (A=0, B=1, etc.)
                const shift = keyChar.charCodeAt(0) - 'A'.charCodeAt(0);
                
                // Apply shift to current character
                const charCode = char.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
                const shiftedCode = ((charCode + shift) % 26) + baseChar.charCodeAt(0);
                
                return String.fromCharCode(shiftedCode);
            });
        },
        decode: (text, key) => {
            if (!key) throw new Error('Decryption key is required for Vigenère cipher');
            
            key = validateInput(key, {
                allowedChars: 'A-Za-z',
                type: 'vigenere-key'
            });

            // Convert key to uppercase and remove non-alphabetic characters
            key = key.toUpperCase().replace(/[^A-Z]/g, '');
            if (key.length === 0) {
                throw new Error('Key must contain at least one letter');
            }

            return text.replace(/[a-zA-Z]/g, (char, index) => {
                const isUpperCase = char === char.toUpperCase();
                const baseChar = isUpperCase ? 'A' : 'a';
                const keyChar = key[index % key.length].toUpperCase();
                
                // Calculate reverse shift based on key character
                const shift = keyChar.charCodeAt(0) - 'A'.charCodeAt(0);
                
                // Apply reverse shift to current character
                const charCode = char.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
                const shiftedCode = ((charCode - shift + 26) % 26) + baseChar.charCodeAt(0);
                
                return String.fromCharCode(shiftedCode);
            });
        }
    },

    // Playfair cipher: A digraph substitution cipher using a 5x5 key matrix
    // - Uses a 5x5 matrix of letters (combining I/J) based on a keyword
    // - Encrypts pairs of letters (digraphs) according to their position in the matrix
    // - Rules: 
    //   * Same row: letters are replaced by letters to their right (wrapping around)
    //   * Same column: letters are replaced by letters below them (wrapping around)
    //   * Different row/column: letters are replaced by letters at the corners of the rectangle they form
    // - Special cases:
    //   * J is replaced by I (to fit alphabet in 5x5 grid)
    //   * Double letters are separated by 'X'
    //   * Odd-length messages are padded with 'X'
    playfair: {
        encode: (text, key) => {
            if (!key) throw new Error('Encryption key is required for Playfair cipher');
            
            key = validateInput(key, {
                allowedChars: 'A-Za-z',
                type: 'playfair-key'
            }).toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');

            if (key.length === 0) {
                throw new Error('Key must contain at least one letter');
            }

            // Prepare the text: remove non-letters, convert to uppercase, replace J with I
            text = text.toUpperCase()
                      .replace(/J/g, 'I')
                      .replace(/[^A-Z]/g, '')
                      .replace(/(.)(.)?\b/g, (m, p1, p2) => p2 ? p1 + p2 : p1 + 'X');

            // Create the Playfair matrix
            const matrix = createPlayfairMatrix(key);

            // Encode pairs of letters
            return text.match(/.{2}/g).map(pair => {
                const [row1, col1] = findInMatrix(matrix, pair[0]);
                const [row2, col2] = findInMatrix(matrix, pair[1]);

                if (row1 === row2) { // Same row
                    return matrix[row1][(col1 + 1) % 5] + matrix[row2][(col2 + 1) % 5];
                } else if (col1 === col2) { // Same column
                    return matrix[(row1 + 1) % 5][col1] + matrix[(row2 + 1) % 5][col2];
                } else { // Rectangle
                    return matrix[row1][col2] + matrix[row2][col1];
                }
            }).join('');
        },
        decode: (text, key) => {
            if (!key) throw new Error('Decryption key is required for Playfair cipher');
            
            key = validateInput(key, {
                allowedChars: 'A-Za-z',
                type: 'playfair-key'
            }).toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');

            if (key.length === 0) {
                throw new Error('Key must contain at least one letter');
            }

            // Prepare the text
            text = text.toUpperCase().replace(/[^A-Z]/g, '');
            if (text.length % 2 !== 0) {
                throw new Error('Invalid Playfair cipher text (must be even length)');
            }

            // Create the Playfair matrix
            const matrix = createPlayfairMatrix(key);

            // Decode pairs of letters
            return text.match(/.{2}/g).map(pair => {
                const [row1, col1] = findInMatrix(matrix, pair[0]);
                const [row2, col2] = findInMatrix(matrix, pair[1]);

                if (row1 === row2) { // Same row
                    return matrix[row1][(col1 + 4) % 5] + matrix[row2][(col2 + 4) % 5];
                } else if (col1 === col2) { // Same column
                    return matrix[(row1 + 4) % 5][col1] + matrix[(row2 + 4) % 5][col2];
                } else { // Rectangle
                    return matrix[row1][col2] + matrix[row2][col1];
                }
            }).join('').replace(/X$/, '');
        }
    },

    // Hill cipher: Polygraphic substitution cipher using linear algebra
    // - Uses a key matrix to encode and decode messages
    // - The key matrix must be a square matrix
    // - The determinant of the key matrix must be coprime with 26
    // - The key matrix must be invertible modulo 26
    hill: {
        encode: (text, key) => {
            if (!key) throw new Error('Key matrix is required for Hill cipher');
            
            // Validate and parse key matrix
            const keyMatrix = parseKeyMatrix(key);
            const matrixSize = Math.sqrt(keyMatrix.length);
            
            // Verify matrix is valid for Hill cipher
            const det = calculateDeterminant(keyMatrix, matrixSize);
            if (!isValidDeterminant(det)) {
                throw new Error('Invalid key matrix: determinant must be coprime with 26');
            }
            
            // Remove non-alphabetic characters and convert to uppercase
            text = text.toUpperCase().replace(/[^A-Z]/g, '');
            
            // Add 'X' to the end of the text if its length is not a multiple of the matrix size
            while (text.length % matrixSize !== 0) {
                text += 'X';
            }
            
            let result = '';
            
            // Process text in blocks
            for (let i = 0; i < text.length; i += matrixSize) {
                const block = text.slice(i, i + matrixSize)
                    .split('')
                    .map(char => char.charCodeAt(0) - 65);
                
                const encrypted = multiplyMatrixVector(keyMatrix, block, matrixSize);
                result += encrypted.map(n => String.fromCharCode((n % 26 + 26) % 26 + 65)).join('');
            }
            
            return result;
        },
        
        decode: (text, key) => {
            if (!key) throw new Error('Key matrix is required for Hill cipher');
            
            // Validate and parse key matrix
            const keyMatrix = parseKeyMatrix(key);
            const matrixSize = Math.sqrt(keyMatrix.length);
            
            // Verify matrix is valid for Hill cipher
            const det = calculateDeterminant(keyMatrix, matrixSize);
            if (!isValidDeterminant(det)) {
                throw new Error('Invalid key matrix: determinant must be coprime with 26');
            }
            
            // Calculate inverse matrix
            const inverseMatrix = calculateInverseMatrix(keyMatrix, matrixSize);
            if (!inverseMatrix) {
                throw new Error('Invalid key matrix: no modular multiplicative inverse exists');
            }
            
            // Remove non-alphabetic characters and convert to uppercase
            text = text.toUpperCase().replace(/[^A-Z]/g, '');
            
            let result = '';
            
            // Process text in blocks
            for (let i = 0; i < text.length; i += matrixSize) {
                const block = text.slice(i, i + matrixSize)
                    .split('')
                    .map(char => char.charCodeAt(0) - 65);
                
                const decrypted = multiplyMatrixVector(inverseMatrix, block, matrixSize);
                result += decrypted.map(n => String.fromCharCode((n % 26 + 26) % 26 + 65)).join('');
            }
            
            return result;
        }
    },

    // Base58 encoding: Used for Bitcoin addresses and other cryptocurrencies
    // Alphabet excludes similar-looking characters: 0OIl to prevent visual ambiguity
    base58: {
        encode: (text) => {
            text = validateInput(text);
            const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            const BASE = ALPHABET.length;
            
            // Convert text to bytes
            const bytes = new TextEncoder().encode(text);
            
            // Convert to big number
            let num = 0n;
            for (let i = 0; i < bytes.length; i++) {
                num = num * 256n + BigInt(bytes[i]);
            }
            
            // Convert to base58
            let encoded = '';
            while (num > 0n) {
                const remainder = Number(num % BigInt(BASE));
                encoded = ALPHABET[remainder] + encoded;
                num = num / BigInt(BASE);
            }
            
            // Add leading zeros
            for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
                encoded = ALPHABET[0] + encoded;
            }
            
            return encoded;
        },
        decode: (text) => {
            text = validateInput(text, {
                allowedChars: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
                type: 'base58'
            });
            
            const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            const BASE = ALPHABET.length;
            
            // Convert from base58
            let num = 0n;
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const value = ALPHABET.indexOf(char);
                if (value === -1) {
                    throw new Error('Invalid Base58 character: ' + char);
                }
                num = num * BigInt(BASE) + BigInt(value);
            }
            
            // Convert to bytes
            let bytes = [];
            while (num > 0n) {
                bytes.unshift(Number(num % 256n));
                num = num / 256n;
            }
            
            // Add leading zeros
            for (let i = 0; i < text.length && text[i] === ALPHABET[0]; i++) {
                bytes.unshift(0);
            }
            
            return new TextDecoder().decode(new Uint8Array(bytes));
        }
    },

    // ADFGVX cipher: German WWI field cipher combining substitution and transposition
    // - Uses a 6x6 grid with coordinates labeled A, D, F, G, V, X
    // - Requires a key for the transposition step
    // - Historically used for radio communications in World War I
    adfgvx: {
        encode: (text, key) => {
            if (!key) throw new Error('Encryption key is required for ADFGVX cipher');
            
            key = validateInput(key, {
                allowedChars: 'A-Za-z',
                type: 'adfgvx-key'
            });
    
            // Convert key to uppercase and remove non-alphabetic characters
            key = key.toUpperCase().replace(/[^A-Z]/g, '');
            if (key.length === 0) {
                throw new Error('Key must contain at least one letter');
            }
    
            // Prepare the input text: convert to uppercase, remove spaces and special characters
            text = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
            
            // Create the polybius square with a mixed alphabet
            const alphabet = "KZROUQHYFSAXWMGPBVTDNLCIJE0123456789";
            const labels = "ADFGVX";
            const square = [];
            
            for (let i = 0; i < 6; i++) {
                square[i] = [];
                for (let j = 0; j < 6; j++) {
                    square[i][j] = alphabet[i * 6 + j];
                }
            }
            
            // Step 1: Substitution - replace each character with its coordinates
            let substituted = '';
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                let found = false;
                
                // Find the character in the square
                for (let row = 0; row < 6 && !found; row++) {
                    for (let col = 0; col < 6 && !found; col++) {
                        if (square[row][col] === char) {
                            // Add the coordinates using the ADFGVX labels
                            substituted += labels[row] + labels[col];
                            found = true;
                        }
                    }
                }
                
                // If character not found in the square, skip it
                if (!found) {
                    continue;
                }
            }
            
            // Step 2: Transposition using the key
            // Create a grid with the key as column headers
            const grid = [];
            const keyArray = [...key];
            
            // Fill the grid with the substituted text
            let row = 0;
            for (let i = 0; i < substituted.length; i += keyArray.length) {
                grid[row] = [];
                for (let j = 0; j < keyArray.length; j++) {
                    grid[row][j] = i + j < substituted.length ? substituted[i + j] : '';
                }
                row++;
            }
            
            // Create a mapping of key positions
            const keyPositions = keyArray.map((char, index) => ({ char, index }))
                                        .sort((a, b) => a.char.localeCompare(b.char));
            
            // Read off the columns in alphabetical order of the key
            let result = '';
            for (const { index } of keyPositions) {
                for (let i = 0; i < grid.length; i++) {
                    if (grid[i][index]) {
                        result += grid[i][index];
                    }
                }
            }
            
            return result;
        },
        
        decode: (text, key) => {
            if (!key) throw new Error('Decryption key is required for ADFGVX cipher');
            
            key = validateInput(key, {
                allowedChars: 'A-Za-z',
                type: 'adfgvx-key'
            });
    
            // Convert key to uppercase and remove non-alphabetic characters
            key = key.toUpperCase().replace(/[^A-Z]/g, '');
            if (key.length === 0) {
                throw new Error('Key must contain at least one letter');
            }
    
            // Validate the ciphertext - should only contain A, D, F, G, V, X
            text = text.toUpperCase();
            if (!text.match(/^[ADFGVX]+$/)) {
                throw new Error('Invalid ADFGVX ciphertext (should only contain A, D, F, G, V, X)');
            }
            
            // Create the polybius square with the same mixed alphabet as in encoding
            const alphabet = "KZROUQHYFSAXWMGPBVTDNLCIJE0123456789";
            const labels = "ADFGVX";
            const square = [];
            
            for (let i = 0; i < 6; i++) {
                square[i] = [];
                for (let j = 0; j < 6; j++) {
                    square[i][j] = alphabet[i * 6 + j];
                }
            }
            
            // Step 1: Reverse the transposition
            const keyArray = [...key];
            const numCols = keyArray.length;
            const numRows = Math.ceil(text.length / numCols);
            
            // Create a mapping of key positions
            const keyPositions = keyArray.map((char, index) => ({ char, index }))
                                        .sort((a, b) => a.char.localeCompare(b.char));
            
            // Calculate column lengths
            const colLengths = [];
            for (let i = 0; i < numCols; i++) {
                colLengths[i] = Math.floor(text.length / numCols) + (i < text.length % numCols ? 1 : 0);
            }
            
            // Distribute the ciphertext among the columns
            const columns = [];
            let pos = 0;
            
            for (const { index } of keyPositions) {
                columns[index] = text.substr(pos, colLengths[index]);
                pos += colLengths[index];
            }
            
            // Reconstruct the original grid
            let grid = [];
            for (let i = 0; i < numRows; i++) {
                grid[i] = [];
                for (let j = 0; j < numCols; j++) {
                    grid[i][j] = i < columns[j].length ? columns[j][i] : '';
                }
            }
            
            // Read the grid row by row to get the substituted text
            let substituted = '';
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (grid[i][j]) {
                        substituted += grid[i][j];
                    }
                }
            }
            
            // Step 2: Reverse the substitution
            let result = '';
            for (let i = 0; i < substituted.length; i += 2) {
                if (i + 1 >= substituted.length) break;
                
                const row = labels.indexOf(substituted[i]);
                const col = labels.indexOf(substituted[i + 1]);
                
                if (row !== -1 && col !== -1) {
                    result += square[row][col];
                }
            }
            
            return result;
        }
    },

    // Punycode: Encoding system used for Internationalized Domain Names (IDN)
    // Converts Unicode characters to ASCII for domain names (RFC 3492)
    punycode: {
        // Constants for Punycode algorithm
        BASE: 36,
        TMIN: 1,
        TMAX: 26,
        SKEW: 38,
        DAMP: 700,
        INITIAL_BIAS: 72,
        INITIAL_N: 128,
        DELIMITER: '-',
        
        // Encode a string to Punycode
        encode: (text) => {
            validateInput(text);
            
            // Check if the string is already ASCII-only
            if (/^[\x00-\x7F]*$/.test(text)) {
                return text;
            }
            
            // For domain names, handle each label separately
            if (text.includes('.')) {
                const labels = text.split('.');
                return labels.map(label => {
                    // If the label contains non-ASCII, encode it with xn-- prefix
                    if (/[^\x00-\x7F]/.test(label)) {
                        return 'xn--' + encodingFunctions.punycode._encodePart(label);
                    }
                    return label;
                }).join('.');
            }
            
            // For a single label/string
            return encodingFunctions.punycode._encodePart(text);
        },
        
        // Internal function to encode a single part
        _encodePart: (text) => {
            const output = [];
            
            // Find the basic code points (ASCII) and copy them to output
            let n = encodingFunctions.punycode.INITIAL_N;
            let delta = 0;
            let bias = encodingFunctions.punycode.INITIAL_BIAS;
            
            // Copy all ASCII chars to output
            const basicChars = [];
            for (let i = 0; i < text.length; i++) {
                const codePoint = text.codePointAt(i);
                if (codePoint < 128) {
                    basicChars.push(text[i]);
                }
            }
            
            let h = basicChars.length;
            let b = h;
            
            // Add delimiter if there are basic code points
            if (b > 0) {
                output.push(encodingFunctions.punycode.DELIMITER);
            }
            
            // Main encoding loop
            while (h < text.length) {
                // Find the next smallest code point >= n
                let m = Number.MAX_SAFE_INTEGER;
                for (let i = 0; i < text.length; i++) {
                    const codePoint = text.codePointAt(i);
                    if (codePoint >= n && codePoint < m) {
                        m = codePoint;
                    }
                }
                
                // Increase delta and update n
                delta += (m - n) * (h + 1);
                n = m;
                
                // Process all code points < m
                for (let i = 0; i < text.length; i++) {
                    const codePoint = text.codePointAt(i);
                    
                    if (codePoint < n) {
                        delta++;
                    }
                    
                    if (codePoint === n) {
                        // Represent delta in the variable-length integer
                        let q = delta;
                        let k = encodingFunctions.punycode.BASE;
                        
                        while (true) {
                            const t = k <= bias ? encodingFunctions.punycode.TMIN :
                                    k >= bias + encodingFunctions.punycode.TMAX ? encodingFunctions.punycode.TMAX :
                                    k - bias;
                            
                            if (q < t) break;
                            
                            const qMinusT = q - t;
                            const baseMinusT = encodingFunctions.punycode.BASE - t;
                            
                            output.push(String.fromCodePoint(
                                encodingFunctions.punycode._digitToCodePoint(t + (qMinusT % baseMinusT))
                            ));
                            
                            q = Math.floor(qMinusT / baseMinusT);
                            k += encodingFunctions.punycode.BASE;
                        }
                        
                        output.push(String.fromCodePoint(
                            encodingFunctions.punycode._digitToCodePoint(q)
                        ));
                        
                        // Adapt bias
                        bias = encodingFunctions.punycode._adapt(
                            delta, h + 1, h === b
                        );
                        delta = 0;
                        h++;
                    }
                }
                
                delta++;
                n++;
            }
            
            return basicChars.join('') + output.join('');
        },
        
        // Decode a Punycode string
        decode: (text) => {
            validateInput(text);
            
            // For domain names, handle each label separately
            if (text.includes('.')) {
                const labels = text.split('.');
                return labels.map(label => {
                    // If the label has the xn-- prefix, decode it
                    if (label.startsWith('xn--')) {
                        return encodingFunctions.punycode._decodePart(label.slice(4));
                    }
                    return label;
                }).join('.');
            }
            
            // For a single label/string
            return encodingFunctions.punycode._decodePart(text);
        },
        
        // Internal function to decode a single part
        _decodePart: (text) => {
            // Find the last delimiter
            const delimiterPos = text.lastIndexOf(encodingFunctions.punycode.DELIMITER);
            
            // Extract basic code points
            const basicChars = delimiterPos === -1 ? '' : text.slice(0, delimiterPos);
            
            // Initialize variables
            let n = encodingFunctions.punycode.INITIAL_N;
            let i = 0;
            let bias = encodingFunctions.punycode.INITIAL_BIAS;
            let output = [...basicChars];
            
            // Start from after the last delimiter
            const inputPart = delimiterPos === -1 ? text : text.slice(delimiterPos + 1);
            
            // Main decoding loop
            let index = 0;
            while (index < inputPart.length) {
                const oldi = i;
                let w = 1;
                let k = encodingFunctions.punycode.BASE;
                
                // Decode the variable-length integer
                while (true) {
                    if (index >= inputPart.length) {
                        throw new Error('Invalid Punycode string');
                    }
                    
                    const digit = encodingFunctions.punycode._codePointToDigit(
                        inputPart.codePointAt(index++)
                    );
                    
                    if (digit >= encodingFunctions.punycode.BASE) {
                        throw new Error('Invalid Punycode string');
                    }
                    
                    i += digit * w;
                    
                    const t = k <= bias ? encodingFunctions.punycode.TMIN :
                              k >= bias + encodingFunctions.punycode.TMAX ? encodingFunctions.punycode.TMAX :
                              k - bias;
                    
                    if (digit < t) break;
                    
                    w *= encodingFunctions.punycode.BASE - t;
                    k += encodingFunctions.punycode.BASE;
                }
                
                // Adapt bias
                bias = encodingFunctions.punycode._adapt(i - oldi, output.length + 1, oldi === 0);
                
                // i now represents the next code point to insert
                n += Math.floor(i / (output.length + 1));
                i %= (output.length + 1);
                
                // Insert the decoded character
                output.splice(i, 0, String.fromCodePoint(n));
                i++;
            }
            
            return output.join('');
        },
        
        // Convert a digit to a code point
        _digitToCodePoint: (digit) => {
            if (digit < 26) {
                // 0..25 => 'a'..'z'
                return digit + 97;
            } else {
                // 26..35 => '0'..'9'
                return digit - 26 + 48;
            }
        },
        
        // Convert a code point to a digit
        _codePointToDigit: (codePoint) => {
            if (codePoint >= 48 && codePoint <= 57) {
                // '0'..'9' => 26..35
                return codePoint - 48 + 26;
            } else if (codePoint >= 97 && codePoint <= 122) {
                // 'a'..'z' => 0..25
                return codePoint - 97;
            } else {
                return encodingFunctions.punycode.BASE; // Invalid
            }
        },
        
        // Adapt the bias
        _adapt: (delta, numPoints, firstTime) => {
            delta = firstTime ? Math.floor(delta / encodingFunctions.punycode.DAMP) : Math.floor(delta / 2);
            delta += Math.floor(delta / numPoints);
            
            let k = 0;
            while (delta > ((encodingFunctions.punycode.BASE - encodingFunctions.punycode.TMIN) * encodingFunctions.punycode.TMAX) / 2) {
                delta = Math.floor(delta / (encodingFunctions.punycode.BASE - encodingFunctions.punycode.TMIN));
                k += encodingFunctions.punycode.BASE;
            }
            
            return k + Math.floor(((encodingFunctions.punycode.BASE - encodingFunctions.punycode.TMIN + 1) * delta) / (delta + encodingFunctions.punycode.SKEW));
        }
    },
};


/* ############################################################ */
/* ##### HELPER FUNCTIONS ##################################### */
/* ############################################################ */

/**
 * Create a Playfair matrix from a key
 * @param {string} key - The key for the Playfair matrix
 * @returns {Array} The Playfair matrix
 */
function createPlayfairMatrix(key) {
    // Create initial alphabet (without J)
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    const uniqueChars = [...new Set(key + alphabet)];
    
    // Create 5x5 matrix
    const matrix = [];
    for (let i = 0; i < 5; i++) {
        matrix[i] = uniqueChars.slice(i * 5, (i + 1) * 5);
    }
    return matrix;
}

/**
 * Find a character in a Playfair matrix
 * @param {Array} matrix - The Playfair matrix
 * @param {string} char - The character to find
 * @returns {Array} The coordinates of the character in the matrix
 */
function findInMatrix(matrix, char) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (matrix[i][j] === char) {
                return [i, j];
            }
        }
    }
    return [0, 0]; // Should never happen with valid input
}

/**
 * Parse a key matrix from a string
 * @param {string} key - The key for the matrix
 * @returns {Array} The matrix
 */
function parseKeyMatrix(key) {
    const matrix = key.trim().split(/\s+/).map(n => {
        const num = parseInt(n);
        if (isNaN(num)) throw new Error('Key matrix must contain valid numbers');
        return ((num % 26) + 26) % 26;
    });
    
    const size = Math.sqrt(matrix.length);
    if (!Number.isInteger(size) || (size !== 2 && size !== 3)) {
        throw new Error('Key matrix must be 2x2 or 3x3');
    }
    
    return matrix;
}

/**
 * Multiply a matrix by a vector
 * @param {Array} matrix - The matrix
 * @param {Array} vector - The vector
 * @param {number} size - The size of the matrix
 * @returns {Array} The result
 */
function multiplyMatrixVector(matrix, vector, size) {
    const result = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            result[i] = (result[i] + matrix[i * size + j] * vector[j]) % 26;
        }
        result[i] = ((result[i] % 26) + 26) % 26;
    }
    return result;
}

/**
 * Calculate the determinant of a matrix
 * @param {Array} matrix - The matrix
 * @param {number} size - The size of the matrix
 * @returns {number} The determinant
 */
function calculateDeterminant(matrix, size) {
    if (size === 2) {
        return ((matrix[0] * matrix[3] - matrix[1] * matrix[2]) % 26 + 26) % 26;
    }
    
    if (size === 3) {
        return ((
            matrix[0] * ((matrix[4] * matrix[8] - matrix[5] * matrix[7]) % 26) +
            matrix[1] * ((matrix[5] * matrix[6] - matrix[3] * matrix[8]) % 26) +
            matrix[2] * ((matrix[3] * matrix[7] - matrix[4] * matrix[6]) % 26)
        ) % 26 + 26) % 26;
    }
}

/**
 * Calculate the modular inverse of a number
 * @param {number} a - The number
 * @param {number} m - The modulus
 * @returns {number} The inverse
 */
function modInverse(a, m = 26) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) {
            return x;
        }
    }
    return null;
}

/**
 * Calculate the inverse of a matrix
 * @param {Array} matrix - The matrix
 * @param {number} size - The size of the matrix
 * @returns {Array} The inverse
 */
function calculateInverseMatrix(matrix, size) {
    const det = calculateDeterminant(matrix, size);
    const detInverse = modInverse(det);
    
    if (detInverse === null) {
        throw new Error('Matrix is not invertible (determinant has no inverse modulo 26)');
    }
    
    if (size === 2) {
        return [
            (matrix[3] * detInverse) % 26,
            (-matrix[1] * detInverse + 26) % 26,
            (-matrix[2] * detInverse + 26) % 26,
            (matrix[0] * detInverse) % 26
        ];
    }
    
    if (size === 3) {
        const cofactors = [
            // First row
            ((matrix[4] * matrix[8] - matrix[5] * matrix[7]) % 26 + 26) % 26,
            ((matrix[5] * matrix[6] - matrix[3] * matrix[8]) % 26 + 26) % 26,
            ((matrix[3] * matrix[7] - matrix[4] * matrix[6]) % 26 + 26) % 26,
            
            // Second row
            ((matrix[2] * matrix[7] - matrix[1] * matrix[8]) % 26 + 26) % 26,
            ((matrix[0] * matrix[8] - matrix[2] * matrix[6]) % 26 + 26) % 26,
            ((matrix[1] * matrix[6] - matrix[0] * matrix[7]) % 26 + 26) % 26,
            
            // Third row
            ((matrix[1] * matrix[5] - matrix[2] * matrix[4]) % 26 + 26) % 26,
            ((matrix[2] * matrix[3] - matrix[0] * matrix[5]) % 26 + 26) % 26,
            ((matrix[0] * matrix[4] - matrix[1] * matrix[3]) % 26 + 26) % 26
        ];
        
        // Transpose the cofactor matrix
        const adjugate = [
            cofactors[0], cofactors[3], cofactors[6],
            cofactors[1], cofactors[4], cofactors[7],
            cofactors[2], cofactors[5], cofactors[8]
        ];
        
        // Multiply by the determinant inverse
        return adjugate.map(x => ((x * detInverse) % 26 + 26) % 26);
    }
}

/**
 * Calculate the greatest common divisor of two numbers
 * @param {number} a - The first number
 * @param {number} b - The second number
 * @returns {number} The greatest common divisor
 */
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

/**
 * Check if a determinant is valid for Hill cipher
 * @param {number} det - The determinant
 * @returns {boolean} True if the determinant is valid, false otherwise
 */
function isValidDeterminant(det) {
    det = ((det % 26) + 26) % 26;
    return det !== 0 && gcd(det, 26) === 1;
} 