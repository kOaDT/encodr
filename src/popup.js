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

    encodingType.addEventListener('change', function() {
        jwtOptions.style.display = this.value === 'jwt' ? 'block' : 'none';
        
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

            if (type === 'jwt') {
                const result = await encodingFunctions.jwt.encode(inputValue, secretElement.value);
                output.value = result;
                showNotification('Successfully encoded to JWT', 'success');
            } else {
                output.value = encodingFunctions[type].encode(inputValue);
                showNotification('Successfully encoded', 'success');
            }
        } catch (error) {
            handleError(error, type === 'jwt' && !secretElement.value.trim() ? secretElement : inputElement);
        }
    });

    document.getElementById('decodeButton').addEventListener('click', async () => {
        const inputElement = document.getElementById('input');
        const secretElement = document.getElementById('jwtSecret');
        const type = encodingType.value;
        
        try {
            if (type === 'jwt') {
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
            } else {
                output.value = encodingFunctions[type].decode(inputElement.value);
                showNotification('Successfully decoded', 'success');
            }
        } catch (error) {
            handleError(error, type === 'jwt' && !secretElement.value.trim() ? secretElement : inputElement);
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