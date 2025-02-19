const encodingFunctions = {
    base64: {
        encode: (text) => btoa(text),
        decode: (text) => atob(text)
    },
    uri: {
        encode: (text) => encodeURIComponent(text),
        decode: (text) => decodeURIComponent(text)
    },
    hex: {
        encode: (text) => Array.from(text).map(char => char.charCodeAt(0).toString(16)).join(''),
        decode: (text) => text.match(/.{1,2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join('') || ''
    },
    binary: {
        encode: (text) => Array.from(text).map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
        decode: (text) => text.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('')
    },
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
    rot13: {
        encode: (text) => text.replace(/[a-zA-Z]/g, c => 
            String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) 
            ? c : c - 26)),
        decode: (text) => text.replace(/[a-zA-Z]/g, c => 
            String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) 
            ? c : c - 26))
    },
    base32: {
        encode: (text) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let bits = 0;
            let value = 0;
            let output = '';
            
            for (let i = 0; i < text.length; i++) {
                value = (value << 8) | text.charCodeAt(i);
                bits += 8;
                while (bits >= 5) {
                    output += alphabet[(value >>> (bits - 5)) & 31];
                    bits -= 5;
                }
            }
            
            if (bits > 0) {
                output += alphabet[(value << (5 - bits)) & 31];
            }
            
            // Padding
            while (output.length % 8 !== 0) {
                output += '=';
            }
            
            return output;
        },
        decode: (text) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            text = text.replace(/=+$/, '');
            let bits = 0;
            let value = 0;
            let output = '';
            
            for (let i = 0; i < text.length; i++) {
                value = (value << 5) | alphabet.indexOf(text[i].toUpperCase());
                bits += 5;
                if (bits >= 8) {
                    output += String.fromCharCode((value >>> (bits - 8)) & 255);
                    bits -= 8;
                }
            }
            
            return output;
        }
    },
    jwt: {
        encode: (text) => {
            // Simple JWT structure (for demonstration)
            const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
            const payload = btoa(text);
            return `${header}.${payload}.`;
        },
        decode: (text) => {
            try {
                const [, payload] = text.split('.');
                return atob(payload);
            } catch (e) {
                throw new Error('Invalid JWT format');
            }
        }
    },
    html: {
        encode: (text) => text.replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]),
        decode: (text) => text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
    },
    caesar: {
        encode: (text, shift = 3) => {
            return text.replace(/[a-zA-Z]/g, char => {
                const code = char.charCodeAt(0);
                const isUpperCase = char === char.toUpperCase();
                const base = isUpperCase ? 65 : 97;
                return String.fromCharCode(((code - base + shift) % 26) + base);
            });
        },
        decode: (text, shift = 3) => {
            return text.replace(/[a-zA-Z]/g, char => {
                const code = char.charCodeAt(0);
                const isUpperCase = char === char.toUpperCase();
                const base = isUpperCase ? 65 : 97;
                return String.fromCharCode(((code - base - shift + 26) % 26) + base);
            });
        }
    },
    ascii85: {
        encode: (text) => {
            let result = '<~';
            let value = 0;
            let count = 0;
            
            for (let i = 0; i < text.length; i++) {
                value = (value * 256) + text.charCodeAt(i);
                count++;
                
                if (count === 4) {
                    if (value === 0) {
                        result += 'z';
                    } else {
                        for (let j = 4; j >= 0; j--) {
                            result += String.fromCharCode(((value / Math.pow(85, j)) | 0) % 85 + 33);
                        }
                    }
                    value = 0;
                    count = 0;
                }
            }
            
            if (count > 0) {
                for (let i = count; i < 4; i++) {
                    value *= 256;
                }
                for (let j = 4; j >= 5 - count; j--) {
                    result += String.fromCharCode(((value / Math.pow(85, j)) | 0) % 85 + 33);
                }
            }
            
            return result + '~>';
        },
        decode: (text) => {
            if (!text.startsWith('<~') || !text.endsWith('~>')) {
                throw new Error('Invalid ASCII85 format');
            }
            
            text = text.slice(2, -2);
            let result = '';
            let value = 0;
            let count = 0;
            
            for (let i = 0; i < text.length; i++) {
                if (text[i] === 'z') {
                    result += '\0\0\0\0';
                    continue;
                }
                
                value = value * 85 + (text.charCodeAt(i) - 33);
                count++;
                
                if (count === 5) {
                    for (let j = 3; j >= 0; j--) {
                        result += String.fromCharCode((value >> (j * 8)) & 0xFF);
                    }
                    value = 0;
                    count = 0;
                }
            }
            
            return result;
        }
    }
};

