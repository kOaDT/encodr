const INPUT_VALIDATION = {
    MAX_LENGTH: 100000, // 100KB max
    MIN_LENGTH: 1,
    VALID_JSON_SIZE: 10000, // 10KB max pour JWT
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

export const encodingFunctions = {
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
            
            // Valider que l'entrée est un JSON valide
            try {
                JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid JSON format for JWT payload');
            }

            secretKey = validateInput(secretKey, {
                minLength: 8,
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
    }
};

// Helper functions for Playfair cipher
function createPlayfairMatrix(key) {
    // Create initial alphabet (without J)
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    
    // Remove duplicates from key and combine with remaining alphabet
    const uniqueChars = [...new Set(key + alphabet)];
    
    // Create 5x5 matrix
    const matrix = [];
    for (let i = 0; i < 5; i++) {
        matrix[i] = uniqueChars.slice(i * 5, (i + 1) * 5);
    }
    return matrix;
}

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