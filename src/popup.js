import { encodingFunctions } from './encodingFunctions.js';
import { showNotification } from './utils.js';
import { detectHashType } from './hashDetector.js';
import { EncodrError, ErrorTypes, ErrorMessages } from './errorHandler.js';
import { handleError } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const encodingType = document.getElementById('encodingType');
    const jwtOptions = document.getElementById('jwtOptions');
    const jwtVerify = document.getElementById('jwtVerify');

    const encodeDecodeButtons = document.getElementById('normalButtons');
    const detectHashButton = document.getElementById('hashButtons');

    // Add Vigenère key input handling
    const vigenereOptions = document.createElement('div');
    vigenereOptions.id = 'vigenereOptions';
    vigenereOptions.style.display = 'none';
    vigenereOptions.innerHTML = `
        <input type="text" id="vigenereKey" placeholder="Enter Vigenère key...">
    `;
    jwtOptions.parentNode.insertBefore(vigenereOptions, jwtOptions.nextSibling);

    // Add Playfair key input handling
    const playfairOptions = document.createElement('div');
    playfairOptions.id = 'playfairOptions';
    playfairOptions.style.display = 'none';
    playfairOptions.innerHTML = `
        <input type="text" id="playfairKey" placeholder="Enter Playfair key...">
    `;
    jwtOptions.parentNode.insertBefore(playfairOptions, jwtOptions.nextSibling);

    // Add ADFGVX key input handling
    const adfgvxOptions = document.createElement('div');
    adfgvxOptions.id = 'adfgvxOptions';
    adfgvxOptions.style.display = 'none';
    adfgvxOptions.innerHTML = `
        <input type="text" id="adfgvxKey" placeholder="Enter ADFGVX key...">
    `;
    jwtOptions.parentNode.insertBefore(adfgvxOptions, jwtOptions.nextSibling);

    // Add Hill cipher key input handling
    const hillOptions = document.createElement('div');
    hillOptions.id = 'hillOptions';
    hillOptions.style.display = 'none';
    hillOptions.innerHTML = `
        <input type="text" id="hillKey" placeholder="Enter Hill matrix (e.g., '2 3 1 4' for 2x2)">
        <div class="matrix-info">
            Format: Space-separated numbers for matrix
            <br>2x2 example: 2 3 1 4
            <br>3x3 example: 6 24 1 13 16 10 20 17 15
        </div>
    `;
    document.body.insertBefore(hillOptions, input);

    encodingType.addEventListener('change', function() {
        jwtOptions.style.display = this.value === 'jwt' ? 'block' : 'none';
        vigenereOptions.style.display = this.value === 'vigenere' ? 'block' : 'none';
        playfairOptions.style.display = this.value === 'playfair' ? 'block' : 'none';
        adfgvxOptions.style.display = this.value === 'adfgvx' ? 'block' : 'none';
        hillOptions.style.display = this.value === 'hill' ? 'block' : 'none';
        
        if (this.value === 'hash-detect') {
            encodeDecodeButtons.style.display = 'none';
            detectHashButton.style.display = 'block';
        } else {
            encodeDecodeButtons.style.display = 'block';
            detectHashButton.style.display = 'none';
        }
    });

    document.getElementById('encodeButton').addEventListener('click', async () => {
        const inputElement = document.getElementById('input');
        const secretElement = document.getElementById('jwtSecret');
        const type = encodingType.value;
        try {
            const inputValue = inputElement.value.trim();
            
            if (!inputValue) {
                throw new EncodrError(ErrorMessages[ErrorTypes.INVALID_INPUT], 'warning');
            }

            if (type === 'jwt') {
                if (!secretElement.value.trim()) {
                    secretElement.classList.add('input-error');
                    throw new EncodrError('Secret key is required for JWT', 'warning');
                }

                try {
                    JSON.parse(inputValue);
                } catch (e) {
                    throw new EncodrError('Invalid JSON format for JWT payload', 'error');
                }
            }

            if (inputValue.length > 100000) { // 100KB
                throw new EncodrError('Input too large (max 100KB)', 'error');
            }

            if (type === 'hill') {
                const keyElement = document.getElementById('hillKey');
                if (!keyElement.value.trim()) {
                    keyElement.classList.add('input-error');
                    throw new EncodrError('Matrix key is required for Hill cipher', 'warning');
                }
                output.value = encodingFunctions.hill.encode(inputValue, keyElement.value);
                showNotification('Successfully encoded with Hill cipher', 'success');
            } else if (type === 'jwt') {
                const result = await encodingFunctions.jwt.encode(inputValue, secretElement.value);
                output.value = result;
                showNotification('Successfully encoded to JWT', 'success');
            } else if (type === 'vigenere') {
                const keyElement = document.getElementById('vigenereKey');
                if (!keyElement.value.trim()) {
                    keyElement.classList.add('input-error');
                    throw new EncodrError('Key is required for Vigenère cipher', 'warning');
                }
                output.value = encodingFunctions.vigenere.encode(inputValue, keyElement.value);
                showNotification('Successfully encoded', 'success');
            } else if (type === 'playfair') {
                const keyElement = document.getElementById('playfairKey');
                if (!keyElement.value.trim()) {
                    keyElement.classList.add('input-error');
                    throw new EncodrError('Key is required for Playfair cipher', 'warning');
                }
                output.value = encodingFunctions.playfair.encode(inputValue, keyElement.value);
                showNotification('Successfully encoded', 'success');
            } else if (type === 'adfgvx') {
                const keyElement = document.getElementById('adfgvxKey');                
                if (!keyElement || !keyElement.value.trim()) {
                    if (keyElement) keyElement.classList.add('input-error');
                    throw new EncodrError('Key is required for ADFGVX cipher', 'warning');
                }
                output.value = encodingFunctions.adfgvx.encode(inputValue, keyElement.value);
                showNotification('Successfully encoded with ADFGVX cipher', 'success');
            } else {
                output.value = encodingFunctions[type].encode(inputValue);
                showNotification('Successfully encoded', 'success');
            }
        } catch (error) {
            handleError(error, type === 'hill' ? document.getElementById('hillKey') : 
                        type === 'adfgvx' ? document.getElementById('adfgvxKey') :
                        type === 'jwt' && !secretElement.value.trim() ? secretElement : inputElement);
        }
    });

    document.getElementById('decodeButton').addEventListener('click', async () => {
        const inputElement = document.getElementById('input');
        const secretElement = document.getElementById('jwtSecret');
        const type = encodingType.value;
        
        try {
            if (type === 'hill') {
                const keyElement = document.getElementById('hillKey');
                if (!keyElement.value.trim()) {
                    keyElement.classList.add('input-error');
                    throw new EncodrError('Matrix key is required for Hill cipher', 'warning');
                }
                output.value = encodingFunctions.hill.decode(inputElement.value, keyElement.value);
                showNotification('Successfully decoded with Hill cipher', 'success');
            } else if (type === 'jwt') {
                if (!inputElement.value.trim()) {
                    throw new EncodrError('Please enter a JWT token', 'warning');
                }
                
                if (!secretElement.value.trim() && jwtVerify.checked) {
                    secretElement.classList.add('input-error');
                    throw new EncodrError('Secret key is required for JWT verification', 'warning');
                }

                const result = await encodingFunctions.jwt.decode(
                    inputElement.value.trim(), 
                    jwtVerify.checked, 
                    secretElement.value.trim()
                );
                
                if (!result) {
                    throw new EncodrError('Failed to decode JWT token', 'error');
                }
                
                output.value = result;
                showNotification('Successfully decoded JWT', 'success');
            } else if (type === 'vigenere') {
                const keyElement = document.getElementById('vigenereKey');
                if (!keyElement.value.trim()) {
                    keyElement.classList.add('input-error');
                    throw new EncodrError('Key is required for Vigenère cipher', 'warning');
                }
                output.value = encodingFunctions.vigenere.decode(inputElement.value, keyElement.value);
                showNotification('Successfully decoded', 'success');
            } else if (type === 'playfair') {
                const keyElement = document.getElementById('playfairKey');
                if (!keyElement.value.trim()) {
                    keyElement.classList.add('input-error');
                    throw new EncodrError('Key is required for Playfair cipher', 'warning');
                }
                output.value = encodingFunctions.playfair.decode(inputElement.value, keyElement.value);
                showNotification('Successfully decoded', 'success');
            } else if (type === 'adfgvx') {
                const keyElement = document.getElementById('adfgvxKey');
                if (!keyElement || !keyElement.value.trim()) {
                    if (keyElement) keyElement.classList.add('input-error');
                    throw new EncodrError('Key is required for ADFGVX cipher', 'warning');
                }
                output.value = encodingFunctions.adfgvx.decode(inputElement.value, keyElement.value);
                showNotification('Successfully decoded with ADFGVX cipher', 'success');
            } else {
                output.value = encodingFunctions[type].decode(inputElement.value);
                showNotification('Successfully decoded', 'success');
            }
        } catch (error) {
            handleError(error, type === 'hill' ? document.getElementById('hillKey') : 
                        type === 'adfgvx' ? document.getElementById('adfgvxKey') :
                        type === 'jwt' && !secretElement.value.trim() ? secretElement : inputElement);
        }
    });

    document.getElementById('copyButton').addEventListener('click', async () => {
        await navigator.clipboard.writeText(output.value);
        showNotification('Copied to clipboard!', 'info');
    });

    document.getElementById('clearButton').addEventListener('click', () => {
        input.value = '';
        output.value = '';
        showNotification('Fields cleared', 'info');
    });

    detectHashButton.addEventListener('click', () => {
        try {
            const results = detectHashType(input.value);
            if (results.length > 0) {
                output.value = results.map(result => 
                    `Type: ${result.type}\n` +
                    `Probability: ${result.probability}%\n` +
                    `Format: ${result.format}\n` +
                    `Description: ${result.description}\n`
                ).join('\n');
            } else {
                output.value = 'No matching hash pattern found.';
            }
        } catch (error) {
            output.value = `Error: ${error.message}`;
        }
    });
}); 