const hashPatterns = {
    MD5: /^[a-f0-9]{32}$/i,
    SHA1: /^[a-f0-9]{40}$/i,
    SHA256: /^[a-f0-9]{64}$/i,
    SHA512: /^[a-f0-9]{128}$/i,
    RIPEMD160: /^[a-f0-9]{40}$/i,
    BCrypt: /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/,
    Argon2: /^\$argon2[id]\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/,
    NTLM: /^[a-f0-9]{32}$/i,
    MySQL4: /^[a-f0-9]{16}$/i,
    MySQL5: /^\*[A-F0-9]{40}$/
};

function detectHashType(hash) {
    const results = [];
    
    hash = hash.trim();
    
    for (const [hashType, pattern] of Object.entries(hashPatterns)) {
        if (pattern.test(hash)) {
            let probability = 100;
            
            if (hashType === 'MD5' && hash.match(/^[a-f0-9]{32}$/i)) {
                probability = hash.match(/^[a-f0-9]{32}$/i) ? 90 : 0;
            }
            
            if (hashType === 'BCrypt') {
                probability = hash.startsWith('$2') ? 100 : 0;
            }
            
            if (hashType === 'MySQL5') {
                probability = hash.startsWith('*') ? 100 : 0;
            }
            
            if (probability > 0) {
                results.push({
                    type: hashType,
                    probability,
                    length: hash.length,
                    format: getHashFormat(hashType),
                    description: getHashDescription(hashType)
                });
            }
        }
    }
    
    return results.sort((a, b) => b.probability - a.probability);
}

function getHashFormat(hashType) {
    const formats = {
        MD5: '32 characters hexadecimal',
        SHA1: '40 characters hexadecimal',
        SHA256: '64 characters hexadecimal',
        SHA512: '128 characters hexadecimal',
        BCrypt: '$2a$, $2b$ or $2y$ + cost + 53 characters',
        Argon2: '$argon2[id]$v=[...]',
        NTLM: '32 characters hexadecimal',
        MySQL4: '16 characters hexadecimal',
        MySQL5: '* + 40 characters hexadecimal'
    };
    return formats[hashType] || 'Unknown format';
}

function getHashDescription(hashType) {
    const descriptions = {
        MD5: 'Fast but cryptographically broken hash function',
        SHA1: 'Cryptographically broken hash function',
        SHA256: 'Strong cryptographic hash function',
        SHA512: 'Strong cryptographic hash function with larger output',
        BCrypt: 'Password hashing function with salt and cost factor',
        Argon2: 'Modern password hashing function, winner of PHC',
        NTLM: 'Microsoft Windows password hash',
        MySQL4: 'Deprecated MySQL password hash',
        MySQL5: 'MySQL password hash (SHA1)'
    };
    return descriptions[hashType] || 'Unknown hash type';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function handleError(error) {
    document.getElementById('output').value = `Error: ${error.message}`;
}

document.getElementById("encodeButton").addEventListener("click", function() {
    try {
        const input = document.getElementById("input").value;
        const type = document.getElementById("encodingType").value;
        const output = encodingFunctions[type].encode(input);
        document.getElementById("output").value = output;
    } catch (error) {
        handleError(error);
    }
});

document.getElementById("decodeButton").addEventListener("click", function() {
    try {
        const input = document.getElementById("input").value;
        const type = document.getElementById("encodingType").value;
        const output = encodingFunctions[type].decode(input);
        document.getElementById("output").value = output;
    } catch (error) {
        handleError(error);
    }
});

document.getElementById("copyButton").addEventListener("click", function() {
    const output = document.getElementById("output");
    output.select();
    document.execCommand('copy');
    showNotification('Copied to clipboard!');
});

document.getElementById("clearButton").addEventListener("click", function() {
    document.getElementById("input").value = '';
    document.getElementById("output").value = '';
});

document.getElementById('encodingType').addEventListener('change', function(e) {
    const normalButtons = document.getElementById('normalButtons');
    const hashButtons = document.getElementById('hashButtons');
    
    if (e.target.value === 'hash-detect') {
        normalButtons.style.display = 'none';
        hashButtons.style.display = 'block';
        document.getElementById('input').placeholder = 'Enter hash to analyze...';
    } else {
        normalButtons.style.display = 'block';
        hashButtons.style.display = 'none';
        document.getElementById('input').placeholder = 'Enter text to encode/decode...';
    }
});

document.getElementById('detectHashButton').addEventListener('click', function() {
    const input = document.getElementById('input').value.trim();
    
    if (!input) {
        document.getElementById('output').value = 'Please enter a hash to analyze.';
        return;
    }
    
    const results = detectHashType(input);
    
    if (results.length === 0) {
        document.getElementById('output').value = 'No known hash format detected.';
        return;
    }
    
    let output = 'Detected Hash Types:\n\n';
    results.forEach(result => {
        output += `Type: ${result.type}\n`;
        output += `Probability: ${result.probability}%\n`;
        output += `Format: ${result.format}\n`;
        output += `Description: ${result.description}\n\n`;
    });
    
    document.getElementById('output').value = output;
});
