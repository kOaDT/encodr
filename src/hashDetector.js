export const hashPatterns = {
    // MD5: 128-bit hash function, outputs 32 hex characters
    // Widely used but cryptographically broken
    MD5: /^[a-f0-9]{32}$/i,

    // SHA1: 160-bit hash function, outputs 40 hex characters
    // No longer considered cryptographically secure
    SHA1: /^[a-f0-9]{40}$/i,

    // SHA256: 256-bit hash function, outputs 64 hex characters
    // Part of SHA-2 family, widely used in security applications
    SHA256: /^[a-f0-9]{64}$/i,

    // SHA512: 512-bit hash function, outputs 128 hex characters
    // Strongest SHA-2 variant, used for high-security applications
    SHA512: /^[a-f0-9]{128}$/i,

    // RIPEMD160: 160-bit hash function, outputs 40 hex characters
    // European alternative to SHA1, used in Bitcoin addresses
    RIPEMD160: /^[a-f0-9]{40}$/i,

    // BCrypt: Adaptive hash function designed for password storage
    // Includes salt and cost factor for increased security
    BCrypt: /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/,

    // Argon2i: Memory-hard function optimized against side-channel attacks
    // Recommended for password hashing in high-security systems
    Argon2i: /^\$argon2i\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/,

    // Argon2d: Variant optimized for resistance against GPU cracking
    // Used when side-channel attacks are not a concern
    Argon2d: /^\$argon2d\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/,

    // Argon2id: Hybrid mode combining Argon2i and Argon2d features
    // Best choice for general password hashing use
    Argon2id: /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/,

    // NTLM: Microsoft Windows password hash
    // Legacy format, still used in Windows authentication
    NTLM: /^[a-f0-9]{32}$/i,

    // MySQL4: Old MySQL password hashing method
    // Deprecated, should not be used in new applications
    MySQL4: /^[a-f0-9]{16}$/i,

    // MySQL5: Current MySQL password hashing method
    // Uses SHA1 with specific formatting
    MySQL5: /^\*[A-F0-9]{40}$/
};

export function detectHashType(hash) {
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

export function getHashFormat(hashType) {
    const formats = {
        MD5: '32 characters hexadecimal',
        SHA1: '40 characters hexadecimal',
        SHA256: '64 characters hexadecimal',
        SHA512: '128 characters hexadecimal',
        BCrypt: '$2a$, $2b$ or $2y$ + cost + 53 characters',
        Argon2i: '$argon2i$v=[version]$m=[memory],t=[iterations],p=[parallelism]$[salt]$[hash]',
        Argon2d: '$argon2d$v=[version]$m=[memory],t=[iterations],p=[parallelism]$[salt]$[hash]',
        Argon2id: '$argon2id$v=[version]$m=[memory],t=[iterations],p=[parallelism]$[salt]$[hash]',
        NTLM: '32 characters hexadecimal',
        MySQL4: '16 characters hexadecimal',
        MySQL5: '* + 40 characters hexadecimal'
    };
    return formats[hashType] || 'Unknown format';
}

export function getHashDescription(hashType) {
    const descriptions = {
        MD5: 'Fast but cryptographically broken hash function',
        SHA1: 'Cryptographically broken hash function',
        SHA256: 'Strong cryptographic hash function',
        SHA512: 'Strong cryptographic hash function with larger output',
        BCrypt: 'Password hashing function with salt and cost factor',
        Argon2i: 'Password hashing optimized for side-channel attack resistance',
        Argon2d: 'Password hashing optimized for GPU cracking resistance',
        Argon2id: 'Hybrid password hashing combining Argon2i and Argon2d features',
        NTLM: 'Microsoft Windows password hash',
        MySQL4: 'Deprecated MySQL password hash',
        MySQL5: 'MySQL password hash (SHA1)'
    };
    return descriptions[hashType] || 'Unknown hash type';
}